const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

const AUTHOR = "SHAKIL-HOSSEN";
const COMMAND_NAME = "autolink";

// Cooldown map to prevent double-processing the same message
const _processed = new Map();
function _alreadySeen(msgID) {
  if (!msgID) return false;
  const now = Date.now();
  if (_processed.has(msgID) && now - _processed.get(msgID) < 60000) return true;
  _processed.set(msgID, now);
  if (_processed.size > 500) {
    for (const [k, v] of _processed) {
      if (now - v > 60000) _processed.delete(k);
      if (_processed.size <= 250) break;
    }
  }
  return false;
}

module.exports = {
  config: {
    name: COMMAND_NAME,
    version: "1.4",
    author: AUTHOR + " (DON'T CHANGE)",
    countDown: 5,
    role: 0,
    shortDescription: "Auto-download & send videos from links",
    category: "media",
  },

  onStart: async function () {
    if (
      module.exports.config.author !== AUTHOR + " (DON'T CHANGE)" ||
      module.exports.config.name !== COMMAND_NAME
    ) {
      throw new Error("⛔ Unauthorized file modification detected!");
    }
  },

  onChat: async function ({ api, event, isUserCallCommand }) {
    // Security check
    if (
      module.exports.config.author !== AUTHOR + " (DON'T CHANGE)" ||
      module.exports.config.name !== COMMAND_NAME
    ) return;

    // Don't interfere with regular commands
    if (isUserCallCommand) return;

    const { threadID, messageID, senderID, body: message = "" } = event;

    // Skip bot's own messages
    try {
      const botID = api.getCurrentUserID();
      if (senderID === botID || senderID === String(botID)) return;
    } catch (_) {}

    // Dedup guard — don't process the same message twice
    if (_alreadySeen(messageID)) return;

    const linkMatches = message.match(/(https?:\/\/[^\s]+)/g);
    if (!linkMatches || linkMatches.length === 0) return;

    // Only process video-hosting links
    const videoHosts = [
      "facebook.com", "fb.watch",
      "tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
      "instagram.com", "twitter.com", "x.com",
      "youtube.com", "youtu.be",
      "dailymotion.com", "vimeo.com"
    ];
    const videoLinks = linkMatches.filter(url =>
      videoHosts.some(host => url.includes(host))
    );
    if (videoLinks.length === 0) return;

    const uniqueLinks = [...new Set(videoLinks)];

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let successCount = 0;
    let failCount = 0;
    let lastError = "";

    for (const url of uniqueLinks) {
      let filePath;
      try {
        const result = await downloadVideo(url);
        filePath = result?.filePath;
        const title = result?.title || "Video File";

        if (!filePath || !fs.existsSync(filePath)) {
          lastError = "Download returned no file";
          failCount++;
          continue;
        }

        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        if (fileSizeInMB > 25) {
          fs.unlinkSync(filePath);
          lastError = `File too large (${fileSizeInMB.toFixed(1)} MB > 25 MB)`;
          failCount++;
          continue;
        }

        await api.sendMessage(
          {
            body:
`📥 ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ
━━━━━━━━━━━━━━━
🎬 ᴛɪᴛʟᴇ: ${title}
📦 sɪᴢᴇ: ${fileSizeInMB.toFixed(2)} MB
━━━━━━━━━━━━━━━`,
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          () => { try { fs.unlinkSync(filePath); } catch (_) {} }
        );

        successCount++;
      } catch (err) {
        lastError = err?.message || String(err);
        failCount++;
        if (filePath) { try { fs.unlinkSync(filePath); } catch (_) {} }
      }
    }

    const finalReaction =
      successCount > 0 && failCount === 0 ? "✅" :
      successCount > 0 ? "⚠️" : "❌";

    api.setMessageReaction(finalReaction, messageID, () => {}, true);
  }
};
