const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * @author MahMUD
 * @author: do not delete it
 */

module.exports = {
  config: {
    name: "butslap",
    aliases: ["buttslap"],
    version: "2.0",
    author: "MahMUD",
    role: 0,
    category: "fun",
    countDown: 8,
    guide: "{pn} @mention / reply"
  },

  onStart: async function ({ api, event, args, message }) {
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
      return api.sendMessage("💥 কাকে slap করতে চাও? Mention করো বা reply দাও!", threadID, messageID);
    }

    try {
      const resp = await axios.get("https://nekos.best/api/v2/slap", { timeout: 10000 });
      const gifUrl = resp.data.results[0].url;
      const imgResp = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `butslap_${Date.now()}.gif`);
      fs.writeFileSync(filePath, Buffer.from(imgResp.data));

      api.sendMessage(
        {
          attachment: fs.createReadStream(filePath),
          body: `💥 ${senderName || "Someone"} butt-slapped ${targetName}! 🤣\nইশ এত জোরে কেন! 😂`
        },
        threadID,
        () => { try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ } },
        messageID
      );

    } catch (err) {
      console.error("[butslap]", err.message);
      api.sendMessage("❌ Slap failed! Try again later 🥹", threadID, messageID);
    }
  }
};
