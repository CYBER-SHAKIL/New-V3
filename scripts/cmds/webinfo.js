const axios = require("axios");
const dns = require("dns").promises;
const https = require("https");

module.exports = {
  config: {
    name: "webinfo",
    version: "2.1",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get detailed information about any website" },
    description: {
      en: "Fetch full info like IP, SSL, Server, Response, Country from any website"
    },
    category: "ai",
    guide: {
      en: "{p}webinfo <url>\nExample: {p}webinfo google.com\nOR reply to a message containing link"
    }
  },

  langs: {
    en: {
      missing: "⚠️ Please provide a valid URL or reply to a message containing link",
      loading: "🔍 Analyzing website...\n🌐 %1",
      error: "❌ Failed to fetch web info"
    }
  },

  onStart: async function ({ message, args, getLang, event }) {
    let input;

    // 1. direct args
    if (args[0]) {
      input = args[0];
    }

    // 2. reply system
    if (!input && event.messageReply?.body) {
      const match = event.messageReply.body.match(
        /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i
      );
      if (match) input = match[0];
    }

    if (!input) return message.reply(getLang("missing"));

    try {
      // clean domain
      let domain = input.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      const url = `https://${domain}`;

      await message.reply(getLang("loading", domain));

      // IP
      let ip = "N/A";
      try {
        const dnsRes = await dns.lookup(domain);
        ip = dnsRes.address;
      } catch {}

      // SSL
      let ssl = "🔴 Not Secure";
      try {
        await new Promise((resolve) => {
          const req = https.request({ host: domain, method: "HEAD", port: 443 }, () => {
            ssl = "🟢 Valid SSL";
            resolve();
          });
          req.on("error", () => resolve());
          req.end();
        });
      } catch {}

      // response + server
      let responseTime = "N/A";
      let server = "Unknown";
      try {
        const start = Date.now();
        const res = await axios.get(url, { timeout: 10000 });
        responseTime = Date.now() - start;
        server = res.headers["server"] || "Unknown";
      } catch {}

      // country
      let country = "N/A";
      try {
        const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
        country = geo.data.country_name || "N/A";
      } catch {}

      const output =
        "🌐 WEBSITE INFO\n\n" +
        `🔗 Domain: ${domain}\n` +
        `📍 IP: ${ip}\n` +
        `🛡️ SSL: ${ssl}\n` +
        `⚡ Response: ${responseTime} ms\n` +
        `🧠 Server: ${server}\n` +
        `🌍 Country: ${country}`;

      message.reply(output);

    } catch (err) {
      console.error(err);
      message.reply(getLang("error"));
    }
  }
};