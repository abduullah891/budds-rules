class SecurityReviewerAgent {
  constructor() {
    this.role = 'security';
    this.title = 'Application Security & Vulnerability Auditor';
  }

  plan(prompt, classification, loadedSkills) {
    return {
      leadRole: this.role,
      strategy: 'THREAT_MODELING_AND_VULNERABILITY_TRIAGE',
      steps: [
        `Scan for hardcoded credentials, secret leaks, and sensitive keys`,
        `Audit authentication, authorization, and permission enforcement`,
        `Check for common vulnerabilities (injection, insecure deserialization, SSRF)`,
        `Verify input validation, path sanitization, and rate limiting controls`
      ],
      skillsInUse: loadedSkills.map(s => s.name || s.id)
    };
  }
}

module.exports = SecurityReviewerAgent;
