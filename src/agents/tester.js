class TesterAgent {
  constructor() {
    this.role = 'tester';
    this.title = 'QA Verification & Test Engineering Specialist';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'EVIDENCE_BASED_VERIFICATION',
      steps: [
        `Identify test targets and critical execution paths`,
        `Draft unit tests, integration tests, and edge case suites`,
        `Execute test suite under non-destructive conditions`,
        `Verify zero regressions and assert PASS/FAIL criteria`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = TesterAgent;
