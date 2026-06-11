'use strict';
const axios = require('axios');

const conversationCache = new Map();
const MAX_HISTORY = 14;
const OPENROUTER_KEY = () => process.env.OPENROUTER_API_KEY || '';

async function chatWithAI(messages) {
  const models = [
    'openai/gpt-4.1',
    'anthropic/claude-sonnet-4',
    'google/gemini-2.5-pro-preview',
    'openai/gpt-4o',
  ];
  for (const model of models) {
    try {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages,
        max_tokens: 900,
        temperature: 0.75,
      }, {
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/CYBER-SHAKIL',
          'X-Title': 'CYBER SHAKIL BOT V3',
        },
        timeout: 30000,
      });
      const text = res.data?.choices?.[0]?.message?.content;
      if (text) return { text, model };
    } catch (_) { continue; }
  }
  throw new Error('All AI models failed');
}

module.exports = {
  config: {
    name:      'gpt',
    aliases:   ['youai', 'youchat', 'copilot4'],
    version:   '3.1',
    author:    'CYBER-SHAKIL',
    countDown: 5,
    role:      0,
    shortDescription: { en: 'Chat with GPT-4.1 via OpenRouter' },
    category:  'AI',
    guide: {
      en:
        '{pn} <message>    — ask anything\n' +
        '{pn} clear        — clear history\n\n' +
        'Example: -gpt What is black hole?'
    }
  },

  langs: {
    en: {
      noKey:    '🔑 OPENROUTER_API_KEY is not configured. Contact bot owner.',
      noInput:  '💬 Please type a message!\n\nExample: -gpt Tell me a joke',
      thinking: '💭 Thinking...',
      cleared:  '🗑️ Conversation cleared!',
      error:    '❌ AI Error: %1',
    }
  },

  onStart: async function ({ message, args, getLang, event }) {
    if (!OPENROUTER_KEY()) return message.reply(getLang('noKey'));

    const key = `${event.threadID}_${event.senderID}`;
    if ((args[0] || '').toLowerCase() === 'clear') {
      conversationCache.delete(key);
      return message.reply(getLang('cleared'));
    }

    const input = args.join(' ').trim();
    if (!input) return message.reply(getLang('noInput'));

    await message.reply(getLang('thinking'));

    const system = {
      role: 'system',
      content: 'You are CYBER SHAKIL BOT V3 — a helpful, friendly AI assistant made by MD SHAKIL HOSSEN from Bangladesh. Be concise and accurate.'
    };

    const history = conversationCache.get(key) || [];
    history.push({ role: 'user', content: input });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

    try {
      const { text, model } = await chatWithAI([system, ...history]);
      history.push({ role: 'assistant', content: text });
      conversationCache.set(key, history);
      const m = model.split('/').pop();
      return message.reply(`${text}\n\n──────────\n🤖 ${m}`);
    } catch (err) {
      return message.reply(getLang('error', err.message));
    }
  }
};
