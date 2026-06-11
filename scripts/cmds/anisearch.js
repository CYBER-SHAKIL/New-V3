const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "ani",
    aliases: ["aniusr", "anisearch"],
    version: "1.0",
    author: "MD SHAKIL HOSSEN",
    countDown: 5,
    role: 0,
    description: "Search random TikTok video by keyword",
    category: "Media",
    guide: "{pn} <keyword>\nExample: {pn} naruto"
  },

  langs: {
    en: {
      noInput: "⚠️ Give a keyword!\nExample: {pn} naruto",
      tooLarge: "❌ Video is too large (25MB+). Try another!",
      success: "🎬 Here is your video\n🔍 Search: %1",
      error: "❌ Error: %1"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const keyword = args.join(" ");
    if (!keyword) return message.reply(getLang("noInput"));

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const videoPath = path.join(cacheDir, `unisr_${Date.now()}.mp4`);

    let waitMsgID;

    try {
      // ⏳ waiting message
      const waitMsg = await message.reply(
        "━━━━━━━━━━━━━━━━━\n" +
        "⏳ কিছুক্ষণ অপেক্ষা করুন...\n" +
        "━━━━━━━━━━━━━━━━━"
      );

      waitMsgID = waitMsg.messageID;

      const apiUrl = await baseApiUrl();

      const res = await axios({
        method: "GET",
        url: `${apiUrl}/api/tiksr`,
        params: { sr: keyword },
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const stat = fs.statSync(videoPath);

      if (stat.size > 26214400) {
        fs.unlinkSync(videoPath);
        if (waitMsgID) api.unsendMessage(waitMsgID);
        return message.reply(getLang("tooLarge"));
      }

      // 🎬 SEND VIDEO FIRST
      await message.reply({
        body: [
          "━━━━━━━━━━━━━━━━━",
          "🎬 Here is your video",
          "━━━━━━━━━━━━━━━━━",
          `🔍 Search: ${keyword}`,
          "━━━━━━━━━━━━━━━━━"
        ].join("\n"),
        attachment: fs.createReadStream(videoPath)
      });

      // ⏳ THEN UNSEND WAIT MESSAGE (SAFE DELAY)
      if (waitMsgID) {
        setTimeout(() => {
          api.unsendMessage(waitMsgID);
        }, 800);
      }

      fs.unlink(videoPath, () => {});

    } catch (err) {
      console.error(err);

      if (waitMsgID) api.unsendMessage(waitMsgID);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

      return message.reply(getLang("error", err.message));
    }
  }
};
