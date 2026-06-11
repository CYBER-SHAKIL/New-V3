'use strict';
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rbg",
    aliases: ["removebg", "rmbg"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Remove background from image" },
    longDescription: { en: "Removes background from replied/attached image using AI. Reply to an image or attach one." },
    category: "image",
    guide: { en: "{pn} (reply to an image or attach image)" }
  },

  onStart: async function ({ api, event, message }) {
    let imageUrl = "";

    if (event.type === "message_reply" && event.messageReply?.attachments?.length) {
      imageUrl = event.messageReply.attachments[0].url;
    } else if (event.attachments?.length) {
      imageUrl = event.attachments[0].url;
    }

    if (!imageUrl)
      return message.reply("❌ Please reply to an image or attach one.\nExample: Reply to a photo with -rbg");

    const wait = await message.reply("🔄 Removing background, please wait...");

    try {
      const apiUrl = `https://api.betabotz.eu.org/api/tools/removebg?url=${encodeURIComponent(imageUrl)}&apikey=lalilulelo`;
      const res = await axios.get(apiUrl, { responseType: "stream", timeout: 30000 });

      await api.sendMessage(
        { body: "✅ Background removed!", attachment: res.data },
        event.threadID,
        wait.messageID
      );
    } catch (err) {
      console.error("rbg error:", err.message);
      api.sendMessage("❌ Failed to remove background. Try again with a clearer image.", event.threadID, wait.messageID);
    }
  }
};
