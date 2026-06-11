// ═══════════════════════════════════════════
//  COUNTRY — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Country info via restcountries.com (free)
// ═══════════════════════════════════════════

const axios = require("axios");

module.exports = {
  config: {
    name: "country",
    aliases: ["countryinfo", "nation"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Country information lookup" },
    longDescription:  { en: "Capital, population, currency, languages, flag and more" },
    category: "utility",
    guide: { en: "{pn} [country name]\nExample: {pn} Bangladesh" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;
    if (!args.length) return message.reply("🌍 Usage: -country [name]\nExample: -country Bangladesh");

    const query = args.join(" ").trim();
    api.setMessageReaction("🌍", messageID, () => {}, true);

    try {
      const res = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`,
        { timeout: 8000 }
      );
      const c = res.data[0];

      const name       = c.name.common;
      const official   = c.name.official;
      const capital    = c.capital?.[0] || "N/A";
      const region     = `${c.region} / ${c.subregion || "N/A"}`;
      const pop        = (c.population || 0).toLocaleString();
      const area       = (c.area || 0).toLocaleString() + " km²";
      const langs      = c.languages ? Object.values(c.languages).join(", ") : "N/A";
      const currencies = c.currencies
        ? Object.values(c.currencies).map(cur => `${cur.name} (${cur.symbol || "?"})` ).join(", ")
        : "N/A";
      const tld        = c.tld?.[0] || "N/A";
      const callingCode = c.idd?.root ? c.idd.root + (c.idd.suffixes?.[0] || "") : "N/A";
      const flag       = c.flag || "🏳️";
      const maps       = c.maps?.googleMaps || "";

      api.setMessageReaction("✅", messageID, () => {}, true);
      return message.reply(
`${flag} Country Information
━━━━━━━━━━━━━━━━━━━━━━━
🏷️ Name       : ${name}
📜 Official   : ${official}
🏛️ Capital    : ${capital}
🌍 Region     : ${region}
👥 Population : ${pop}
📐 Area       : ${area}
🗣️ Languages  : ${langs}
💰 Currency   : ${currencies}
📞 Calling    : ${callingCode}
🌐 TLD        : ${tld}
${maps ? `🗺️ Maps       : ${maps}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (err.response?.status === 404)
        return message.reply(`❌ Country "${query}" not found. Try full country name.`);
      message.reply("❌ Country lookup failed. Try again.");
    }
  }
};
