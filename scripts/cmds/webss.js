const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "webss",
    aliases: ["ss"],
    version: "1.2",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Website screenshot"
    },
    description: {
      en: "Take a full page screenshot of any website"
    },
    category: "Ai",
    guide: {
      en:
        "{p}webss <url>\n" +
        "Example: {p}webss https://google.com\n\n" +
        "Or reply to a message containing a link:\n" +
        "{p}webss"
    }
  },

  langs: {
    en: {
      missing:
        "⚠️ Please provide a valid URL or reply to a message containing a website link.",
      loading:
        "📸 Website Screenshot Taking...\n🌐 %1",
      error:
        "❌ Screenshot Failed\n🌐 Invalid, blocked, or unsupported URL."
    }
  },

  onStart: async function ({ message, args, getLang, event }) {
    let url;

    // Direct URL from command
    if (args[0]) {
      url = args[0].startsWith("http")
        ? args[0]
        : `https://${args[0]}`;
    }

    // URL from replied message
    if (!url && event.messageReply?.body) {
      const match = event.messageReply.body.match(
        /(https?:\/\/[^\s]+|(?:www\.)[^\s]+)/i
      );

      if (match) {
        url = match[0].startsWith("http")
          ? match[0]
          : `https://${match[0]}`;
      }
    }

    if (!url)
      return message.reply(getLang("missing"));

    await message.reply(getLang("loading", url));

    try {
      const res = await axios.get(
        `https://api.popcat.xyz/v2/screenshot?url=${encodeURIComponent(url)}`,
        {
          responseType: "arraybuffer"
        }
      );

      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir))
        fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(
        cacheDir,
        `webss_${Date.now()}.png`
      );

      fs.writeFileSync(filePath, res.data);

      await message.reply(
        {
          body:
            "📸 WEBSITE SCREENSHOT\n\n" +
            `🌐 URL: ${url}\n` +
            "🖼️ Type: Full Page\n" +
            "⚡ Status: Success",
          attachment: fs.createReadStream(filePath)
        },
        () => {
          if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        }
      );
    } catch (err) {
      console.error("WEBSS ERROR:", err);
      return message.reply(getLang("error"));
    }
  }
};