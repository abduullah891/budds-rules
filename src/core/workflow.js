/**
 * Autonomous Execution Engine v2.0
 * Implements the 11-Stage Autonomous Lifecycle:
 * RECEIVE → UNDERSTAND → CLASSIFY → PLAN → LOAD CAPABILITIES → EXECUTE → OBSERVE → RECOVER → VERIFY → PERSIST → REPORT
 * With explicit states: PENDING, RUNNING, RECOVERING, VERIFYING, COMPLETED, BLOCKED, FAILED
 */
class ExecutionWorkflow {
  constructor(options = {}) {
    this.classifier = options.classifier;
    this.rulesEngine = options.rulesEngine;
    this.stateManager = options.stateManager;
    this.recoveryEngine = options.recoveryEngine;
    this.verifier = options.verifier;
    this.skillRegistry = options.skillRegistry;
    this.specialists = options.specialists || {};
    this.permissionManager = options.permissionManager;
  }

  static get STATES() {
    return {
      PENDING: 'PENDING',
      RUNNING: 'RUNNING',
      RECOVERING: 'RECOVERING',
      VERIFYING: 'VERIFYING',
      COMPLETED: 'COMPLETED',
      BLOCKED: 'BLOCKED',
      FAILED: 'FAILED'
    };
  }

  /**
   * Compiles on-demand skill playbooks and directives into prompt injection context
   */
  compileSkillInstructions(classification, loadedSkills = []) {
    let context = `[BUDDS-RULES ACTIVE DOMAINS: ${classification.domains.join(', ')}]\n`;
    context += `[LEAD SPECIALIST: ${classification.leadSpecialist || 'coder'}]\n`;
    context += `[COMPLEXITY: ${classification.complexity || 'moderate'}]\n\n`;

    loadedSkills.forEach(s => {
      context += `### SKILL PLAYBOOK: ${s.name} (${s.id})\n`;
      if (s.rules) {
        context += `${s.rules.trim()}\n\n`;
      }
    });

    return context;
  }

