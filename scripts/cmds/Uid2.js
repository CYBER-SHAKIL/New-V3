const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "uid2",
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get UID & stylish banner" },
    longDescription: { en: "Cyberpunk banner with User ID and Avatar." },
    category: "info",
    guide: { en: "{pn} [mention / reply / blank]" }
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { senderID, type, messageReply, mentions } = event;

    let targetID = senderID;
    if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions || {}).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0] && /^\d{10,}$/.test(args[0])) {
      targetID = args[0];
    }

    try {
      const userData = await usersData.get(targetID).catch(() => null);
      const name = userData?.name || "Unknown User";

      const width = 1200, height = 500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(0,255,255,0.07)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 60) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#00f260");
      grad.addColorStop(1, "#0575e6");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0,0); ctx.lineTo(300,0); ctx.lineTo(250,50); ctx.lineTo(0,50);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(width, height); ctx.lineTo(width-300, height);
      ctx.lineTo(width-250, height-50); ctx.lineTo(width, height-50);
      ctx.closePath(); ctx.fill();

      let avatarBuffer = null;
      try {
        const info = await api.getUserInfo([targetID]);
        const src = info?.[targetID]?.thumbSrc || info?.[targetID]?.profileUrl;
        if (src) {
          const r = await axios.get(src, { responseType: "arraybuffer", timeout: 8000 });
          avatarBuffer = r.data;
        }
      } catch (_) {}
      if (!avatarBuffer) {
        try {
          const r = await axios.get(
            `https://graph.facebook.com/${targetID}/picture?width=512&height=512&type=large`,
            { responseType: "arraybuffer", timeout: 8000 }
          );
          avatarBuffer = r.data;
        } catch (_) {}
      }

      if (avatarBuffer) {
        const img = await loadImage(Buffer.from(avatarBuffer));
        const cx = 250, cy = 250, sz = 155;
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          if (i === 0) ctx.moveTo(cx + sz * Math.cos(a), cy + sz * Math.sin(a));
          else ctx.lineTo(cx + sz * Math.cos(a), cy + sz * Math.sin(a));
        }
        ctx.closePath(); ctx.clip();
        ctx.drawImage(img, cx - sz, cy - sz, sz * 2, sz * 2);
        ctx.restore();

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          if (i === 0) ctx.moveTo(cx + sz * Math.cos(a), cy + sz * Math.sin(a));
          else ctx.lineTo(cx + sz * Math.cos(a), cy + sz * Math.sin(a));
        }
        ctx.closePath();
        ctx.strokeStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 25;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 52px Arial";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 10;
      ctx.fillText(name.toUpperCase().slice(0, 18), 480, 200);

      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 32px Courier New";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12;
      ctx.fillText(`UID: ${targetID}`, 480, 265);

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "22px Courier New";
      ctx.shadowBlur = 0;
      ctx.fillText("/// IDENTITY VERIFIED ///", 480, 320);
      ctx.fillText("⚡ POWERED BY SHAKIL BOT V3", 480, 360);

      ctx.fillStyle = "#00ffff";
      for (let k = 0; k < 20; k++) {
        const w = Math.random() * 10 + 2;
        ctx.fillRect(480 + k * 20, 400, w, 18);
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `uid_${targetID}_${Date.now()}.png`);
      fs.writeFileSync(cachePath, canvas.toBuffer("image/png"));

      await message.reply({
        body: `🔍 UID: ${targetID}`,
        attachment: fs.createReadStream(cachePath)
      });
      setTimeout(() => { try { fs.unlinkSync(cachePath); } catch (_) {} }, 5000);

    } catch (err) {
      console.error("[uid.js]", err.message);
      return message.reply(`🔍 UID: ${targetID}`);
    }
  }
};
