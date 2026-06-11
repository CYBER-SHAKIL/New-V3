'use strict';
const ytSearch = require('yt-search');
const ytdl     = require('@distube/ytdl-core');
const axios    = require('axios');
const path     = require('path');
const fs       = require('fs-extra');

module.exports = {
  config: {
    name:      'sing',
    aliases:   ['song', 'music', 'ytaudio'],
    version:   '2.0',
    author:    '𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪',
    countDown: 10,
    role:      0,
    shortDescription: { en: 'Search and download YouTube audio' },
    category:  'media',
    guide:     { en: '{pn} <song name>\nExample: -sing Shape of You' }
  },

  onStart: async function ({ message, args, event, commandName }) {
    const query = args.join(' ').trim();
    if (!query) return message.reply('🎵 Please provide a song name!\nExample: -sing Shape of You');

    try {
      const search  = await ytSearch(query);
      const results = (search.videos || []).slice(0, 5);
      if (!results.length) return message.reply('❌ No songs found.');

      let msg = '🎵 Choose a song (reply with 1–5):\n━━━━━━━━━━━━━━━\n';
      results.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n   ⏱️ ${v.timestamp}  👁️ ${v.views?.toLocaleString?.() || '?'}\n\n`;
      });

      const sent = await message.reply(msg);
      global.GoatBot.onReply.set(sent.messageID, {
        commandName,
        author: event.senderID,
        results: results.map(v => ({ title: v.title, url: v.url, timestamp: v.timestamp }))
      });
    } catch (e) {
      message.reply('❌ Search failed. Try again.');
    }
  },

  onReply: async function ({ message, event, Reply, api }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body.trim());
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) return;

    const selected = Reply.results[choice - 1];
    api.unsendMessage(event.messageReply.messageID).catch(() => {});
    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `sing_${Date.now()}.m4a`);

    try {
      // Get best audio-only format URL directly (no piping needed)
      const info = await ytdl.getInfo(selected.url, {
        requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0' } }
      });
      const fmt = ytdl.chooseFormat(info.formats, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });
      if (!fmt?.url) throw new Error('No audio format available');

      // Download with axios — more reliable than ytdl stream
      const res = await axios.get(fmt.url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: 60 * 1024 * 1024,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.youtube.com/',
        }
      });

      await fs.writeFile(filePath, Buffer.from(res.data));

      await message.reply({
        body: `🎵 ${selected.title}\n⏱️ ${selected.timestamp}`,
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction('✅', event.messageID, () => {}, true);
    } catch (e) {
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      message.reply(`❌ Download failed: ${e.message.slice(0, 120)}\n\nTry a different song.`);
    } finally {
      fs.remove(filePath).catch(() => {});
    }
  }
};
