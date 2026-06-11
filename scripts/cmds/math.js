// ═══════════════════════════════════════════
//  MATH — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Advanced math evaluator + converter
// ═══════════════════════════════════════════

module.exports = {
  config: {
    name: "math",
    aliases: ["mathsolve", "solve", "calc2"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Advanced math calculator 🧮" },
    longDescription:  { en: "Evaluate math expressions, convert units, compute" },
    category: "utility",
    guide: {
      en: "{pn} [expression]\nExamples:\n{pn} 2+2*10\n{pn} sqrt(144)\n{pn} 100*0.15\n{pn} 2^10"
    }
  },

  onStart: async function ({ args, message }) {
    if (!args.length) return message.reply("🧮 Usage: -math [expression]\nExample: -math 2+2*10");

    const expr = args.join(" ").trim();

    // Safety check — only allow math characters
    if (/[^0-9+\-*/().,%^ a-zA-Z_]/.test(expr))
      return message.reply("⚠️ Invalid characters in expression.");

    // Replace common functions
    let safe = expr
      .replace(/\^/g, "**")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/floor\(/g, "Math.floor(")
      .replace(/ceil\(/g, "Math.ceil(")
      .replace(/round\(/g, "Math.round(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/pi/gi, "Math.PI")
      .replace(/e(?![0-9])/g, "Math.E");

    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${safe})`)();

      if (typeof result !== "number" || !isFinite(result))
        return message.reply("❌ Result is not a valid number.");

      const formatted = Number.isInteger(result)
        ? result.toLocaleString()
        : parseFloat(result.toFixed(10)).toLocaleString();

      return message.reply(
`🧮 Math Result
━━━━━━━━━━━━━━━━━━━
📥 Expression : ${expr}
📤 Answer     : ${formatted}
━━━━━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );
    } catch (err) {
      return message.reply("❌ Math error: " + err.message.slice(0, 100));
    }
  }
};
