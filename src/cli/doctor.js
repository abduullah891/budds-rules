const fs = require('fs');
const path = require('path');
const RulesEngine = require('../core/rules-engine');
const SkillRegistry = require('../skills');
const AdapterRegistry = require('../adapters');
const StateManager = require('../core/state');

function runDoctor(targetDir = process.cwd()) {
  console.log('\n========================================');
  console.log('   BUDDS-RULES SYSTEM HEALTH DOCTOR   ');
  console.log('========================================\n');

  const diagnostics = [];
  let allHealthy = true;

  // 1. Node.js environment
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
  const nodeOk = major >= 18;
  diagnostics.push({
    item: 'Node.js Runtime',
    status: nodeOk ? 'PASS' : 'FAIL',
    details: `${nodeVersion} (Requires Node >= 18.0.0)`
  });
  if (!nodeOk) allHealthy = false;

  // 2. Canonical AGENTS.md integrity
  try {
    const rulesEngine = new RulesEngine(targetDir);
    const integrity = rulesEngine.validateIntegrity();
    diagnostics.push({
      item: 'Canonical AGENTS.md Integrity',
      status: integrity.valid ? 'PASS' : 'FAIL',
      details: integrity.valid ? `All core commandments present (${integrity.sectionsCount} sections)` : `Missing keywords: ${integrity.missing.join(', ')}`
    });
    if (!integrity.valid) allHealthy = false;
  } catch (e) {
    diagnostics.push({
      item: 'Canonical AGENTS.md Integrity',
      status: 'FAIL',
      details: e.message
    });
    allHealthy = false;
  }

  // 3. On-Demand Skills
  try {
    const skillRegistry = new SkillRegistry();
    const skills = skillRegistry.getAllSkills();
    const skillsOk = skills.length >= 6;
    diagnostics.push({
      item: 'Automatic Skills Catalog',
      status: skillsOk ? 'PASS' : 'WARN',
      details: `${skills.length} modular skills discovered (${skills.map(s => s.domain).join(', ')})`
    });
  } catch (e) {
    diagnostics.push({
      item: 'Automatic Skills Catalog',
      status: 'FAIL',
      details: e.message
    });
    allHealthy = false;
  }

  // 4. Universal Agent Adapters
  try {
    const adapterRegistry = new AdapterRegistry();
    const verified = adapterRegistry.verifyAll(targetDir);
    const passed = verified.filter(v => v.pass);
    diagnostics.push({
      item: 'Universal AI Agent Adapters',
      status: passed.length > 0 ? 'PASS' : 'WARN',
      details: `${passed.length}/${verified.length} adapters active in workspace (${passed.map(p => p.adapter).join(', ') || 'None yet, run `budds install`'})`
    });
  } catch (e) {
    diagnostics.push({
      item: 'Universal AI Agent Adapters',
      status: 'FAIL',
      details: e.message
    });
  }

  // 5. Persistent State Engine
  try {
    const stateManager = new StateManager(targetDir);
    const state = stateManager.load();
    diagnostics.push({
      item: 'Persistent Task State (.budds/state.json)',
      status: state ? 'PASS' : 'FAIL',
      details: state ? `Status: ${state.status}, Cycles: ${state.cycleCount || 0}` : 'State uninitialized'
    });
  } catch (e) {
    diagnostics.push({
      item: 'Persistent Task State Engine',
      status: 'FAIL',
      details: e.message
    });
    allHealthy = false;
  }

  // Render Table
  diagnostics.forEach(d => {
    const icon = d.status === 'PASS' ? '✅' : (d.status === 'WARN' ? '⚠️' : '❌');
    console.log(`${icon} [${d.status.padEnd(4)}] ${d.item.padEnd(35)} : ${d.details}`);
  });

  console.log('\n----------------------------------------');
  if (allHealthy) {
    console.log('System Status: HEALTHY & FULLY OPERATIONAL');
  } else {
    console.log('System Status: ISSUES DETECTED. Run `budds install` to repair.');
  }
  console.log('----------------------------------------\n');

  return { allHealthy, diagnostics };
}

module.exports = runDoctor;
