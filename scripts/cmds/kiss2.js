const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * @author MahMUD
 * @author: do not delete it
 */

module.exports = {
  config: {
    name: "kiss2",
    aliases: ["k2"],
    version: "2.0",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    longDescription: "Generate anime-style kiss GIF",
    category: "love",
    guide: "{pn} @mention / reply"
  },

  onStart: async function ({ api, event, message }) {
    try {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
      if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
      }

      const { threadID, messageID, messageReply, mentions, senderName } = event;

      let targetName;
      if (messageReply) {
        targetName = messageReply.senderName || "Someone";
      } else if (Object.keys(mentions).length > 0) {
        targetName = Object.values(mentions)[0] || "Someone";
      } else {
        return api.sendMessage("💋 কাকে kiss করতে চাও? Mention করো বা reply দাও!", threadID, messageID);
      }

      const resp = await axios.get("https://nekos.best/api/v2/kiss", { timeout: 10000 });
      const gifUrl = resp.data.results[0].url;
      const imgResponse = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `kiss2_${Date.now()}.gif`);
      fs.writeFileSync(filePath, Buffer.from(imgResponse.data));

      api.sendMessage(
        {
          attachment: fs.createReadStream(filePath),
          body: `💋 ${senderName || "কেউ"} kissed ${targetName}!\nজান উফ সেই স্বাদ 😘🤣`
        },
        threadID,
        () => { try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ } },
        messageID
      );

    } catch (err) {
      console.error("[kiss2]", err.message);
      api.sendMessage("❌ Kiss কাজ করেনি! একটু পরে try করো 🥹", event.threadID, event.messageID);
    }
  }
};