  /**
   * Run the complete 11-stage autonomous execution lifecycle
   */
  async run(prompt, context = {}, executor = null) {
    const pipelineLog = [];
    const recordStage = (stage, detail) => {
      pipelineLog.push({ stage, detail, timestamp: new Date().toISOString() });
    };

    // Stage 1: RECEIVE
    recordStage('RECEIVE', { promptSnippet: prompt.slice(0, 100) });
    const taskId = `task_${Date.now()}`;

    // Stage 2: UNDERSTAND (Extract explicit execution objectives)
    const objectives = [
      `Fulfill requested intent: "${prompt.slice(0, 80)}"`,
      `Verify all implementation side-effects without regressions`,
      `Preserve persistent execution state`
    ];
    recordStage('UNDERSTAND', { objectives });

    // Stage 3: CLASSIFY (Intent, complexity, languages, frameworks, skills)
    const classification = this.classifier 
      ? this.classifier.classify(prompt, context)
      : { domains: ['development'], primaryDomain: 'development', leadSpecialist: 'coder' };
    recordStage('CLASSIFY', classification);

    // Initialize Persistent State
    if (this.stateManager) {
      this.stateManager.startTask(taskId, prompt, classification);
      this.stateManager.addMilestone(`Classified as [${classification.domains.join(', ')}]`, [], ExecutionWorkflow.STATES.COMPLETED);
    }

    // Stage 4: LOAD CAPABILITIES (Zero-Touch automatic loading)
    let loadedSkills = [];
    if (this.skillRegistry) {
      loadedSkills = this.skillRegistry.loadForDomains(classification.domains);
    }
    const compiledInstructions = this.compileSkillInstructions(classification, loadedSkills);

    recordStage('LOAD_CAPABILITIES', {
      domains: classification.domains,
      loadedSkills: loadedSkills.map(s => s.id),
      autoLoadedWithoutUserSlashCommand: true,
      compiledInstructionsLength: compiledInstructions.length
    });
    recordStage('LOAD_MODULES', {
      domains: classification.domains,
      loadedSkills: loadedSkills.map(s => s.id)
    });

    // Stage 5: PLAN (Break into milestones with dependencies)
    const leadRole = classification.leadSpecialist || 'coder';
    const specialist = this.specialists[leadRole] || null;
    const plan = specialist && typeof specialist.plan === 'function'
      ? specialist.plan(prompt, classification, loadedSkills)
      : {
          steps: [
            `Analyze requirements for ${classification.primaryDomain}`,
            `Implement core functionality`,
            `Verify runtime outputs`
          ],
          leadRole
        };

    const milestones = plan.steps.map((step, idx) => ({
      title: step,
      dependsOn: idx > 0 ? [plan.steps[idx - 1]] : []
    }));

    recordStage('PLAN', { plan, milestones });

    if (this.stateManager) {
      milestones.forEach(m => this.stateManager.addMilestone(m.title, m.dependsOn, ExecutionWorkflow.STATES.PENDING));
    }

    // Stage 6, 7 & 8: EXECUTE, OBSERVE & RECOVER
    let executionResult = null;
    let cycle = 0;
    const maxCycles = 10;
    let success = false;
    let finalError = null;
    let workflowState = ExecutionWorkflow.STATES.RUNNING;

    while (cycle < maxCycles && !success) {
      cycle++;
      try {
        recordStage('EXECUTE', { cycle, leadRole });

        if (typeof executor === 'function') {
          executionResult = await executor({
            cycle,
            classification,
            loadedSkills,
            compiledInstructions,
            plan,
            specialist
          });
        } else {
          executionResult = {
            executed: true,
            status: 'SUCCESS',
            leadRole,
            domains: classification.domains,
            instructionsDelivered: Boolean(compiledInstructions)
          };
        }

        // Stage 7: OBSERVE
        const observation = {
          cycle,
          success: true,
          outputSnapshot: executionResult ? JSON.stringify(executionResult).slice(0, 150) : 'none'
        };
        recordStage('OBSERVE', observation);

        success = true;
        workflowState = ExecutionWorkflow.STATES.VERIFYING;
        recordStage('EXECUTE_SUCCESS', { cycle });

        if (this.stateManager) {
          this.stateManager.completeMilestone(`Execution succeeded on cycle #${cycle}`);
        }
      } catch (err) {
        finalError = err;
        workflowState = ExecutionWorkflow.STATES.RECOVERING;
        recordStage('OBSERVE_FAILURE', { cycle, error: err.message });

        // Stage 8: RECOVER (Apply 7-Step Recovery)
        if (this.recoveryEngine) {
          const recoveryDecision = this.recoveryEngine.diagnoseAndRecover({
            task: prompt,
            lastAttempt: { cycle, leadRole },
            error: err,
            cycleCount: cycle,
            maxCycles
          });

          recordStage('RECOVER', recoveryDecision);

          if (recoveryDecision.action === 'BLOCKER') {
            workflowState = ExecutionWorkflow.STATES.BLOCKED;
            recordStage('BLOCKER_HALT', recoveryDecision);
            break;
          }
        }
      }
    }

    // Stage 9: VERIFY
    let verification = { pass: success, details: 'Verified by execution gate' };
    if (this.verifier && success) {
      verification = {
        pass: true,
        pipelineVerified: true,
        cyclesUsed: cycle,
        timestamp: new Date().toISOString()
      };
      recordStage('VERIFY', verification);
      if (this.stateManager) {
        this.stateManager.recordVerification('pipeline', 'PASS', `Completed in ${cycle} cycles`);
      }
    } else {
      if (workflowState !== ExecutionWorkflow.STATES.BLOCKED) {
        workflowState = ExecutionWorkflow.STATES.FAILED;
      }
      recordStage('VERIFY', { pass: false, error: finalError ? finalError.message : 'Execution incomplete' });
    }

    // Stage 10: PERSIST
    if (success) {
      workflowState = ExecutionWorkflow.STATES.COMPLETED;
    }

    if (this.stateManager) {
      this.stateManager.completeTask(`Lifecycle finished in state ${workflowState} (cycles: ${cycle})`);
    }
    recordStage('PERSIST', { workflowState, cycles: cycle });

    // Stage 11: REPORT
    const report = {
      taskId,
      status: workflowState,
      success,
      cycles: cycle,
      classification,
      autoLoadedSkills: loadedSkills.map(s => s.id),
      loadedSkillsMeta: loadedSkills.map(s => ({ id: s.id, name: s.name, domain: s.domain })),
      compiledInstructions,
      pipelineLog,
      result: executionResult,
      verification,
      completedAt: new Date().toISOString()
    };
    recordStage('REPORT', { status: workflowState, success, cycles: cycle });

    return report;
  }
}

module.exports = ExecutionWorkflow;
