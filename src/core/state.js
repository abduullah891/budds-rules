const fs = require('fs');
const path = require('path');
const PermissionManager = require('./permissions');

class StateManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
    this.stateDir = path.join(this.baseDir, '.budds');
    this.stateFile = path.join(this.stateDir, 'state.json');
    this.backupFile = path.join(this.stateDir, 'state.backup.json');
    this.historyFile = path.join(this.stateDir, 'history.json');
    this.logFile = path.join(this.stateDir, 'execution.log');
    this.permissions = new PermissionManager(baseDir);
    this.init();
  }

  init() {
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
    if (!fs.existsSync(this.stateFile)) {
      this.save({
        schemaVersion: '2.0.0',
        activeTask: null,
        status: 'IDLE',
        mode: 'auto',
        cycleCount: 0,
        maxCycles: 15,
        milestones: [],
        pendingSteps: [],
        completedSteps: [],
        recoveryAttempts: [],
        verifiedArtifacts: [],
        lastUpdated: new Date().toISOString()
      });
    }
  }

  load() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const raw = fs.readFileSync(this.stateFile, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (e) {
      console.warn('Corruption detected in state.json, attempting restore from backup:', e.message);
      if (fs.existsSync(this.backupFile)) {
        try {
          const backupRaw = fs.readFileSync(this.backupFile, 'utf8');
          const backupParsed = JSON.parse(backupRaw);
          fs.writeFileSync(this.stateFile, backupRaw, 'utf8');
          this.log('CORRUPTION_RESTORE', 'Restored state from state.backup.json');
          return backupParsed;
        } catch (bkErr) {
          console.error('Backup restoration failed:', bkErr.message);
        }
      }
    }
    return null;
  }

  /**
   * Atomic file save with backup & secret sanitization
   */
  save(data) {
    data.schemaVersion = '2.0.0';
    data.lastUpdated = new Date().toISOString();

    const sanitized = this.permissions.sanitizeSecrets(data);
    const content = JSON.stringify(sanitized, null, 2);

    // Write backup first if previous state exists
    if (fs.existsSync(this.stateFile)) {
      try {
        fs.copyFileSync(this.stateFile, this.backupFile);
      } catch (_) {}
    }

    // Atomic write pattern: write to tmp then atomic rename
    const tmpFile = path.join(this.stateDir, `state.tmp.${Date.now()}_${process.pid}`);
    fs.writeFileSync(tmpFile, content, 'utf8');
    try {
      fs.renameSync(tmpFile, this.stateFile);
    } catch (renameErr) {
      // Fallback on Windows if target is momentarily held by indexer
      fs.copyFileSync(tmpFile, this.stateFile);
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }

    return sanitized;
  }

  log(event, details) {
    const entry = `[${new Date().toISOString()}] [${event}] ${typeof details === 'object' ? JSON.stringify(this.permissions.sanitizeSecrets(details)) : details}\n`;
    try {
      fs.appendFileSync(this.logFile, entry, 'utf8');
    } catch (_) {}
  }

  startTask(taskId, taskDescription, classification = {}) {
    const state = this.load() || {};
    state.activeTask = {
      id: taskId || `task_${Date.now()}`,
      description: taskDescription,
      startedAt: new Date().toISOString(),
      classification
    };
    state.status = 'RUNNING';
    state.cycleCount = 0;
    state.milestones = [];
    state.completedSteps = [];
    state.pendingSteps = [];
    state.recoveryAttempts = [];
    state.verifiedArtifacts = [];
    this.log('TASK_START', { id: state.activeTask.id, description: taskDescription });
    return this.save(state);
  }

  addMilestone(title, dependsOn = [], status = 'PENDING') {
    const state = this.load();
    const milestone = {
      id: `m_${Date.now()}_${state.milestones.length + 1}`,
      title,
      dependsOn: Array.isArray(dependsOn) ? dependsOn : [dependsOn],
      status,
      startedAt: new Date().toISOString()
    };
    state.milestones.push(milestone);
    this.log('MILESTONE_ADD', { title, dependsOn });
    return this.save(state);
  }

  completeMilestone(title) {
    const state = this.load();
    const m = state.milestones.find(item => item.title === title);
    if (m) {
      m.status = 'COMPLETED';
      m.completedAt = new Date().toISOString();
    } else {
      state.milestones.push({
        id: `m_${Date.now()}`,
        title,
        dependsOn: [],
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      });
    }
    if (!state.completedSteps.includes(title)) {
      state.completedSteps.push(title);
    }
    this.log('MILESTONE_COMPLETE', { title });
    return this.save(state);
  }

  recordFailure(attempt, error, strategyChange) {
    const state = this.load();
    state.cycleCount = (state.cycleCount || 0) + 1;
    const record = {
      attemptNumber: state.cycleCount,
      timestamp: new Date().toISOString(),
      originalApproach: attempt,
      errorDetails: typeof error === 'object' ? (error.message || String(error)) : String(error),
      strategyChange
    };
    state.recoveryAttempts.push(record);
    this.log('FAILURE_RECORD', record);
    this.save(state);
    return record;
  }

  recordVerification(artifactPath, status, details = '') {
    const state = this.load();
    state.verifiedArtifacts.push({
      path: artifactPath,
      status, // 'PASS' | 'FAIL'
      details,
      timestamp: new Date().toISOString()
    });
    this.log('VERIFICATION', { path: artifactPath, status, details });
    return this.save(state);
  }

  canRetry() {
    const state = this.load();
    const max = state.maxCycles || 15;
    return (state.cycleCount || 0) < max;
  }

  hasInterruptedTask() {
    const state = this.load();
    return Boolean(state && (state.status === 'RUNNING' || state.status === 'RECOVERING') && state.activeTask);
  }

  resumeInterruptedTask() {
    const state = this.load();
    if (!this.hasInterruptedTask()) return null;

    state.status = 'RESUMED';
    state.resumedAt = new Date().toISOString();
    state.resumptionCycle = (state.cycleCount || 0) + 1;
    this.log('TASK_RESUME', { id: state.activeTask.id });
    this.save(state);
    return {
      task: state.activeTask,
      completedSteps: state.completedSteps,
      milestones: state.milestones,
      cycleCount: state.cycleCount
    };
  }

  completeTask(summary = '') {
    const state = this.load();
    state.status = 'COMPLETED';
    state.completedAt = new Date().toISOString();
    state.summary = summary;
    this.log('TASK_COMPLETE', { summary });
    this.save(state);

    // Append to history
    try {
      let history = [];
      if (fs.existsSync(this.historyFile)) {
        history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }
      history.push({ ...state, archivedAt: new Date().toISOString() });
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2), 'utf8');
    } catch (_) {}

    return state;
  }

  reset() {
    const initial = {
      schemaVersion: '2.0.0',
      activeTask: null,
      status: 'IDLE',
      mode: 'auto',
      cycleCount: 0,
      maxCycles: 15,
      milestones: [],
      pendingSteps: [],
      completedSteps: [],
      recoveryAttempts: [],
      verifiedArtifacts: [],
      lastUpdated: new Date().toISOString()
    };
    this.log('STATE_RESET', 'State cleared to initial');
    return this.save(initial);
  }
}

module.exports = StateManager;
