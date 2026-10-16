const assert = require('assert');
const AgentOrchestrator = require('../src/core/orchestrator');

async function testWorkflow() {
  console.log('Testing ExecutionWorkflow 11-Stage Autonomous Lifecycle...');
  const orchestrator = new AgentOrchestrator(__dirname);

  // Run pipeline on a realistic prompt
  const prompt = 'Please refactor and test the authentication service with JWT tokens';
  const report = await orchestrator.execute(prompt, {}, async ({ cycle, classification, loadedSkills, plan }) => {
    // Custom simulated execution
    return { status: 'OK', cycle, domain: classification.primaryDomain };
  });

  assert.strictEqual(report.success, true, 'Workflow should complete successfully');
  assert.strictEqual(report.status, 'COMPLETED', 'Status should be COMPLETED');
  assert.strictEqual(report.classification.primaryDomain, 'development', 'Should classify as development');
  assert.ok(report.autoLoadedSkills.includes('development'), 'Should auto-load development skill without /skill');
  assert.strictEqual(report.verification.pass, true, 'Verification stage must pass');

  // Verify all 11 stages of the v2.0 lifecycle
  assert.ok(report.pipelineLog.some(p => p.stage === 'RECEIVE'), 'Pipeline must have RECEIVE stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'UNDERSTAND'), 'Pipeline must have UNDERSTAND stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'CLASSIFY'), 'Pipeline must have CLASSIFY stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'LOAD_CAPABILITIES'), 'Pipeline must have LOAD_CAPABILITIES stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'LOAD_MODULES'), 'Pipeline must have LOAD_MODULES stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'PLAN'), 'Pipeline must have PLAN stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'EXECUTE'), 'Pipeline must have EXECUTE stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'OBSERVE'), 'Pipeline must have OBSERVE stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'VERIFY'), 'Pipeline must have VERIFY stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'PERSIST'), 'Pipeline must have PERSIST stage');
  assert.ok(report.pipelineLog.some(p => p.stage === 'REPORT'), 'Pipeline must have REPORT stage');

  console.log('  ✅ 11-Stage Autonomous Lifecycle verified end-to-end!');
  return true;
}

module.exports = testWorkflow;
if (require.main === module) testWorkflow();
