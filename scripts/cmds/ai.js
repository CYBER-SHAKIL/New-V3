'use strict';
const axios = require('axios');

const OPENROUTER_KEY = () => process.env.OPENROUTER_API_KEY || '';
const GROQ_KEY       = () => process.env.GROQ_API_KEY || '';

// Priority order: premium → free fallbacks
const OR_MODELS = [
  'openai/gpt-4.1',
  'anthropic/claude-sonnet-4',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-2.5-pro-preview',
  'openai/gpt-4o',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-3-12b-it:free',
];

const conversations = new Map();

async function askOpenRouter(messages) {
  if (!OPENROUTER_KEY()) throw new Error('NO_OR_KEY');
  for (const model of OR_MODELS) {
    try {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY()}`,
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
  throw new Error('OR_FAILED');
}

async function askGroq(messages) {
  if (!GROQ_KEY()) throw new Error('NO_GROQ_KEY');
  const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama3-70b-8192',
    messages,
    max_tokens: 1000,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${GROQ_KEY()}`,
      'Content-Type': 'application/json',
    },
    timeout: 20000,
  });
  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('GROQ_EMPTY');
  return { text, model: 'groq/llama3-70b' };
}

async function askAI(messages) {
  // Try OpenRouter first, then Groq as fallback
  try { return await askOpenRouter(messages); } catch (_) {}
  try { return await askGroq(messages); } catch (_) {}
  throw new Error('All AI models failed. Set OPENROUTER_API_KEY or GROQ_API_KEY.');
}

module.exports = {
  config: {
    name:     'ai',
    aliases:  ['copilot', 'cyberai', 'ask', 'chat'],
    version:  '3.0',
    author:   'CYBER-SHAKIL',
    countDown: 5,
    role:     0,
    shortDescription: { en: 'Chat with AI (GPT-4.1 / Claude / Llama3)' },
    longDescription:  { en: 'Multi-model AI — GPT-4.1, Claude Sonnet, Llama3, Gemini. Remembers conversation context. Falls back through free models automatically.' },
    category: 'AI',
    guide: {
      en:
        '{pn} <message>   — chat with AI\n' +
        '{pn} clear       — clear conversation\n' +
        '{pn} history     — show last 5 messages\n\n' +
        'Example: -ai What is the capital of Bangladesh?'
    }
  },

  langs: {
    en: {
      noInput:   '💬 Type a message!\n\nExample: -ai What is Bangladesh?',
      thinking:  '💭 Thinking...',
      noKey:     '🔑 No AI key configured! Set OPENROUTER_API_KEY or GROQ_API_KEY.',
      error:     '❌ AI Error: %1',
      cleared:   '🗑️ Conversation history cleared!',
      noHistory: 'No conversation history yet.',
    }
  },

  onStart: async function ({ message, args, getLang, event }) {
    if (!OPENROUTER_KEY() && !GROQ_KEY())
      return message.reply(getLang('noKey'));

    const key = `${event.threadID}_${event.senderID}`;
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'clear') {
      conversations.delete(key);
      return message.reply(getLang('cleared'));
    }

    if (sub === 'history') {
      const hist = conversations.get(key) || [];
      if (!hist.length) return message.reply(getLang('noHistory'));
      const preview = hist.slice(-10).map(m =>
        `${m.role === 'user' ? '👤' : '🤖'}: ${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}`
      ).join('\n\n');
      return message.reply(`📜 Conversation History:\n\n${preview}`);
    }

    const input = args.join(' ').trim();
    if (!input) return message.reply(getLang('noInput'));

    await message.reply(getLang('thinking'));

    const systemMsg = {
      role: 'system',
      content: 'You are CYBER SHAKIL BOT V3, a helpful and friendly AI assistant created by MD SHAKIL HOSSEN (CYBER SHAKIL) from Bangladesh. Answer concisely and helpfully.'
    };

    const hist = conversations.get(key) || [];
    hist.push({ role: 'user', content: input });
    if (hist.length > 20) hist.splice(0, hist.length - 20);

    try {
      const { text, model } = await askAI([systemMsg, ...hist]);
      hist.push({ role: 'assistant', content: text });
      conversations.set(key, hist);

      const modelShort = model.split('/').pop().replace(/:free$/, ' ✦free');
      return message.reply(`${text}\n\n──────────\n🤖 ${modelShort}`);
    } catch (err) {
      return message.reply(getLang('error', err.message));
    }
  }
};
