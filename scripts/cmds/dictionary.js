'use strict';
const axios = require('axios');

module.exports = {
  config: {
    name:     'dictionary',
    aliases:  ['dict', 'define', 'meaning', 'word'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 5,
    role:     0,
    shortDescription: { en: 'Get word definition, meaning, synonyms' },
    category: 'utility',
    guide: {
      en:
        '{pn} <word>        — get word definition\n\n' +
        'Example:\n  {pn} beautiful\n  {pn} ephemeral'
    }
  },

  langs: {
    en: {
      noInput:  'Please enter a word!\n\nExample: -dictionary beautiful',
      notfound: 'Word "%1" not found in dictionary.',
      error:    'Error: %1',
    }
  },

  onStart: async function ({ message, args, getLang }) {
    if (!args[0]) return message.reply(getLang('noInput'));
    const word = args[0].toLowerCase().trim();

    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { timeout: 10000 });
      const data = res.data?.[0];
      if (!data) return message.reply(getLang('notfound', word));

      let msg = `Dictionary: ${data.word}`;
      if (data.phonetic) msg += `\nPronunciation: ${data.phonetic}`;
      msg += '\n';

      const seen = new Set();
      for (const m of (data.meanings || []).slice(0, 3)) {
        msg += `\n${m.partOfSpeech.toUpperCase()}\n`;
        for (const def of (m.definitions || []).slice(0, 2)) {
          msg += `  • ${def.definition}\n`;
          if (def.example) msg += `    Example: "${def.example}"\n`;
        }
        const syns = m.synonyms?.slice(0, 4).filter(s => !seen.has(s)) || [];
        syns.forEach(s => seen.add(s));
        if (syns.length) msg += `  Synonyms: ${syns.join(', ')}\n`;
      }

      return message.reply(msg.trim());
    } catch (err) {
      if (err.response?.status === 404) return message.reply(getLang('notfound', word));
      return message.reply(getLang('error', err.message));
    }
  }
};
