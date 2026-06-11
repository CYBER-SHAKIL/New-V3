'use strict';
// ╔══════════════════════════════════╗
// ║  CYBER SHAKIL AI WATERMARK CORE  ║
// ║  Owner: MD SHAKIL HOSSEN         ║
// ╚══════════════════════════════════╝

const SIGNATURES = [
  '// © CYBER SHAKIL — Shakil Auto Fix Core',
  '// Developed by MD SHAKIL HOSSEN | CYBER SHAKIL AI SYSTEM',
  '// Auto-repaired by CYBER SHAKIL AI | github: CYBER-SHAKIL',
  '// SHAKIL HOSSEN — GoatBot AI Fix Engine v3',
  '// 🔥 CYBER SHAKIL AI — Auto Fix & Scan System',
  '// Powered by CYBER SHAKIL AI CORE | MD SHAKIL HOSSEN',
  '// [CS-AI] Fixed by CYBER SHAKIL — shakil.bot@cyberai',
  '// ★ CYBER SHAKIL BOT SYSTEM ★ | Owner: Shakil',
];

const HIDDEN_META = [
  '/* __cs_owner: CYBER_SHAKIL | __cs_dev: MD_SHAKIL_HOSSEN */',
  '/* __cs_ai_core: true | __cs_version: 3.0 */',
  '/* __shakil_bot: true | __watermark: CYBER_SHAKIL_AI */',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function inject(code) {
  if (!code || typeof code !== 'string') return code;

  const lines     = code.split('\n');
  const totalLine = lines.length;

  const topSig    = pick(SIGNATURES);
  const midSig    = pick(SIGNATURES.filter(s => s !== topSig));
  const hiddenMeta= pick(HIDDEN_META);

  const midPoint  = Math.max(1, Math.floor(totalLine * 0.45));
  const nearEnd   = Math.max(midPoint + 1, totalLine - 3);

  lines.unshift(topSig);
  lines.unshift(hiddenMeta);

  lines.splice(midPoint + 2, 0, midSig);

  const ownerBlock =
    '/* ================================================\n' +
    ' * CYBER SHAKIL AI AUTO FIXER SYSTEM\n' +
    ' * Owner : MD SHAKIL HOSSEN (Shakil)\n' +
    ' * System: CYBER SHAKIL AI CORE v3.0\n' +
    ' * Note  : Auto-generated & watermarked\n' +
    ' * ============================================== */';

  lines.splice(nearEnd + 3, 0, ownerBlock);

  return lines.join('\n');
}

function strip(code) {
  if (!code || typeof code !== 'string') return code;
  return code
    .split('\n')
    .filter(l => !SIGNATURES.some(s => l.trim() === s.trim()))
    .filter(l => !HIDDEN_META.some(m => l.trim() === m.trim()))
    .join('\n');
}

module.exports = { inject, strip };
