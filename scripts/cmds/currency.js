// ═══════════════════════════════════════════
//  CURRENCY — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Currency converter via open.er-api.com (free)
// ═══════════════════════════════════════════

const axios = require("axios");

module.exports = {
  config: {
    name: "currency",
    aliases: ["convert", "forex", "exchange"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Currency converter 💱" },
    longDescription:  { en: "Convert any currency to another using live exchange rates" },
    category: "utility",
    guide: {
      en: "{pn} [amount] [FROM] [TO]\nExample: {pn} 100 USD BDT\n{pn} 1000 BDT USD"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;

    if (args.length < 3)
      return message.reply("💱 Usage: -currency [amount] [FROM] [TO]\nExample: -currency 100 USD BDT");

    const amount = parseFloat(args[0]);
    if (isNaN(amount) || amount <= 0)
      return message.reply("⚠️ Invalid amount. Please enter a positive number.");

    const from = args[1].toUpperCase().trim();
    const to   = args[2].toUpperCase().trim();

    api.setMessageReaction("💱", messageID, () => {}, true);

    try {
      const res   = await axios.get(`https://open.er-api.com/v6/latest/${from}`, { timeout: 8000 });
      const rates = res.data?.rates;

      if (res.data?.result === "error")
        return message.reply(`❌ Invalid currency code: ${from}`);
      if (!rates?.[to])
        return message.reply(`❌ Target currency not found: ${to}`);

      const rate     = rates[to];
      const converted = (amount * rate).toFixed(4);
      const updateDate = res.data?.time_last_update_utc || "N/A";

      api.setMessageReaction("✅", messageID, () => {}, true);
      return message.reply(
`💱 Currency Converter
━━━━━━━━━━━━━━━━━━━━━
💰 ${amount} ${from} = ${converted} ${to}
📊 Rate: 1 ${from} = ${rate.toFixed(6)} ${to}
📅 Updated: ${updateDate.slice(0, 16)}
━━━━━━━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("❌ Currency conversion failed. Check currency codes (e.g., USD, BDT, EUR).");
    }
  }
};
