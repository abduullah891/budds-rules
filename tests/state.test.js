const assert = require('assert');
const fs = require('fs');
const path = require('path');
const StateManager = require('../src/core/state');

function testState() {
  console.log('Testing StateManager...');
  const testDir = path.join(__dirname, 'temp_state_test');
  if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  fs.mkdirSync(testDir, { recursive: true });

  const state = new StateManager(testDir);

  // Test initialization
  const initial = state.load();
  assert.strictEqual(initial.status, 'IDLE');
  assert.strictEqual(initial.cycleCount, 0);

  // Test task start
  state.startTask('t_1', 'Test task execution', { primaryDomain: 'development' });
  const running = state.load();
  assert.strictEqual(running.status, 'RUNNING');
  assert.strictEqual(running.activeTask.description, 'Test task execution');

  // Test milestone tracking
  state.addMilestone('Phase 1 Started');
  state.completeMilestone('Phase 1 Started');
  const withMilestone = state.load();
  assert.strictEqual(withMilestone.milestones[0].status, 'COMPLETED');

  // Test failure recording
  state.recordFailure({ method: 'testMethod' }, new Error('Sample Error'), 'Switched to fallback');
  const withFailure = state.load();
  assert.strictEqual(withFailure.cycleCount, 1);
  assert.strictEqual(withFailure.recoveryAttempts.length, 1);
  assert.strictEqual(withFailure.recoveryAttempts[0].strategyChange, 'Switched to fallback');

  // Test artifact verification recording
  state.recordVerification('test.js', 'PASS', 'Syntax validated');
  const withVerif = state.load();
  assert.strictEqual(withVerif.verifiedArtifacts.length, 1);
  assert.strictEqual(withVerif.verifiedArtifacts[0].status, 'PASS');

  // Test task completion
  state.completeTask('Finished successfully');
  const completed = state.load();
  assert.strictEqual(completed.status, 'COMPLETED');

  // Cleanup
  if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });

  console.log('  ✅ StateManager tests passed!');
  return true;
}

module.exports = testState;
if (require.main === module) testState();
