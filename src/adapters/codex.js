const fs = require('fs');
const path = require('path');
const PermissionManager = require('../core/permissions');

class CodexAdapter {
  constructor() {
    this.id = 'codex';
    this.name = 'OpenAI Codex & Universal CLI Agents';
    this.activationMechanism = 'Standard AGENTS.md rule parser in working directory';
    this.verificationMechanism = 'Verify AGENTS.md existence and core rule integrity';
    this.configurationLocations = ['AGENTS.md'];
    this.supportedCapabilities = ['always_on_rules', 'cli_orchestration', 'zero_touch_skills'];
    this.limitations = [
      'Universal CLI agents look for AGENTS.md in the root directory.',
      'Supports automated system prompt pre-pending via environment variables.'
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
    return fs.existsSync(path.join(targetDir, 'AGENTS.md'));
  }

  configure(targetDir, config = {}) {
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'Universal AGENTS.md active' : 'AGENTS.md missing'
    };
  }

  execute(targetDir, command, options = {}) {
    return {
      supported: false,
      adapter: this.id,
      message: 'Universal CLI agent handles execution directly'
    };
  }

  install(targetDir, options = {}) {
    const file = path.join(targetDir, 'AGENTS.md');
    this.permissions.backupFile(file);

    if (!fs.existsSync(file) || options.force) {
      const source = path.join(__dirname, '..', '..', 'AGENTS.md');
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, file);
      }
    }

    return {
      success: true,
      adapter: this.id,
      createdFiles: [file],
      message: 'Installed BUDDS-RULES for Universal Codex / CLI Agents (AGENTS.md)'
    };
  }

  uninstall(targetDir, options = {}) {
    const file = path.join(targetDir, 'AGENTS.md');
    const removedFiles = [];

    // Only delete AGENTS.md if explicitly forced
    if (options.force && fs.existsSync(file)) {
      this.permissions.backupFile(file);
      fs.unlinkSync(file);
      removedFiles.push(file);
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Uninstalled Codex adapter files (${removedFiles.length} removed)`
    };
  }

  verify(targetDir) {
    const file = path.join(targetDir, 'AGENTS.md');
    const exists = fs.existsSync(file);
    return {
      pass: exists,
      adapter: this.id,
      details: exists ? 'AGENTS.md verified' : 'AGENTS.md missing'
    };
  }
}

module.exports = CodexAdapter;
