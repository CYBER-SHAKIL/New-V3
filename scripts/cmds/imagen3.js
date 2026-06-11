const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const APIS = [
  (p) => `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random()*99999)}`,
  (p) => `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`,
];

module.exports = {
  config: {
    name: "imagen3",
    aliases: ["ig3", "gflux"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 10,
    role: 0,
    shortDescription: "Generate image using AI (Flux/Imagen)",
    longDescription: "Generate AI image using Pollinations Flux model",
    category: "ai-image",
    guide: {
      en: "{pn} [prompt]\nExample: {pn} a samurai standing in sunset"
    }
  },

  onStart: async function ({ args, message, event, api }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Prompt দাও।\nউদাহরণ: imagen3 a samurai standing in sunset");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `imagen3_${Date.now()}.jpg`);

    for (const apiBuilder of APIS) {
      try {
        const url = apiBuilder(prompt);
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 60000,
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!response.data || response.data.byteLength < 1000) continue;

        await fs.writeFile(filePath, Buffer.from(response.data));

        await message.reply({ attachment: fs.createReadStream(filePath) });

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        setTimeout(() => fs.remove(filePath).catch(() => {}), 10000);
        return;

      } catch (_) { continue; }
    }

    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply("❌ Image generate করতে পারেনি। আবার try করো।");
  }
};
