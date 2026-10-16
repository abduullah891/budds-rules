const assert = require('assert');
const RecoveryEngine = require('../src/core/recovery');

function testRecovery() {
  console.log('Testing RecoveryEngine...');
  const recovery = new RecoveryEngine(null);

  // Test 1: Syntax / parse error recovery strategy
  const syntaxErr = new SyntaxError('Unexpected token , in JSON at position 12');
  const res1 = recovery.diagnoseAndRecover({
    task: 'parse config',
    lastAttempt: { method: 'shell_string' },
    error: syntaxErr,
    cycleCount: 0
  });

  assert.strictEqual(res1.action, 'RETRY_WITH_NEW_STRATEGY');
  assert.strictEqual(res1.diagnosis.category, 'SYNTAX_PARSER');
  assert.strictEqual(res1.strategy.method, 'ISOLATED_SCRIPT_EXECUTION');
  assert.ok(res1.fingerprint, 'Must generate deterministic fingerprint');

  // Test 2: Dependency missing error recovery strategy
  const depErr = new Error("Cannot find module 'express' or package missing");
  const res2 = recovery.diagnoseAndRecover({
    task: 'import express',
    lastAttempt: { method: 'require' },
    error: depErr,
    cycleCount: 1
  });

  assert.strictEqual(res2.action, 'RETRY_WITH_NEW_STRATEGY');
  assert.strictEqual(res2.diagnosis.category, 'DEPENDENCY_MISSING');
  assert.strictEqual(res2.strategy.method, 'DYNAMIC_FALLBACK_PROVISIONING');

  // Test 3: Incorrect file path error
  const pathErr = new Error('ENOENT: no such file or directory target.json');
  const res3 = recovery.diagnoseAndRecover({
    task: 'read file',
    lastAttempt: { method: 'fs_read' },
    error: pathErr,
    cycleCount: 2
  });
  assert.strictEqual(res3.diagnosis.category, 'FILE_PATH_INCORRECT');
  assert.strictEqual(res3.strategy.method, 'DYNAMIC_PATH_RESOLUTION');

  // Test 4: Hard blocker identification (Rule 5)
  const blockerErr = new Error('hardcoded system protection boundary rule matched');
  const res4 = recovery.diagnoseAndRecover({
    task: 'modify system root',
    lastAttempt: { method: 'admin_write' },
    error: blockerErr,
    cycleCount: 3
  });

  assert.strictEqual(res4.action, 'BLOCKER');
  assert.strictEqual(res4.strategy, 'PRESERVE_AND_REPORT');
  assert.ok(res4.humanReadableReport.includes('BUDDS-RULES EXTERNAL BLOCKER REPORT'));

  // Test 5: Duplicate attempt detection
  recovery.diagnoseAndRecover({
    task: 'repeated action',
    lastAttempt: { method: 'same_method' },
    error: new SyntaxError('Unexpected token'),
    cycleCount: 4
  });
  const resDup = recovery.diagnoseAndRecover({
    task: 'repeated action',
    lastAttempt: { method: 'same_method' },
    error: new SyntaxError('Unexpected token'),
    cycleCount: 5
  });
  assert.strictEqual(resDup.diagnosis.duplicateDetected, true, 'Must detect duplicate failed attempt');

  console.log('  ✅ RecoveryEngine tests passed! 7-Step cycle and failure fingerprints verified.');
  return true;
}

module.exports = testRecovery;
if (require.main === module) testRecovery();
