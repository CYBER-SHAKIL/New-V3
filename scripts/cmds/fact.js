// ═══════════════════════════════════════════
//  FACT — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Random facts — uselessfacts API (free)
// ═══════════════════════════════════════════

const axios = require("axios");

const FALLBACK_FACTS = [
  "A group of flamingos is called a 'flamboyance'.",
  "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that is still perfectly edible.",
  "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
  "Bananas are berries, but strawberries aren't.",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "A day on Venus is longer than a year on Venus.",
  "Octopuses have three hearts and blue blood.",
  "The world's oldest known living tree is over 5,000 years old.",
  "A snail can sleep for 3 years.",
  "Tigers have striped skin, not just striped fur."
];

module.exports = {
  config: {
    name: "fact",
    aliases: ["facts", "randomfact", "funfact"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Random interesting fact 🧠" },
    longDescription:  { en: "Learn something new with a random fact every time" },
    category: "fun",
    guide: { en: "{pn} — random fact" }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get(
        "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
        { timeout: 5000 }
      );
      const fact = res.data?.text;
      if (!fact) throw new Error("no fact");

      return message.reply(
`🧠 Did You Know?
━━━━━━━━━━━━━━━
💡 ${fact}
━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );
    } catch {
      const fact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
      return message.reply(
`🧠 Did You Know?
━━━━━━━━━━━━━━━
💡 ${fact}
━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );
    }
  }
};
