const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ROASTS = [
  "তুই এতটাই অদ্ভুত যে আয়না দেখেও হাসে 😂",
  "তোর চেহারা দেখে ভূতও ভয় পায় 👻",
  "তুই যখন হাঁটিস, রাস্তাও দুঃখ পায় 💀",
  "গুগল তোর মুখ সার্চ করলে 'Not Found' দেখায় 🔍",
  "তোর selfie তুলতে ক্যামেরাও কাঁদে 📸",
  "NASA তোকে দেখে বলল — 'এটা আমাদের আবিষ্কারের বাইরে' 🚀",
  "তুই এত পেকো যে চশমা পরলে দেখা যায় না 👓",
  "তোর IQ এবং জুতার সাইজ একই 🩴",
  "তুই হাসলে বাচ্চারা কাঁদে 😭",
  "তোর ছবি দেখলে Wi-Fi ও ডিসকানেক্ট হয় 📶",
  "তুই এতটাই স্লো যে কচ্ছপও রেস ছেড়ে দিয়েছে 🐢",
  "তোর মাথায় চুল নেই কারণ ঘাস পাথরে জন্মায় না 🪨",
  "তুই যখন কথা বলিস, অক্সিজেন নষ্ট হয় 💨",
  "তোর মুখ দেখে পাথরও পিছলে পড়ে 😆",
  "তুই এতটাই ফ্ল্যাট যে ছায়াও পড়ে না 🌑"
];

module.exports = {
  config: {
    name: "nigga",
    aliases: ["roast"],
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 2,
    role: 0,
    description: "Roast someone with a funny message + their profile photo",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      let targetUID;
      if (event.type === "message_reply") {
        targetUID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
      } else {
        targetUID = event.senderID;
      }

      const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

      let avatarUrl;
      try {
        const userInfo = await api.getUserInfo([targetUID]);
        avatarUrl = userInfo?.[targetUID]?.thumbSrc;
      } catch (_) {}
      if (!avatarUrl) avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=256&height=256&type=large`;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `roast_${targetUID}_${Date.now()}.jpg`);

      const imgRes = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 8000 });
      fs.writeFileSync(filePath, Buffer.from(imgRes.data));

      api.sendMessage(
        {
          body: `🔥 Roast Alert!\n\n${roast}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => { try { fs.unlinkSync(filePath); } catch (_) {} },
        event.messageID
      );
    } catch (e) {
      const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
      api.sendMessage(`🔥 Roast Alert!\n\n${roast}`, event.threadID, event.messageID);
    }
  }
};
