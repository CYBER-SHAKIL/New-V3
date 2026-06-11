'use strict';
const axios = require('axios');
const fs    = require('fs-extra');
const path  = require('path');

module.exports = {
  config: {
    name:     'gimage',
    aliases:  ['gi', 'img', 'photo', 'pix'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 10,
    role:     0,
    shortDescription: { en: 'Search and send images (free, no API key)' },
    category: 'media',
    guide: {
      en:
        '{pn} <query>          — send random image\n' +
        '{pn} <query> 3        — send 3 images\n\n' +
        'Example:\n  {pn} cute cat\n  {pn} Bangladesh 2'
    }
  },

  langs: {
    en: {
      noInput: 'Please provide a search query!\n\nExample: -gimage cute cat',
      notfound: 'No images found for "%1". Try a different search.',
      error:   'Failed to get images. Error: %1',
      fetching: 'Searching images...',
    }
  },

  onStart: async function ({ message, args, getLang, event }) {
    if (!args[0]) return message.reply(getLang('noInput'));

    let count = 1;
    let queryArr = [...args];
    const last = queryArr[queryArr.length - 1];
    if (/^\d+$/.test(last)) {
      count = Math.min(parseInt(last), 5);
      queryArr.pop();
    }
    const query = queryArr.join(' ').trim();
    if (!query) return message.reply(getLang('noInput'));

    await message.reply(getLang('fetching'));

    try {
      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);

      const attachments = [];
      const promises = [];

      for (let i = 0; i < count; i++) {
        const seed = Math.floor(Math.random() * 10000) + i * 1000;
        const encoded = encodeURIComponent(query);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&nologo=true&seed=${seed}`;
        const outPath = path.join(cacheDir, `gimage_${event.senderID}_${Date.now()}_${i}.jpg`);

        promises.push(
          axios.get(url, { responseType: 'arraybuffer', timeout: 45000 })
            .then(r => fs.writeFile(outPath, Buffer.from(r.data)).then(() => outPath))
        );
      }

      const paths = await Promise.all(promises);
      for (const p of paths) attachments.push(fs.createReadStream(p));

      await message.reply({
        body: `Images for: ${query}`,
        attachment: attachments
      });

      setTimeout(() => paths.forEach(p => fs.remove(p).catch(() => {})), 15000);
    } catch (err) {
      message.reply(getLang('error', err.message));
    }
  }
};
