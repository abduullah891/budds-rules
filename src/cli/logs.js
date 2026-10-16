const fs = require('fs');
const path = require('path');

function runLogs(options = {}) {
  const targetDir = options.dir || process.cwd();
  const logFile = path.join(targetDir, '.budds', 'execution.log');
  const count = options.lines ? parseInt(options.lines, 10) : 30;

  console.log('\n========================================');
  console.log('       BUDDS-RULES EXECUTION LOGS       ');
  console.log('========================================\n');

  if (!fs.existsSync(logFile)) {
    console.log('ℹ️  No execution log file found at .budds/execution.log');
    console.log('----------------------------------------\n');
    return;
  }

  const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
  const slice = lines.slice(-count);

  console.log(`Showing last ${slice.length} of ${lines.length} log events:\n`);
  slice.forEach(l => console.log(l));

  console.log('\n----------------------------------------\n');
}

module.exports = runLogs;
