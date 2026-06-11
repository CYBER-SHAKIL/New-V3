const axios = require('axios');

const GEMINI_KEY = () => process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-flash-latest';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const history = new Map();

async function askGemini(userID, userMsg) {
  const key = GEMINI_KEY();
  if (!key) throw new Error('NO_KEY');

  const userHistory = history.get(userID) || [];
  userHistory.push({ role: 'user', parts: [{ text: userMsg }] });

  const res = await axios.post(API_URL, {
    contents: userHistory.slice(-10),
    generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': key,
    },
    timeout: 30000,
  });

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');

  userHistory.push({ role: 'model', parts: [{ text }] });
  if (userHistory.length > 20) userHistory.splice(0, 2);
  history.set(userID, userHistory);
  return text;
}

module.exports = {
  config: {
    name: 'gemini',
    aliases: ['gem', 'bard', 'google'],
    version: '2.0',
    author: '𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡',
    countDown: 5,
    role: 0,
    category: 'AI',
    shortDescription: { en: 'Chat with Google Gemini Flash AI' },
    longDescription: { en: 'Powered by Google Gemini Flash — fast, smart, free. Remembers conversation context per user.' },
    guide: {
      en: '{pn} <message>   — chat with Gemini\n{pn} clear         — clear your history\n\nExample: -gemini What is AI?',
    },
  },

  onStart: async function ({ message, event, args, commandName }) {
    if (!GEMINI_KEY())
      return message.reply(
        '🔑 GEMINI_API_KEY not set!\n\n' +
        '1. Go to aistudio.google.com\n' +
        '2. Click "Get API Key"\n' +
        '3. Add GEMINI_API_KEY in Replit Secrets\n\n' +
        'Free tier: 15 req/min, no credit card needed!'
      );

    if ((args[0] || '').toLowerCase() === 'clear') {
      history.delete(event.senderID);
      return message.reply('🗑️ Gemini conversation history cleared!');
    }

    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply('💬 Type something! Example: -gemini Tell me about Bangladesh');

    const waiting = await message.reply('💭 Gemini thinking...');
    try {
      const reply = await askGemini(event.senderID, prompt);
      message.unsend(waiting.messageID).catch(() => {});
      message.reply(reply, (err, info) => {
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
        return message.reply('❌ GEMINI_API_KEY missing! Add it to Replit Secrets.');
      const errMsg = e.response?.data?.error?.message || e.message || 'Unknown error';
      message.reply(`❌ Gemini Error: ${errMsg}`);
    }
  },

  onReply: async function ({ Reply, message, event, commandName }) {
    if (event.senderID !== Reply.author) return;
    if (!GEMINI_KEY()) return message.reply('❌ GEMINI_API_KEY missing!');

    const prompt = event.body?.trim();
    if (!prompt) return;

    const waiting = await message.reply('💭 Gemini thinking...');
    try {
      const reply = await askGemini(event.senderID, prompt);
      message.unsend(waiting.messageID).catch(() => {});
      message.reply(reply, (err, info) => {
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
      message.reply(`❌ Gemini Error: ${e.response?.data?.error?.message || e.message}`);
    }
  },
};
