const fs = require('fs');
const path = require('path');

class RulesEngine {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.canonicalFile = path.join(this.baseDir, 'AGENTS.md');
    this.cache = null;
  }

  loadCanonicalRules() {
    if (this.cache) return this.cache;

    if (!fs.existsSync(this.canonicalFile)) {
      throw new Error(`Canonical rules file not found: ${this.canonicalFile}`);
    }

    const content = fs.readFileSync(this.canonicalFile, 'utf8');
    const parsed = this.parseRules(content);
    this.cache = parsed;
    return parsed;
  }

  parseRules(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: trimmed.replace(/^##\s+/, ''),
          content: []
        };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }
    if (currentSection) sections.push(currentSection);

    return {
      raw: content,
      title: 'BUDDS-RULES: ABSOLUTE EXECUTION & AUTONOMOUS AGENT FRAMEWORK',
      version: '2.0.0',
      canonicalPath: this.canonicalFile,
      sections: sections.map(s => ({
        title: s.title,
        body: s.content.join('\n').trim()
      }))
    };
  }

  getNeverGiveUpPrinciples() {
    const rules = this.loadCanonicalRules();
    const section = rules.sections.find(s => s.title.includes('NEVER GIVE UP') || s.title.includes('INFINITE'));
    return section ? section.body : 'NEVER GIVE UP: Failure is a signal to change strategy, not surrender.';
  }

  /**
   * Prepares task prompt for delegated subagents to ensure they inherit BUDDS-RULES
   * @param {string} taskDescription - Original subagent task description
   * @param {Object} options - Additional context or domain hints
   * @returns {string} Fully augmented task prompt with BUDDS-RULES mandate
   */
  formatSubagentTaskPrompt(taskDescription, options = {}) {
    const mandate = `[BUDDS-RULES SUBAGENT MANDATE]\n` +
      `1. NEVER GIVE UP: Failure is a signal to change strategy, never surrender.\n` +
      `2. INFINITE PROBLEM SOLVING: Analyze errors, identify root causes, try alternate implementations.\n` +
      `3. RESULT VERIFICATION: Verify outputs, check exit codes, or assert results before reporting completion.\n\n` +
      `[ASSIGNED TASK]\n${taskDescription}`;
    return mandate;
  }

  validateIntegrity() {
    const rules = this.loadCanonicalRules();
    const requiredKeywords = ['NEVER GIVE UP', 'INFINITE PROBLEM-SOLVING', 'PERSISTENT EXECUTION', 'VERIFICATION'];
    const missing = requiredKeywords.filter(k => !rules.raw.toUpperCase().includes(k));
    return {
      valid: missing.length === 0,
      missing,
      sectionsCount: rules.sections.length
    };
  }
}

module.exports = RulesEngine;
