'use strict';
const fs   = require('fs-extra');
const path = require('path');

const CFG_FILE = path.join(process.cwd(), 'database', 'data', 'autodeletemsg.json');

function load() { try { return fs.readJsonSync(CFG_FILE); } catch (_) { return {}; } }
function save(d) { fs.ensureDirSync(path.dirname(CFG_FILE)); fs.writeJsonSync(CFG_FILE, d, { spaces: 2 }); }

module.exports = {
  config: {
    name:     'autodeletemsg',
    aliases:  ['adm', 'unsenddetect', 'deletedmsg', 'antiunsend'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 5,
    role:     2,
    shortDescription: { en: 'Auto-detect and resend deleted messages (bot admin only)' },
    category: 'owner',
    guide: {
      en:
        '{pn} on      — enable for this group\n' +
        '{pn} off     — disable for this group\n' +
        '{pn} status  — check current status\n' +
        '{pn} list    — see all enabled groups\n\n' +
        'When enabled: if someone deletes a message, bot will resend it!'
    }
  },
  langs: {
    en: {
      on:     '✅ Auto-detect deleted messages: ENABLED!\nWhen anyone deletes a message in this group, bot will resend it.',
      off:    '🔴 Auto-detect deleted messages: DISABLED.',
      status: '🗑️ Auto-delete-detect: %1',
      list:   '📋 Enabled groups (%1):\n%2',
      empty:  '📭 No groups have this feature enabled.',
    }
  },
  onStart: async function ({ message, args, event, getLang }) {
    const sub = (args[0] || '').toLowerCase();
    const { threadID } = event;
    const cfg = load();

    if (sub === 'on') {
      cfg[threadID] = true;
      save(cfg);
      return message.reply(getLang('on'));
    }
    if (sub === 'off') {
      delete cfg[threadID];
      save(cfg);
      return message.reply(getLang('off'));
    }
    if (sub === 'list') {
      const enabled = Object.keys(cfg).filter(k => cfg[k]);
      if (!enabled.length) return message.reply(getLang('empty'));
      return message.reply(getLang('list', enabled.length, enabled.map((id, i) => `${i+1}. ${id}`).join('\n')));
    }
    return message.reply(getLang('status', cfg[threadID] ? '✅ Enabled' : '❌ Disabled'));
  }
};
