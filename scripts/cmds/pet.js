const axios = require("axios");
const fs = require("fs");
const path = require("path");

const PAT_APIS = [
  "https://purrbot.site/api/img/sfw/pat/gif",
  "https://nekos.life/api/v2/img/pat"
];

module.exports = {
  config: {
    name: "pet",
    aliases: ["petgif"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 5,
    role: 0,
    shortDescription: "Pat/pet a user",
    longDescription: "Sends a cute pat GIF for a tagged user",
    category: "fun",
    guide: { en: "{pn} @mention or reply" }
  },

  onStart: async function ({ api, message, event, usersData }) {
    let targetID;
    const mentions = Object.keys(event.mentions || {});

    if (mentions.length > 0) {
      targetID = mentions[0];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else {
      targetID = event.senderID;
    }

    const senderName = (await usersData.get(event.senderID))?.name || "Someone";
    const targetName = (await usersData.get(targetID))?.name || "Unknown";

    let gifUrl = null;
    for (const apiUrl of PAT_APIS) {
      try {
        const res = await axios.get(apiUrl, { timeout: 8000 });
        gifUrl = res.data?.link || res.data?.url;
        if (gifUrl) break;
      } catch (_) {}
    }

    if (!gifUrl) {
      return message.reply(`🐾 ${senderName} patted ${targetName}! 🤗`);
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `pet_${Date.now()}.gif`);

    try {
      const imgRes = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 10000 });
      fs.writeFileSync(filePath, Buffer.from(imgRes.data));

      await message.reply({
        body: `🐾 ${senderName} patted ${targetName}! 🤗`,
        attachment: fs.createReadStream(filePath)
      });
      try { fs.unlinkSync(filePath); } catch (_) {}
    } catch (err) {
      message.reply(`🐾 ${senderName} patted ${targetName}! 🤗`);
    }
  }
};
