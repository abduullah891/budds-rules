const crypto = require('crypto');

/**
 * Advanced Recovery Engine v2.0
 * Operationalizes NEVER GIVE UP & 7-Step Infinite Problem-Solving Mindset
 * Features failure fingerprinting, adaptive retry budgets, and duplicate detection
 */
class RecoveryEngine {
  constructor(stateManager = null) {
    this.stateManager = stateManager;
    this.attemptedFingerprints = new Map();
    this.checkpoints = [];
  }

  /**
   * Computes a deterministic fingerprint of an error and execution context
   */
  computeFingerprint(errorCategory, rootSnippet, method) {
    const raw = `${errorCategory}:${rootSnippet.trim().slice(0, 100)}:${method || 'unknown'}`;
    return crypto.createHash('md5').update(raw).digest('hex').slice(0, 12);
  }

  /**
   * Analyze error and determine recovery strategy
   * @param {Object} context - { task, lastAttempt, error, cycleCount, maxCycles }
   * @returns {Object} Strategy decision { action: 'RETRY_WITH_NEW_STRATEGY' | 'BLOCKER', strategy, diagnosis }
   */
  diagnoseAndRecover(context) {
    const errorStr = typeof context.error === 'object' 
      ? `${context.error.name}: ${context.error.message}\n${context.error.stack || ''}` 
      : String(context.error);

    const diagnosis = this.classifyError(errorStr);
    const method = context.lastAttempt?.method || 'default';
    const fingerprint = this.computeFingerprint(diagnosis.category, diagnosis.rootCauseSnippet, method);

    // Track duplicate attempts
    const previousOccurrences = this.attemptedFingerprints.get(fingerprint) || 0;
    this.attemptedFingerprints.set(fingerprint, previousOccurrences + 1);

    if (previousOccurrences > 0) {
      diagnosis.duplicateDetected = true;
      diagnosis.identicalAttemptWarning = `Attempt with fingerprint ${fingerprint} already failed previously. Approach MUST change immediately.`;
    }

    // Record checkpoint
    const checkpoint = {
      timestamp: new Date().toISOString(),
      cycle: (context.cycleCount || 0) + 1,
      fingerprint,
      category: diagnosis.category,
      method
    };
    this.checkpoints.push(checkpoint);

    // Adaptive retry budget check
    const maxBudget = context.maxCycles || (this.stateManager ? (this.stateManager.load()?.maxCycles || 15) : 15);
    const currentCycle = (context.cycleCount || 0) + 1;

    if (currentCycle >= maxBudget) {
      return {
        action: 'BLOCKER',
        category: 'RETRY_BUDGET_EXHAUSTED',
        reason: `Maximum adaptive retry budget of ${maxBudget} cycles reached.`,
        recommendation: 'Evaluate external constraints or adjust budget via `budds config set maxCycles <number>`.',
        strategy: 'PRESERVE_AND_REPORT'
      };
    }

    // Check if this is a genuine external blocker (Rule 5)
    if (diagnosis.isExternalBlocker) {
      const blockerReport = {
        action: 'BLOCKER',
        category: diagnosis.category,
        reason: diagnosis.rootCauseSnippet,
        fingerprint,
        recommendation: diagnosis.userActionRequired,
        strategy: 'PRESERVE_AND_REPORT',
        humanReadableReport: this.generateBlockerReport(diagnosis, context)
      };

      if (this.stateManager) {
        this.stateManager.recordFailure(context.lastAttempt, context.error, `EXTERNAL BLOCKER: ${diagnosis.rootCauseSnippet}`);
      }

      return blockerReport;
    }

    // Generate new alternative approach (Rule 2)
    const strategy = this.generateAlternativeStrategy(diagnosis, context, previousOccurrences);

    if (this.stateManager) {
      this.stateManager.recordFailure(context.lastAttempt, context.error, strategy.description);
    }

    return {
      action: 'RETRY_WITH_NEW_STRATEGY',
      cycle: currentCycle,
      fingerprint,
      diagnosis,
      strategy
    };
  }

