const fs = require('fs');
const path = require('path');

/**
 * Permission Manager & Security Model
 * Manages risk tiers, configuration backups, secret sanitization, and path safety
 */
class PermissionManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
    this.backupDir = path.join(this.baseDir, '.budds', 'backups');
    this.init();
  }

  init() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Risk Tiers definition
   */
  static get RISK_TIERS() {
    return {
      READ: { level: 1, name: 'READ', description: 'Safe read-only operations' },
      WRITE: { level: 2, name: 'WRITE', description: 'Scoped filesystem modifications within project' },
      EXECUTE: { level: 3, name: 'EXECUTE', description: 'Standard command and script execution' },
      DANGEROUS: { level: 4, name: 'DANGEROUS', description: 'Privileged operations, external deletion, system changes' }
    };
  }

  /**
   * Assess the risk tier of a planned operation
   */
  assessRisk(operationType, targetPath = null, command = null) {
    if (command) {
      const lowerCmd = command.toLowerCase();
      if (lowerCmd.includes('rm -rf /') || lowerCmd.includes('del /f /s /q c:\\') || lowerCmd.includes('format ') || lowerCmd.includes('mkfs')) {
        return PermissionManager.RISK_TIERS.DANGEROUS;
      }
      return PermissionManager.RISK_TIERS.EXECUTE;
    }

    if (operationType === 'delete' || operationType === 'uninstall') {
      if (targetPath && !this.isPathWithinWorkspace(targetPath)) {
        return PermissionManager.RISK_TIERS.DANGEROUS;
      }
      return PermissionManager.RISK_TIERS.WRITE;
    }

    if (operationType === 'write' || operationType === 'install') {
      return PermissionManager.RISK_TIERS.WRITE;
    }

    return PermissionManager.RISK_TIERS.READ;
  }

  /**
   * Verify that a path resides safely inside the workspace
   */
  isPathWithinWorkspace(targetPath) {
    if (!targetPath) return false;
    const resolved = path.resolve(targetPath);
    return resolved.startsWith(this.baseDir);
  }

  /**
   * Create an automated backup of a file before overwriting/modifying it
   */
  backupFile(targetPath) {
    if (!fs.existsSync(targetPath)) return null;

    const relName = path.relative(this.baseDir, targetPath).replace(/[\/\\]/g, '_');
    const backupName = `${Date.now()}_${relName}.bak`;
    const dest = path.join(this.backupDir, backupName);

    try {
      fs.copyFileSync(targetPath, dest);
      return dest;
    } catch (e) {
      console.warn(`Failed to create backup for ${targetPath}:`, e.message);
      return null;
    }
  }

  /**
   * Restore a file from its most recent backup
   */
  restoreLatestBackup(targetPath) {
    const relName = path.relative(this.baseDir, targetPath).replace(/[\/\\]/g, '_');
    const files = fs.readdirSync(this.backupDir).filter(f => f.includes(relName)).sort().reverse();
    if (files.length === 0) return false;

    const latest = path.join(this.backupDir, files[0]);
    fs.copyFileSync(latest, targetPath);
    return true;
  }

  /**
   * Sanitize secrets, tokens, passwords, and private keys from strings and objects
   */
  sanitizeSecrets(input) {
    if (typeof input === 'string') {
      return input
        .replace(/(Bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*/gi, '$1[REDACTED_BEARER_TOKEN]')
        .replace(/(api[_-]?key\s*[:=]\s*['"]?)[A-Za-z0-9\-_]{16,}['"]?/gi, '$1[REDACTED_API_KEY]')
        .replace(/(password\s*[:=]\s*['"]?)[^'"\s]{4,}['"]?/gi, '$1[REDACTED_PASSWORD]')
        .replace(/(secret\s*[:=]\s*['"]?)[A-Za-z0-9\-_]{16,}['"]?/gi, '$1[REDACTED_SECRET]')
        .replace(/-----BEGIN\s+PRIVATE\s+KEY-----[\s\S]+?-----END\s+PRIVATE\s+KEY-----/gi, '[REDACTED_PRIVATE_KEY]');
    }

    if (typeof input === 'object' && input !== null) {
      if (Array.isArray(input)) {
        return input.map(item => this.sanitizeSecrets(item));
      }
      const copy = {};
      for (const [k, v] of Object.entries(input)) {
        const lowerKey = k.toLowerCase();
        if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('apikey')) {
          copy[k] = '[REDACTED]';
        } else {
          copy[k] = this.sanitizeSecrets(v);
        }
      }
      return copy;
    }

    return input;
  }
}

module.exports = PermissionManager;
