const fs = require('fs');
const path = require('path');
const StateManager = require('../core/state');
const { saveConfig, loadConfig } = require('./config');

function runInit(options = {}) {
  const targetDir = options.dir || process.cwd();
  console.log('\n========================================');
  console.log('       BUDDS-RULES INITIALIZATION       ');
  console.log('========================================\n');

  console.log(`Target Workspace: ${targetDir}`);
  const stateManager = new StateManager(targetDir);
  stateManager.init();

  const config = loadConfig(targetDir);
  saveConfig(config, targetDir);

  console.log('✅ Created .budds/state.json (Persistent Task Engine)');
  console.log('✅ Created .budds/config.json (Framework Settings)');
  console.log('✅ Created .budds/execution.log (Execution History)');
  console.log('\nRun `budds install` to configure AI agent adapters.');
  console.log('----------------------------------------\n');

  return { success: true, targetDir };
}

module.exports = runInit;
