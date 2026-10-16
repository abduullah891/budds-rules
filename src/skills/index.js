const fs = require('fs');
const path = require('path');

class SkillRegistry {
  constructor(skillsDir = path.join(__dirname)) {
    this.skillsDir = skillsDir;
    this.skills = new Map();
    this.discover();
  }

  discover() {
    this.skills.clear();
    if (!fs.existsSync(this.skillsDir)) return;

    const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(this.skillsDir, entry.name, 'skill.json');
        const rulesPath = path.join(this.skillsDir, entry.name, 'rules.md');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const rules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf8') : '';
            this.skills.set(manifest.id || entry.name, {
              id: manifest.id || entry.name,
              name: manifest.name || entry.name,
              domain: manifest.domain || entry.name,
              version: manifest.version || '1.0.0',
              description: manifest.description || '',
              keywords: manifest.keywords || [],
              dependencies: manifest.dependencies || [],
              rules,
              manifest,
              dir: path.join(this.skillsDir, entry.name)
            });
          } catch (e) {
            console.warn(`Failed loading skill at ${entry.name}:`, e.message);
          }
        }
      }
    }
  }

  getSkill(id) {
    return this.skills.get(id) || null;
  }

  getAllSkills() {
    return Array.from(this.skills.values());
  }

  /**
   * Automatically loads skills matching requested domains with dependency resolution and fallback
   * @param {string[]} domains
   * @returns {Object[]} Loaded skills including dependencies
   */
  loadForDomains(domains = []) {
    const loadedMap = new Map();

    const resolveSkill = (domain) => {
      let match = this.skills.get(domain) || Array.from(this.skills.values()).find(s => s.domain === domain);
      
      // Fallback if specific domain not found: use development playbook
      if (!match) {
        match = this.skills.get('development');
      }

      if (match && !loadedMap.has(match.id)) {
        loadedMap.set(match.id, match);
        // Resolve nested dependencies
        if (Array.isArray(match.dependencies)) {
          for (const dep of match.dependencies) {
            resolveSkill(dep);
          }
        }
      }
    };

    for (const d of domains) {
      resolveSkill(d);
    }

    return Array.from(loadedMap.values());
  }

  /**
   * Search skills by keywords automatically
   */
  findMatching(query = '') {
    const q = query.toLowerCase();
    return Array.from(this.skills.values()).filter(s => {
      if (s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)) return true;
      return s.keywords.some(k => k.toLowerCase().includes(q));
    });
  }
}

module.exports = SkillRegistry;
