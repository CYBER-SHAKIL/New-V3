'use strict';
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["uploadimg", "imgupload"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Upload image and get shareable link" },
    longDescription: { en: "Upload any image (reply/attach) to catbox.moe and get a permanent shareable link." },
    category: "utility",
    guide: { en: "{pn} (reply to an image or attach image)" }
  },

  onStart: async function ({ api, event, message }) {
    let imageUrl = "";
    let fileName = "image.jpg";

    if (event.type === "message_reply" && event.messageReply?.attachments?.length) {
      imageUrl = event.messageReply.attachments[0].url;
      fileName = event.messageReply.attachments[0].filename || "image.jpg";
    } else if (event.attachments?.length) {
      imageUrl = event.attachments[0].url;
      fileName = event.attachments[0].filename || "image.jpg";
    }

    if (!imageUrl)
      return message.reply("❌ Please reply to an image or attach one.\nExample: Reply to a photo with -imgbb");

    const wait = await message.reply("⬆️ Uploading image, please wait...");

    try {
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
      const buffer = Buffer.from(imgRes.data);

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("userhash", "");
      form.append("fileToUpload", buffer, { filename: fileName, contentType: "image/jpeg" });

      const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      const link = uploadRes.data?.trim();
      if (!link || !link.startsWith("http"))
        throw new Error("Upload failed - invalid response");

      await api.sendMessage(
        `✅ Image uploaded successfully!\n\n🔗 Link: ${link}\n\n📌 Hosted on catbox.moe (permanent link)`,
        event.threadID,
        wait.messageID
      );
    } catch (err) {
      console.error("imgbb error:", err.message);
      api.sendMessage("❌ Failed to upload image. Please try again.", event.threadID, wait.messageID);
    }
  }
};
