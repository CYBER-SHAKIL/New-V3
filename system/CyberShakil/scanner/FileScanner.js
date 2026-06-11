'use strict';
// CYBER SHAKIL AI SYSTEM — File Scanner
// Developed by MD SHAKIL HOSSEN

const fs     = require('fs-extra');
const path   = require('path');
const Logger = require('../Logger');

const GOATBOT_KEYS = ['module.exports', 'config', 'onStart', 'name', 'role', 'category', 'countDown'];
const COMMON_DEPS  = ['axios', 'fs-extra', 'canvas', 'moment-timezone', 'path', 'fs', 'os'];

function scanFile(filePath) {
  Logger.scan(`Scanning → ${path.basename(filePath)}`);

  const issues   = [];
  const warnings = [];
  const info     = {};

  if (!fs.existsSync(filePath)) {
    issues.push({ type: 'FATAL', line: 0, msg: `File not found: ${filePath}` });
    return { issues, warnings, info, score: 0 };
  }

  const raw   = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');
  info.lines = lines.length;
  info.size  = Buffer.byteLength(raw, 'utf8');
  info.name  = path.basename(filePath);

  // ── 1. GoatBot structure check ─────────────────────────
  const hasExports = raw.includes('module.exports');
  const hasConfig  = raw.includes('config') && raw.includes('name:');
  const hasOnStart = raw.includes('onStart');

  if (!hasExports) issues.push({ type: 'STRUCTURE', line: 0, msg: 'Missing module.exports' });
  if (!hasConfig)  issues.push({ type: 'STRUCTURE', line: 0, msg: 'Missing config block' });
  if (!hasOnStart) warnings.push({ type: 'STRUCTURE', line: 0, msg: 'No onStart function found' });

  // ── 2. Syntax patterns ──────────────────────────────────
  let braceDepth = 0, parenDepth = 0, bracketDepth = 0;
  lines.forEach((ln, i) => {
    const lineNo = i + 1;
    const t = ln.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    for (const ch of ln) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
      if (ch === '(') parenDepth++;
      if (ch === ')') parenDepth--;
      if (ch === '[') bracketDepth++;
      if (ch === ']') bracketDepth--;
    }

    if (t.match(/^\s*(var|let|const)\s+\w+\s*=\s*$/) )
      issues.push({ type: 'SYNTAX', line: lineNo, msg: `Incomplete assignment: "${t}"` });

    if (t.match(/\)\s*=>\s*$/) && !lines[i + 1]?.trim().startsWith('{'))
      warnings.push({ type: 'ASYNC', line: lineNo, msg: 'Arrow function may be missing body' });

    if (t.includes('await ') && !ln.match(/async\s+function|async\s*\(|async\s*\w+\s*=>/)) {
      const funcLines = lines.slice(Math.max(0, i - 10), i).join('\n');
      if (!funcLines.includes('async')) {
        issues.push({ type: 'ASYNC', line: lineNo, msg: `"await" used outside async function` });
      }
    }

    if (t.match(/require\s*\(['"]([^'"]+)['"]\)/)) {
      const dep = t.match(/require\s*\(['"]([^'"]+)['"]\)/)[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        if (!info.deps) info.deps = [];
        info.deps.push(dep);
      }
    }

    if (t.includes('undefined') && !t.startsWith('//'))
      warnings.push({ type: 'RUNTIME', line: lineNo, msg: `Possible undefined reference` });

    if (t.match(/https?:\/\/[^\s'"]+api[^\s'"]*/i))
      warnings.push({ type: 'API', line: lineNo, msg: `External API call detected — may be dead` });
  });

  if (braceDepth !== 0)
    issues.push({ type: 'SYNTAX', line: 0, msg: `Unmatched braces: ${braceDepth > 0 ? 'missing ' + braceDepth + ' }' : 'extra ' + Math.abs(braceDepth) + ' }'}` });
  if (parenDepth !== 0)
    issues.push({ type: 'SYNTAX', line: 0, msg: `Unmatched parentheses: depth=${parenDepth}` });

  // ── 3. Missing deps ─────────────────────────────────────
  info.missingDeps = [];
  (info.deps || []).forEach(dep => {
    try { require.resolve(dep); }
    catch (_) { info.missingDeps.push(dep); }
  });
  if (info.missingDeps.length) {
    info.missingDeps.forEach(d =>
      issues.push({ type: 'DEPENDENCY', line: 0, msg: `Missing package: ${d}` })
    );
  }

  // ── 4. Score ────────────────────────────────────────────
  const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

  info.hasExports = hasExports;
  info.hasConfig  = hasConfig;
  info.hasOnStart = hasOnStart;
  info.raw        = raw;

  Logger.scan(`Done — ${issues.length} issues, ${warnings.length} warnings, score: ${score}/100`);
  return { issues, warnings, info, score };
}

function formatReport({ issues, warnings, info, score }) {
  let out = `📊 *SCAN REPORT — ${info.name}*\n`;
  out += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  out += `📄 Lines: ${info.lines}  |  💾 Size: ${(info.size / 1024).toFixed(1)}KB\n`;
  out += `🏆 Health Score: ${score}/100\n\n`;

  if (!issues.length && !warnings.length) {
    out += `✅ No issues found! File looks healthy.\n`;
    return out;
  }

  if (issues.length) {
    out += `❌ *Issues (${issues.length}):*\n`;
    issues.forEach((e, i) => {
      out += `  ${i + 1}. [${e.type}]${e.line ? ` Line ${e.line}:` : ''} ${e.msg}\n`;
    });
  }

  if (warnings.length) {
    out += `\n⚠️ *Warnings (${warnings.length}):*\n`;
    warnings.slice(0, 5).forEach((w, i) => {
      out += `  ${i + 1}. [${w.type}]${w.line ? ` Line ${w.line}:` : ''} ${w.msg}\n`;
    });
    if (warnings.length > 5) out += `  ... and ${warnings.length - 5} more\n`;
  }

  if (info.missingDeps?.length) {
    out += `\n📦 *Missing packages:*\n  ${info.missingDeps.join(', ')}\n`;
    out += `  💡 Run: npm install ${info.missingDeps.join(' ')} --legacy-peer-deps\n`;
  }

  return out;
}

module.exports = { scanFile, formatReport };
