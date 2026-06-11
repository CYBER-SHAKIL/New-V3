const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    role: 0,
    shortDescription: "Bot owner information",
    category: "Information",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText =
`👿━━━━━━━━━━━━━━━━━━━━━━━━👿
   𝗦𝗛𝗔𝗞𝗜𝗟-𝗕𝗢𝗧-𝗩𝟯 | 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 😈
👿━━━━━━━━━━━━━━━━━━━━━━━━👿

╭───── 👤 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 ──────╮
│ 𝗡𝗔𝗠𝗘  ➤  𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
│ 𝗜𝗗    ➤  61590607769212
╰────────────────────────╯

╭───── 🌍 𝗣𝗘𝗥𝗦𝗢𝗡𝗔𝗟 ────────╮
│ 📍 𝗔𝗗𝗗𝗥𝗘𝗦𝗦   ➤ Jhenaidah 🇧🇩
│ 🕌 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡  ➤ Islam ☪️
│ 🚻 𝗚𝗘𝗡𝗗𝗘𝗥    ➤ Male
│ 💞 𝗦𝗧𝗔𝗧𝗨𝗦    ➤ Single 💔
│ 🧑‍🔧 𝗪𝗢𝗥𝗞      ➤ No Job 🌚
╰────────────────────────╯

╭───── 💬 𝗔𝗕𝗢𝗨𝗧 𝗠𝗘 ─────────╮
│ আমি ভদ্র, বেয়াদব দুটোই 🥱✌️
│ তুমি যেটা ডি'জার্ভ করো,
│ আমি সেটাই দেখাবো 🙂
╰────────────────────────╯

╭───── 📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 ──────────╮
│ 📱 𝗪𝗔   ➤ wa.me/01602892579
│ 🌐 𝗙𝗕   ➤ fb.com/61590607769212
╰────────────────────────╯

👿━━━━━━━━━━━━━━━━━━━━━━━━👿
    𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗦𝗛𝗔𝗞𝗜𝗟-𝗕𝗢𝗧-𝗩𝟯 😈
👿━━━━━━━━━━━━━━━━━━━━━━━━👿`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "owner_banner.jpg");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imgLink = "https://i.imgur.com/T8IQ8lb.jpeg";

    const sendWithImg = async () => {
      try {
        if (!fs.existsSync(imgPath)) {
          const res = await axios.get(imgLink, { responseType: "arraybuffer", timeout: 12000 });
          fs.writeFileSync(imgPath, Buffer.from(res.data));
        }
        api.sendMessage(
          { body: ownerText, attachment: fs.createReadStream(imgPath) },
          event.threadID,
          event.messageID
        );
      } catch (e) {
        api.sendMessage({ body: ownerText }, event.threadID, event.messageID);
      }
    };

    await sendWithImg();
  }
};
