class AutomationSpecialist {
  constructor() {
    this.role = 'automation';
    this.title = 'CLI & Workflow Automation Engineer';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'CROSS_PLATFORM_DETERMINISTIC_TOOLING',
      steps: [
        `Define cross-platform shell and Node.js execution routines`,
        `Implement resilient error handling and non-zero exit codes`,
        `Support both interactive and unattended/CI flags`,
        `Validate clean lifecycle cleanup of scratch and temporary resources`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = AutomationSpecialist;
