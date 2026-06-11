'use strict';
// CYBER SHAKIL AI SYSTEM — Prompt Builder
// Developed by MD SHAKIL HOSSEN

const SYSTEM_PROMPT = `You are an expert GoatBot v3 command file repair AI assistant called CYBER SHAKIL AI.

YOUR RULES:
1. Return ONLY pure valid JavaScript code — NO explanations, NO markdown, NO backticks.
2. NEVER break GoatBot structure: module.exports, config (name, role, category, countDown, author, guide), onStart, onEvent, onReply must stay intact.
3. Fix ALL syntax errors, runtime errors, async/await issues, undefined variables.
4. If an API is dead/broken, replace it with a working equivalent or a graceful fallback message.
5. Preserve the original command logic, purpose, and flow.
6. Fix missing try/catch around API calls.
7. Ensure proper error handling throughout.
8. Do NOT add unnecessary dependencies.
9. Output ONLY the complete fixed JavaScript file — nothing else.
10. ALWAYS keep author as SHAKIL-HOSSEN or CYBER SHAKIL in config.author.`;

function buildFixPrompt({ raw, issues, warnings, info }) {
  const issueList = issues.map((e, i) =>
    `${i + 1}. [${e.type}]${e.line ? ` Line ${e.line}:` : ''} ${e.msg}`
  ).join('\n');

  const warnList  = warnings.slice(0, 10).map((w, i) =>
    `${i + 1}. [${w.type}]${w.line ? ` Line ${w.line}:` : ''} ${w.msg}`
  ).join('\n');

  return `COMMAND FILE: ${info.name}
LINES: ${info.lines}
GOATBOT STRUCTURE: exports=${info.hasExports}, config=${info.hasConfig}, onStart=${info.hasOnStart}

DETECTED ISSUES:
${issueList || 'None detected by scanner'}

DETECTED WARNINGS:
${warnList || 'None'}

MISSING PACKAGES: ${info.missingDeps?.join(', ') || 'None'}

--- ORIGINAL BROKEN FILE ---
${raw}
--- END FILE ---

Fix ALL issues. Return ONLY the complete corrected JavaScript file.`;
}

function buildScanOnlyPrompt({ raw, info }) {
  return `Review this GoatBot v3 command file and list all bugs, issues, and improvements needed.
Be specific with line numbers where possible.

FILE: ${info.name} (${info.lines} lines)

${raw}

List all issues found. Be detailed and specific.`;
}

function buildCreatePrompt(commandName, description = '') {
  return `Create a complete new GoatBot v3 command file for the command named "${commandName}".
${description ? `Description: ${description}` : ''}

Requirements:
- Full GoatBot module.exports structure
- Proper config: name, version, author ("CYBER SHAKIL"), role, countDown, category, shortDescription, guide
- Working onStart function with proper error handling
- Use axios for any HTTP calls with try/catch
- Add useful features appropriate for the command name
- Make it fully functional and production-ready

Return ONLY the complete JavaScript file — no explanations.`;
}

module.exports = { SYSTEM_PROMPT, buildFixPrompt, buildScanOnlyPrompt, buildCreatePrompt };
