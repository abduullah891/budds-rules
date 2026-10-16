const runInit = require('./init');
const runInstall = require('./install');
const runUninstall = require('./uninstall');
const runUpdate = require('./update');
const runDoctor = require('./doctor');
const runList = require('./list');
const runStatus = require('./status');
const { runConfig } = require('./config');
const runValidate = require('./validate');
const runResume = require('./resume');
const runLogs = require('./logs');
const runTestCommand = require('./test-cmd');

function printHelp() {
  console.log(`
BUDDS-RULES CLI v2.0 — Autonomous AI Agent Rules & Execution Framework

Usage:
  budds <command> [options]

Core Commands:
  init        Initialize BUDDS-RULES in the current workspace (.budds/)
  install     Install BUDDS-RULES adapters to project or global config
  uninstall   Remove BUDDS-RULES adapters from project or global config
  update      Synchronize rules across all registered adapters & update
  doctor      Diagnose health, agent adapters, skills, and rule integrity
  status      Show current task state, cycle count, and recovery attempts
  config      Inspect and configure framework settings (get/set/reset)

Execution & Quality Commands:
  validate    Validate canonical rule integrity and adapter configurations
  resume      Resume an interrupted or stopped task from last verified state
  logs        View recent execution events from .budds/execution.log
  test        Execute the automated test suite

Discovery Commands:
  list        List available modular skills, specialists, and agent adapters
  adapters    Display all universal AI agent adapters and capabilities
  skills      Display on-demand modular skills catalog
  agents      Display modular specialist agents

Options:
  --global, -g     Install/configure globally (~/)
  --project, -p    Install to current workspace project (default)
  --agent <name>   Target specific agent (antigravity, claudecode, cursor, etc.)
  --json           Output result in JSON format
  --force, -f      Force operation / overwrite existing configurations
  --help, -h       Display this help message
  --version, -v    Display version information

Examples:
  budds init
  budds install --agent antigravity
  budds doctor
  budds status --json
  budds resume
`);
}

async function main(argv = process.argv.slice(2)) {
  const command = argv[0];
  const args = argv.slice(1);

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v' || command === 'version') {
    const pkg = require('../../package.json');
    console.log(`budds-rules v${pkg.version}`);
    return;
  }

  const options = {
    global: args.includes('--global') || args.includes('-g'),
    force: args.includes('--force') || args.includes('-f'),
    json: args.includes('--json'),
    dir: process.cwd()
  };

  const agentIdx = args.indexOf('--agent');
  if (agentIdx !== -1 && args[agentIdx + 1]) {
    options.agent = args[agentIdx + 1];
  }

  switch (command) {
    case 'init':
      runInit(options);
      break;

    case 'install':
      await runInstall(options);
      break;

    case 'uninstall':
    case 'remove':
      await runUninstall(options);
      break;

    case 'update':
      await runUpdate(options);
      break;

    case 'doctor':
      runDoctor(options.dir);
      break;

    case 'status':
      runStatus(options.dir);
      break;

    case 'validate':
      runValidate(options);
      break;

    case 'resume':
      runResume(options);
      break;

    case 'logs':
      runLogs(options);
      break;

    case 'test':
      await runTestCommand(options);
      break;

    case 'list':
      runList(args[0] || 'all');
      break;

    case 'adapters':
      runList('adapters');
      break;

    case 'skills':
      runList('skills');
      break;

    case 'agents':
      runList('specialists');
      break;

    case 'config': {
      const subAction = args[0] || 'get';
      const key = args[1];
      const val = args[2];
      runConfig(subAction, key, val, options.dir);
      break;
    }

    default:
      console.error(`Unknown command: "${command}"\nRun 'budds --help' for available commands.`);
      process.exit(1);
  }
}

module.exports = main;
