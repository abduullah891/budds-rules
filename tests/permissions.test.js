const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PermissionManager = require('../src/core/permissions');

function testPermissions() {
  console.log('Testing PermissionManager & Security Model...');
  const testDir = path.join(__dirname, 'temp_perm_test');
  if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  fs.mkdirSync(testDir, { recursive: true });

  const pm = new PermissionManager(testDir);

  // 1. Risk Tier Assessment
  const readRisk = pm.assessRisk('read');
  assert.strictEqual(readRisk.level, 1, 'Read should be tier 1');

  const writeRisk = pm.assessRisk('write', path.join(testDir, 'file.txt'));
  assert.strictEqual(writeRisk.level, 2, 'Write should be tier 2');

  const dangerousRisk = pm.assessRisk('exec', null, 'rm -rf /');
  assert.strictEqual(dangerousRisk.level, 4, 'Destructive command should be DANGEROUS');

  // 2. Secret Sanitization
  const rawLog = 'User with api_key="sk-1234567890abcdef123456" and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz failed password: "superSecretPassword123"';
  const sanitized = pm.sanitizeSecrets(rawLog);
  assert.ok(!sanitized.includes('sk-1234567890abcdef123456'), 'API key must be redacted');
  assert.ok(!sanitized.includes('superSecretPassword123'), 'Password must be redacted');
  assert.ok(sanitized.includes('[REDACTED_API_KEY]'), 'Redaction placeholder must be present');

  const objWithSecret = {
    username: 'admin',
    apiKey: 'my-super-secret-api-key-99',
    token: 'jwt-token-val'
  };
  const sanitizedObj = pm.sanitizeSecrets(objWithSecret);
  assert.strictEqual(sanitizedObj.username, 'admin');
  assert.strictEqual(sanitizedObj.apiKey, '[REDACTED]');
  assert.strictEqual(sanitizedObj.token, '[REDACTED]');

  // 3. Backup and Restore
  const sampleFile = path.join(testDir, 'sample.conf');
  fs.writeFileSync(sampleFile, 'VERSION=1', 'utf8');

  const backupPath = pm.backupFile(sampleFile);
  assert.ok(backupPath && fs.existsSync(backupPath), 'Backup file must be created');

  // Overwrite sample
  fs.writeFileSync(sampleFile, 'VERSION=2_CORRUPTED', 'utf8');
  assert.strictEqual(fs.readFileSync(sampleFile, 'utf8'), 'VERSION=2_CORRUPTED');

  // Restore latest backup
  const restored = pm.restoreLatestBackup(sampleFile);
  assert.strictEqual(restored, true, 'Restore must succeed');
  assert.strictEqual(fs.readFileSync(sampleFile, 'utf8'), 'VERSION=1', 'File must match pre-corruption state');

  // Cleanup
  if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });

  console.log('  ✅ PermissionManager security tests passed! Secrets sanitized and backups validated.');
  return true;
}

module.exports = testPermissions;
if (require.main === module) testPermissions();
