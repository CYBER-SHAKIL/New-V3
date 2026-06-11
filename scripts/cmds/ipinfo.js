// ═══════════════════════════════════════════
//  IPINFO — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  IP Geolocation via ip-api.com (free)
// ═══════════════════════════════════════════

const axios = require("axios");

module.exports = {
  config: {
    name: "ipinfo",
    aliases: ["ip", "iplookup", "geoip"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "IP address geolocation lookup" },
    longDescription:  { en: "Get location, ISP, timezone and other info for any IP" },
    category: "utility",
    guide: { en: "{pn} [IP address]\nExample: {pn} 8.8.8.8" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;
    if (!args[0]) return message.reply("🔍 Usage: -ipinfo [IP]\nExample: -ipinfo 8.8.8.8");

    const ip = args[0].trim();
    // Basic IP format check
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^[a-fA-F0-9:]+$/;
    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip))
      return message.reply("⚠️ Invalid IP address format.");

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const res  = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
        { timeout: 8000 }
      );
      const d = res.data;

      if (d.status === "fail")
        return message.reply(`❌ IP lookup failed: ${d.message}`);

      const flag = d.countryCode
        ? String.fromCodePoint(...[...d.countryCode.toUpperCase()].map(c => 0x1F1E0 - 65 + c.charCodeAt(0)))
        : "🌐";

      api.setMessageReaction("✅", messageID, () => {}, true);
      return message.reply(
`🌐 IP Information
━━━━━━━━━━━━━━━━━━━━━━
🔎 IP       : ${d.query}
${flag} Country  : ${d.country} (${d.countryCode})
🏙️ Region   : ${d.regionName}
🏡 City     : ${d.city}
📮 ZIP      : ${d.zip || "N/A"}
📍 Coords   : ${d.lat}, ${d.lon}
🕐 Timezone : ${d.timezone}
🌐 ISP      : ${d.isp}
🏢 Org      : ${d.org}
📡 AS       : ${d.as}
━━━━━━━━━━━━━━━━━━━━━━
🤖 SHAKIL BOT V3`
      );

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("❌ IP lookup failed. Try again later.");
    }
  }
};
