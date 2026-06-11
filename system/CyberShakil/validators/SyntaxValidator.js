'use strict';
// CYBER SHAKIL AI SYSTEM — Syntax Validator
// Developed by MD SHAKIL HOSSEN

const { execSync } = require('child_process');
const fs           = require('fs-extra');
const path         = require('path');
const Logger       = require('../Logger');

function validateCode(code) {
  const tmpFile = path.join(process.cwd(), `backup/.cs_tmp_${Date.now()}.js`);
  try {
    fs.ensureDirSync(path.dirname(tmpFile));
    fs.writeFileSync(tmpFile, code, 'utf8');
    execSync(`node --check "${tmpFile}"`, { timeout: 10000, stdio: 'pipe' });
    Logger.success('Syntax validation passed ✅');
    return { valid: true, error: null };
  } catch (err) {
    const msg = err.stderr?.toString() || err.message || 'Unknown syntax error';
    const lineMatch = msg.match(/:\s*(\d+)\s*\n/);
    const line = lineMatch ? parseInt(lineMatch[1]) : null;
    Logger.error(`Syntax validation failed${line ? ` at line ${line}` : ''}: ${msg.split('\n')[0]}`);
    return { valid: false, error: msg, line };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

function validateFile(filePath) {
  try {
    execSync(`node --check "${filePath}"`, { timeout: 10000, stdio: 'pipe' });
    return { valid: true, error: null };
  } catch (err) {
    const msg = err.stderr?.toString() || err.message || 'Syntax error';
    return { valid: false, error: msg };
  }
}

module.exports = { validateCode, validateFile };
