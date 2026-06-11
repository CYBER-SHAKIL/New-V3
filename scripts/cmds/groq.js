'use strict';
const axios = require('axios');

const GROQ_KEY = () => process.env.GROQ_API_KEY || '';

// Groq models — fastest free AI available
const GROQ_MODELS = [
  { id: 'llama3-70b-8192',        label: 'Llama3 70B' },
  { id: 'llama3-8b-8192',         label: 'Llama3 8B'  },
  { id: 'mixtral-8x7b-32768',     label: 'Mixtral 8x7B' },
  { id: 'gemma2-9b-it',           label: 'Gemma2 9B'  },
];

const history = new Map();

async function askGroq(userID, userMsg) {
  const key = GROQ_KEY();
  if (!key) throw new Error('NO_KEY');

  const userHistory = history.get(userID) || [];
  userHistory.push({ role: 'user', content: userMsg });

  for (const { id, label } of GROQ_MODELS) {
    try {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: id,
        messages: [
          {
            role: 'system',
            content: 'You are CYBER SHAKIL BOT V3, a fast and helpful AI assistant made by MD SHAKIL HOSSEN (CYBER SHAKIL) from Bangladesh. Be concise, friendly, and accurate.'
          },
          ...userHistory.slice(-12),
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      });

      const text = res.data?.choices?.[0]?.message?.content;
      if (text) {
        userHistory.push({ role: 'assistant', content: text });
        if (userHistory.length > 20) userHistory.splice(0, 2);
        history.set(userID, userHistory);
        return { text, label };
      }
    } catch (_) { continue; }
  }

  throw new Error('All Groq models failed');
}

module.exports = {
  config: {
    name: 'groq',
    aliases: ['llama', 'llama3', 'fastai', 'lama'],
    version: '1.0',
    author: 'CYBER-SHAKIL',
    countDown: 3,
    role: 0,
    category: 'AI',
    shortDescription: { en: 'Ultra-fast AI (Groq — Llama3 70B)' },
    longDescription: { en: 'Powered by Groq — the fastest AI inference. Uses Llama3 70B. Remembers conversation context per user.' },
    guide: {
      en:
        '{pn} <message>  — chat (ultra-fast)\n' +
        '{pn} clear      — clear history\n\n' +
        'Example: -groq What is black hole?\n\n' +
        'Setup: Get free key at console.groq.com\n' +
        'Add GROQ_API_KEY to Replit Secrets'
    }
  },

  onStart: async function ({ message, event, args, commandName }) {
    if (!GROQ_KEY())
      return message.reply(
        '🔑 GROQ_API_KEY not set!\n\n' +
        '1. Go to console.groq.com\n' +
        '2. Click "Create API Key"\n' +
        '3. Add GROQ_API_KEY to Replit Secrets\n\n' +
        '⚡ Groq is FREE and 10x faster than ChatGPT!'
      );

    if ((args[0] || '').toLowerCase() === 'clear') {
      history.delete(event.senderID);
      return message.reply('🗑️ Groq conversation cleared!');
    }

    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply('⚡ Type a message!\nExample: -groq What is AI?');

    const waiting = await message.reply('⚡ Groq thinking...');

    try {
      const { text, label } = await askGroq(event.senderID, prompt);
      message.unsend(waiting.messageID).catch(() => {});
      message.reply(text + `\n\n──────────\n⚡ ${label} (Groq)`, (err, info) => {
        if (!err && info?.messageID) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
          });
        }
      });
    } catch (e) {
      message.unsend(waiting.messageID).catch(() => {});
      if (e.message === 'NO_KEY')
        return message.reply('❌ GROQ_API_KEY missing! Add it to Replit Secrets.');
      message.reply(`❌ Groq Error: ${e.message.slice(0, 100)}`);
    }
  },

  onReply: async function ({ Reply, message, event, commandName }) {
    if (event.senderID !== Reply.author) return;
    if (!GROQ_KEY()) return message.reply('❌ GROQ_API_KEY missing!');

    const prompt = event.body?.trim();
    if (!prompt) return;

    const waiting = await message.reply('⚡ Groq thinking...');
    try {
      const { text, label } = await askGroq(event.senderID, prompt);
      message.unsend(waiting.messageID).catch(() => {});
      message.reply(text + `\n\n──────────\n⚡ ${label} (Groq)`, (err, info) => {
        if (!err && info?.messageID) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
          });
        }
      });
    } catch (e) {
      message.unsend(waiting.messageID).catch(() => {});
      message.reply(`❌ Groq Error: ${e.message.slice(0, 100)}`);
    }
  }
};
