const assert = require('assert');
const TaskClassifier = require('../src/core/classifier');

function testClassifier() {
  console.log('Testing TaskClassifier...');
  const classifier = new TaskClassifier();

  // Test 1: Development classification
  const devRes = classifier.classify('Please implement a new authentication REST API module with JWT');
  assert.strictEqual(devRes.primaryDomain, 'development', 'Should classify as development');
  assert.strictEqual(devRes.leadSpecialist, 'coder', 'Lead specialist should be coder');
  assert.ok(devRes.autoLoadedSkills.includes('development'), 'Should auto-load development skill without /skill');

  // Test 2: Debugging classification
  const debugRes = classifier.classify('The application crashed with an unexpected syntax error and broken stack trace');
  assert.strictEqual(debugRes.primaryDomain, 'debugging', 'Should classify as debugging');
  assert.strictEqual(debugRes.leadSpecialist, 'debugger', 'Lead specialist should be debugger');
  assert.ok(debugRes.autoLoadedSkills.includes('debugging'), 'Should auto-load debugging skill without /skill');

  // Test 3: Testing classification
  const testRes = classifier.classify('Write comprehensive unit tests with assertions and coverage benchmarks');
  assert.strictEqual(testRes.primaryDomain, 'testing', 'Should classify as testing');
  assert.strictEqual(testRes.leadSpecialist, 'tester', 'Lead specialist should be tester');

  // Test 4: Research classification
  const researchRes = classifier.classify('Investigate the official documentation and study the architectural patterns');
  assert.strictEqual(researchRes.primaryDomain, 'research', 'Should classify as research');
  assert.strictEqual(researchRes.leadSpecialist, 'researcher', 'Lead specialist should be researcher');

  // Test 5: Automation classification
  const autoRes = classifier.classify('Automate the installer script and configure the CI/CD pipeline');
  assert.strictEqual(autoRes.primaryDomain, 'automation', 'Should classify as automation');

  // Test 6: Documentation classification
  const docRes = classifier.classify('Update the README manual and document the API specification');
  assert.strictEqual(docRes.primaryDomain, 'documentation', 'Should classify as documentation');

  // Test 7: Multi-domain detection
  const multiRes = classifier.classify('Debug the failing database connection and implement a unit test');
  assert.ok(multiRes.domains.includes('debugging'), 'Should include debugging');
  assert.ok(multiRes.domains.includes('testing'), 'Should include testing');

  console.log('  ✅ TaskClassifier tests passed! Zero-touch skill selection verified.');
  return true;
}

module.exports = testClassifier;
if (require.main === module) testClassifier();
