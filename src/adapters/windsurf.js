const fs = require('fs');
const path = require('path');
const PermissionManager = require('../core/permissions');

class WindsurfAdapter {
  constructor() {
    this.id = 'windsurf';
    this.name = 'Windsurf IDE (Codeium)';
    this.activationMechanism = 'Workspace rule parser (.windsurfrules)';
    this.verificationMechanism = 'Verify .windsurfrules existence';
    this.configurationLocations = ['.windsurfrules'];
    this.supportedCapabilities = ['always_on_rules', 'zero_touch_skills', 'cascade_integration'];
    this.limitations = [
      'Windsurf reads .windsurfrules in the root of the project workspace.',
      'Supports Markdown or plain text instructions.'
    ];
    this.permissions = new PermissionManager();
  }

  getCapabilities() {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.supportedCapabilities,
      configLocations: this.configurationLocations,
      activationMechanism: this.activationMechanism,
      verificationMechanism: this.verificationMechanism,
      limitations: this.limitations
    };
  }

  detect(targetDir) {
    return fs.existsSync(path.join(targetDir, '.windsurfrules'));
  }

  configure(targetDir, config = {}) {
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'Windsurf rules active' : 'Windsurf rules missing'
    };
  }

  execute(targetDir, command, options = {}) {
    return {
      supported: false,
      adapter: this.id,
      message: 'Windsurf executions occur inside Windsurf Cascade editor sessions'
    };
  }

  install(targetDir, options = {}) {
    const rulesFile = path.join(targetDir, '.windsurfrules');
    this.permissions.backupFile(rulesFile);

    const content = `# BUDDS-RULES: WINDSURF EXECUTION RULES

1. NEVER GIVE UP: Never abandon a task because of initial failure.
2. 7-STEP INFINITE PROBLEM SOLVING: Analyze error -> Isolate root cause -> Implement alternate strategy -> Test.
3. ZERO-TOUCH AUTOMATIC SKILL ACTIVATION: Automatically detect and apply development, debugging, and testing playbooks.
4. EVIDENCE-BASED VERIFICATION: Confirm task completion through tests or terminal outputs.
`;
    fs.writeFileSync(rulesFile, content, 'utf8');

    return {
      success: true,
      adapter: this.id,
      createdFiles: [rulesFile],
      message: 'Installed BUDDS-RULES for Windsurf IDE (.windsurfrules)'
    };
  }

  uninstall(targetDir, options = {}) {
    const rulesFile = path.join(targetDir, '.windsurfrules');
    const removedFiles = [];

    if (fs.existsSync(rulesFile)) {
      this.permissions.backupFile(rulesFile);
      fs.unlinkSync(rulesFile);
      removedFiles.push(rulesFile);
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Uninstalled Windsurf adapter (.windsurfrules removed)`
    };
  }

  verify(targetDir) {
    const rulesFile = path.join(targetDir, '.windsurfrules');
    const exists = fs.existsSync(rulesFile);
    return {
      pass: exists,
      adapter: this.id,
      details: exists ? '.windsurfrules verified' : '.windsurfrules missing'
    };
  }
}

module.exports = WindsurfAdapter;
