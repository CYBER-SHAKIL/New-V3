// ═══════════════════════════════════════════
//  DOG — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Random dog images via dog.ceo (free)
// ═══════════════════════════════════════════

const axios = require("axios");
const fs    = require("fs-extra");
const path  = require("path");

const BREEDS = [
  "labrador","poodle","beagle","bulldog","rottweiler",
  "husky","corgi","dalmatian","pug","shiba","akita",
  "boxer","chihuahua","maltese","samoyed"
];

module.exports = {
  config: {
    name: "dog",
    aliases: ["doggo", "puppy", "woof"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 4,
    role: 0,
    shortDescription: { en: "Random dog image 🐶" },
    longDescription:  { en: "Get random dog photos — with optional breed filter" },
    category: "fun",
    guide: { en: "{pn} — random dog\n{pn} [breed] — specific breed\n{pn} list — show breeds" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;

    if (args[0] === "list") {
      return message.reply(`🐕 Available breeds:\n${BREEDS.map(b => `• ${b}`).join("\n")}`);
    }

    api.setMessageReaction("🐶", messageID, () => {}, true);

    try {
      let url;
      const breed = args[0]?.toLowerCase().trim();

      if (breed) {
        const res = await axios.get(`https://dog.ceo/api/breed/${breed}/images/random`, { timeout: 8000 });
        if (res.data.status !== "success") throw new Error("breed not found");
        url = res.data.message;
      } else {
        const res = await axios.get("https://dog.ceo/api/breeds/image/random", { timeout: 8000 });
        url = res.data.message;
      }

      // Extract breed name from URL
      const parts    = url.split("/");
      const breedName = parts[parts.length - 2] || "unknown";

      const imgBuf  = (await axios.get(url, { responseType: "arraybuffer" })).data;
      const ext     = url.split(".").pop().split("?")[0] || "jpg";
      const imgPath = path.join(__dirname, "cache", `dog_${Date.now()}.${ext}`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(imgPath, imgBuf);

      api.setMessageReaction("✅", messageID, () => {}, true);
      await message.reply({
        body: `🐶 Woof! ${breedName.charAt(0).toUpperCase() + breedName.slice(1)} dog!\nType -dog list to see all breeds.`,
        attachment: fs.createReadStream(imgPath)
      });
      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 8000);

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (err.message === "breed not found" || err.response?.status === 404)
        return message.reply(`❌ Breed not found. Use -dog list to see available breeds.`);
      message.reply("❌ Could not fetch dog image. Try again!");
    }
  }
};
