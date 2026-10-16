const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function testCLI() {
  console.log('Testing budds CLI executable and commands...');
  const cliPath = path.join(__dirname, '..', 'bin', 'budds.js');
  const cwd = path.join(__dirname, '..');

  // Test 1: Help output
  const helpOut = execSync(`node "${cliPath}" --help`, { cwd, encoding: 'utf8' });
  assert.ok(helpOut.includes('Usage:'), 'Help output must show usage');
  assert.ok(helpOut.includes('budds <command>'), 'Help output must show command syntax');

  // Test 2: Version output
  const verOut = execSync(`node "${cliPath}" --version`, { cwd, encoding: 'utf8' });
  assert.ok(verOut.includes('budds-rules v'), 'Version output must show version');

  // Test 3: Doctor command
  const docOut = execSync(`node "${cliPath}" doctor`, { cwd, encoding: 'utf8' });
  assert.ok(docOut.includes('BUDDS-RULES SYSTEM HEALTH DOCTOR'), 'Doctor output must show header');
  assert.ok(docOut.includes('Node.js Runtime'), 'Doctor must check Node runtime');
  assert.ok(docOut.includes('Canonical AGENTS.md Integrity'), 'Doctor must check AGENTS.md');

  // Test 4: List command
  const listOut = execSync(`node "${cliPath}" list`, { cwd, encoding: 'utf8' });
  assert.ok(listOut.includes('ON-DEMAND MODULAR SKILLS'), 'List must show skills');
  assert.ok(listOut.includes('development'), 'List must include development skill');
  assert.ok(listOut.includes('MODULAR SPECIALIST AGENTS'), 'List must show specialists');
  assert.ok(listOut.includes('UNIVERSAL AI AGENT ADAPTERS'), 'List must show adapters');

  // Test 5: Status command
  const statusOut = execSync(`node "${cliPath}" status`, { cwd, encoding: 'utf8' });
  assert.ok(statusOut.includes('BUDDS-RULES TASK STATE STATUS'), 'Status must show header');

  // Test 6: Config command
  const configOut = execSync(`node "${cliPath}" config`, { cwd, encoding: 'utf8' });
  assert.ok(configOut.includes('mode'), 'Config output must show mode');

  const setOut = execSync(`node "${cliPath}" config set mode resilient`, { cwd, encoding: 'utf8' });
  assert.ok(setOut.includes('Config updated: mode = "resilient"'), 'Config set must report update');

  // Test 7: Validate command
  const valOut = execSync(`node "${cliPath}" validate`, { cwd, encoding: 'utf8' });
  assert.ok(valOut.includes('BUDDS-RULES VALIDATION ENGINE'), 'Validate must show header');

  // Test 8: Logs command
  const logOut = execSync(`node "${cliPath}" logs`, { cwd, encoding: 'utf8' });
  assert.ok(logOut.includes('BUDDS-RULES EXECUTION LOGS'), 'Logs must show header');

  // Test 9: Shortcuts (adapters, skills, agents)
  const adapOut = execSync(`node "${cliPath}" adapters`, { cwd, encoding: 'utf8' });
  assert.ok(adapOut.includes('UNIVERSAL AI AGENT ADAPTERS'), 'Adapters shortcut must work');

  const skillOut = execSync(`node "${cliPath}" skills`, { cwd, encoding: 'utf8' });
  assert.ok(skillOut.includes('ON-DEMAND MODULAR SKILLS'), 'Skills shortcut must work');

  const agentOut = execSync(`node "${cliPath}" agents`, { cwd, encoding: 'utf8' });
  assert.ok(agentOut.includes('MODULAR SPECIALIST AGENTS'), 'Agents shortcut must work');

  console.log('  ✅ CLI commands verified successfully!');
  return true;
}

module.exports = testCLI;
if (require.main === module) testCLI();
