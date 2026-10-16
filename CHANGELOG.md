# Changelog

All notable changes to the **BUDDS-RULES** framework will be documented in this file.

## [2.0.0] - 2026-10-16

### Added
- **11-Stage Autonomous Lifecycle**: `RECEIVE → UNDERSTAND → CLASSIFY → PLAN → LOAD CAPABILITIES → EXECUTE → OBSERVE → RECOVER → VERIFY → PERSIST → REPORT`.
- **Permission & Security Model (`src/core/permissions.js`)**:
  - Implemented 4 risk tiers (`READ`, `WRITE`, `EXECUTE`, `DANGEROUS`).
  - Automated configuration backups to `.budds/backups/`.
  - Secret sanitization redacting API keys, bearer tokens, passwords, and private keys.
- **Enhanced TaskClassifier v2.0 (`src/core/classifier.js`)**:
  - Detection for 9 programming languages (JS, TS, Python, Go, Rust, PHP, Java, SQL, Shell).
  - Framework awareness (React, Vue, Express, Django, Laravel, etc.).
  - Task complexity scoring (`simple`, `moderate`, `complex`, `architectural`).
- **Complete 9 Modular Specialist Agents (`src/agents/`)**:
  - Added `ReviewerAgent` (`reviewer.js`), `SecurityReviewerAgent` (`security.js`), `DocumentationSpecialist` (`docs.js`), and `AutomationSpecialist` (`automation.js`).
- **Resilient StateManager v2.0 (`src/core/state.js`)**:
  - Atomic writes via temporary files and rename.
  - Automatic `state.backup.json` creation with corruption detection and self-healing restore.
  - Milestone dependency tracking (`dependsOn`).
  - Append-only execution history logging (`.budds/execution.log`).
- **Advanced Recovery Engine v2.0 (`src/core/recovery.js`)**:
  - Failure fingerprinting (MD5 hash of category + root snippet + method).
  - Duplicate attempt detection preventing identical failing retries.
  - Adaptive retry budget with loop protection.
  - Human-readable blocker reports for external policy barriers.
- **Domain Quality Gates (`src/core/verifier.js`)**:
  - Programming gates (build, lint, test checks).
  - Documentation gates (heading checks, file size threshold).
- **Universal Adapter Contract v2 (`src/adapters/`)**:
  - Standardized `getCapabilities()`, `configure()`, `activate()`, `execute()`, and `uninstall()` across all 7 agent adapters.
- **Expanded CLI Commands (`bin/budds.js`)**:
  - Added `budds init`, `budds validate`, `budds resume`, `budds logs`, `budds test`, `budds adapters`, `budds skills`, and `budds agents`.
- **9 Comprehensive Test Suites (`npm test`)**: 100% pass rate across all components.

## [1.1.0] - 2026-10-16

### Added
- Pluralization and word stem matching in `TaskClassifier` (`tests`, `features`, `endpoints`).
- Subagent prompt augmentation (`formatSubagentTaskPrompt`).
- Skill playbook instruction compilation (`compileSkillInstructions`).
- Interrupted task detection and resumption (`hasInterruptedTask`, `resumeInterruptedTask`).
- Stress audit suite (`tests/stress.test.js`) evaluating real agent 4-state matrix.

## [1.0.0] - 2026-10-16

### Added
- Initial modular framework inspired by `oh-my-open-pentest`.
- Canonical `AGENTS.md` and deduplicated `GEMINI.md`.
- 6 on-demand skills with zero-touch auto-activation.
- 7 universal AI agent adapters.
- Initial interactive CLI `budds`.
