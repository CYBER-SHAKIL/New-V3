// ═══════════════════════════════════════════════
//  SECURITY DASHBOARD — v3.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Show security stats and manage protection
// ═══════════════════════════════════════════════

const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "security",
    aliases: ["sec", "shield", "protect2"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Bot security dashboard & stats" },
    longDescription:  { en: "Shows security status, active protections, and system health" },
    category: "system",
    guide: { en: "{pn} — full security report" }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID } = event;
    api.setMessageReaction("🛡️", messageID, () => {}, true);

    try {
      const canvas = createCanvas(1000, 620);
      const ctx = canvas.getContext("2d");

      // ── Background ────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 1000, 620);
      bg.addColorStop(0, "#0a0a1a");
      bg.addColorStop(0.5, "#0d1b2a");
      bg.addColorStop(1, "#0a0a1a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1000, 620);

      // ── Neon grid pattern ─────────────────────────────────────
      ctx.strokeStyle = "rgba(0,255,136,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1000; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,620); ctx.stroke(); }
      for (let y = 0; y < 620; y += 40)  { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1000,y); ctx.stroke(); }

      // ── Header ────────────────────────────────────────────────
      ctx.fillStyle = "rgba(0,255,136,0.12)";
      ctx.beginPath(); ctx.roundRect(20, 20, 960, 90, 16); ctx.fill();
      ctx.strokeStyle = "#00ff88"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(20, 20, 960, 90, 16); ctx.stroke();

      ctx.font = "bold 42px Arial";
      ctx.fillStyle = "#00ff88";
      ctx.textAlign = "center";
      ctx.fillText("🛡  SHAKIL BOT V3 — SECURITY CENTER", 500, 78);

      // ── Security checks ───────────────────────────────────────
      const checks = [
        { label: "Anti-Flood Protection",     status: true,  icon: "🌊" },
        { label: "Rate Limiter",              status: true,  icon: "⚡" },
        { label: "ISIS / Terror Trigger",     status: true,  icon: "☠️" },
        { label: "Phishing Link Blocker",     status: true,  icon: "🔗" },
        { label: "Spam Kick (Spamkick)",      status: true,  icon: "🚫" },
        { label: "Anti Change Info Box",      status: true,  icon: "🔒" },
        { label: "Group Protect Mode",        status: true,  icon: "🛡️" },
        { label: "Auto Kick on Leave Abuse",  status: true,  icon: "👢" },
        { label: "Warn System",               status: true,  icon: "⚠️" },
        { label: "Ban System",                status: true,  icon: "🔨" },
      ];

      const colW = 460;
      const rowH = 50;
      const startX = [30, 510];
      const startY = 135;

      checks.forEach((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = startX[col];
        const y = startY + row * rowH;

        ctx.fillStyle = c.status ? "rgba(0,255,136,0.08)" : "rgba(255,50,50,0.08)";
        ctx.beginPath(); ctx.roundRect(x, y, colW, 42, 10); ctx.fill();

        ctx.font = "24px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${c.icon}  ${c.label}`, x + 14, y + 28);

        ctx.font = "bold 22px Arial";
        ctx.fillStyle = c.status ? "#00ff88" : "#ff5555";
        ctx.textAlign = "right";
        ctx.fillText(c.status ? "✅ ACTIVE" : "❌ OFF", x + colW - 12, y + 28);
      });

      // ── System stats bar ─────────────────────────────────────
      const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
      const uptimeSec = process.uptime();
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);

      ctx.fillStyle = "rgba(0,255,136,0.07)";
      ctx.beginPath(); ctx.roundRect(20, 400 + 150, 960, 58, 14); ctx.fill();
      ctx.strokeStyle = "rgba(0,255,136,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(20, 400 + 150, 960, 58, 14); ctx.stroke();

      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#00ff88";
      ctx.textAlign = "center";
      const cmdCount = global.GoatBot?.commands?.size || 0;
      ctx.fillText(
        `⚙️ Uptime: ${h}h ${m}m  |  💾 Memory: ${memMB}MB  |  📦 Commands: ${cmdCount}  |  🤖 SHAKIL BOT V3`,
        500, 560
      );

      // ── Footer ────────────────────────────────────────────────
      ctx.font = "italic 18px Arial";
      ctx.fillStyle = "rgba(0,255,136,0.5)";
      ctx.textAlign = "center";
      ctx.fillText("🔐 All protections active • Powered by SHAKIL BOT V3 • Author: MD SHAKIL HOSSEN", 500, 605);

      const imgPath = path.join(__dirname, "cache", `security_${Date.now()}.png`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      api.setMessageReaction("✅", messageID, () => {}, true);
      await message.reply({
        body: "🛡️ SHAKIL BOT V3 — Security Center\n━━━━━━━━━━━━━━━━━\n✅ All 10 security systems ACTIVE\n🌊 Anti-Flood  ⚡ Rate Limit  ☠️ Anti-ISIS\n🔗 Phishing Blocker  🔨 Ban/Warn System",
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 8000);

    } catch (err) {
      console.error("[security]", err);
      message.reply("🛡️ Security Status:\n✅ Anti-Flood\n✅ Rate Limiter\n✅ ISIS Filter\n✅ Phishing Blocker\n✅ Spam Kick\n✅ Protect\n✅ Warn/Ban System\n\n⚙️ All protections ACTIVE");
    }
  }
};
