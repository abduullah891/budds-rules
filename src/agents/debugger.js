class DebuggerAgent {
  constructor() {
    this.role = 'debugger';
    this.title = 'Root-Cause & Resilient Triage Specialist';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: '7_STEP_INFINITE_PROBLEM_SOLVING',
      steps: [
        `Analyze failing command output, stack traces, and exit codes`,
        `Identify underlying root cause without fixing superficial symptoms`,
        `Formulate alternate execution strategy (Rule 2: Never repeat identical failure)`,
        `Implement fix and verify resolution`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = DebuggerAgent;
