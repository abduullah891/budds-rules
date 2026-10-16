const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PermissionManager = require('../core/permissions');

class ClaudeCodeAdapter {
  constructor() {
    this.id = 'claudecode';
    this.name = 'Anthropic Claude Code';
    this.activationMechanism = 'Root or global markdown instructions (CLAUDE.md)';
    this.verificationMechanism = 'Verify CLAUDE.md existence and claude binary discovery';
    this.configurationLocations = ['CLAUDE.md', '~/.claude/CLAUDE.md'];
    this.supportedCapabilities = ['always_on_rules', 'zero_touch_skills', 'persistent_context'];
    this.limitations = [
      'Claude Code loads CLAUDE.md in current working directory or ~/.claude/CLAUDE.md.',
      'Context windows in long-running tasks require concise summaries to prevent compaction drops.'
    ];
    this.permissions = new PermissionManager();
  }

  getCapabilities() {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.supportedCapabilities,
      configLocations: this.configurationLocations,
      activationMechanism: this.activationMechanism,
      verificationMechanism: this.verificationMechanism,
      limitations: this.limitations
    };
  }

  detect(targetDir) {
    return fs.existsSync(path.join(targetDir, 'CLAUDE.md')) ||
           fs.existsSync(path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude'));
  }

  configure(targetDir, config = {}) {
    const claudeFile = path.join(targetDir, 'CLAUDE.md');
    this.permissions.backupFile(claudeFile);
    return { success: true, adapter: this.id, config };
  }

  activate(targetDir) {
    const detected = this.detect(targetDir);
    return {
      active: detected,
      adapter: this.id,
      message: detected ? 'Claude Code CLAUDE.md active' : 'Claude Code instructions missing'
    };
  }

  execute(targetDir, prompt, options = {}) {
    try {
      execSync('where claude', { stdio: 'pipe' });
      // Execute non-interactive prompt if requested
      const out = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
        cwd: targetDir,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { supported: true, success: true, output: out };
    } catch (e) {
      return { supported: true, success: false, error: e.message };
    }
  }

  install(targetDir, options = {}) {
    const claudeFile = options.global 
      ? path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'CLAUDE.md')
      : path.join(targetDir, 'CLAUDE.md');

    this.permissions.backupFile(claudeFile);
    const dir = path.dirname(claudeFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const content = `# BUDDS-RULES: CLAUDE CODE EXECUTION RULES

The agent must NEVER give up on a user's task simply because an attempt failed.
This is the canonical behavioral requirement of BUDDS-RULES.

## 1. NEVER GIVE UP (ABSOLUTE MANDATE)
- Never abandon a task because of difficulty or early errors.
- Never declare a task impossible while viable alternatives remain unexplored.
- Never surrender simply because the task requires extensive work.

## 2. 7-STEP INFINITE PROBLEM-SOLVING MINDSET
When an approach fails:
1. Analyze failure -> 2. Root cause -> 3. Reconsider -> 4. Alternatives -> 5. Try implementation -> 6. Test -> 7. Repeat until success or real blocker.
*Do not repeat identical failed attempts without changing the approach.*

## 3. ZERO-TOUCH AUTOMATIC SKILL & SPECIALIST SELECTION
Automatically classify incoming tasks (development, debugging, research, testing, automation, documentation) without requiring the user to invoke /skill.

## 4. PERSISTENT TASK STATE & VERIFICATION
- Never claim success without running tests or inspecting exit codes.
- Maintain continuity and preserve verified intermediate states.
`;

    fs.writeFileSync(claudeFile, content, 'utf8');

    return {
      success: true,
      adapter: this.id,
      createdFiles: [claudeFile],
      message: `Installed BUDDS-RULES for Claude Code at ${claudeFile}`
    };
  }

  uninstall(targetDir, options = {}) {
    const claudeFile = options.global 
      ? path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'CLAUDE.md')
      : path.join(targetDir, 'CLAUDE.md');

    const removedFiles = [];
    if (fs.existsSync(claudeFile)) {
      this.permissions.backupFile(claudeFile);
      fs.unlinkSync(claudeFile);
      removedFiles.push(claudeFile);
    }

    return {
      success: true,
      adapter: this.id,
      removedFiles,
      message: `Uninstalled Claude Code adapter files (${removedFiles.length} removed)`
    };
  }

  verify(targetDir) {
    const claudeFile = path.join(targetDir, 'CLAUDE.md');
    const exists = fs.existsSync(claudeFile);
    const content = exists ? fs.readFileSync(claudeFile, 'utf8') : '';
    const hasNeverGiveUp = content.includes('NEVER GIVE UP');

    return {
      pass: exists && hasNeverGiveUp,
      adapter: this.id,
      details: exists ? `CLAUDE.md verified (${content.length} bytes)` : 'CLAUDE.md missing'
    };
  }
}

module.exports = ClaudeCodeAdapter;
