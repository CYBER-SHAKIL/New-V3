'use strict';
// ╔═══════════════════════════════════════════════════════════╗
// ║   CYBER SHAKIL AI AUTO FIXER — Bot Command               ║
// ║   Developed by MD SHAKIL HOSSEN (CYBER SHAKIL)           ║
// ║   Commands: fix, scan, scanbot, create                    ║
// ╚═══════════════════════════════════════════════════════════╝

const path = require('path');

let AutoFixer;
try {
  AutoFixer = require('../../system/CyberShakil/AutoFixer');
} catch (e) {
  AutoFixer = null;
}

const ADMIN_UIDS = ['61590607769212', '61590612445063'];

function isOwner(uid) {
  return ADMIN_UIDS.includes(String(uid));
}

module.exports = {
  config: {
    name:             'fix',
    version:          '3.0',
    author:           '𝗖𝗬𝗕𝗘𝗥`𝗦𝗛𝗔𝗞𝗜𝗟',
    countDown:        5,
    role:             2,
    shortDescription: { en: 'AI Auto Fixer — scan, fix, create GoatBot commands' },
    longDescription:  { en: 'CYBER SHAKIL AI system: auto-detect and fix broken command files using multiple AI models via OpenRouter.' },
    category:         'owner',
    guide: {
      en:
        '  {pn} <file.js>           — AI fix a command\n' +
        '  {pn} scan <file.js>      — scan only (no fix)\n' +
        '  {pn} scanbot             — scan ALL commands\n' +
        '  {pn} create <name>       — AI create new command\n' +
        '  {pn} reload <cmd>        — hot-reload command\n' +
        '  {pn} list                — list loaded commands\n' +
        '  {pn} status              — bot status\n' +
        '  {pn} check <cmd>         — check if cmd file exists\n' +
        '  {pn} backup list         — list saved backups\n' +
        '  {pn} backup restore <f>  — restore a backup'
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;

    if (!isOwner(senderID)) {
      return message.reply('❌ This command is restricted to bot owners only.');
    }

    if (!args[0]) {
      return message.reply(
        '╔══ 🤖 CYBER SHAKIL AI FIXER ══╗\n' +
        '  -fix <file.js>      — AI fix\n' +
        '  -fix scan <file>    — scan only\n' +
        '  -fix scanbot        — scan all\n' +
        '  -fix create <name>  — create cmd\n' +
        '  -fix reload <cmd>   — hot-reload\n' +
        '  -fix list           — commands\n' +
        '  -fix status         — bot status\n' +
        '  -fix backup list    — backups\n' +
        '╚══════════════════════════════╝'
      );
    }

    const sub = args[0].toLowerCase();

    // ── NON-AI COMMANDS (no API key needed) ────────────────────────────────

    if (sub === 'reload') {
      return handleReload(args[1], message);
    }

    if (sub === 'list') {
      return handleList(message);
    }

    if (sub === 'status') {
      return handleStatus(message, args[1]);
    }

    if (sub === 'check') {
      return handleCheck(args[1], message);
    }

    if (sub === 'backup') {
      return handleBackup(args[1], args[2], message);
    }

    // ── AI COMMANDS ────────────────────────────────────────────────────────

    if (!AutoFixer) {
      return message.reply(
        '❌ CYBER SHAKIL AI Core failed to load.\n' +
        'Check: system/CyberShakil/ folder exists.\n' +
        `Error: modules missing`
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return message.reply(
        '🔑 *OPENROUTER_API_KEY not set!*\n\n' +
        '1. Go to openrouter.ai → Get API Key\n' +
        '2. In Replit → Tools → Secrets\n' +
        '3. Add key: OPENROUTER_API_KEY\n' +
        '4. Restart bot\n\n' +
        '💡 Non-AI commands still work:\n' +
        '   -fix reload | list | status | check'
      );
    }

    // SCAN ONLY
    if (sub === 'scan') {
      const fname = args[1];
      if (!fname) return message.reply('❌ Usage: -fix scan <filename.js>');

      const wait = await message.reply(`🔍 Scanning *${fname}*...`);
      try {
        const result = await AutoFixer.scanOnly(fname);
        api.unsendMessage(wait.messageID).catch(() => {});
        return message.reply(result.msg);
      } catch (e) {
        api.unsendMessage(wait.messageID).catch(() => {});
        return message.reply(`❌ Scan error: ${e.message}`);
      }
    }

    // SCAN BOT (ALL)
    if (sub === 'scanbot') {
      const wait = await message.reply('⏳ Scanning all command files... This may take a moment.');
      try {
        const result = await AutoFixer.scanBot({
          onProgress: (msg) => {
            api.editMessage(`⏳ ${msg}`, wait.messageID).catch(() => {});
          }
        });
        api.unsendMessage(wait.messageID).catch(() => {});
        return message.reply(result.msg);
      } catch (e) {
        api.unsendMessage(wait.messageID).catch(() => {});
        return message.reply(`❌ Scanbot error: ${e.message}`);
      }
    }

    // CREATE
    if (sub === 'create') {
      const name = args[1];
      if (!name) return message.reply('❌ Usage: -fix create <commandname>');
      const desc = args.slice(2).join(' ');

      const wait = await message.reply(
        `🤖 *CYBER SHAKIL AI* is creating *${name}.js*...\n⏳ Please wait...`
      );
      try {
        const result = await AutoFixer.createCommand(name, desc);
        api.unsendMessage(wait.messageID).catch(() => {});
        return message.reply(result.msg);
      } catch (e) {
        api.unsendMessage(wait.messageID).catch(() => {});
        return message.reply(`❌ Create failed: ${e.message}`);
      }
    }

    // FIX (main AI feature) — triggered by: -fix filename.js
    const filename = args[0].endsWith('.js') ? args[0] : args[0] + '.js';
    const wait = await message.reply(
      `╔══ 🤖 CYBER SHAKIL AI FIXER ══╗\n` +
      `  📁 File    : ${filename}\n` +
      `  ⏳ Status  : Initializing...\n` +
      `  [░░░░░░░░░░] 0/8\n` +
      `╚══════════════════════════════╝`
    );

    try {
      const result = await AutoFixer.fixFile(filename, {
        onProgress: (progressLine) => {
          api.editMessage(
            `╔══ 🤖 CYBER SHAKIL AI FIXER ══╗\n` +
            `  📁 File : ${filename}\n` +
            `  ${progressLine}\n` +
            `╚══════════════════════════════╝`,
            wait.messageID
          ).catch(() => {});
        }
      });

      api.unsendMessage(wait.messageID).catch(() => {});
      return message.reply(result.msg);

    } catch (e) {
      api.unsendMessage(wait.messageID).catch(() => {});
      return message.reply(
        `❌ *Fix failed unexpectedly*\n\n` +
        `File: ${filename}\n` +
        `Error: ${e.message}\n\n` +
        `💡 Try again or check if file exists.`
      );
    }
  }
};

// ── Non-AI helpers ─────────────────────────────────────────────────────────

const fs = require('fs-extra');

function handleReload(cmdArg, message) {
  if (!cmdArg) return message.reply('❌ Usage: -fix reload <commandname>');
  const name = cmdArg.replace(/\.js$/i, '');
  const cmdsDir = path.join(process.cwd(), 'scripts', 'cmds');
  const candidates = [
    path.join(cmdsDir, `${name}.js`),
    path.join(cmdsDir, `${name.charAt(0).toUpperCase()}${name.slice(1)}.js`)
  ];
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) return message.reply(`❌ File not found: ${name}.js`);

  try {
    delete require.cache[require.resolve(found)];
    const newCmd = require(found);
    const cmdName = newCmd?.config?.name || name;
    if (global.GoatBot?.commands) {
      global.GoatBot.commands.delete(cmdName);
      global.GoatBot.commands.set(cmdName, newCmd);
      if (newCmd?.config?.aliases) {
        newCmd.config.aliases.forEach(a => global.GoatBot.commands.set(a, newCmd));
      }
    }
    return message.reply(
      `✅ *Reloaded: ${cmdName}*\n` +
      `🏷️ v${newCmd?.config?.version || '?'}\n` +
      `👤 ${newCmd?.config?.author || '?'}\n` +
      `📦 Aliases: ${newCmd?.config?.aliases?.join(', ') || 'none'}`
    );
  } catch (err) {
    return message.reply(`❌ Reload failed!\n${err.message}`);
  }
}

function handleList(message) {
  const loaded = global.GoatBot?.commands?.size || 0;
  const names  = global.GoatBot?.commands
    ? [...new Set([...global.GoatBot.commands.keys()])].sort()
    : [];
  const preview = names.slice(0, 30).join(', ');
  return message.reply(
    `📦 *Loaded Commands: ${loaded}*\n\n${preview}` +
    (names.length > 30 ? `\n...and ${names.length - 30} more` : '')
  );
}

function handleStatus(message) {
  const up  = process.uptime();
  const h   = Math.floor(up / 3600);
  const m   = Math.floor((up % 3600) / 60);
  const s   = Math.floor(up % 60);
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const hasKey = !!process.env.OPENROUTER_API_KEY;
  return message.reply(
    `╔══ 🤖 BOT STATUS ══╗\n` +
    `  ✅ Online\n` +
    `  ⏱️ Uptime  : ${h}h ${m}m ${s}s\n` +
    `  💾 RAM     : ${mem} MB\n` +
    `  📦 Cmds    : ${global.GoatBot?.commands?.size || 0}\n` +
    `  🔑 AI Key  : ${hasKey ? '✅ Set' : '❌ Missing'}\n` +
    `  🏷️ Version : V3.0.0\n` +
    `  👑 Owner   : 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡\n` +
    `  🆔 UID     : 61590607769212\n` +
    `╚════════════════════╝`
  );
}

function handleCheck(cmdArg, message) {
  if (!cmdArg) return message.reply('❌ Usage: -fix check <commandname>');
  const name     = cmdArg.replace(/\.js$/i, '');
  const filePath = path.join(process.cwd(), 'scripts', 'cmds', `${name}.js`);
  const exists   = fs.existsSync(filePath);
  const loaded   = global.GoatBot?.commands?.has(name);
  return message.reply(
    `🔍 *${name}*\n` +
    `📁 File  : ${exists ? '✅ exists' : '❌ not found'}\n` +
    `⚡ Loaded: ${loaded ? '✅ yes' : '❌ no'}`
  );
}

function handleBackup(sub2, sub3, message) {
  let BackupManager;
  try { BackupManager = require('../../system/CyberShakil/BackupManager'); } catch (_) {
    return message.reply('❌ BackupManager not loaded.');
  }

  if (!sub2 || sub2 === 'list') {
    const files = BackupManager.list().slice(0, 15);
    if (!files.length) return message.reply('📭 No backups found.');
    let msg = `💾 *Backups (${files.length}):*\n\n`;
    files.forEach((f, i) => { msg += `${i + 1}. ${f}\n`; });
    msg += '\nUse: -fix backup restore <filename>';
    return message.reply(msg);
  }

  if (sub2 === 'restore') {
    if (!sub3) return message.reply('❌ Usage: -fix backup restore <backup-filename>');
    const bPath = path.join(process.cwd(), 'backup', sub3);
    if (!fs.existsSync(bPath)) return message.reply(`❌ Backup not found: ${sub3}`);
    const origName = sub3.replace(/^\d+_/, '');
    const origPath = path.join(process.cwd(), 'scripts', 'cmds', origName);
    BackupManager.restore(bPath, origPath);
    return message.reply(`✅ Restored: *${origName}*\nFrom backup: ${sub3}`);
  }

  return message.reply('❓ Usage: -fix backup list | -fix backup restore <file>');
}
