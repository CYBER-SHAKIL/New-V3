'use strict';
// ╔═══════════════════════════════════════════════════╗
// ║  CYBER SHAKIL AI AUTO FIXER — Main Orchestrator   ║
// ║  Developed by MD SHAKIL HOSSEN                    ║
// ║  © CYBER SHAKIL AI CORE v3.0                      ║
// ╚═══════════════════════════════════════════════════╝

const fs            = require('fs-extra');
const path          = require('path');
const Logger        = require('./Logger');
const BackupManager = require('./BackupManager');
const Watermark     = require('./WatermarkInjector');
const { scanFile, formatReport }  = require('./scanner/FileScanner');
const { validateCode }            = require('./validators/SyntaxValidator');
const { getModelQueue }           = require('./router/AIRouter');
const { callModel, extractCode }  = require('./modelHandlers/OpenRouterClient');
const { SYSTEM_PROMPT, buildFixPrompt, buildScanOnlyPrompt, buildCreatePrompt } = require('./PromptBuilder');

const CMDS_DIR   = path.join(process.cwd(), 'scripts', 'cmds');
const BACKUP_DIR = path.join(process.cwd(), 'backup');

// ── Helpers ────────────────────────────────────────────────────────────────

function resolveCmdPath(filename) {
  const safe = path.basename(filename.replace(/\.\./g, '').trim());
  if (!safe.endsWith('.js')) return null;

  const candidates = [
    path.join(CMDS_DIR, safe),
    path.join(CMDS_DIR, safe.charAt(0).toUpperCase() + safe.slice(1)),
    path.join(CMDS_DIR, safe.toLowerCase()),
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

function progressMsg(step, total, label) {
  const filled = Math.round((step / total) * 10);
  const bar    = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return `[${bar}] ${step}/${total} — ${label}`;
}

// ── FIX ───────────────────────────────────────────────────────────────────

async function fixFile(filename, { onProgress } = {}) {
  Logger.header();
  const emit = onProgress || (() => {});

  // Step 1: Resolve file
  emit(progressMsg(1, 8, '🔍 Locating file...'));
  Logger.step('Locating file...');
  const filePath = resolveCmdPath(filename);
  if (!filePath) {
    return {
      ok: false,
      msg: `❌ File not found: *${filename}*\nMake sure the file exists in scripts/cmds/`
    };
  }
  Logger.success(`Found: ${filePath}`);

  // Step 2: Scan
  emit(progressMsg(2, 8, '🔬 Scanning for issues...'));
  Logger.step('Scanning file...');
  const scanResult = scanFile(filePath);
  const { issues, warnings, info } = scanResult;

  if (!issues.length && !warnings.length) {
    return {
      ok: true,
      msg: `✅ *${filename}* scanned — no issues found!\nHealth score: ${scanResult.score}/100 🏆`
    };
  }

  // Step 3: Backup
  emit(progressMsg(3, 8, '💾 Creating backup...'));
  Logger.step('Creating backup...');
  const backup = BackupManager.create(filePath);

  // Step 4: Build prompt
  emit(progressMsg(4, 8, '📝 Building AI prompt...'));
  Logger.step('Building prompt...');
  const userPrompt = buildFixPrompt({ raw: info.raw, issues, warnings, info });

  // Step 5: Get model queue & try each
  emit(progressMsg(5, 8, '🧠 Selecting AI model...'));
  const modelQueue = getModelQueue(scanResult);

  let fixedCode  = null;
  let usedModel  = null;
  let lastError  = null;
  let attempt    = 0;

  for (const model of modelQueue.slice(0, 4)) {
    attempt++;
    emit(progressMsg(5, 8, `🧠 Trying ${model.name} (${attempt}/4)...`));
    Logger.ai(model.name, `Attempt ${attempt}...`);
    try {
      const raw   = await callModel(model.id, SYSTEM_PROMPT, userPrompt, 90000);
      fixedCode   = extractCode(raw);
      usedModel   = model;
      Logger.success(`Got code from ${model.name}`);
      break;
    } catch (err) {
      lastError = err.message;
      Logger.warn(`${model.name} failed: ${err.message}`);
    }
  }

  if (!fixedCode) {
    return {
      ok: false,
      msg: `❌ All AI models failed to fix *${filename}*.\n\nLast error: ${lastError}\n\n💡 Tip: Set OPENROUTER_API_KEY in Replit Secrets.`
    };
  }

  // Step 6: Validate syntax
  emit(progressMsg(6, 8, '✅ Validating syntax...'));
  Logger.step('Validating generated code...');
  const validation = validateCode(fixedCode);

  if (!validation.valid) {
    Logger.warn('Validation failed — restoring backup...');
    BackupManager.restore(backup.dest, filePath);
    return {
      ok: false,
      msg: `⚠️ AI fixed code *failed* syntax check — original restored.\n\n🔴 Error: ${validation.error?.split('\n')[0]}\n\n💡 Try: \`-fix ${filename}\` again`
    };
  }

  // Step 7: Watermark & write
  emit(progressMsg(7, 8, '💧 Injecting watermark...'));
  Logger.step('Injecting watermark...');
  const watermarked = Watermark.inject(fixedCode);

  emit(progressMsg(8, 8, '📝 Writing fixed file...'));
  Logger.step('Writing fixed file...');
  fs.writeFileSync(filePath, watermarked, 'utf8');

  BackupManager.clean(30);
  Logger.success(`Fixed & saved: ${filename}`);
  Logger.divider();

  const issueCount = issues.length;
  const warnCount  = warnings.length;

  return {
    ok:    true,
    model: usedModel.name,
    msg:
      `✅ *${filename}* fixed successfully!\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🤖 AI Used    : ${usedModel.name}\n` +
      `🔧 Issues Fixed: ${issueCount}\n` +
      `⚠️ Warnings   : ${warnCount}\n` +
      `💾 Backup     : backup/${backup.stamp}_${backup.base}\n` +
      `🏆 Health Score: ${scanResult.score}/100 → 100/100\n` +
      `\n🎉 File is ready to use! Bot may need -restart.`
  };
}

// ── SCAN ──────────────────────────────────────────────────────────────────

async function scanOnly(filename) {
  const filePath = resolveCmdPath(filename);
  if (!filePath) {
    return { ok: false, msg: `❌ File not found: *${filename}*` };
  }
  const result = scanFile(filePath);
  return { ok: true, msg: formatReport(result) };
}

// ── SCAN BOT ──────────────────────────────────────────────────────────────

async function scanBot({ onProgress } = {}) {
  const emit   = onProgress || (() => {});
  const files  = fs.readdirSync(CMDS_DIR).filter(f => f.endsWith('.js'));
  const report = [];
  let broken   = 0;

  emit(`🔍 Scanning ${files.length} command files...`);
  Logger.step(`Scanning ${files.length} commands...`);

  for (let i = 0; i < files.length; i++) {
    const fp     = path.join(CMDS_DIR, files[i]);
    const result = scanFile(fp);
    if (result.issues.length > 0) {
      broken++;
      report.push({
        file:   files[i],
        issues: result.issues.length,
        score:  result.score,
        topIssue: result.issues[0]?.msg || '?'
      });
    }
    if (i % 10 === 0) emit(`Scanned ${i + 1}/${files.length}...`);
  }

  const healthy = files.length - broken;
  let msg =
    `📊 *FULL BOT SCAN REPORT*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📁 Total commands : ${files.length}\n` +
    `✅ Healthy        : ${healthy}\n` +
    `❌ Broken         : ${broken}\n\n`;

  if (report.length) {
    msg += `*Broken files:*\n`;
    report.slice(0, 20).forEach((r, i) => {
      msg += `${i + 1}. ${r.file} — ${r.issues} issue(s)\n   └ ${r.topIssue}\n`;
    });
    if (report.length > 20) msg += `...and ${report.length - 20} more\n`;
    msg += `\n💡 Use \`-fix filename.js\` to auto-fix each one.`;
  } else {
    msg += `🎉 All commands look healthy!`;
  }

  return { ok: true, msg };
}

// ── CREATE ────────────────────────────────────────────────────────────────

async function createCommand(name, description = '') {
  Logger.step(`Creating new command: ${name}`);
  const safeName  = name.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  const outPath   = path.join(CMDS_DIR, `${safeName}.js`);

  if (fs.existsSync(outPath)) {
    return { ok: false, msg: `⚠️ Command *${safeName}.js* already exists!\nUse a different name.` };
  }

  const prompt = buildCreatePrompt(safeName, description);
  const models = ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.5-pro-preview'];

  let code = null, lastErr = null;
  for (const modelId of models) {
    try {
      const raw = await callModel(modelId, SYSTEM_PROMPT, prompt, 60000);
      code      = extractCode(raw);
      Logger.success(`Created by ${modelId}`);
      break;
    } catch (e) {
      lastErr = e.message;
      Logger.warn(`${modelId} failed: ${e.message}`);
    }
  }

  if (!code) return { ok: false, msg: `❌ Failed to create command.\n${lastErr}` };

  const validation = validateCode(code);
  if (!validation.valid) {
    return { ok: false, msg: `❌ Generated code has syntax errors:\n${validation.error?.split('\n')[0]}` };
  }

  const watermarked = Watermark.inject(code);
  fs.writeFileSync(outPath, watermarked, 'utf8');
  Logger.success(`Created: ${outPath}`);

  return {
    ok:  true,
    msg: `✅ Command *${safeName}.js* created!\n📁 Location: scripts/cmds/${safeName}.js\n🎉 Use -fix ${safeName}.js to verify it.`
  };
}

module.exports = { fixFile, scanOnly, scanBot, createCommand };
