class ArchitectAgent {
  constructor() {
    this.role = 'architect';
    this.title = 'Systems Architect';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'MODULAR_EXTENSIBLE_DESIGN',
      steps: [
        `Deconstruct system requirements for domain: ${classification.primaryDomain}`,
        `Define module boundaries and data contracts`,
        `Delegate execution to specialized agents`,
        `Coordinate end-to-end integration verification`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = ArchitectAgent;
