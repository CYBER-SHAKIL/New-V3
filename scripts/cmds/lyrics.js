const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["lyric", "lrc", "songlyrics"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get song lyrics" },
    longDescription: { en: "Fetch full song lyrics via lrclib — type song name or artist - song" },
    category: "music",
    guide: { en: "{pn} [artist] - [song]\nExample: {pn} Eminem - Lose Yourself\nOr: {pn} Shape of You" }
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args.length)
      return message.reply("🎵 Usage: -lyrics [artist] - [song name]\nExample: -lyrics Eminem - Lose Yourself");

    const input = args.join(" ").trim();
    api.setMessageReaction("🎵", event.messageID, () => {}, true);

    const dashIdx = input.indexOf(" - ");
    let artist = "", title = "";
    if (dashIdx !== -1) {
      artist = input.slice(0, dashIdx).trim();
      title  = input.slice(dashIdx + 3).trim();
    } else {
      title = input;
    }

    try {
      let result = null;

      // Try exact search first
      if (artist && title) {
        try {
          const r = await axios.get("https://lrclib.net/api/get", {
            params: { artist_name: artist, track_name: title },
            timeout: 10000,
          });
          if (r.data?.plainLyrics) result = r.data;
        } catch (_) {}
      }

      // Fallback to general search
      if (!result) {
        const r = await axios.get("https://lrclib.net/api/search", {
          params: { q: input },
          timeout: 10000,
        });
        const items = r.data || [];
        result = items.find(i => i.plainLyrics) || null;
      }

      if (!result || !result.plainLyrics)
        return message.reply(`❌ No lyrics found for "${input}".\n\nTip: Try format: -lyrics [artist] - [song]`);

      const trackName  = result.trackName  || title  || "Unknown";
      const artistName = result.artistName || artist || "Unknown";
      const lyricsText = result.plainLyrics.trim();

      const header = `🎵 ═══════════════════════\n🎤 Artist : ${artistName}\n🎶 Song   : ${trackName}\n═══════════════════════\n\n`;

      // Split into 2000-char chunks
      const MAX = 1900;
      const chunks = [];
      for (let i = 0; i < lyricsText.length; i += MAX)
        chunks.push(lyricsText.slice(i, i + MAX));

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.reply(header + chunks[0]);

      for (let i = 1; i < chunks.length; i++) {
        await api.sendMessage(`📄 (Part ${i + 1}/${chunks.length})\n\n${chunks[i]}`, event.threadID);
      }

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("❌ Could not fetch lyrics. Try again later.");
    }
  }
};
