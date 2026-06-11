'use strict';

const axios = require('axios');
const log = require('../logger/log.js');

const MODELS = {
  GPT: {
    name: 'GPT (OpenAI)',
    envKey: 'OPENAI_API_KEY',
    errTypes: ['syntax'],
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'
  },
  CLAUDE: {
    name: 'Claude (Anthropic)',
    envKey: 'ANTHROPIC_API_KEY',
    errTypes: ['logic'],
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307'
  },
  GEMINI: {
    name: 'Gemini (Google)',
    envKey: 'GEMINI_API_KEY',
    errTypes: ['optimization'],
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro'
  },
  DEEPSEEK: {
    name: 'DeepSeek',
    envKey: 'DEEPSEEK_API_KEY',
    errTypes: ['large_refactor'],
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-coder'
  },
  GROK: {
    name: 'Grok (xAI)',
    envKey: 'GROK_API_KEY',
    errTypes: ['unstable', 'unknown'],
    endpoint: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-beta'
  }
};

const ERROR_TYPE_MAP = {
  syntax: 'GPT',
  logic: 'CLAUDE',
  optimization: 'GEMINI',
  large_refactor: 'DEEPSEEK',
  unstable: 'GROK',
  async: 'GPT',
  missing_imports: 'GPT',
  unknown: 'GROK'
};

const FALLBACK_ORDER = ['GPT', 'CLAUDE', 'DEEPSEEK', 'GEMINI', 'GROK'];

class AIRouter {
  selectModel(errorType = 'unknown') {
    const primary = ERROR_TYPE_MAP[errorType] || 'GROK';
    const model = MODELS[primary];
    if (model && process.env[model.envKey]) {
      return { key: primary, ...model };
    }
    for (const key of FALLBACK_ORDER) {
      if (key !== primary && process.env[MODELS[key].envKey]) {
        return { key, ...MODELS[key] };
      }
    }
    return null;
  }

  async fix(code, error, errorType = 'unknown', attempt = 1) {
    const model = this.selectModel(errorType);

    if (!model) {
      log.warn('AI_ROUTER', 'No AI API keys found — using safe mock fixer');
      return this._mockFix(code, error, errorType);
    }

    log.info('AI_ROUTER', `Attempt ${attempt}: routing to ${model.name} for error type: ${errorType}`);

    try {
      const prompt = this._buildPrompt(code, error);

      if (model.key === 'CLAUDE') {
        return await this._callClaude(model, prompt);
      } else if (model.key === 'GEMINI') {
        return await this._callGemini(model, prompt);
      } else {
        return await this._callOpenAICompatible(model, prompt);
      }
    } catch (err) {
      log.warn('AI_ROUTER', `${model.name} failed: ${err.message}`);
      return this._mockFix(code, error, errorType);
    }
  }

  async _callOpenAICompatible(model, prompt) {
    const res = await axios.post(model.endpoint, {
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4096
    }, {
      headers: {
        Authorization: `Bearer ${process.env[model.envKey]}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return res.data?.choices?.[0]?.message?.content || null;
  }

  async _callClaude(model, prompt) {
    const res = await axios.post(model.endpoint, {
      model: model.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': process.env[model.envKey],
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return res.data?.content?.[0]?.text || null;
  }

  async _callGemini(model, prompt) {
    const res = await axios.post(`${model.endpoint}?key=${process.env[model.envKey]}`, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  _buildPrompt(code, error) {
    return `You are a Node.js expert. Fix the following JavaScript code that has an error.

ERROR:
${error}

CODE:
\`\`\`javascript
${code}
\`\`\`

Return ONLY the fixed JavaScript code, no explanation, no markdown, no code fences. Just the raw fixed JS code.`;
  }

  _mockFix(code, error, errorType) {
    log.info('AI_ROUTER', `Mock fixer activated for error type: ${errorType}`);
    const fixes = {
      syntax: this._fixCommonSyntax(code),
      missing_imports: code,
      async: code.replace(/^((?!async).)*function/, 'async function'),
      logic: code,
      unknown: code
    };
    return fixes[errorType] || code;
  }

  _fixCommonSyntax(code) {
    return code
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/([^=!<>])=(?!=)/g, (m, p) => {
        return p + '=';
      });
  }

  getAvailableModels() {
    return Object.entries(MODELS)
      .filter(([, m]) => process.env[m.envKey])
      .map(([key, m]) => ({ key, name: m.name }));
  }
}

module.exports = new AIRouter();
module.exports.AIRouter = AIRouter;
module.exports.MODELS = MODELS;