  classifyError(errorStr) {
    const lower = errorStr.toLowerCase();

    // 1. Permissions & Security Protection Boundaries (Rule 5)
    if (lower.includes('protection boundary') || lower.includes('blocked by policy') || lower.includes('safety control') ||
        lower.includes('eacces') || lower.includes('permission denied') || lower.includes('unauthorized') || lower.includes('forbidden')) {
      const isHardBlocker = lower.includes('sudo') || lower.includes('root') || lower.includes('hardcoded system protection boundary') || lower.includes('protection boundary');
      return {
        category: 'PERMISSIONS_SECURITY',
        rootCauseSnippet: isHardBlocker ? 'External security or system protection boundary' : 'Access or permission denied',
        isExternalBlocker: isHardBlocker,
        userActionRequired: 'Elevated permissions or sandbox boundary adjustment required.'
      };
    }

    // 2. Syntax & Parser errors
    if (lower.includes('syntaxerror') || lower.includes('unexpected token') || lower.includes('parse error') || lower.includes('invalid regex')) {
      return {
        category: 'SYNTAX_PARSER',
        rootCauseSnippet: 'Syntax or escaping parser error',
        isExternalBlocker: false
      };
    }

    // 3. Missing dependencies & modules
    if (lower.includes('cannot find module') || lower.includes('module_not_found') || lower.includes('pkg_missing')) {
      return {
        category: 'DEPENDENCY_MISSING',
        rootCauseSnippet: 'Target module or dependency not found in environment',
        isExternalBlocker: false
      };
    }

    // 4. Incorrect file paths
    if (lower.includes('enoent') || lower.includes('no such file or directory') || lower.includes('cannot find file') || lower.includes('command not found')) {
      return {
        category: 'FILE_PATH_INCORRECT',
        rootCauseSnippet: 'Target file or executable not found at specified path',
        isExternalBlocker: false
      };
    }

    // 5. Failed test assertions
    if (lower.includes('assertionerror') || lower.includes('assert.') || lower.includes('expected') && lower.includes('actual') || lower.includes('test failed')) {
      return {
        category: 'TEST_FAILURE',
        rootCauseSnippet: 'Test assertion or behavioral contract expectation mismatch',
        isExternalBlocker: false
      };
    }

    // 6. Network & API failures
    if (lower.includes('etimedout') || lower.includes('econnrefused') || lower.includes('enotfound') || lower.includes('network error') || lower.includes('socket hang up')) {
      return {
        category: 'NETWORK_API_FAILURE',
        rootCauseSnippet: 'Network connectivity or target API unreachable',
        isExternalBlocker: false
      };
    }

    // 7. Subagent execution failures
    if (lower.includes('subagent failed') || lower.includes('delegated task error') || lower.includes('browser action failed')) {
      return {
        category: 'SUBAGENT_EXECUTION_FAILURE',
        rootCauseSnippet: 'Delegated subagent encountered execution error',
        isExternalBlocker: false
      };
    }

    // 8. Configuration errors
    if (lower.includes('config error') || lower.includes('invalid config') || lower.includes('json parse error')) {
      return {
        category: 'CONFIG_ERROR',
        rootCauseSnippet: 'Malformed or missing configuration value',
        isExternalBlocker: false
      };
    }

    return {
      category: 'RUNTIME_EXCEPTION',
      rootCauseSnippet: errorStr.slice(0, 150),
      isExternalBlocker: false
    };
  }

  generateAlternativeStrategy(diagnosis, context, previousOccurrences = 0) {
    const cycle = (context.cycleCount || 0) + 1;

    switch (diagnosis.category) {
      case 'SYNTAX_PARSER':
        return {
          method: 'ISOLATED_SCRIPT_EXECUTION',
          description: `Switch from inline shell string escaping to isolated script execution via Node.js/Python script (Cycle #${cycle}).`,
          parameters: { cycle, useScriptFile: true }
        };

      case 'DEPENDENCY_MISSING':
        return {
          method: 'DYNAMIC_FALLBACK_PROVISIONING',
          description: `Create fallback implementation or install/stub missing dependencies automatically (Cycle #${cycle}).`,
          parameters: { cycle, autoProvision: true }
        };

      case 'FILE_PATH_INCORRECT':
        return {
          method: 'DYNAMIC_PATH_RESOLUTION',
          description: `Re-evaluate path relative to workspace root using path.resolve and fallback search (Cycle #${cycle}).`,
          parameters: { cycle, searchHierarchy: true }
        };

      case 'TEST_FAILURE':
        return {
          method: 'CONTRACT_REALIGNMENT',
          description: `Inspect assertion diff, correct implementation logic or update stale test contract (Cycle #${cycle}).`,
          parameters: { cycle, refineImplementation: true }
        };

      case 'NETWORK_API_FAILURE':
        return {
          method: 'EXPONENTIAL_BACKOFF_CACHE_FALLBACK',
          description: `Switch to local cached definitions or secondary mirror endpoint with backoff (Cycle #${cycle}).`,
          parameters: { cycle, backoffMs: Math.min(5000, cycle * 1000) }
        };

      case 'SUBAGENT_EXECUTION_FAILURE':
        return {
          method: 'DIRECT_ORCHESTRATOR_FALLBACK',
          description: `Execute delegated task directly in primary orchestrator with explicit step-by-step verification (Cycle #${cycle}).`,
          parameters: { cycle, bypassDelegation: true }
        };

      case 'PERMISSIONS_SECURITY':
        return {
          method: 'UNPRIVILEGED_WORKSPACE_SCOPING',
          description: `Redirect paths and operations into user-accessible scratch/artifact directory (Cycle #${cycle}).`,
          parameters: { cycle, redirectedToWorkspace: true }
        };

      default:
        return {
          method: previousOccurrences > 0 ? 'RADICAL_STRATEGY_PIVOT' : 'ALTERNATIVE_ALGORITHM_PATH',
          description: `Decompose task into smaller sub-steps and employ alternate algorithmic approach (Cycle #${cycle}).`,
          parameters: { cycle, decompose: true, pivot: previousOccurrences > 0 }
        };
    }
  }

  generateBlockerReport(diagnosis, context) {
    return [
      `=== BUDDS-RULES EXTERNAL BLOCKER REPORT ===`,
      `Task: ${context.task}`,
      `Category: ${diagnosis.category}`,
      `Root Cause: ${diagnosis.rootCauseSnippet}`,
      `User Remediation Required: ${diagnosis.userActionRequired}`,
      `State Preserved: Yes. Progress recorded in .budds/state.json.`,
      `Resume Command: Run \`budds resume\` once external blocker is resolved.`
    ].join('\n');
  }
}

module.exports = RecoveryEngine;
