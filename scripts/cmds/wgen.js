'use strict';
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const THEMES = ["nature", "anime", "space", "city", "abstract", "dark", "neon", "fantasy", "ocean", "mountain"];

module.exports = {
  config: {
    name: "wgen",
    aliases: ["wallgen"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Generate AI wallpaper" },
    longDescription: { en: "Generate high-quality AI wallpapers using Pollinations AI. Specify a theme or custom prompt." },
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <theme or prompt>\n\n🎨 Quick Themes:\n" + THEMES.map(t => `• ${t}`).join("  ") + "\n\nExample: {pn} anime girl in neon city\nExample: {pn} space"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let prompt = args.join(" ").trim();
    if (!prompt) prompt = THEMES[Math.floor(Math.random() * THEMES.length)];

    const isTheme = THEMES.includes(prompt.toLowerCase());
    const fullPrompt = isTheme
      ? `beautiful ${prompt} wallpaper, ultra HD, 4K, stunning, artistic, high quality`
      : `${prompt}, wallpaper style, ultra HD, 4K, stunning visual`;

    const wait = await message.reply(`🖼️ Generating wallpaper: "${prompt}"...`);

    try {
      const seed = Math.floor(Math.random() * 99999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&seed=${seed}&model=flux&nologo=true&enhance=true`;

      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
      const imgPath = path.join(__dirname, "cache", `wgen_${event.senderID}_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(res.data));

      await api.sendMessage(
        {
          body: `✅ Wallpaper ready!\n🎨 Theme: ${prompt}\n📐 Resolution: 1280×720 (HD)`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.remove(imgPath).catch(() => {}),
        wait.messageID
      );
    } catch (err) {
      api.sendMessage("❌ Failed to generate wallpaper. Please try again.", event.threadID, wait.messageID);
    }
  }
};
