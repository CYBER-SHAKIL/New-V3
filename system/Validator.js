'use strict';

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class Validator {
  syntaxCheck(filePath) {
    try {
      execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
      return { valid: true, error: null };
    } catch (err) {
      const msg = (err.stderr || err.stdout || err.message || '').toString().trim();
      return { valid: false, error: msg };
    }
  }

  detectIssues(code) {
    const issues = [];

    if (/\brequire\s*\(\s*['"][^'"]+['"]\s*\)/.test(code)) {
      const missing = [];
      const requires = code.match(/require\(['"]([^'"]+)['"]\)/g) || [];
      for (const req of requires) {
        const mod = req.match(/require\(['"]([^'"]+)['"]\)/)?.[1];
        if (mod && !mod.startsWith('.') && !mod.startsWith('/')) {
          try {
            require.resolve(mod);
          } catch {
            missing.push(mod);
          }
        }
      }
      if (missing.length) {
        issues.push({ type: 'missing_imports', modules: missing });
      }
    }

    if (/await\s+[^(]/.test(code) && !/async/.test(code)) {
      issues.push({ type: 'async_issue', detail: 'await used outside async function' });
    }

    const undeclared = [];
    const declared = new Set(
      (code.match(/(?:const|let|var)\s+(\w+)/g) || []).map(m => m.split(/\s+/)[1])
    );
    const used = (code.match(/\b([a-zA-Z_$][\w$]*)\s*\(/g) || []).map(m => m.replace(/\s*\($/, '').trim());
    const builtins = new Set(['require', 'module', 'exports', 'process', 'console', 'setTimeout',
      'setInterval', 'clearTimeout', 'clearInterval', 'Promise', 'Math', 'Date', 'JSON',
      'Object', 'Array', 'String', 'Number', 'Boolean', 'Error', 'Buffer', 'global']);
    for (const u of used) {
      if (!declared.has(u) && !builtins.has(u) && !u.startsWith('_')) {
        undeclared.push(u);
      }
    }
    if (undeclared.length) {
      issues.push({ type: 'possible_undefined', identifiers: [...new Set(undeclared)].slice(0, 10) });
    }

    return issues;
  }

  classifyError(error = '') {
    const e = error.toLowerCase();
    if (e.includes('syntaxerror') || e.includes('unexpected token') || e.includes('unexpected end')) {
      return 'syntax';
    }
    if (e.includes('is not a function') || e.includes('cannot read') || e.includes('undefined')) {
      return 'logic';
    }
    if (e.includes('async') || e.includes('await') || e.includes('promise')) {
      return 'async';
    }
    if (e.includes('require') || e.includes('module') || e.includes('cannot find')) {
      return 'missing_imports';
    }
    return 'unknown';
  }
}

module.exports = new Validator();
module.exports.Validator = Validator;
