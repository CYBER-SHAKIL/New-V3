const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "latti",
    aliases: ["usta", "kik"],
    version: "11.0",
    author: "SHAKIL-HOSSEN",
    countDown: 5,
    role: 0,
    shortDescription: "latti mare 😈",
    category: "fun",
    guide: "{pn} @mention অথবা কারো message এ reply করো"
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID } = event;

    try {
      let targetID =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID;

      if (!targetID) {
        return api.sendMessage(
          "⚠️ কাকে latti মারবি? @mention দাও বা কারো message এ reply করো!",
          threadID,
          messageID
        );
      }

      const senderID = event.senderID;

      // ── Names ─────────────────────────────────────────────────
      let senderName, targetName;
      try { senderName = await usersData.getName(senderID); } catch (_) { senderName = "তুই"; }
      try { targetName = await usersData.getName(targetID); } catch (_) { targetName = "সে"; }

      // ── Avatar helper ─────────────────────────────────────────
      const getAvatar = async (uid) => {
        const url = `https://graph.facebook.com/${uid}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
        const p = path.join(__dirname, "cache", `latti_av_${uid}_${Date.now()}.png`);
        await fs.writeFile(p, Buffer.from(res.data));
        return p;
      };

      api.setMessageReaction("⏳", messageID, () => {}, true);

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      // ── Canvas ────────────────────────────────────────────────
      const W = 700, H = 320;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1a0a2e");
      grad.addColorStop(0.5, "#2d1b4e");
      grad.addColorStop(1, "#1a0a2e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative lines
      ctx.strokeStyle = "rgba(255,80,80,0.3)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 45);
        ctx.lineTo(W, i * 45);
        ctx.stroke();
      }

      // "LATTI!" impact text in center
      ctx.font = "bold 60px sans-serif";
      ctx.fillStyle = "#ff4444";
      ctx.textAlign = "center";
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 20;
      ctx.fillText("💢 LATTI! 🦵", W / 2, H / 2 - 10);
      ctx.shadowBlur = 0;

      // Sub text
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${senderName} → latti দিল → ${targetName}`, W / 2, H / 2 + 40);

      // Draw circular avatar helper
      const drawCircleAvatar = (img, cx, cy, r) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        // Border
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff4444";
        ctx.lineWidth = 4;
        ctx.stroke();
      };

      // Avatars
      const [senderAvatarPath, targetAvatarPath] = await Promise.all([
        getAvatar(senderID).catch(() => null),
        getAvatar(targetID).catch(() => null)
      ]);

      if (senderAvatarPath) {
        const avSender = await loadImage(senderAvatarPath);
        drawCircleAvatar(avSender, 90, H / 2 - 20, 65);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#aaaaff";
        ctx.textAlign = "center";
        ctx.fillText(senderName.slice(0, 12), 90, H / 2 + 60);
      }

      if (targetAvatarPath) {
        const avTarget = await loadImage(targetAvatarPath);
        drawCircleAvatar(avTarget, W - 90, H / 2 - 20, 65);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#ffaaaa";
        ctx.textAlign = "center";
        ctx.fillText(targetName.slice(0, 12), W - 90, H / 2 + 60);
      }

      // Arrow in middle
      ctx.font = "50px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("👟💨", W / 2, H / 2 - 60);

      // Save & send
      const outPath = path.join(cacheDir, `latti_out_${Date.now()}.png`);
      await fs.writeFile(outPath, canvas.toBuffer("image/png"));

      api.setMessageReaction("🦵", messageID, () => {}, true);

      await api.sendMessage(
        {
          body: `🦵😈 ${senderName} latti দিল ${targetName} কে!\nতুই latti খাওয়ার যোগ্য ছিলি এই নে 💢`,
          attachment: fs.createReadStream(outPath),
          mentions: [{ tag: targetName, id: targetID }]
        },
        threadID,
        () => {
          fs.remove(outPath).catch(() => {});
          if (senderAvatarPath) fs.remove(senderAvatarPath).catch(() => {});
          if (targetAvatarPath) fs.remove(targetAvatarPath).catch(() => {});
        },
        messageID
      );

    } catch (err) {
      console.error("latti error:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("❌ latti দেওয়া গেল না! Error: " + err.message, threadID, messageID);
    }
  }
};
