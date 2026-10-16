class ResearcherAgent {
  constructor() {
    this.role = 'researcher';
    this.title = 'Intelligence & Technical Research Specialist';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'SYSTEMATIC_INTELLIGENCE_EXTRACTION',
      steps: [
        `Discover official reference documentation, specs, and sitemaps`,
        `Cross-validate compatibility matrix and breaking changes`,
        `Synthesize architectural patterns into concrete code recommendations`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = ResearcherAgent;
