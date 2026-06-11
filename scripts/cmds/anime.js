const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const GIF_CATS = ["baka","bite","blush","bored","cry","cuddle","dance","facepalm","feed","handhold","happy","highfive","hug","kick","kiss","laugh","lurk","nod","nom","nope","pat","poke","pout","punch","run","shrug","slap","sleep","smile","smug","stare","think","thumbsup","tickle","wave","wink","yawn","yeet"];
const IMG_CATS = ["husbando","kitsune","neko","waifu"];
const ALL_CATS  = [...GIF_CATS, ...IMG_CATS];

const ALIAS_MAP = {
  shinobu: "neko", megumin: "waifu", bully: "smug", awoo: "wink",
  lick: "nom", glomp: "hug", kill: "yeet", cringe: "smug", bonk: "pat",
  anime: "neko", waifu2: "waifu", nekochan: "neko",
};

module.exports = {
  config: {
    name: "sizuka",
    aliases: ["waifu","neko","shinobu","megumin","bully","cuddle","cry","awoo",
              "lick","pat","smug","bonk","yeet","blush","smile","wave",
              "highfive","handhold","nom","bite","glomp","kill","happy",
              "wink","poke","dance","cringe","anime"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Get random anime images/GIFs (nekos.best)" },
    longDescription: { en: "Fetch random anime-style images and GIFs using nekos.best API. Supports 38+ categories." },
    category: "anime",
    guide: { en: "{pn} [category]\nCategories: " + ALL_CATS.join(", ") }
  },

  onStart: async function ({ api, event, args, message }) {
    let cat = (args[0] || "neko").toLowerCase();
    if (ALIAS_MAP[cat]) cat = ALIAS_MAP[cat];
    if (!ALL_CATS.includes(cat)) cat = "neko";

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://nekos.best/api/v2/${cat}`, { timeout: 10000 });
      const result = res.data?.results?.[0];
      if (!result?.url) throw new Error("No image found");

      const imgRes = await axios.get(result.url, { responseType: "arraybuffer", timeout: 20000 });
      const ext = result.url.endsWith(".gif") ? "gif" : "jpg";
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `sizuka_${Date.now()}.${ext}`);
      await fs.writeFile(filePath, Buffer.from(imgRes.data));

      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      const artist = result.artist_name ? `\n🎨 ${result.artist_name}` : "";

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await api.sendMessage({
        body: `🌸 ${label}${artist}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      fs.remove(filePath).catch(() => {});
    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("❌ Could not fetch image right now. Try again later.");
    }
  }
};
