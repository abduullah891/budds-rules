const fs = require('fs');
const path = require('path');
const PermissionManager = require('../core/permissions');

class CursorAdapter {
  constructor() {
    this.id = 'cursor';
    this.name = 'Cursor IDE';
    this.activationMechanism = 'Workspace rule parser (.cursorrules / .cursor/rules/*.mdc)';
    this.verificationMechanism = 'Verify .cursorrules or .cursor/rules/budds-rules.mdc existence';
    this.configurationLocations = ['.cursorrules', '.cursor/rules/budds-rules.mdc'];
    this.supportedCapabilities = ['always_on_rules', 'zero_touch_skills', 'mdc_frontmatter'];
    this.limitations = [
      'Cursor supports both legacy .cursorrules and modern .cursor/rules/*.mdc format.',
      'Always-on rules should remain concise to avoid consuming fast-apply token allowances.'
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
    return fs.existsSync(path.join(targetDir, '.cursorrules')) ||
           fs.existsSync(path.join(targetDir, '.cursor', 'rules'));
  }

  configure(targetDir, config = {}) {
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'Cursor workspace rules active' : 'Cursor rules missing'
    };
  }

  execute(targetDir, command, options = {}) {
    return {
      supported: false,
      adapter: this.id,
      message: 'Cursor executions occur inside Cursor AI editor sessions'
    };
  }

  install(targetDir, options = {}) {
    const rulesDir = path.join(targetDir, '.cursor', 'rules');
    if (!fs.existsSync(rulesDir)) fs.mkdirSync(rulesDir, { recursive: true });

    const mdcFile = path.join(rulesDir, 'budds-rules.mdc');
    const legacyFile = path.join(targetDir, '.cursorrules');

    this.permissions.backupFile(mdcFile);
    this.permissions.backupFile(legacyFile);

    const mdcContent = `---
description: BUDDS-RULES Absolute Execution & Autonomous Execution Framework
globs: *
alwaysApply: true
---

# BUDDS-RULES: ABSOLUTE EXECUTION MANDATE

1. NEVER GIVE UP: An attempt failure is NEVER a reason to abandon a task.
2. INFINITE PROBLEM-SOLVING MINDSET: Analyze -> Root cause -> Reconsider -> Alternative methods -> Implement -> Test -> Iterate.
3. ZERO-TOUCH AUTOMATIC SKILLS: Automatically classify and load skills (dev, debug, test, research, automation) without requiring /skill.
4. VERIFY BEFORE COMPLETION: Always verify outputs, test runs, or exit codes before declaring success.
`;

    fs.writeFileSync(mdcFile, mdcContent, 'utf8');
    fs.writeFileSync(legacyFile, mdcContent, 'utf8');

    return {
      success: true,
      adapter: this.id,
      createdFiles: [mdcFile, legacyFile],
      message: 'Installed BUDDS-RULES for Cursor IDE (.cursorrules + .cursor/rules/budds-rules.mdc)'
    };
  }

  uninstall(targetDir, options = {}) {
    const mdcFile = path.join(targetDir, '.cursor', 'rules', 'budds-rules.mdc');
    const legacyFile = path.join(targetDir, '.cursorrules');
    const removedFiles = [];

    if (fs.existsSync(mdcFile)) {
      this.permissions.backupFile(mdcFile);
      fs.unlinkSync(mdcFile);
      removedFiles.push(mdcFile);
    }
    if (fs.existsSync(legacyFile)) {
      this.permissions.backupFile(legacyFile);
      fs.unlinkSync(legacyFile);
      removedFiles.push(legacyFile);
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Uninstalled Cursor adapter files (${removedFiles.length} removed)`
    };
  }

  verify(targetDir) {
    const legacy = path.join(targetDir, '.cursorrules');
    const mdc = path.join(targetDir, '.cursor', 'rules', 'budds-rules.mdc');
    const pass = fs.existsSync(legacy) || fs.existsSync(mdc);

    return {
      pass,
      adapter: this.id,
      details: pass ? 'Cursor rules verified' : 'Neither .cursorrules nor .cursor/rules/ found'
    };
  }
}

module.exports = CursorAdapter;
