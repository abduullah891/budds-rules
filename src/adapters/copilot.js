const fs = require('fs');
const path = require('path');
const PermissionManager = require('../core/permissions');

class CopilotAdapter {
  constructor() {
    this.id = 'copilot';
    this.name = 'GitHub Copilot';
    this.activationMechanism = 'VS Code Copilot workspace instructions (.github/copilot-instructions.md)';
    this.verificationMechanism = 'Verify .github/copilot-instructions.md existence and VS Code code binary discovery';
    this.configurationLocations = ['.github/copilot-instructions.md'];
    this.supportedCapabilities = ['always_on_rules', 'zero_touch_skills', 'ide_chat_context'];
    this.limitations = [
      'Copilot reads workspace instructions from .github/copilot-instructions.md.',
      'Applies to both GitHub Copilot Chat and agent workflows in VS Code / Visual Studio.'
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
    return fs.existsSync(path.join(targetDir, '.github', 'copilot-instructions.md'));
  }

  configure(targetDir, config = {}) {
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'Copilot instructions active' : 'Copilot instructions missing'
    };
  }

  execute(targetDir, command, options = {}) {
    return {
      supported: false,
      adapter: this.id,
      message: 'GitHub Copilot executions occur inside VS Code Copilot Chat sessions'
    };
  }

  install(targetDir, options = {}) {
    const githubDir = path.join(targetDir, '.github');
    if (!fs.existsSync(githubDir)) fs.mkdirSync(githubDir, { recursive: true });

    const instructionsFile = path.join(githubDir, 'copilot-instructions.md');
    this.permissions.backupFile(instructionsFile);

    const content = `# BUDDS-RULES: GITHUB COPILOT INSTRUCTIONS

- NEVER GIVE UP: Never terminate an agent attempt without exploring alternative fixes.
- INFINITE PROBLEM SOLVING: When code fails or compilation errors occur, isolate root causes and re-try with an altered implementation.
- ZERO-TOUCH SKILLS: Automatically engage coding, debugging, and testing playbooks without manual prompting.
- VERIFICATION: Always verify generated code syntax and functionality.
`;
    fs.writeFileSync(instructionsFile, content, 'utf8');

    return {
      success: true,
      adapter: this.id,
      createdFiles: [instructionsFile],
      message: 'Installed BUDDS-RULES for GitHub Copilot (.github/copilot-instructions.md)'
    };
  }

  uninstall(targetDir, options = {}) {
    const file = path.join(targetDir, '.github', 'copilot-instructions.md');
    const removedFiles = [];

    if (fs.existsSync(file)) {
      this.permissions.backupFile(file);
      fs.unlinkSync(file);
      removedFiles.push(file);
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Uninstalled Copilot adapter instructions file`
    };
  }

  verify(targetDir) {
    const file = path.join(targetDir, '.github', 'copilot-instructions.md');
    const exists = fs.existsSync(file);
    return {
      pass: exists,
      adapter: this.id,
      details: exists ? '.github/copilot-instructions.md verified' : 'File missing'
    };
  }
}

module.exports = CopilotAdapter;
