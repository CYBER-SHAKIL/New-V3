const axios = require('axios');
const fs = require('fs');
const path = require('path');

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

const SKIP_DOMAINS = new Set([
  'raw.githubusercontent.com','github.com','google.com','facebook.com',
  'messenger.com','fbcdn.net','fbsbx.com','m.me','youtu.be',
  'youtube.com','www.youtube.com','developer.mozilla.org','www.w3schools.com',
  'nodejs.org','example.com','docs.google.com','drive.google.com',
  'tinyurl.com','imgur.com','i.imgur.com','i.ibb.co','i.postimg.cc',
  'files.catbox.moe','catbox.moe','0x0.st','tmpfiles.org',
  'imagine.gsfc.nasa.gov','www.emojiall.com','lunaf.com',
  'feeds.bbci.co.uk','translate.google.com','translate.googleapis.com',
  'graphql.anilist.co','api.github.com',
]);

const KEY_ENV_MAP = {
  'openrouter.ai':                         'OPENROUTER_API_KEY',
  'api.openai.com':                        'OPENAI_API_KEY',
  'generativelanguage.googleapis.com':     'GEMINI_API_KEY',
  'api.x.ai':                              'GROK_API_KEY',
  'api.accuweather.com':                   'ACCUWEATHER_KEY',
  'vortex.accuweather.com':                'ACCUWEATHER_KEY',
  'newsapi.org':                           'NEWS_API_KEY',
  'api.remove.bg':                         'REMOVEBG_KEY',
  'api.imgbb.com':                         'IMGBB_API_KEY',
};

