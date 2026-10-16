class DocumentationSpecialist {
  constructor() {
    this.role = 'docs';
    this.title = 'Technical Documentation & Architecture Specialist';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'ACCURATE_TECHNICAL_SPECIFICATION',
      steps: [
        `Analyze codebase and extract accurate API surfaces`,
        `Author clean, actionable markdown guides with copy-pasteable examples`,
        `Generate architectural diagrams (Mermaid) matching current implementation`,
        `Validate all links, anchors, and cross-references`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = DocumentationSpecialist;
