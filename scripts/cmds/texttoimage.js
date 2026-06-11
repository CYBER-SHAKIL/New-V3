'use strict';
const axios = require('axios');
const fs    = require('fs-extra');
const path  = require('path');

module.exports = {
  config: {
    name:     'texttoimage',
    aliases:  ['tti', 'midjourney', 'openjourney', 'text2image'],
    version:  '2.0',
    author:   'SHAKIL-HOSSEN',
    countDown: 15,
    role:     0,
    shortDescription: { en: 'Generate AI image from text prompt - FREE' },
    category: 'AI-IMAGE',
    guide: {
      en:
        '{pn} <prompt>\n' +
        '{pn} <prompt> | <style>\n\n' +
        'Styles: realistic, anime, fantasy, cyberpunk, cartoon, portrait\n\n' +
        'Example:\n' +
        '  {pn} a lion in desert | realistic\n' +
        '  {pn} cute anime girl with sword | anime'
    }
  },

  langs: {
    en: {
      noPrompt:   'Please enter a prompt!\n\nExample: -texttoimage a dragon flying over mountains',
      generating: 'Generating your AI image...\nThis may take 10-30 seconds.',
      error:      'Failed to generate image. Please try again.\nError: %1',
    }
  },

  onStart: async function ({ message, args, getLang, event }) {
    if (!args[0]) return message.reply(getLang('noPrompt'));

    const input      = args.join(' ').split('|');
    const rawPrompt  = input[0].trim();
    const style      = (input[1] || '').trim().toLowerCase();

    const styleMap = {
      realistic:      'photorealistic, ultra-detailed, 8K UHD, natural lighting, DSLR quality',
      anime:          'anime style, vibrant colors, sharp lines, cel shading, highly detailed',
      fantasy:        'fantasy art, epic background, magical aura, dramatic lighting',
      cyberpunk:      'cyberpunk neon lights, futuristic city, dark atmosphere, high tech',
      cartoon:        'cartoon style, bold outlines, bright colors, 2D animation look',
      portrait:       'professional portrait, close-up, studio lighting, sharp focus, bokeh',
      'oil painting': 'oil painting, textured brush strokes, classical art, warm tones',
    };

    const styleTag    = styleMap[style] || '';
    const finalPrompt = styleTag ? `${rawPrompt}, ${styleTag}` : rawPrompt;

    await message.reply(getLang('generating'));

    try {
      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const outPath = path.join(cacheDir, `tti_${event.senderID}_${Date.now()}.jpg`);

      const encoded = encodeURIComponent(finalPrompt);
      const seed    = Math.floor(Math.random() * 99999);
      const url     = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&enhance=true&seed=${seed}`;

      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
      await fs.writeFile(outPath, Buffer.from(res.data));

      await message.reply({
        body:       `AI Image Generated!\nPrompt: ${rawPrompt}${style ? `\nStyle: ${style}` : ''}`,
        attachment: fs.createReadStream(outPath)
      });

      setTimeout(() => fs.remove(outPath).catch(() => {}), 15000);
    } catch (err) {
      message.reply(getLang('error', err.message || 'Unknown error'));
    }
  }
};
