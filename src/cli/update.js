const runInstall = require('./install');
const runDoctor = require('./doctor');

async function runUpdate(options = {}) {
  console.log('\n========================================');
  console.log('       BUDDS-RULES FRAMEWORK UPDATE     ');
  console.log('========================================\n');

  console.log('Synchronizing canonical rules to all registered AI agent adapters...');
  const installResult = await runInstall({ ...options, force: true });

  console.log('\nRunning post-update verification...');
  const doctorResult = runDoctor(options.dir || process.cwd());

  console.log('Update finished.\n');
  return { installResult, doctorResult };
}

module.exports = runUpdate;
