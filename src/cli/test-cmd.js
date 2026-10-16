const path = require('path');
const runAllTests = require('../../tests/run-all');

async function runTestCommand(options = {}) {
  console.log('\nExecuting BUDDS-RULES Automated Test Suite...\n');
  try {
    // If run-all exports function, invoke it
    if (typeof runAllTests === 'function') {
      await runAllTests();
    } else {
      const { execSync } = require('child_process');
      execSync('node tests/run-all.js', { cwd: path.join(__dirname, '..', '..'), stdio: 'inherit' });
    }
  } catch (e) {
    console.error('Test execution error:', e.message);
    process.exit(1);
  }
}

module.exports = runTestCommand;
