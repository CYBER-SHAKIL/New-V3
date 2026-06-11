'use strict';
// CYBER SHAKIL AI SYSTEM — OpenRouter Client
// Developed by MD SHAKIL HOSSEN

const axios  = require('axios');
const Logger = require('../Logger');

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callModel(modelId, systemPrompt, userPrompt, timeoutMs = 90000) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set in environment secrets.');

  Logger.ai(modelId.split('/')[1] || modelId, `Sending request...`);

  const resp = await axios.post(
    BASE_URL,
    {
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   }
      ],
      temperature:  0.2,
      max_tokens:   8192,
    },
    {
      headers: {
        'Authorization':  `Bearer ${apiKey}`,
        'Content-Type':   'application/json',
        'HTTP-Referer':   'https://github.com/CYBER-SHAKIL',
        'X-Title':        'CYBER SHAKIL AI BOT FIXER',
      },
      timeout: timeoutMs,
    }
  );

  const content = resp.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${modelId} returned empty response`);

  Logger.ai(modelId.split('/')[1] || modelId, `Response received (${content.length} chars)`);
  return content;
}

function extractCode(raw) {
  const fence = raw.match(/```(?:javascript|js)?\n?([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  if (raw.includes('module.exports') || raw.includes('const ') || raw.includes('var '))
    return raw.trim();
  return raw.trim();
}

module.exports = { callModel, extractCode };
