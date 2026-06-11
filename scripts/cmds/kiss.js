const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * @author MahMUD
 * @author: do not delete it
 */

module.exports = {
  config: {
    name: "kiss",
    version: "2.0",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    longDescription: "Generate anime-style kiss GIF",
    category: "love",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event }) {
    try {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
      if (module.exports.config.author.trim() !== obfuscatedAuthor) {
        return message.reply("❌ | You are not authorized to change the author name.");
      }

      const mention = Object.keys(event.mentions);
      if (mention.length === 0 && event.type !== "message_reply") {
        return message.reply("💋 কাকে kiss করতে চাও? কাউকে mention করো অথবা reply দাও!");
      }

      const targetName = mention.length > 0
        ? (Object.values(event.mentions)[0] || "Someone")
        : (event.messageReply?.senderName || "Someone");

      const waitMsg = await message.reply("💋 একটু অপেক্ষা করো...");

      const resp = await axios.get("https://nekos.best/api/v2/kiss", { timeout: 10000 });
      const gifUrl = resp.data.results[0].url;

      const imgResponse = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const imgPath = path.join(cacheDir, `kiss_${Date.now()}.gif`);
      fs.writeFileSync(imgPath, Buffer.from(imgResponse.data));

      const senderName = event.senderName || "কেউ";

      await message.reply({
        body: `💋 ${senderName} kissed ${targetName}!\nইস বেবি, তোমাকে তো খেয়ে দিল 🤭🤣\nএখন তো তোমার বিয়ে হবে না 😂`,
        attachment: fs.createReadStream(imgPath)
      });

      api.unsendMessage(waitMsg.messageID).catch(() => {});
      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch (e) { /* ignore */ } }, 15000);

    } catch (err) {
      console.error("[kiss]", err.message);
      message.reply("❌ Kiss কাজ করেনি! একটু পরে আবার try করো 🥹");
    }
  }
};
