const AntigravityAdapter = require('./antigravity');
const ClaudeCodeAdapter = require('./claudecode');
const CursorAdapter = require('./cursor');
const OpenCodeAdapter = require('./opencode');
const WindsurfAdapter = require('./windsurf');
const CopilotAdapter = require('./copilot');
const CodexAdapter = require('./codex');

class AdapterRegistry {
  constructor() {
    this.adapters = [
      new AntigravityAdapter(),
      new ClaudeCodeAdapter(),
      new CursorAdapter(),
      new OpenCodeAdapter(),
      new WindsurfAdapter(),
      new CopilotAdapter(),
      new CodexAdapter()
    ];
  }

  getAll() {
    return this.adapters;
  }

  get(id) {
    return this.adapters.find(a => a.id === id) || null;
  }

  detectAvailable(targetDir = process.cwd()) {
    return this.adapters.filter(a => a.detect(targetDir));
  }

  installAll(targetDir = process.cwd(), options = {}) {
    const results = [];
    for (const adapter of this.adapters) {
      try {
        const res = adapter.install(targetDir, options);
        results.push(res);
      } catch (e) {
        results.push({ success: false, adapter: adapter.id, error: e.message });
      }
    }
    return results;
  }

  uninstallAll(targetDir = process.cwd(), options = {}) {
    const results = [];
    for (const adapter of this.adapters) {
      try {
        const res = adapter.uninstall(targetDir, options);
        results.push(res);
      } catch (e) {
        results.push({ success: false, adapter: adapter.id, error: e.message });
      }
    }
    return results;
  }

  verifyAll(targetDir = process.cwd()) {
    return this.adapters.map(adapter => adapter.verify(targetDir));
  }
}

module.exports = AdapterRegistry;
