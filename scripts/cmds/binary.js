// ═══════════════════════════════════════════
//  BINARY — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Text ↔ Binary / Hex / Base64 encoder
// ═══════════════════════════════════════════

module.exports = {
  config: {
    name: "binary",
    aliases: ["encode", "bin2text", "text2bin"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Text ↔ Binary/Hex/Base64 encoder 🔢" },
    longDescription:  { en: "Encode or decode text in binary, hex, base64" },
    category: "utility",
    guide: {
      en: "{pn} encode [text] — text → binary\n{pn} decode [binary] — binary → text\n{pn} hex [text] — text → hex\n{pn} unhex [hex] — hex → text\n{pn} b64 [text] — base64 encode\n{pn} unb64 [b64] — base64 decode"
    }
  },

  onStart: async function ({ args, message }) {
    if (args.length < 2)
      return message.reply("Usage: -binary encode/decode/hex/unhex/b64/unb64 [text]");

    const mode  = args[0].toLowerCase();
    const input = args.slice(1).join(" ");

    try {
      let result = "";
      switch (mode) {
        case "encode":
          result = input.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
          break;
        case "decode":
          result = input.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join("");
          break;
        case "hex":
          result = Buffer.from(input).toString("hex").match(/.{1,2}/g).join(" ");
          break;
        case "unhex":
          result = Buffer.from(input.replace(/\s/g, ""), "hex").toString("utf8");
          break;
        case "b64":
          result = Buffer.from(input).toString("base64");
          break;
        case "unb64":
          result = Buffer.from(input, "base64").toString("utf8");
          break;
        default:
          return message.reply("❌ Unknown mode. Use: encode, decode, hex, unhex, b64, unb64");
      }

      if (result.length > 1800)
        result = result.slice(0, 1800) + "... [truncated]";

      return message.reply(
`🔢 ${mode.toUpperCase()} Result
━━━━━━━━━━━━━━━━━━━
📥 Input : ${input.length > 80 ? input.slice(0, 80) + "…" : input}
━━━━━━━━━━━━━━━━━━━
📤 Output:
${result}
━━━━━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );
    } catch (err) {
      return message.reply("❌ Encoding/decoding error: " + err.message);
    }
  }
};
