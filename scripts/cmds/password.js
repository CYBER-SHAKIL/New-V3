// ═══════════════════════════════════════════
//  PASSWORD — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Secure random password generator
// ═══════════════════════════════════════════

const crypto = require("crypto");

function genPassword(length, opts) {
  let chars = "";
  if (opts.upper)   chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower)   chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.numbers) chars += "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let password = "";
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, chars.length);
    password += chars[idx];
  }
  return password;
}

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = ["❌ Very Weak","⚠️ Weak","🟡 Fair","🟠 Good","✅ Strong","💪 Very Strong"];
  return levels[Math.min(score, 5)];
}

module.exports = {
  config: {
    name: "password",
    aliases: ["pass", "genpass", "passgen"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Secure password generator 🔐" },
    longDescription:  { en: "Generate strong random passwords with custom options" },
    category: "utility",
    guide: {
      en: "{pn} [length] [options]\nOptions: -n (no symbols) -s (symbols only) -u (uppercase only)\nDefault: 16 chars, all types\nExample: {pn} 20 | {pn} 12 -n"
    }
  },

  onStart: async function ({ args, message }) {
    let length = 16;
    const opts = { upper: true, lower: true, numbers: true, symbols: true };

    if (args[0] && !isNaN(args[0])) {
      length = Math.min(Math.max(parseInt(args[0]), 4), 128);
    }
    if (args.includes("-n")) opts.symbols = false;
    if (args.includes("-s")) { opts.upper = false; opts.lower = false; opts.numbers = false; }
    if (args.includes("-u")) { opts.lower = false; }

    // Generate 5 passwords
    const passwords = Array.from({ length: 5 }, () => genPassword(length, opts));
    const strength  = scorePassword(passwords[0]);

    return message.reply(
`🔐 Password Generator
━━━━━━━━━━━━━━━━━━━━━
Length : ${length} chars
Strength: ${strength}
━━━━━━━━━━━━━━━━━━━━━
1️⃣  ${passwords[0]}
2️⃣  ${passwords[1]}
3️⃣  ${passwords[2]}
4️⃣  ${passwords[3]}
5️⃣  ${passwords[4]}
━━━━━━━━━━━━━━━━━━━━━
⚠️ Never share your password!
🤖 SHAKIL BOT V3`
    );
  }
};
