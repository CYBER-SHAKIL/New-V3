const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    version: "2.2.3",
    author: "MD_SHAKIL",
    countDown: 5,
    role: 0,
    shortDescription: "Search & download YouTube videos",
    longDescription: "Search YouTube videos by name and download without prefix",
    category: "media",
    guide: {
      en: "video <video name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, body } = event;
    const creatorName = "MD SHAKIL HOSSEN";

    let query = args.join(" ");

    if (!query && body) {
      query = body.replace(/^video\s+/i, "").trim();
    }

    if (!query || query.toLowerCase() === "video") {
      return api.sendMessage(
        `❌ Please provide a video name.\n📌 Example: video Let Me Love You`,
        threadID,
        messageID
      );
    }

    let tempMsgID = null;

    try {
      const searching = await api.sendMessage(
        `🔍 Searching\n━━━━━━━━━━━━━━━\n📌 Query: ${query}\n⏳ Please wait...`,
        threadID
      );
      tempMsgID = searching.messageID;

      const searchRes = await axios.get(
        `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`,
        { timeout: 15000 }
      );

      const items = searchRes.data?.items;
      if (!Array.isArray(items) || items.length === 0) throw new Error("No results found.");
      const firstResult = items[0];
      const videoId = firstResult.url?.replace("/watch?v=", "") || firstResult.id;
      if (!videoId) throw new Error("Could not extract video ID.");
      const video = {
        title: firstResult.title || "Unknown",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        time: firstResult.duration ? `${Math.floor(firstResult.duration/60)}:${String(firstResult.duration%60).padStart(2,'0')}` : "N/A",
        id: videoId
      };

      await api.unsendMessage(tempMsgID).catch(() => {});

      const downloading = await api.sendMessage(
        `🎬 Video Found\n━━━━━━━━━━━━━━━\n📖 Title: ${video.title}\n⬇️ Downloading...`,
        threadID
      );
      tempMsgID = downloading.messageID;

      const streamsRes = await axios.get(
        `https://pipedapi.kavin.rocks/streams/${video.id}`,
        { timeout: 15000 }
      );
      const videoStreams = streamsRes.data?.videoStreams || [];
      const stream360 = videoStreams.find(s => s.quality === "360p") || videoStreams[0];
      const downloadUrl = stream360?.url;
      if (!downloadUrl) throw new Error("Download link not available.");

      const buffer = (
        await axios.get(downloadUrl, { responseType: "arraybuffer" })
      ).data;

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
      await fs.writeFile(filePath, buffer);

      const finalMessage = {
        body:
          `━━━━━━━━━━━━━━━━━━\n` +
          `🎬 VIDEO READY\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📖 Title: ${video.title}\n` +
          `⏱ Duration: ${video.time}\n` +
          `🖌️ Power by: ${creatorName}\n` +
          `━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(filePath)
      };

      await api.sendMessage(finalMessage, threadID, async () => {
        if (fs.existsSync(filePath)) await fs.unlink(filePath);
      }, messageID);

      if (tempMsgID) await api.unsendMessage(tempMsgID).catch(() => {});

    } catch (err) {
      if (tempMsgID) await api.unsendMessage(tempMsgID).catch(() => {});
      api.sendMessage(
        `❌ Failed\n━━━━━━━━━━━━━━━\n${err.message || "An unexpected error occurred."}`,
        threadID,
        messageID
      );
    }
  }
};
