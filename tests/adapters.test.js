const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AdapterRegistry = require('../src/adapters');

function testAdapters() {
  console.log('Testing Universal AI Agent Adapters independently...');
  const baseTestDir = path.join(__dirname, 'temp_adapter_test');
  if (fs.existsSync(baseTestDir)) fs.rmSync(baseTestDir, { recursive: true, force: true });
  fs.mkdirSync(baseTestDir, { recursive: true });

  const registry = new AdapterRegistry();
  const adapters = registry.getAll();

  assert.strictEqual(adapters.length, 7, 'Must have 7 universal agent adapters');

  for (const adapter of adapters) {
    const adapterDir = path.join(baseTestDir, adapter.id);
    fs.mkdirSync(adapterDir, { recursive: true });
    console.log(`  Checking adapter: ${adapter.id} (${adapter.name})...`);

    // 1. Initial verify should fail in empty isolated dir
    const preVerify = adapter.verify(adapterDir);
    assert.strictEqual(preVerify.pass, false, `${adapter.id} should not pass in empty test dir`);

    // 2. Install
    const installRes = adapter.install(adapterDir, { force: true });
    assert.strictEqual(installRes.success, true, `${adapter.id} install should succeed`);
    assert.ok(installRes.createdFiles.length > 0, `${adapter.id} should create files`);

    // 3. Post-install verify should pass
    const postVerify = adapter.verify(adapterDir);
    assert.strictEqual(postVerify.pass, true, `${adapter.id} should pass verification after install`);

    // 4. Limitations documentation check
    assert.ok(Array.isArray(adapter.limitations) && adapter.limitations.length > 0, `${adapter.id} must document limitations`);
  }

  // Cleanup
  if (fs.existsSync(baseTestDir)) fs.rmSync(baseTestDir, { recursive: true, force: true });

  console.log('  ✅ All 7 AI Agent Adapters verified independently!');
  return true;
}

module.exports = testAdapters;
if (require.main === module) testAdapters();
