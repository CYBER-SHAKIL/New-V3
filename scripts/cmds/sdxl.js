'use strict';
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const STYLE_MAP = {
  "3d model":     "3d-model",
  "analog film":  "analog-film",
  "anime":        "anime",
  "cinematic":    "cinematic",
  "comic book":   "comic-book",
  "digital art":  "digital-art",
  "fantasy art":  "fantasy-art",
  "neon punk":    "neon-punk",
  "photographic": "photographic",
  "pixel art":    "pixel-art"
};

const VALID_STYLES = Object.keys(STYLE_MAP);

module.exports = {
  config: {
    name: "sdxl",
    aliases: ["sdxllight"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Generate SDXL-style AI image with style" },
    longDescription: { en: "Generate styled AI image using Pollinations AI. Supports 10 style modes." },
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <prompt> | <style>\n\n📋 Styles:\n• 3d model  • analog film  • anime\n• cinematic  • comic book  • digital art\n• fantasy art  • neon punk  • photographic  • pixel art\n\nExample: {pn} a warrior princess | anime"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").split("|");
    const prompt = input[0]?.trim();
    const style  = input[1]?.trim()?.toLowerCase();

    if (!prompt)
      return message.reply("❌ Please provide a prompt.\nExample: -sdxl a warrior princess | anime");

    if (style && !VALID_STYLES.includes(style))
      return message.reply(
        "❌ Invalid style! Available styles:\n• " + VALID_STYLES.join("\n• ")
      );

    const wait = await message.reply(`⏳ Generating${style ? ` [${style}]` : ""} image...`);

    try {
      const seed = Math.floor(Math.random() * 99999);
      const fullPrompt = style ? `${prompt}, ${STYLE_MAP[style]} style` : prompt;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`;

      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
      const imgPath = path.join(__dirname, "cache", `sdxl_${event.senderID}_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(res.data));

      await api.sendMessage(
        {
          body: `✅ Here's your image!\n🖼️ Prompt: ${prompt}${style ? `\n🎨 Style: ${style}` : ""}`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.remove(imgPath).catch(() => {}),
        wait.messageID
      );
    } catch (err) {
      api.sendMessage("❌ Failed to generate image. Please try again later.", event.threadID, wait.messageID);
    }
  }
};
