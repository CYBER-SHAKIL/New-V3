const axios = require('axios');

const GROK_KEY = () => process.env.GROK_API_KEY || '';
const MODEL = 'grok-3-mini';

const history = new Map();

async function askGrok(userID, userMsg) {
  const key = GROK_KEY();
  if (!key) throw new Error('NO_KEY');

  const userHistory = history.get(userID) || [];
  userHistory.push({ role: 'user', content: userMsg });

  const res = await axios.post('https://api.x.ai/v1/chat/completions', {
    model: MODEL,
    messages: [
      { role: 'system', content: 'You are Grok, a helpful and witty AI assistant created by xAI. Be concise but thorough.' },
      ...userHistory.slice(-12),
    ],
    max_tokens: 1500,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from Grok');

  userHistory.push({ role: 'assistant', content: text });
  if (userHistory.length > 20) userHistory.splice(0, 2);
  history.set(userID, userHistory);
  return text;
}

module.exports = {
  config: {
    name: 'grok',
    aliases: ['xai', 'grokai'],
    version: '1.0',
    author: '𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡',
    countDown: 5,
    role: 0,
    category: 'AI',
    shortDescription: { en: 'Chat with xAI Grok — fast & witty AI' },
    longDescription: { en: 'Powered by xAI Grok 3 Mini — smart, witty, real-time knowledge. Remembers conversation context.' },
    guide: {
      en: '{pn} <message>   — chat with Grok\n{pn} clear         — clear your history\n\nSetup: Set GROK_API_KEY in Secrets\nGet key: console.x.ai',
    },
  },

  onStart: async function ({ message, event, args, commandName }) {
    if (!GROK_KEY())
      return message.reply(
        '🔑 GROK_API_KEY set করো!\n\n' +
        '1. console.x.ai এ যাও\n' +
        '2. API Keys section থেকে key নাও\n' +
        '3. Replit Secrets-এ GROK_API_KEY নামে add করো\n\n' +
        'Free tier available on xAI console!'
      );

    if ((args[0] || '').toLowerCase() === 'clear') {
      history.delete(event.senderID);
      return message.reply('🗑️ Grok conversation history cleared!');
    }

    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply('💬 কিছু লেখো! Example: -grok What is the meaning of life?');

    const waiting = await message.reply('⚡ Grok thinking...');
    try {
      const reply = await askGrok(event.senderID, prompt);
      message.unsend(waiting.messageID);
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
      message.unsend(waiting.messageID);
      if (e.message === 'NO_KEY')
        return message.reply('❌ GROK_API_KEY missing! Secrets-এ add করো।');
      const errMsg = e.response?.data?.error?.message || e.message || 'Unknown error';
      message.reply(`❌ Grok Error: ${errMsg}`);
    }
  },

  onReply: async function ({ Reply, message, event, commandName }) {
    if (event.senderID !== Reply.author) return;
    if (!GROK_KEY()) return message.reply('❌ GROK_API_KEY missing!');

    const prompt = event.body?.trim();
    if (!prompt) return;

    const waiting = await message.reply('⚡ Grok thinking...');
    try {
      const reply = await askGrok(event.senderID, prompt);
      message.unsend(waiting.messageID);
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
      message.unsend(waiting.messageID);
      message.reply(`❌ Grok Error: ${e.response?.data?.error?.message || e.message}`);
    }
  },
};
