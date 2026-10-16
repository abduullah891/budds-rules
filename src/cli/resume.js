const StateManager = require('../core/state');

function runResume(options = {}) {
  const targetDir = options.dir || process.cwd();
  const stateManager = new StateManager(targetDir);

  console.log('\n========================================');
  console.log('       BUDDS-RULES RESUME TASK          ');
  console.log('========================================\n');

  if (!stateManager.hasInterruptedTask()) {
    console.log('ℹ️  No interrupted task found in status RUNNING/RECOVERING.');
    const state = stateManager.load();
    console.log(`Current status: ${state?.status || 'IDLE'}\n`);
    return { resumed: false };
  }

  const resumed = stateManager.resumeInterruptedTask();
  console.log(`✅ Resumed Task: ${resumed.task.id}`);
  console.log(`Description     : ${resumed.task.description}`);
  console.log(`Completed Steps : ${resumed.completedSteps.length}`);
  resumed.completedSteps.forEach(s => console.log(`   └─ ✅ ${s}`));
  console.log(`Pending Milestones: ${resumed.milestones.filter(m => m.status !== 'COMPLETED').length}`);
  console.log('\nTask continuity restored. Proceeding with remaining steps.');
  console.log('----------------------------------------\n');

  return { resumed: true, task: resumed.task };
}

module.exports = runResume;
