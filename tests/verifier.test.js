const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ResultVerifier = require('../src/core/verifier');

function testVerifier() {
  console.log('Testing ResultVerifier...');
  const verifier = new ResultVerifier(null);

  // Test 1: File existence verification
  const pkgFile = path.join(__dirname, '..', 'package.json');
  const fileRes = verifier.verifyFile(pkgFile, 10);
  assert.strictEqual(fileRes.pass, true, 'package.json should pass file verification');

  const nonExistent = path.join(__dirname, 'no_such_file.xyz');
  const failRes = verifier.verifyFile(nonExistent);
  assert.strictEqual(failRes.pass, false, 'Non-existent file should fail verification');

  // Test 2: JSON Syntax verification
  const jsonRes = verifier.verifySyntax(pkgFile);
  assert.strictEqual(jsonRes.pass, true, 'package.json syntax should be valid');

  // Test 3: Command execution verification
  const cmdRes = verifier.verifyCommand('node -v', 'v[0-9]+');
  assert.strictEqual(cmdRes.pass, true, 'node -v should match regex');

  console.log('  ✅ ResultVerifier tests passed! Evidence-based verification confirmed.');
  return true;
}

module.exports = testVerifier;
if (require.main === module) testVerifier();