const EMPTY_KEY_PATTERN = /(?:const|let|var)\s+\w*[Kk]ey\w*\s*=\s*["']{2}/;

async function runScan() {
  const cmdDir = path.join(process.cwd(), 'scripts', 'cmds');
  const files = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'));

  const domainToFiles = {};
  const fileInfo = {};

  for (const file of files) {
    let code;
    try { code = fs.readFileSync(path.join(cmdDir, file), 'utf8'); }
    catch (e) { continue; }

    const nameMatch = code.match(/name\s*:\s*["']([^"']+)["']/);
    const cmdName = nameMatch ? nameMatch[1] : file.replace('.js', '');
    const hasEmptyKey = EMPTY_KEY_PATTERN.test(code);

    const urlMatches = code.match(/https?:\/\/[a-zA-Z0-9.\-]+(?::\d+)?/g) || [];
    const domains = [...new Set(
      urlMatches
        .map(u => { try { return new URL(u).hostname; } catch (e) { return null; } })
        .filter(h => h && !SKIP_DOMAINS.has(h))
    )];

    fileInfo[file] = { cmdName, domains, hasEmptyKey };
    for (const d of domains) {
      if (!domainToFiles[d]) domainToFiles[d] = [];
      if (!domainToFiles[d].includes(file)) domainToFiles[d].push(file);
    }
  }

  const domainStatus = {};
  await Promise.all(
    Object.keys(domainToFiles).map(async domain => {
      if (KEY_ENV_MAP[domain]) {
        const envKey = KEY_ENV_MAP[domain];
        domainStatus[domain] = process.env[envKey] ? 'key_ok' : 'needs_key';
        return;
      }
      try {
        await axios.get(`https://${domain}`, { timeout: 5000 });
        domainStatus[domain] = 'ok';
      } catch (e) {
        if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN')
          domainStatus[domain] = 'dead';
        else if (e.code === 'ERR_BAD_RESPONSE' || e.code === 'ECONNRESET')
          domainStatus[domain] = 'dead';
        else if (e.response)
          domainStatus[domain] = 'ok';
        else if (e.code === 'ECONNABORTED' || (e.message || '').includes('timeout'))
          domainStatus[domain] = 'timeout';
        else
          domainStatus[domain] = 'ok';
      }
    })
  );

  const categories = {
    dead:      { emoji: '🔴', label: 'API Dead',          cmds: [] },
    needs_key: { emoji: '🔑', label: 'Key Missing',        cmds: [] },
    timeout:   { emoji: '⏱️', label: 'API Timeout',        cmds: [] },
    working:   { emoji: '✅', label: 'API Working',        cmds: [] },
    local:     { emoji: '🏠', label: 'No External API',   cmds: [] },
  };

  for (const file of files) {
    const info = fileInfo[file];
    if (!info) continue;

    if (info.domains.length === 0) {
      categories.local.cmds.push(info.cmdName);
      continue;
    }

    let worst = 'working';
    for (const d of info.domains) {
      const st = domainStatus[d] || 'ok';
      if (st === 'dead')      { worst = 'dead';      break; }
      if (st === 'needs_key' && worst !== 'dead')  worst = 'needs_key';
      if (st === 'timeout'   && worst !== 'dead' && worst !== 'needs_key') worst = 'timeout';
    }
    if (info.hasEmptyKey && worst !== 'dead') worst = 'needs_key';

    categories[worst].cmds.push(info.cmdName);
  }

  for (const cat of Object.values(categories))
    cat.cmds.sort();

  return { categories, scannedAt: Date.now() };
}

module.exports = {
  config: {
    name: 'help3',
    aliases: ['healthcheck', 'botcheck', 'apistatus'],
    version: '1.0',
    author: '𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡',
    countDown: 10,
    role: 0,
    category: 'system',
    shortDescription: { en: 'Bot health report — shows broken/working commands by category' },
    guide: { en: '{pn} → full report\n{pn} refresh → force re-scan\nReply with number to see commands in that category' },
  },

  onStart: async function ({ message, event, commandName, args }) {
    const forceRefresh = (args[0] || '').toLowerCase() === 'refresh';
    const now = Date.now();

    if (forceRefresh || !_cache || now - _cacheTime > CACHE_TTL) {
      const waiting = await message.reply('🔍 Scanning all commands and testing APIs...\nএকটু অপেক্ষা করো ~5-8 সেকেন্ড');
      _cache = await runScan();
      _cacheTime = now;
      try { message.unsend(waiting.messageID); } catch (e) {}
    }

    const { categories } = _cache;
    const total = Object.values(categories).reduce((s, c) => s + c.cmds.length, 0);
    const catKeys = Object.keys(categories);
    const ageMin = Math.floor((now - _cacheTime) / 60000);

    let body = `╭━━━━━━━━━━━━━━━━━━━━━━╮\n`;
    body += `┃ 🏥 BOT HEALTH REPORT\n`;
    body += `┃ 📊 Total: ${total} commands\n`;
    body += `┃ 🕐 ${ageMin === 0 ? 'Just scanned' : `${ageMin}m ago`} (cache 30m)\n`;
    body += `┣━━━━━━━━━━━━━━━━━━━━━━┫\n`;

    catKeys.forEach((key, i) => {
      const c = categories[key];
      body += `┃ ${i + 1}. ${c.emoji} ${c.label}: ${c.cmds.length}\n`;
    });

    body += `┣━━━━━━━━━━━━━━━━━━━━━━┫\n`;
    body += `┃ Reply number দিয়ে\n`;
    body += `┃ details দেখো 👇\n`;
    body += `┃ "-help3 refresh" = rescan\n`;
    body += `╰━━━━━━━━━━━━━━━━━━━━━━╯`;

    message.reply(body, (err, info) => {
      if (!err && info?.messageID) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          data: { categories, catKeys },
        });
      }
    });
  },

  onReply: async function ({ Reply, message, event }) {
    const { data } = Reply;
    if (event.senderID !== Reply.author) return;

    const num = parseInt(event.body.trim());
    if (isNaN(num) || num < 1 || num > data.catKeys.length)
      return message.reply(`⚠️ 1 থেকে ${data.catKeys.length} এর মধ্যে number দাও।`);

    const key = data.catKeys[num - 1];
    const cat = data.categories[key];
    const cmds = cat.cmds;

    if (cmds.length === 0)
      return message.reply(`${cat.emoji} ${cat.label}\n\n✅ এই category-তে কোনো সমস্যা নেই।`);

    const PER_PAGE = 20;
    const pages = Math.ceil(cmds.length / PER_PAGE);
    let body = `${cat.emoji} ${cat.label} (${cmds.length}টি command):\n`;
    body += `━━━━━━━━━━━━━━━━━━━━\n`;
    cmds.slice(0, PER_PAGE).forEach((c, i) => {
      body += `${i + 1}. ${c}\n`;
    });
    if (pages > 1) body += `\n...আরো ${cmds.length - PER_PAGE}টি আছে`;

    message.reply(body);
  },
};
