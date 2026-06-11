const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * @author MahMUD
 * @author: do not delete it
 */

const NEKOS_TYPES = [
  "baka", "bite", "blush", "bored", "cry", "cuddle", "dance",
  "facepalm", "handshake", "happy", "highfive", "hug", "kick",
  "kiss", "laugh", "nod", "nom", "nope", "pat", "poke",
  "punch", "run", "sad", "shrug", "slap", "sleep", "smile",
  "smug", "stare", "think", "thumbsup", "tickle", "wave",
  "wink", "yawn"
];

module.exports = {
  config: {
    name: "fun",
    aliases: ["dig", "funny"],
    version: "2.0",
    author: "MahMUD",
    role: 0,
    category: "fun",
    countDown: 10,
    guide: "{pn} [type] @mention | {pn} list"
  },

  onStart: async function ({ api, event, args, message }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const { threadID, messageID, messageReply, mentions, senderID, senderName } = event;
    const type = (args[0] || "").toLowerCase();

    if (!type || type === "list") {
      return api.sendMessage(
`👿━━━━━━━━━━━━━━━━━━━━━━━━👿
  🎭 𝗙𝗨𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 | 𝗔𝗟𝗟 𝗧𝗬𝗣𝗘𝗦 😈
👿━━━━━━━━━━━━━━━━━━━━━━━━👿

${NEKOS_TYPES.map((t, i) => `${i + 1}. ${t}`).join("  |  ")}

Usage: ,fun slap @mention`,
        threadID, messageID
      );
    }

    if (!NEKOS_TYPES.includes(type)) {
      return api.sendMessage(
        `❌ Unknown type "${type}"!\nType ,fun list to see all available types.`,
        threadID, messageID
      );
    }

    let targetName;
    if (messageReply) {
      targetName = messageReply.senderName || "Someone";
    } else if (Object.keys(mentions).length > 0) {
      targetName = Object.values(mentions)[0] || "Someone";
    } else if (args[1]) {
      targetName = `UID:${args[1]}`;
    } else {
      return api.sendMessage(`💬 Who to ${type}? Mention someone or reply to a message!\n\nExample: ,fun ${type} @friend`, threadID, messageID);
    }

    try {
      const resp = await axios.get(`https://nekos.best/api/v2/${type}`, { timeout: 10000 });
      const gifUrl = resp.data.results[0].url;
      const imgResp = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `fun_${type}_${Date.now()}.gif`);
      fs.writeFileSync(filePath, Buffer.from(imgResp.data));

      const bodies = {
        slap: `💥 ${senderName || "Someone"} slapped ${targetName}! 🤜`,
        kiss: `💋 ${senderName || "Someone"} kissed ${targetName}! 😘`,
        hug: `🤗 ${senderName || "Someone"} hugged ${targetName}!`,
        pat: `🖐️ ${senderName || "Someone"} patted ${targetName}!`,
        punch: `👊 ${senderName || "Someone"} punched ${targetName}!`,
        baka: `😤 ${targetName} is BAKA! 🗣️`,
        cry: `😭 ${senderName || "Someone"} is crying!`,
        laugh: `😂 ${senderName || "Someone"} is laughing at ${targetName}!`,
        poke: `👉 ${senderName || "Someone"} poked ${targetName}!`,
        tickle: `🤣 ${senderName || "Someone"} tickled ${targetName}!`,
        cuddle: `🥰 ${senderName || "Someone"} cuddled ${targetName}!`,
        dance: `💃 ${senderName || "Someone"} is dancing!`,
        bite: `😬 ${senderName || "Someone"} bit ${targetName}!`,
        highfive: `🙌 ${senderName || "Someone"} high-fived ${targetName}!`,
        wave: `👋 ${senderName || "Someone"} waved at ${targetName}!`,
        kick: `🦵 ${senderName || "Someone"} kicked ${targetName}!`,
        handshake: `🤝 ${senderName || "Someone"} shook hands with ${targetName}!`
      };

      const body = bodies[type] || `🎭 ${type.toUpperCase()} effect: ${senderName || "Someone"} → ${targetName}`;

      api.sendMessage(
        { attachment: fs.createReadStream(filePath), body },
        threadID,
        () => { try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ } },
        messageID
      );

    } catch (err) {
      console.error("[fun]", err.message);
      api.sendMessage(`❌ fun ${type} failed! Try again later 🥹`, threadID, messageID);
    }
  }
};
