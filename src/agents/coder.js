class CoderAgent {
  constructor() {
    this.role = 'coder';
    this.title = 'Full-Stack Implementation Specialist';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'INCREMENTAL_EXECUTION',
      steps: [
        `Inspect target codebase and dependency boundaries`,
        `Write modular, high-performance implementation files`,
        `Preserve existing interfaces and avoid regressions`,
        `Perform static syntax validation`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = CoderAgent;
