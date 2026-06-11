'use strict';

module.exports = {
  config: {
    name:     'calc',
    aliases:  ['calculator', 'math', 'calculate'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 3,
    role:     0,
    shortDescription: { en: 'Calculator — do math calculations' },
    category: 'utility',
    guide: {
      en:
        '{pn} <expression>\n\n' +
        'Examples:\n' +
        '  {pn} 25 * 4 + 10\n' +
        '  {pn} sqrt(144)\n' +
        '  {pn} (100 / 5) ^ 2\n' +
        '  {pn} sin(90) | cos(0) | log(100)'
    }
  },

  langs: {
    en: {
      noInput: 'Please enter a math expression!\n\nExample: -calc 25 * 4 + 10',
      error:   'Invalid expression! Check your math.\nExpression: %1',
    }
  },

  onStart: async function ({ message, args, getLang }) {
    if (!args[0]) return message.reply(getLang('noInput'));

    let expr = args.join(' ')
      .replace(/x/gi, '*')
      .replace(/\^/g, '**')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/floor\(/g, 'Math.floor(')
      .replace(/ceil\(/g, 'Math.ceil(')
      .replace(/round\(/g, 'Math.round(')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e(?![a-zA-Z])/g, 'Math.E');

    if (/[^0-9+\-*/().%\s,MathsqrlognabceiPIE]/.test(expr)) {
      return message.reply(getLang('error', args.join(' ')));
    }

    try {
      const result = Function(`"use strict"; return (${expr})`)();
      if (typeof result !== 'number' || !isFinite(result)) throw new Error('Invalid result');

      const displayResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));

      return message.reply(
        `Calculator\n` +
        `Expression: ${args.join(' ')}\n` +
        `Result: ${displayResult}`
      );
    } catch (e) {
      return message.reply(getLang('error', args.join(' ')));
    }
  }
};
