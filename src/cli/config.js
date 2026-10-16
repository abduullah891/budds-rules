const fs = require('fs');
const path = require('path');

function getConfigFile(targetDir = process.cwd()) {
  const dir = path.join(targetDir, '.budds');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'config.json');
}

function loadConfig(targetDir = process.cwd()) {
  const file = getConfigFile(targetDir);
  const defaults = {
    mode: 'auto', // 'auto' | 'fast' | 'deep-dive' | 'resilient'
    maxCycles: 15,
    autoLoadSkills: true,
    strictVerification: true,
    enabledAdapters: ['antigravity', 'claudecode', 'cursor', 'opencode', 'windsurf', 'copilot', 'codex']
  };

  if (fs.existsSync(file)) {
    try {
      return { ...defaults, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
    } catch (_) {}
  }
  return defaults;
}

function saveConfig(config, targetDir = process.cwd()) {
  const file = getConfigFile(targetDir);
  fs.writeFileSync(file, JSON.stringify(config, null, 2), 'utf8');
  return config;
}

function runConfig(action, key, value, targetDir = process.cwd()) {
  console.log('\n========================================');
  console.log('       BUDDS-RULES CONFIGURATION        ');
  console.log('========================================\n');

  const config = loadConfig(targetDir);

  if (!action || action === 'get') {
    if (key) {
      console.log(`${key} = ${JSON.stringify(config[key])}`);
    } else {
      console.log(JSON.stringify(config, null, 2));
    }
  } else if (action === 'set') {
    if (!key || value === undefined) {
      console.log('Usage: budds config set <key> <value>');
      return;
    }

    let parsedVal = value;
    if (value === 'true') parsedVal = true;
    else if (value === 'false') parsedVal = false;
    else if (!isNaN(Number(value))) parsedVal = Number(value);

    config[key] = parsedVal;
    saveConfig(config, targetDir);
    console.log(`✅ Config updated: ${key} = ${JSON.stringify(parsedVal)}`);
  } else if (action === 'reset') {
    const file = getConfigFile(targetDir);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    console.log('✅ Configuration reset to defaults.');
  }

  console.log('\n----------------------------------------\n');
}

module.exports = { runConfig, loadConfig, saveConfig };
