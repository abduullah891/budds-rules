# Contributing to BUDDS-RULES

Thank you for contributing to the **BUDDS-RULES** Autonomous AI Agent Rules & Execution Framework.

---

## 1. Core Development Philosophy

1. **Execution First**: Prioritize deterministic action over conversation.
2. **Never Give Up**: An attempt failure is a trigger to change strategy, never surrender.
3. **Zero-Touch Friction**: Users must not be required to manually activate skills via slash commands.
4. **Evidence-Based Verification**: Never mark a task or test complete without concrete evidence.
5. **No Regressions**: All 9 automated test suites must pass (`npm test`).

---

## 2. Extending the Framework

### Adding a New Modular Skill
1. Create a new directory under `src/skills/<skill-name>/`.
2. Add `skill.json` manifest:
   ```json
   {
     "id": "my-skill",
     "name": "My Skill Playbook",
     "domain": "my-domain",
     "version": "1.0.0",
     "description": "Clear capability summary",
     "keywords": ["keyword1", "keyword2"],
     "dependencies": ["development"],
     "specialistRole": "coder",
     "autoActivation": true
   }
   ```
3. Add `rules.md` containing actionable directives for the agent.
4. Update `src/core/classifier.js` if new domain signatures are required.

### Adding a New AI Agent Adapter
1. Create `src/adapters/<agent-name>.js`.
2. Implement the unified contract v2:
   ```javascript
   class MyAgentAdapter {
     constructor() {
       this.id = 'myagent';
       this.name = 'My Agent IDE';
       this.supportedCapabilities = ['always_on_rules'];
       this.configurationLocations = ['.myrules'];
       this.limitations = [];
     }
     getCapabilities() { ... }
     detect(targetDir) { ... }
     configure(targetDir, config) { ... }
     activate(targetDir) { ... }
     execute(targetDir, command, options) { ... }
     install(targetDir, options) { ... }
     uninstall(targetDir, options) { ... }
     verify(targetDir) { ... }
   }
   ```
3. Register the adapter in `src/adapters/index.js`.
4. Add independent test cases in `tests/adapters.test.js`.

### Adding a New Specialist Agent
1. Create `src/agents/<specialist>.js`.
2. Expose the agent in `src/agents/index.js`.
3. Implement `plan(prompt, classification, loadedSkills)`.

---

## 3. Running Tests

Before submitting code:
```bash
# Run all 9 test suites
npm test

# Run health diagnostics
node bin/budds.js doctor

# Run rule validation
node bin/budds.js validate
```
