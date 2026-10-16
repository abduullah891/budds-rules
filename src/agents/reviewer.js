class ReviewerAgent {
  constructor() {
    this.role = 'reviewer';
    this.title = 'Code Quality & Architectural Reviewer';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'STATIC_ANALYSIS_AND_HEURISTICS',
      steps: [
        `Inspect code structure and verify single responsibility principle`,
        `Check for code smells, antipatterns, and dead code`,
        `Validate interface consistency and backward compatibility`,
        `Ensure compliance with project conventions and guidelines`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = ReviewerAgent;
