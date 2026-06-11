const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "owner2",
    version: "3.0.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Owner Information" },
    longDescription: { en: "Show Owner Profile" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, message }) {
    const msg = `
╔══════════════════════╗
       👑 OWNER INFO 👑
╚══════════════════════╝

╭─❍ OFFICIAL OWNER PROFILE
├ 👤 Name      : MD SHAKIL HOSSEN
├ 🎂 Age       : 18+
├ 🌍 Country   : Bangladesh 🇧🇩
├ 📍 City      : Jhenaidah
├ 💖 Relation  : Single 💗
├ 💻 Profession: Developer & Bot Creator
├ 🎮 Hobby     : Coding, Gaming, Music
├ 🤖 Bot Name  : SHAKIL BOT
├ ⚡ Version   : V3.0.0
├ 📘 Facebook  : fb.com/mdshakilhossen.bd
├ 📧 Gmail     : mdshakilhossen75@gmail.com
╰────────────────❍

╭─❍ BOT STATUS
├ ✅ 100% Trusted
├ 🟢 24/7 Online
├ 💯 100% Dedicated
├ 🔐 V3 Secured
╰────────────────❍

❤️ Thanks For Using My Bot ❤️
🔥 Powered By MD SHAKIL HOSSEN 🔥
`;

    const ownerUID = global.GoatBot?.config?.ownerUID || "61590607769212";
    let ownerAvatarUrl = `https://graph.facebook.com/${ownerUID}/picture?width=512&height=512&type=large`;
    try {
      const ownerInfo = await api.getUserInfo([ownerUID]);
      if (ownerInfo?.[ownerUID]?.thumbSrc) ownerAvatarUrl = ownerInfo[ownerUID].thumbSrc;
    } catch (_) {}

    const imageUrls = [ownerAvatarUrl, "https://graph.facebook.com/61590607769212/picture?width=512&height=512"];

    const cachePath = path.join(__dirname, "cache", "owner.jpg");
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
    }

    let downloaded = false;
    for (const url of imageUrls) {
      try {
        const response = await axios({ url, method: "GET", responseType: "stream", timeout: 10000 });
        const writer = fs.createWriteStream(cachePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
        downloaded = true;
        break;
      } catch (err) {
        console.log(`[owner2] Image fetch failed: ${url}`);
      }
    }

    if (!downloaded) {
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    return api.sendMessage(
      { body: msg, attachment: fs.createReadStream(cachePath) },
      event.threadID,
      () => { try { fs.unlinkSync(cachePath); } catch (_) {} },
      event.messageID
    );
  }
};
