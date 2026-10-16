const RulesEngine = require('./rules-engine');
const TaskClassifier = require('./classifier');
const StateManager = require('./state');
const RecoveryEngine = require('./recovery');
const ResultVerifier = require('./verifier');
const PermissionManager = require('./permissions');
const ExecutionWorkflow = require('./workflow');
const SkillRegistry = require('../skills');
const AdapterRegistry = require('../adapters');
const { createSpecialistTeam } = require('../agents');

class AgentOrchestrator {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.permissions = new PermissionManager(baseDir);
    this.rulesEngine = new RulesEngine(baseDir);
    this.classifier = new TaskClassifier();
    this.stateManager = new StateManager(baseDir);
    this.recoveryEngine = new RecoveryEngine(this.stateManager);
    this.verifier = new ResultVerifier(this.stateManager);
    this.skillRegistry = new SkillRegistry();
    this.adapterRegistry = new AdapterRegistry();
    this.specialists = createSpecialistTeam();

    this.workflow = new ExecutionWorkflow({
      classifier: this.classifier,
      rulesEngine: this.rulesEngine,
      stateManager: this.stateManager,
      recoveryEngine: this.recoveryEngine,
      verifier: this.verifier,
      skillRegistry: this.skillRegistry,
      specialists: this.specialists,
      permissionManager: this.permissions
    });
  }

  /**
   * Main entrypoint for autonomous execution
   * @param {string} prompt - User request
   * @param {Object} context - Optional environment context
   * @param {Function} executor - Optional custom executor
   */
  async execute(prompt, context = {}, executor = null) {
    return this.workflow.run(prompt, context, executor);
  }

  getStatus() {
    return {
      state: this.stateManager.load(),
      installedSkills: this.skillRegistry.getAllSkills().map(s => ({ id: s.id, name: s.name, domain: s.domain })),
      specialists: Object.keys(this.specialists),
      adapters: this.adapterRegistry.getAll().map(a => ({ id: a.id, name: a.name }))
    };
  }
}

module.exports = AgentOrchestrator;
