const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "avatar",
    aliases: ["av", "pfp"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    description: { en: "Show stylish profile avatar card" },
    category: "image",
    guide: { en: "{pn} [mention/reply/blank] — shows your or mentioned user's avatar banner" }
  },

  onStart: async function ({ api, event, args, message, usersData, mentions }) {
    const { senderID, messageReply } = event;
    let targetID = senderID;
    const mentionUIDs = Object.keys(event.mentions || {});
    if (mentionUIDs.length > 0) targetID = mentionUIDs[0];
    else if (messageReply) targetID = messageReply.senderID;
    else if (args[0] && /^\d{10,}$/.test(args[0])) targetID = args[0];

    try {
      const userData = await usersData.get(targetID).catch(() => null);
      const name = userData?.name || "Unknown";

      let avatarBuf = null;
      try {
        const info = await api.getUserInfo([targetID]);
        const src = info?.[targetID]?.thumbSrc || info?.[targetID]?.profileUrl;
        if (src) {
          const r = await axios.get(src, { responseType: "arraybuffer", timeout: 8000 });
          avatarBuf = r.data;
        }
      } catch (_) {}
      if (!avatarBuf) {
        try {
          const r = await axios.get(
            `https://graph.facebook.com/${targetID}/picture?width=512&height=512&type=large`,
            { responseType: "arraybuffer", timeout: 8000 }
          );
          avatarBuf = r.data;
        } catch (_) {}
      }

      const W = 900, H = 400;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0f0c29");
      bg.addColorStop(0.5, "#302b63");
      bg.addColorStop(1, "#24243e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let i = 0; i < H; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
      }

      const cx = 180, cy = H / 2, r = 130;
      if (avatarBuf) {
        const img = await loadImage(Buffer.from(avatarBuf));
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#a78bfa";
      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 20;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px Arial";
      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 10;
      ctx.fillText(name.slice(0, 16), 360, 160);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#c4b5fd";
      ctx.font = "22px Arial";
      ctx.fillText(`UID: ${targetID}`, 360, 210);

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "18px Arial";
      ctx.fillText("⚡ SHAKIL BOT V3", 360, 260);

      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#7c3aed";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(360, 280); ctx.lineTo(800, 280); ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Facebook Profile Avatar", 360, 315);

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `avatar_${targetID}_${Date.now()}.png`);
      fs.writeFileSync(cachePath, canvas.toBuffer("image/png"));

      await message.reply({
        body: `🖼️ Avatar of ${name}`,
        attachment: fs.createReadStream(cachePath)
      });
      setTimeout(() => { try { fs.unlinkSync(cachePath); } catch (_) {} }, 5000);

    } catch (err) {
      console.error("[avatar.js]", err.message);
      return message.reply("❌ Failed to generate avatar card.\nError: " + err.message);
    }
  }
};
