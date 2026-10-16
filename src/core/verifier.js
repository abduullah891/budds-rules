const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ResultVerifier {
  constructor(stateManager = null) {
    this.stateManager = stateManager;
  }

  /**
   * Verify file existence and non-zero length
   */
  verifyFile(filePath, minBytes = 1) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      this.record(absPath, 'FAIL', 'File does not exist');
      return { pass: false, error: `File not found: ${absPath}` };
    }
    const stat = fs.statSync(absPath);
    if (stat.size < minBytes) {
      this.record(absPath, 'FAIL', `File size ${stat.size} is below threshold ${minBytes}`);
      return { pass: false, error: `File too small (${stat.size} bytes)` };
    }
    this.record(absPath, 'PASS', `File verified: ${stat.size} bytes`);
    return { pass: true, size: stat.size, path: absPath };
  }

  /**
   * Verify JavaScript / JSON syntax
   */
  verifySyntax(filePath) {
    const checkFile = this.verifyFile(filePath);
    if (!checkFile.pass) return checkFile;

    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf8');

    if (ext === '.json') {
      try {
        JSON.parse(content);
        this.record(filePath, 'PASS', 'JSON syntax valid');
        return { pass: true, type: 'json' };
      } catch (e) {
        this.record(filePath, 'FAIL', `JSON parse error: ${e.message}`);
        return { pass: false, error: e.message };
      }
    }

    if (ext === '.js' || ext === '.mjs') {
      try {
        execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
        this.record(filePath, 'PASS', 'JavaScript syntax check passed');
        return { pass: true, type: 'javascript' };
      } catch (e) {
        const msg = e.stderr ? e.stderr.toString() : e.message;
        this.record(filePath, 'FAIL', `JS syntax error: ${msg}`);
        return { pass: false, error: msg };
      }
    }

    return { pass: true, type: 'text' };
  }

  /**
   * Quality Gate: Programming Verification (Build, Lint, Tests)
   */
  verifyProgramming(options = {}) {
    const checks = [];

    if (options.testCommand) {
      const res = this.verifyCommand(options.testCommand, null, options.cwd);
      checks.push({ item: 'Test Suite', pass: res.pass, details: res.error || 'All tests passed' });
    }

    if (options.lintCommand) {
      const res = this.verifyCommand(options.lintCommand, null, options.cwd);
      checks.push({ item: 'Linter', pass: res.pass, details: res.error || 'Lint check passed' });
    }

    if (options.files && Array.isArray(options.files)) {
      for (const f of options.files) {
        const sRes = this.verifySyntax(f);
        checks.push({ item: `Syntax: ${path.basename(f)}`, pass: sRes.pass, details: sRes.error || 'Syntax valid' });
      }
    }

    const allPassed = checks.every(c => c.pass);
    return {
      domain: 'programming',
      pass: allPassed,
      checks
    };
  }

  /**
   * Quality Gate: Documentation Verification (Required sections & non-empty)
   */
  verifyDocumentation(filePath, requiredHeadings = []) {
    const fileCheck = this.verifyFile(filePath, 20);
    if (!fileCheck.pass) return fileCheck;

    const content = fs.readFileSync(filePath, 'utf8');
    const missing = [];

    for (const heading of requiredHeadings) {
      const regex = new RegExp(`^#+\\s+.*${heading}.*`, 'mi');
      if (!regex.test(content)) {
        missing.push(heading);
      }
    }

    const pass = missing.length === 0;
    this.record(filePath, pass ? 'PASS' : 'FAIL', pass ? 'Documentation requirements met' : `Missing headings: ${missing.join(', ')}`);

    return {
      domain: 'documentation',
      pass,
      missingHeadings: missing,
      sizeBytes: fileCheck.size
    };
  }

  /**
   * Quality Gate: Automation & Command Verification
   */
  verifyCommand(command, expectedRegex = null, cwd = process.cwd()) {
    try {
      const output = execSync(command, { cwd, stdio: 'pipe', encoding: 'utf8' });
      if (expectedRegex) {
        const regex = new RegExp(expectedRegex);
        if (!regex.test(output)) {
          this.record(command, 'FAIL', `Output did not match expected regex: ${expectedRegex}`);
          return { pass: false, error: 'Output pattern mismatch', output };
        }
      }
      this.record(command, 'PASS', 'Command executed successfully with exit 0');
      return { pass: true, output };
    } catch (e) {
      const errOut = (e.stdout || '') + '\n' + (e.stderr || '');
      this.record(command, 'FAIL', `Command failed with exit code ${e.status}: ${errOut}`);
      return { pass: false, exitCode: e.status, error: errOut };
    }
  }

  record(target, status, details) {
    if (this.stateManager) {
      this.stateManager.recordVerification(target, status, details);
    }
  }
}

module.exports = ResultVerifier;
