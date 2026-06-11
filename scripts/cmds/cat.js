// ═══════════════════════════════════════════
//  CAT — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Random cat images via thecatapi.com
// ═══════════════════════════════════════════

const axios = require("axios");
const fs    = require("fs-extra");
const path  = require("path");

module.exports = {
  config: {
    name: "cat",
    aliases: ["kitty", "meow"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 4,
    role: 0,
    shortDescription: { en: "Random cat image 🐱" },
    longDescription:  { en: "Get adorable random cat photos from TheCatAPI" },
    category: "fun",
    guide: { en: "{pn} — random cat photo" }
  },

  onStart: async function ({ api, event, message }) {
    const { messageID } = event;
    api.setMessageReaction("🐱", messageID, () => {}, true);

    try {
      const res = await axios.get(
        "https://api.thecatapi.com/v1/images/search",
        { timeout: 8000 }
      );
      const url = res.data?.[0]?.url;
      if (!url) throw new Error("No image");

      const buf  = (await axios.get(url, { responseType: "arraybuffer" })).data;
      const ext  = url.split(".").pop().split("?")[0] || "jpg";
      const imgPath = path.join(__dirname, "cache", `cat_${Date.now()}.${ext}`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(imgPath, buf);

      api.setMessageReaction("✅", messageID, () => {}, true);
      await message.reply({
        body: "🐱 Meow~ Here's your cat! 🐾",
        attachment: fs.createReadStream(imgPath)
      });
      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 8000);

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("❌ Could not fetch cat image. Try again!");
    }
  }
};
