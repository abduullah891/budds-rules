const fs = require('fs');
const path = require('path');
const AdapterRegistry = require('../adapters');
const StateManager = require('../core/state');

async function runInstall(options = {}) {
  const targetDir = options.dir || process.cwd();
  const isGlobal = Boolean(options.global);
  const targetAgent = options.agent || 'all';

  console.log('\n========================================');
  console.log('      BUDDS-RULES INSTALLER WIZARD      ');
  console.log('========================================\n');

  console.log(`Target Directory : ${targetDir}`);
  console.log(`Scope            : ${isGlobal ? 'GLOBAL (~/)' : 'PROJECT (Workspace)'}`);
  console.log(`Target Agents    : ${targetAgent}\n`);

  const registry = new AdapterRegistry();
  const stateManager = new StateManager(targetDir);

  // Initialize state
  stateManager.init();

  let adaptersToInstall = [];
  if (targetAgent === 'all') {
    adaptersToInstall = registry.getAll();
  } else {
    const found = registry.get(targetAgent);
    if (!found) {
      console.error(`❌ Unknown agent adapter: "${targetAgent}". Available: ${registry.getAll().map(a => a.id).join(', ')}`);
      return { success: false, error: 'Unknown adapter' };
    }
    adaptersToInstall = [found];
  }

  console.log('Installing adapters...\n');
  const results = [];

  for (const adapter of adaptersToInstall) {
    try {
      const res = adapter.install(targetDir, { global: isGlobal, force: options.force });
      results.push(res);
      console.log(`  ✅ [${adapter.id.padEnd(12)}] ${adapter.name}`);
      if (res.createdFiles && res.createdFiles.length > 0) {
        res.createdFiles.forEach(f => console.log(`     └─ Generated: ${f}`));
      }
    } catch (e) {
      console.error(`  ❌ [${adapter.id.padEnd(12)}] Failed: ${e.message}`);
      results.push({ success: false, adapter: adapter.id, error: e.message });
    }
  }

  console.log('\n----------------------------------------');
  console.log('INSTALLATION COMPLETE');
  console.log('Core Rules    : Canonical AGENTS.md active');
  console.log('Skill Loading : Zero-Touch automatic selection enabled');
  console.log('Verification  : Run `budds doctor` to test setup');
  console.log('----------------------------------------\n');

  return { success: true, results };
}

module.exports = runInstall;
