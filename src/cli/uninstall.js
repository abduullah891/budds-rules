const AdapterRegistry = require('../adapters');

async function runUninstall(options = {}) {
  const targetDir = options.dir || process.cwd();
  const isGlobal = Boolean(options.global);
  const targetAgent = options.agent || 'all';

  console.log('\n========================================');
  console.log('     BUDDS-RULES UNINSTALL WIZARD       ');
  console.log('========================================\n');

  console.log(`Target Directory : ${targetDir}`);
  console.log(`Scope            : ${isGlobal ? 'GLOBAL (~/)' : 'PROJECT (Workspace)'}`);
  console.log(`Target Agents    : ${targetAgent}\n`);

  const registry = new AdapterRegistry();
  let adaptersToUninstall = [];

  if (targetAgent === 'all') {
    adaptersToUninstall = registry.getAll();
  } else {
    const found = registry.get(targetAgent);
    if (!found) {
      console.error(`❌ Unknown agent adapter: "${targetAgent}". Available: ${registry.getAll().map(a => a.id).join(', ')}`);
      return { success: false, error: 'Unknown adapter' };
    }
    adaptersToUninstall = [found];
  }

  const results = [];
  for (const adapter of adaptersToUninstall) {
    try {
      const res = adapter.uninstall(targetDir, { global: isGlobal, force: options.force });
      results.push(res);
      console.log(`  ✅ [${adapter.id.padEnd(12)}] ${res.message}`);
    } catch (e) {
      console.error(`  ❌ [${adapter.id.padEnd(12)}] Error: ${e.message}`);
      results.push({ success: false, adapter: adapter.id, error: e.message });
    }
  }

  console.log('\n----------------------------------------');
  console.log('UNINSTALLATION COMPLETE');
  console.log('----------------------------------------\n');

  return { success: true, results };
}

module.exports = runUninstall;
