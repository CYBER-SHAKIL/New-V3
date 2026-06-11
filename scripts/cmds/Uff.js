const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const NSFW_VIDEO_APIS = [
  "https://api.vreden.my.id/api/nsfw/hentai",
  "https://apis.davidcyriltech.my.id/nsfw/hentai",
  "https://xihad-4-x.vercel.app/api/nsfw?type=hentai&apikey=dhn",
];

module.exports = {
  config: {
    name: "uff",
    aliases: ["onlytik", "nsfwtk"],
    author: "SHAKIL-HOSSEN",
    version: "2.0",
    countDown: 10,
    role: 2,
    shortDescription: "18+ video",
    longDescription: "18+ random NSFW video (Admin only)",
    category: "18+",
    guide: "{p}uff"
  },

  onStart: async function ({ api, event, message }) {
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    for (const apiUrl of NSFW_VIDEO_APIS) {
      try {
        const res = await axios.get(apiUrl, { timeout: 15000 });
        const data = res.data;

        const videoUrl = data?.video || data?.videoUrl || data?.url || data?.result;
        if (!videoUrl) continue;

        const filePath = path.join(cacheDir, `uff_${Date.now()}.mp4`);

        const dlRes = await axios.get(videoUrl, {
          responseType: "stream",
          timeout: 60000,
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        const writer = fs.createWriteStream(filePath);
        dlRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        await message.reply({ attachment: fs.createReadStream(filePath) });
        api.setMessageReaction("🔥", event.messageID, () => {}, true);
        setTimeout(() => fs.remove(filePath).catch(() => {}), 15000);
        return;

      } catch (_) { continue; }
    }

    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply("❌ Video পাওয়া যায়নি। একটু পরে try করো।");
  }
};
