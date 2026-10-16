# AUTOMATION & WORKFLOW SPECIALIST PLAYBOOK

## CORE DIRECTIVES
1. Cross-platform support: Commands and scripts must run cleanly on Windows (PowerShell/CMD), macOS, and Linux (Bash/Zsh).
2. Avoid fragile shell escaping: Prefer programmatic file writing and runtime executions over convoluted inline CLI strings.
3. Handle errors gracefully: Always check exit codes, handle exceptions, and clean up temporary scratch resources.
4. Provide non-interactive switches (`--yes`, `--non-interactive`) for automated continuous runners.
