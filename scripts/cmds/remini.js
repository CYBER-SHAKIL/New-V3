const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "remini",
    aliases: ["remini2", "aienhance"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 10,
    role: 0,
    category: "ai",
    description: { en: "Enhance/upscale image quality using AI" },
    guide: { en: "{pn} — reply to an image or provide URL" }
  },

  onStart: async function ({ message, event, args }) {
    let imgUrl = null;

    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
    } else if (args[0]) {
      imgUrl = args.join(" ").trim();
    }

    if (!imgUrl)
      return message.reply("📷 Please reply to a photo or provide an image URL!\n\nExample: -remini [URL]");

    message.reaction("⏳", event.messageID);

    const APIS = [
      `https://api.betabotz.eu.org/api/tools/remini?url=${encodeURIComponent(imgUrl)}&apikey=lalilulelo`,
      `https://api.nexoracle.com/enhance/remini?apikey=free_key&url=${encodeURIComponent(imgUrl)}`,
      `https://api.vreden.my.id/api/remini?url=${encodeURIComponent(imgUrl)}`
    ];

    for (const apiUrl of APIS) {
      try {
        const res = await axios.get(apiUrl, { responseType: "stream", timeout: 45000 });
        message.reaction("✅", event.messageID);
        return await message.reply({
          body: "✨ Here's your enhanced image!",
          attachment: res.data
        });
      } catch (_) {
        continue;
      }
    }

    try {
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const res = await axios.post(
        "https://api.deepai.org/api/waifu2x",
        new URLSearchParams({ image_url: imgUrl }),
        {
          headers: {
            "api-key": "quickstart-QUdJIGlzIGF3ZXNvbWU",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          timeout: 45000
        }
      );
      const outputUrl = res.data?.output_url;
      if (outputUrl) {
        const img = await axios.get(outputUrl, { responseType: "stream", timeout: 20000 });
        message.reaction("✅", event.messageID);
        return await message.reply({
          body: "✨ Here's your enhanced image!",
          attachment: img.data
        });
      }
    } catch (_) {}

    message.reaction("❌", event.messageID);
    return message.reply("❌ Image enhancement failed. Please try with a clearer image URL.");
  }
};
