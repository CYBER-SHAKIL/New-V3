// ═══════════════════════════════════════════
//  GITHUB — v3.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  GitHub user/repo info with canvas card
// ═══════════════════════════════════════════

const axios  = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs     = require("fs-extra");
const path   = require("path");

async function drawGithubCard(user) {
  const W = 900, H = 420;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  // BG
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d1117"); bg.addColorStop(1, "#161b22");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = "#30363d"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(6, 6, W - 12, H - 12, 20); ctx.stroke();

  // Avatar
  try {
    const avatarBuf = (await axios.get(user.avatar_url, { responseType: "arraybuffer" })).data;
    const avatar = await loadImage(avatarBuf);
    ctx.save();
    ctx.beginPath();
    ctx.arc(110, 110, 80, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 30, 30, 160, 160);
    ctx.restore();
    // Avatar border
    ctx.strokeStyle = "#58a6ff"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(110, 110, 80, 0, Math.PI * 2); ctx.stroke();
  } catch {}

  // Name
  ctx.fillStyle = "#e6edf3";
  ctx.font = "bold 38px Arial";
  ctx.textAlign = "left";
  ctx.fillText(user.name || user.login, 215, 70);

  ctx.fillStyle = "#58a6ff";
  ctx.font = "26px Arial";
  ctx.fillText(`@${user.login}`, 215, 108);

  if (user.bio) {
    ctx.fillStyle = "#8b949e";
    ctx.font = "22px Arial";
    ctx.fillText(user.bio.length > 50 ? user.bio.slice(0, 50) + "…" : user.bio, 215, 148);
  }

  if (user.location) {
    ctx.fillStyle = "#8b949e"; ctx.font = "20px Arial";
    ctx.fillText(`📍 ${user.location}`, 215, 180);
  }

  // Stats boxes
  const stats = [
    { label: "Repos",      value: user.public_repos, icon: "📦" },
    { label: "Followers",  value: user.followers,    icon: "👥" },
    { label: "Following",  value: user.following,    icon: "➡️" },
    { label: "Gists",      value: user.public_gists, icon: "📝" }
  ];
  const bw = 190, bh = 90, sy = 250;
  stats.forEach((s, i) => {
    const x = 30 + i * (bw + 16);
    ctx.fillStyle = "rgba(88,166,255,0.08)";
    ctx.beginPath(); ctx.roundRect(x, sy, bw, bh, 12); ctx.fill();
    ctx.strokeStyle = "rgba(88,166,255,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x, sy, bw, bh, 12); ctx.stroke();
    ctx.fillStyle = "#58a6ff"; ctx.font = "bold 30px Arial"; ctx.textAlign = "center";
    ctx.fillText(s.icon + " " + (s.value ?? 0), x + bw / 2, sy + 38);
    ctx.fillStyle = "#8b949e"; ctx.font = "20px Arial";
    ctx.fillText(s.label, x + bw / 2, sy + 68);
  });

  // Footer
  ctx.fillStyle = "#30363d";
  ctx.fillRect(30, 360, W - 60, 1);
  ctx.fillStyle = "#8b949e"; ctx.font = "italic 18px Arial"; ctx.textAlign = "center";
  ctx.fillText(`github.com/${user.login}  •  SHAKIL BOT V3`, W / 2, 390);

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "github",
    aliases: ["gh", "git"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "GitHub user / repo info" },
    longDescription:  { en: "Get GitHub profile card or repo info" },
    category: "utility",
    guide: { en: "{pn} [username]\n{pn} [username]/[repo]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;
    if (!args[0]) return message.reply("Usage: -github [username]\nExample: -github CYBER-SHAKIL");

    api.setMessageReaction("⏳", messageID, () => {}, true);
    const input = args[0].trim();

    try {
      if (input.includes("/")) {
        // Repo info
        const res  = await axios.get(`https://api.github.com/repos/${input}`, { timeout: 8000 });
        const repo = res.data;
        api.setMessageReaction("✅", messageID, () => {}, true);
        return message.reply(
`📦 GitHub Repository
━━━━━━━━━━━━━━━━━━━━
📌 Name    : ${repo.full_name}
📝 Desc    : ${repo.description || "No description"}
⭐ Stars   : ${repo.stargazers_count}
🍴 Forks   : ${repo.forks_count}
👁️ Watch   : ${repo.watchers_count}
🐛 Issues  : ${repo.open_issues_count}
📅 Created : ${new Date(repo.created_at).toDateString()}
🔗 URL     : ${repo.html_url}
━━━━━━━━━━━━━━━━━━━━
SHAKIL BOT V3`
        );
      }

      // User profile
      const res  = await axios.get(`https://api.github.com/users/${input}`, { timeout: 8000 });
      const user = res.data;

      fs.ensureDirSync(path.join(__dirname, "cache"));
      const imgPath = path.join(__dirname, "cache", `github_${Date.now()}.png`);
      const buf = await drawGithubCard(user);
      fs.writeFileSync(imgPath, buf);

      api.setMessageReaction("✅", messageID, () => {}, true);
      await message.reply({
        body: `👤 GitHub: ${user.login}\n📦 ${user.public_repos} repos | 👥 ${user.followers} followers`,
        attachment: fs.createReadStream(imgPath)
      });
      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 8000);

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (err.response?.status === 404)
        return message.reply(`❌ GitHub user/repo "${input}" not found.`);
      message.reply("❌ GitHub API error. Try again.");
    }
  }
};
