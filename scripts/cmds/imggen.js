'use strict';
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "imgen",
    aliases: ["imggen", "imagine"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Generate AI image from prompt" },
    longDescription: { en: "Generate AI images using Pollinations AI — free, fast, no key needed." },
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <prompt>\nExample: {pn} A dragon flying over a castle at sunset"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();
    if (!prompt)
      return message.reply("❌ Please provide a prompt.\nExample: -imgen A dragon flying over a castle");

    const wait = await message.reply("🎨 Generating image, please wait...");

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 99999);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
      const imgPath = path.join(__dirname, "cache", `imgen_${event.senderID}_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(res.data));

      await api.sendMessage(
        { body: `✅ | Prompt: ${prompt}`, attachment: fs.createReadStream(imgPath) },
        event.threadID,
        () => fs.remove(imgPath).catch(() => {}),
        wait.messageID
      );
    } catch (err) {
      api.sendMessage("❌ Failed to generate image. Try a different prompt.", event.threadID, wait.messageID);
    }
  }
};
