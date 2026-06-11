const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "pint", "wallpaper"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 5,
    role: 0,
    description: "Search wallpapers and images by keyword",
    category: "image",
    guide: {
      en: "{pn} [keyword] — Get wallpaper results\nExample: {pn} Naruto"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("❗ Please provide a search keyword.\nExample: -pin Naruto", event.threadID, event.messageID);

    try {
      await api.sendMessage(`🔍 Searching for "${query}"...`, event.threadID);

      const res = await axios.get(
        `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&categories=111&purity=100&per_page=5&sorting=relevance`,
        { timeout: 15000 }
      );

      const results = res.data?.data;
      if (!Array.isArray(results) || results.length === 0) {
        return api.sendMessage(`❌ No results found for "${query}"!`, event.threadID, event.messageID);
      }

      const attachments = [];
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const savedFiles = [];

      const limit = Math.min(5, results.length);
      for (let i = 0; i < limit; i++) {
        const imgUrl = results[i].path;
        if (!imgUrl) continue;
        try {
          const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 20000 });
          const ext = imgUrl.split(".").pop().split("?")[0] || "jpg";
          const filePath = path.join(cacheDir, `pin_${Date.now()}_${i}.${ext}`);
          fs.writeFileSync(filePath, Buffer.from(imgRes.data));
          attachments.push(fs.createReadStream(filePath));
          savedFiles.push(filePath);
        } catch (_) {}
      }

      if (attachments.length === 0) {
        return api.sendMessage(`❌ Failed to download images for "${query}".`, event.threadID, event.messageID);
      }

      api.sendMessage(
        { body: `🖼️ Results for: "${query}" (${attachments.length} images)`, attachment: attachments },
        event.threadID,
        () => { savedFiles.forEach(f => { try { fs.unlinkSync(f); } catch (_) {} }); },
        event.messageID
      );
    } catch (err) {
      console.error("[pin]", err.message);
      api.sendMessage("🚫 Error fetching images. Try again later.", event.threadID, event.messageID);
    }
  }
};
