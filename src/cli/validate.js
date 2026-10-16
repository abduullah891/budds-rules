const RulesEngine = require('../core/rules-engine');
const AdapterRegistry = require('../adapters');
const ResultVerifier = require('../core/verifier');

function runValidate(options = {}) {
  const targetDir = options.dir || process.cwd();
  console.log('\n========================================');
  console.log('       BUDDS-RULES VALIDATION ENGINE    ');
  console.log('========================================\n');

  const rulesEngine = new RulesEngine(targetDir);
  const integrity = rulesEngine.validateIntegrity();
  const adapterRegistry = new AdapterRegistry();
  const verifications = adapterRegistry.verifyAll(targetDir);
  const verifier = new ResultVerifier();

  const results = [
    { item: 'Canonical AGENTS.md Integrity', pass: integrity.valid, details: integrity.valid ? 'All 10 principles intact' : `Missing: ${integrity.missing.join(', ')}` }
  ];

  verifications.forEach(v => {
    results.push({ item: `Adapter: ${v.adapter}`, pass: v.pass, details: v.details });
  });

  results.forEach(r => {
    const icon = r.pass ? '✅' : '❌';
    console.log(`${icon} [${r.pass ? 'PASS' : 'FAIL'}] ${r.item.padEnd(30)} : ${r.details}`);
  });

  const allPassed = results.every(r => r.pass);
  console.log('\n----------------------------------------');
  console.log(`Validation Status: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  console.log('----------------------------------------\n');

  return { success: allPassed, results };
}

module.exports = runValidate;
