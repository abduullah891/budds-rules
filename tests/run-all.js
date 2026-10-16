const testClassifier = require('./classifier.test');
const testAdapters = require('./adapters.test');
const testState = require('./state.test');
const testRecovery = require('./recovery.test');
const testVerifier = require('./verifier.test');
const testWorkflow = require('./workflow.test');
const testPermissions = require('./permissions.test');
const testCLI = require('./cli.test');
const runStressAudit = require('./stress.test');

async function runAllTests() {
  console.log('\n========================================');
  console.log('   BUDDS-RULES TEST SUITE EXECUTION   ');
  console.log('========================================\n');

  let passedCount = 0;
  const tests = [
    { name: 'TaskClassifier (Zero-Touch Skills)', fn: testClassifier },
    { name: 'Universal AI Agent Adapters (Contract v2)', fn: testAdapters },
    { name: 'Persistent State Manager (Atomic & Resilient)', fn: testState },
    { name: 'Recovery Engine (Fingerprints & 7-Step Mindset)', fn: testRecovery },
    { name: 'Result Verification Engine (Quality Gates)', fn: testVerifier },
    { name: '11-Stage Autonomous Pipeline (Workflow)', fn: testWorkflow },
    { name: 'PermissionManager (Security & Sanitization)', fn: testPermissions },
    { name: 'Interactive CLI (budds v2.0)', fn: testCLI },
    { name: 'v2.0 Real-World Stress & Integration Audit', fn: runStressAudit }
  ];

  for (const t of tests) {
    try {
      console.log(`[SUITE] Running: ${t.name}`);
      await t.fn();
      passedCount++;
    } catch (e) {
      console.error(`❌ Suite Failed: ${t.name}\n`, e);
      process.exit(1);
    }
  }

  console.log('\n========================================');
  console.log(`ALL ${passedCount}/${tests.length} TEST SUITES PASSED (100% SUCCESS)`);
  console.log('========================================\n');
}

module.exports = runAllTests;

if (require.main === module) {
  runAllTests().catch(e => {
    console.error('Fatal test error:', e);
    process.exit(1);
  });
}
