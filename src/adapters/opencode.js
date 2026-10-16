const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PermissionManager = require('../core/permissions');

class OpenCodeAdapter {
  constructor() {
    this.id = 'opencode';
    this.name = 'OpenCode Framework';
    this.activationMechanism = 'Plugin registration and configuration in opencode.json';
    this.verificationMechanism = 'Verify opencode binary discovery and buddsRules key in opencode.json';
    this.configurationLocations = ['opencode.json', '~/.config/opencode/opencode.json'];
    this.supportedCapabilities = ['plugin_integration', 'autonomous_execution', 'tui_sessions'];
    this.limitations = [
      'OpenCode loads plugin configuration from ~/.config/opencode/opencode.json or workspace opencode.json.',
      'Requires valid JSON configuration without comments in opencode.json.'
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
    const globalConfig = path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'opencode', 'opencode.json');
    return fs.existsSync(path.join(targetDir, 'opencode.json')) || fs.existsSync(globalConfig);
  }

  configure(targetDir, config = {}) {
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'OpenCode configuration active' : 'OpenCode config not found'
    };
  }

  execute(targetDir, message, options = {}) {
    try {
      execSync('where opencode', { stdio: 'pipe' });
      const out = execSync(`opencode run "${message.replace(/"/g, '\\"')}"`, {
        cwd: targetDir,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { supported: true, success: true, output: out };
    } catch (e) {
      return { supported: true, success: false, error: e.message };
    }
  }

  install(targetDir, options = {}) {
    const configFile = options.global
      ? path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'opencode', 'opencode.json')
      : path.join(targetDir, 'opencode.json');

    this.permissions.backupFile(configFile);
    const dir = path.dirname(configFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let config = {};
    if (fs.existsSync(configFile)) {
      try {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      } catch (_) {}
    }

    config.buddsRules = {
      enabled: true,
      mode: 'autonomous',
      rulesFile: path.join(targetDir, 'AGENTS.md'),
      neverGiveUp: true,
      autoSkills: true
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');

    return {
      success: true,
      adapter: this.id,
      createdFiles: [configFile],
      message: `Configured BUDDS-RULES for OpenCode at ${configFile}`
    };
  }

  uninstall(targetDir, options = {}) {
    const configFile = options.global
      ? path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'opencode', 'opencode.json')
      : path.join(targetDir, 'opencode.json');

    const removedFiles = [];
    if (fs.existsSync(configFile)) {
      this.permissions.backupFile(configFile);
      try {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        if (config.buddsRules) {
          delete config.buddsRules;
          if (Object.keys(config).length === 0) {
            fs.unlinkSync(configFile);
            removedFiles.push(configFile);
          } else {
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
          }
        }
      } catch (_) {}
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Cleaned OpenCode adapter configuration`
    };
  }

  verify(targetDir) {
    const local = path.join(targetDir, 'opencode.json');
    const globalConfig = path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'opencode', 'opencode.json');
    const target = fs.existsSync(local) ? local : (fs.existsSync(globalConfig) ? globalConfig : null);

    if (!target) {
      return { pass: false, adapter: this.id, details: 'opencode.json not found' };
    }

    try {
      const data = JSON.parse(fs.readFileSync(target, 'utf8'));
      const pass = Boolean(data.buddsRules && data.buddsRules.enabled);
      return {
        pass,
        adapter: this.id,
        details: pass ? 'OpenCode configuration verified' : 'buddsRules not enabled in opencode.json'
      };
    } catch (e) {
      return { pass: false, adapter: this.id, details: e.message };
    }
  }
}

module.exports = OpenCodeAdapter;
