const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "shakilinfo",
    aliases: ["shakil"],
    version: "20.2",
    author: "𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 1,
    role: 0,
    shortDescription: "SHAKIL INFO",
    longDescription: "PREMIUM AUTO INFO SYSTEM WITH HD API",
    category: "info"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {

    if (!event.body) return;

    const triggerWords = [
      "শাকিল",
      "শাকিল ভাই",
      "shakil",
      "Shakil",
      "SHAKIL",
      "md shakil",
      "shakil vai"
    ];

    const body = event.body.toLowerCase();

    if (!triggerWords.some(word => body.includes(word.toLowerCase()))) return;

    api.setMessageReaction("😎", event.messageID, () => {}, true);

    // STYLE ROTATION
    if (!global.shakilStyle) global.shakilStyle = 0;

    global.shakilStyle++;

    if (global.shakilStyle > 4) {
      global.shakilStyle = 1;
    }

    const style = global.shakilStyle;

    // IMAGE SYSTEM
    async function getHDImage() {
      try {

        const images = [
          "https://i.imgur.com/6Q2REDp.jpeg",
          "https://i.imgur.com/UevXHiG.jpeg",
          "https://i.imgur.com/FEF0b6R.jpeg",
          "https://files.catbox.moe/dslsa0.jpg"
        ];

        const randomImage =
          images[Math.floor(Math.random() * images.length)];

        const response = await axios.get(randomImage, {
          responseType: "arraybuffer"
        });

        return response.data;

      } catch (err) {
        console.log("Image Error:", err);
        return null;
      }
    }

    // CACHE SYSTEM
    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cachePath = path.join(
      cacheDir,
      `shakil_${Date.now()}.jpg`
    );

    const imageBuffer = await getHDImage();

    if (!imageBuffer) {
      return api.sendMessage(
        "❌ Image load failed!",
        event.threadID,
        event.messageID
      );
    }

    fs.writeFileSync(cachePath, imageBuffer);

    const attachment = fs.createReadStream(cachePath);

    // 4 DESIGNS
    const designs = [

`╔━━━❖ ❤️ ❖━━━╗
 👑𝆠፝𝐒𝐇𝐀𝐊𝐈𝐋 𝐖𝐎𝐑𝐋𝐃👑
 ╚━━━❖ ❤️ ❖━━━╝

🧑 নাম ➤  𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
🏡 বাসা ➤ 𝗝𝗛𝗘𝗡𝗔𝗜𝗗𝗔𝗛
📚 পড়ালেখা ➤ Coding & AI
🎂 বয়স ➤ 18
🏫 পরিচয় ➤ Goat Bot Developer

❝ আমি নিজের স্টাইলে চলি,
কারণ copy না, 
originality-ই power ❞

❤️‍🔥🌸💖🌺✨🫶

━━━༺❀༻━━━`,

`╭─❖ 🌙 ❖─╮
 👑𝑺𝒉𝒂𝒌𝒊𝒍 𝑾𝒐𝒓𝒍𝒅👑
 ╰─❖ 🌙 ❖─╯

❂━━ 𝑷𝑹𝑬𝑴𝑰𝑼𝑴 𝑽𝑰𝑩𝑬 ━━❂

╭─────────────────╮
│ 👤 𝐍𝐀𝐌𝐄 ➤ 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
│ 🌍 𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍 ➤ 𝗝𝗛𝗘𝗡𝗔𝗜𝗗𝗔𝗛
│ 📚 𝐒𝐓𝐔𝐃𝐘 ➤ CODING & AI
│ ⚡ 𝐀𝐆𝐄 ➤ 18
│ 💻 𝐒𝐓𝐀𝐓𝐔𝐒 ➤ BOT DEVELOPER
╰─────────────────╯

❖━━ 𝑨𝑻𝑻𝑰𝑻𝑼𝑫𝑬 𝑵𝑶𝑻𝑬 ━━❖
❝ I DON’T FOLLOW TRENDS,
I CREATE MY OWN STYLE. ❞
💎⚡🖤👑🌙✨🔥`,

`╔══════════════╗
 💞 𝆠፝𝐒𝐇𝐀𝐊𝐈𝐋-𝐄𝐌𝐏𝐈𝐑𝐄 💞
╚══════════════╝

🌸 নাম : 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
💒 ঠিকানা : 𝗝𝗛𝗘𝗡𝗔𝗜𝗗𝗔𝗛
📘 পড়াশোনা : Coding & AI
🎂 বয়স : 18
💻 কাজ : Messenger Bot Developer

💝 উক্তি :
❝ সবার মতো না,
নিজের vibe নিয়েই best ❞

💗🌺🫶❤️‍🔥✨💞

━━━༺🖤༻━━━`,

`╭━━━〔 💎 〕━━━╮
 👑 𝐒𝐇𝐀𝐊𝐈𝐋 𝐖𝐎𝐑𝐋𝐃 👑
 ╰━━━〔 💎 〕━━━╯

👤 𝐎𝐖𝐍𝐄𝐑 ➤ 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
🏠 𝐇𝐎𝐌𝐄 ➤ 𝗝𝗛𝗘𝗡𝗔𝗜𝗗𝗔𝗛
📚 𝐒𝐓𝐔𝐃𝐘 ➤ CODING & AI
🔥 𝐀𝐆𝐄 ➤ 18
💻 𝐖𝐎𝐑𝐊 ➤ GOAT BOT CUSTOMIZER

💫 𝐁𝐈𝐎 :
"I DON'T COPY PEOPLE,
PEOPLE COPY MY STYLE"

❤️✨🖤👑🌸💘

━━━━━━━━━━━━━━`
    ];

    return api.sendMessage(
      {
        body: designs[style - 1],
        attachment
      },
      event.threadID,
      () => {
        fs.unlinkSync(cachePath);
      },
      event.messageID
    );
  }
};