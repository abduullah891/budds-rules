const fs = require('fs');
const path = require('path');
const PermissionManager = require('../core/permissions');

class AntigravityAdapter {
  constructor() {
    this.id = 'antigravity';
    this.name = 'Google Antigravity IDE';
    this.activationMechanism = 'Hierarchical workspace folder rule discovery (AGENTS.md / GEMINI.md)';
    this.verificationMechanism = 'Inspect <user_rules> prompt injection and AGENTS.md existence';
    this.configurationLocations = ['AGENTS.md', 'GEMINI.md', '.agents/rules/'];
    this.supportedCapabilities = ['always_on_rules', 'zero_touch_skills', 'subagent_mandate', 'directory_traversal'];
    this.limitations = [
      'Rules deduplication operates on resolved file path: having both identical AGENTS.md and GEMINI.md causes double-injection.',
      'Standalone subagents (e.g. browser_subagent) operate in isolated sandboxes and require task prompt rules injection.'
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
    return fs.existsSync(path.join(targetDir, '.agents')) ||
           fs.existsSync(path.join(targetDir, 'AGENTS.md')) ||
           fs.existsSync(path.join(targetDir, 'GEMINI.md'));
  }

  configure(targetDir, config = {}) {
    const agentsFile = path.join(targetDir, 'AGENTS.md');
    if (fs.existsSync(agentsFile)) {
      this.permissions.backupFile(agentsFile);
    }
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'Antigravity workspace rules active' : 'Antigravity rules not detected'
    };
  }

  execute(targetDir, command, options = {}) {
    return {
      supported: false,
      adapter: this.id,
      message: 'Direct command execution managed by Antigravity IDE run_command tool'
    };
  }

  install(targetDir, options = {}) {
    const agentsFile = path.join(targetDir, 'AGENTS.md');
    const geminiFile = path.join(targetDir, 'GEMINI.md');
    const createdFiles = [];

    // Backup existing files before overwriting
    this.permissions.backupFile(agentsFile);
    this.permissions.backupFile(geminiFile);

    // Ensure AGENTS.md exists as canonical source
    if (!fs.existsSync(agentsFile) || options.force) {
      const source = path.join(__dirname, '..', '..', 'AGENTS.md');
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, agentsFile);
        createdFiles.push(agentsFile);
      }
    }

    // Ensure GEMINI.md exists as pointer adapter to avoid duplication
    if (!fs.existsSync(geminiFile) || options.force) {
      const geminiContent = `# BUDDS-RULES: GEMINI / ANTIGRAVITY COMPATIBILITY ADAPTER\n\nThis workspace uses **BUDDS-RULES**, governed canonically by [AGENTS.md](./AGENTS.md).\n\n1. NEVER GIVE UP (Absolute execution mandate)\n2. 7-Step Infinite Problem-Solving Mindset\n3. Zero-Touch Automatic Skill Activation (No manual /skill)\n4. Autonomous Execution: RECEIVE -> CLASSIFY -> LOAD MODULES -> PLAN -> EXECUTE -> RECOVER -> VERIFY -> REPORT\n`;
      fs.writeFileSync(geminiFile, geminiContent, 'utf8');
      createdFiles.push(geminiFile);
    }

    return {
      success: true,
      adapter: this.id,
      createdFiles,
      message: 'Installed BUDDS-RULES for Antigravity IDE (Canonical AGENTS.md + GEMINI.md adapter)'
    };
  }

  uninstall(targetDir, options = {}) {
    const geminiFile = path.join(targetDir, 'GEMINI.md');
    const removedFiles = [];

    if (fs.existsSync(geminiFile)) {
      this.permissions.backupFile(geminiFile);
      fs.unlinkSync(geminiFile);
      removedFiles.push(geminiFile);
    }

    // Only remove AGENTS.md if explicitly forced, to prevent losing canonical root rules
    if (options.force) {
      const agentsFile = path.join(targetDir, 'AGENTS.md');
      if (fs.existsSync(agentsFile)) {
        this.permissions.backupFile(agentsFile);
        fs.unlinkSync(agentsFile);
        removedFiles.push(agentsFile);
      }
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Uninstalled Antigravity adapter files (${removedFiles.length} removed)`
    };
  }

  verify(targetDir) {
    const agentsFile = path.join(targetDir, 'AGENTS.md');
    const exists = fs.existsSync(agentsFile);
    const content = exists ? fs.readFileSync(agentsFile, 'utf8') : '';
    const hasNeverGiveUp = content.includes('NEVER GIVE UP');

    return {
      pass: exists && hasNeverGiveUp,
      adapter: this.id,
      details: exists ? `AGENTS.md verified (${content.length} bytes)` : 'AGENTS.md missing'
    };
  }
}

module.exports = AntigravityAdapter;
