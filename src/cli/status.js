const StateManager = require('../core/state');

function runStatus(targetDir = process.cwd()) {
  const stateManager = new StateManager(targetDir);
  const state = stateManager.load();

  console.log('\n========================================');
  console.log('       BUDDS-RULES TASK STATE STATUS    ');
  console.log('========================================\n');

  if (!state || !state.activeTask) {
    console.log('Status: IDLE (No active task)');
    console.log(`Last State Update: ${state?.lastUpdated || 'Never'}\n`);
    return;
  }

  console.log(`Active Task ID   : ${state.activeTask.id}`);
  console.log(`Task Description : ${state.activeTask.description}`);
  console.log(`Task Status      : ${state.status}`);
  console.log(`Started At       : ${state.activeTask.startedAt}`);
  console.log(`Cycles Used      : ${state.cycleCount || 0} / ${state.maxCycles || 15}`);
  console.log(`Primary Domain   : ${state.activeTask.classification?.primaryDomain || 'N/A'}`);
  console.log(`Lead Specialist  : ${state.activeTask.classification?.leadSpecialist || 'coder'}`);

  console.log('\n📌 MILESTONES:');
  if (state.milestones && state.milestones.length > 0) {
    state.milestones.forEach(m => {
      const icon = m.status === 'COMPLETED' ? '✅' : '⏳';
      console.log(`  ${icon} [${m.status.padEnd(9)}] ${m.title}`);
    });
  } else {
    console.log('  No milestones recorded yet.');
  }

  console.log('\n🛠️ RECOVERY ATTEMPTS (7-Step Mindset):');
  if (state.recoveryAttempts && state.recoveryAttempts.length > 0) {
    state.recoveryAttempts.forEach(r => {
      console.log(`  • Attempt #${r.attemptNumber}: ${r.strategyChange}`);
      console.log(`    Error: ${r.errorDetails}`);
    });
  } else {
    console.log('  Zero recovery cycles needed (Clean execution).');
  }

  console.log('\n🔍 VERIFIED ARTIFACTS:');
  if (state.verifiedArtifacts && state.verifiedArtifacts.length > 0) {
    state.verifiedArtifacts.forEach(v => {
      const icon = v.status === 'PASS' ? '✅' : '❌';
      console.log(`  ${icon} [${v.status}] ${v.path} - ${v.details}`);
    });
  } else {
    console.log('  No artifacts verified yet.');
  }

  console.log('\n----------------------------------------\n');
}

module.exports = runStatus;
