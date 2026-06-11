// ═══════════════════════════════════════════
//  QUOTE — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Random inspiring quotes via quotable.io
// ═══════════════════════════════════════════

const axios = require("axios");

const FALLBACK_QUOTES = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { content: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" }
];

const TAGS = ["motivational","inspirational","life","success","wisdom","love","happiness","friendship"];

module.exports = {
  config: {
    name: "quote",
    aliases: ["quotes", "qoute", "inspiration"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Get an inspiring quote 💬" },
    longDescription:  { en: "Random inspirational quotes from famous people" },
    category: "fun",
    guide: { en: "{pn} — random quote\n{pn} [tag] — category quote\nTags: " + TAGS.join(", ") }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;
    const tag = args[0]?.toLowerCase()?.trim();

    try {
      let data;
      const url = tag
        ? `https://api.quotable.io/random?tags=${tag}`
        : `https://api.quotable.io/random`;

      const res = await axios.get(url, { timeout: 6000 });
      data = res.data;

      return message.reply(
`💬 "${data.content}"

— ${data.author}

━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );

    } catch {
      // Fallback to local quotes
      const q = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      return message.reply(
`💬 "${q.content}"

— ${q.author}

━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );
    }
  }
};
