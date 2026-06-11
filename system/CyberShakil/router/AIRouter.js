'use strict';
// CYBER SHAKIL AI SYSTEM — Smart AI Router
// Developed by MD SHAKIL HOSSEN

const Logger = require('../Logger');

// All models via OpenRouter
const MODELS = [
  {
    id:       'openai/gpt-4.1',
    name:     'GitHub Copilot (GPT-4.1)',
    tags:     ['copilot', 'complex', 'logic', 'structure', 'large', 'goatbot'],
    priority: 1,
    maxLines: 9999,
  },
  {
    id:       'anthropic/claude-sonnet-4',
    name:     'Claude Sonnet 4',
    tags:     ['complex', 'logic', 'structure', 'large'],
    priority: 2,
    maxLines: 9999,
  },
  {
    id:       'anthropic/claude-3.5-sonnet',
    name:     'Claude 3.5 Sonnet',
    tags:     ['complex', 'logic', 'structure'],
    priority: 3,
    maxLines: 9999,
  },
  {
    id:       'google/gemini-2.5-pro-preview',
    name:     'Gemini 2.5 Pro',
    tags:     ['logic', 'api', 'medium', 'large'],
    priority: 4,
    maxLines: 9999,
  },
  {
    id:       'openai/gpt-4o',
    name:     'GPT-4o',
    tags:     ['syntax', 'small', 'medium'],
    priority: 5,
    maxLines: 500,
  },
  {
    id:       'deepseek/deepseek-chat-v3-0324',
    name:     'DeepSeek Chat V3',
    tags:     ['large', 'complex', 'dependency'],
    priority: 6,
    maxLines: 9999,
  },
  {
    id:       'x-ai/grok-3-mini-beta',
    name:     'Grok 3 Mini',
    tags:     ['optimization', 'small', 'syntax'],
    priority: 7,
    maxLines: 300,
  },
  {
    id:       'meta-llama/llama-3.3-70b-instruct',
    name:     'Llama 3.3 70B',
    tags:     ['medium', 'syntax', 'structure'],
    priority: 8,
    maxLines: 600,
  },
  {
    id:       'openai/gpt-4o-mini',
    name:     'GPT-4o Mini',
    tags:     ['small', 'syntax', 'fast'],
    priority: 9,
    maxLines: 200,
  },
];

function selectModel({ issues = [], warnings = [], info = {} }) {
  const lines     = info.lines || 0;
  const hasAPI    = issues.some(e => e.type === 'API') || warnings.some(w => w.type === 'API');
  const hasDep    = issues.some(e => e.type === 'DEPENDENCY');
  const hasSyntax = issues.some(e => e.type === 'SYNTAX');
  const hasAsync  = issues.some(e => e.type === 'ASYNC');
  const hasStruct = issues.some(e => e.type === 'STRUCTURE');
  const isLarge   = lines > 300;
  const isMedium  = lines > 100 && lines <= 300;
  const isSmall   = lines <= 100;

  let preferred = null;

  if (isLarge || hasStruct)                           preferred = 'openai/gpt-4.1';
  else if (hasAPI || (hasAsync && isMedium))          preferred = 'google/gemini-2.5-pro-preview';
  else if (hasSyntax && isSmall)                      preferred = 'openai/gpt-4o';
  else if (hasDep || isLarge)                         preferred = 'deepseek/deepseek-chat-v3-0324';
  else if (isSmall && hasSyntax)                      preferred = 'x-ai/grok-3-mini-beta';
  else                                                preferred = 'openai/gpt-4.1';

  const model = MODELS.find(m => m.id === preferred) || MODELS[0];
  Logger.ai(model.name, `Selected for this fix task`);
  return model;
}

function getModelQueue({ issues = [], warnings = [], info = {} }) {
  const primary = selectModel({ issues, warnings, info });
  const rest    = MODELS.filter(m => m.id !== primary.id).sort((a, b) => a.priority - b.priority);
  return [primary, ...rest];
}

module.exports = { MODELS, selectModel, getModelQueue };
