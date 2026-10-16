const SkillRegistry = require('../skills');
const AdapterRegistry = require('../adapters');
const { createSpecialistTeam } = require('../agents');

function runList(type = 'all') {
  console.log('\n========================================');
  console.log('   BUDDS-RULES CATALOG: MODULES & AGENTS');
  console.log('========================================\n');

  if (type === 'all' || type === 'skills') {
    const registry = new SkillRegistry();
    const skills = registry.getAllSkills();
    console.log('📦 ON-DEMAND MODULAR SKILLS (Zero-Touch Auto-Loaded):');
    skills.forEach(s => {
      console.log(`  • ${s.id.padEnd(15)} [${s.domain}] - ${s.name}`);
      console.log(`    Keywords: ${s.keywords.slice(0, 8).join(', ')}`);
      console.log(`    Specialist: ${s.manifest.specialistRole || 'coder'} (Auto-Active: ${s.manifest.autoActivation ? 'Yes' : 'No'})\n`);
    });
  }

  if (type === 'all' || type === 'specialists') {
    const specialists = createSpecialistTeam();
    console.log('👥 MODULAR SPECIALIST AGENTS:');
    const uniqueAgents = Array.from(new Map(Object.values(specialists).map(a => [a.role, a])).values());
    uniqueAgents.forEach(agent => {
      console.log(`  • ${agent.role.padEnd(15)} : ${agent.title}`);
    });
    console.log('');
  }

  if (type === 'all' || type === 'adapters') {
    const adapterRegistry = new AdapterRegistry();
    const adapters = adapterRegistry.getAll();
    console.log('🔌 UNIVERSAL AI AGENT ADAPTERS:');
    adapters.forEach(a => {
      console.log(`  • ${a.id.padEnd(15)} : ${a.name}`);
    });
    console.log('');
  }

  console.log('----------------------------------------');
  console.log('NOTE: Users never need to manually invoke `/skill`. Modules are auto-selected.');
  console.log('----------------------------------------\n');
}

module.exports = runList;
