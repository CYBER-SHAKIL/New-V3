// ═══════════════════════════════════════════
//  CLEANCACHE — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Clean cache/tmp files, free memory
// ═══════════════════════════════════════════

const fs   = require("fs-extra");
const path = require("path");

function getDirSizeKB(dir) {
  try {
    let total = 0;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      try {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.isFile()) total += stat.size;
      } catch {}
    }
    return (total / 1024).toFixed(1);
  } catch { return "0"; }
}

function cleanDir(dir, keepGitkeep = true) {
  let count = 0;
  try {
    if (!fs.existsSync(dir)) return 0;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (keepGitkeep && f === ".gitkeep") continue;
      try {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.isFile()) { fs.unlinkSync(fp); count++; }
      } catch {}
    }
  } catch {}
  return count;
}

module.exports = {
  config: {
    name: "cleancache",
    aliases: ["cc", "cacheclean", "cleantemp"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 15,
    role: 1,
    shortDescription: { en: "Clean bot cache & temp files" },
    longDescription:  { en: "Removes cached images and temp files, frees up memory" },
    category: "system",
    guide: { en: "{pn} — clean all cache/tmp\n{pn} -f — force clean (admin only)" }
  },

  onStart: async function ({ api, event, message, args, role }) {
    const { messageID } = event;
    api.setMessageReaction("🧹", messageID, () => {}, true);

    const dirs = [
      path.join(__dirname, "cache"),
      path.join(__dirname, "tmp"),
      path.join(__dirname, "../events/tmp"),
      path.join(__dirname, "../events/data/leaveAttachment"),
      path.join(__dirname, "../events/data/welcomeAttachment"),
      path.join(process.cwd(), "cache"),
      path.join(process.cwd(), "logs")
    ];

    let beforeKB = 0;
    dirs.forEach(d => { beforeKB += parseFloat(getDirSizeKB(d)) || 0; });

    let totalCleaned = 0;
    const results = [];
    for (const dir of dirs) {
      const sizeKB = parseFloat(getDirSizeKB(dir)) || 0;
      const count  = cleanDir(dir);
      if (count > 0) results.push(`📁 ${path.basename(dir)}: ${count} files (${sizeKB.toFixed(1)} KB)`);
      totalCleaned += count;
    }

    // Force GC if available
    if (global.gc) {
      try { global.gc(); } catch {}
    }

    const memBefore = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = results.length > 0
      ? results.join("\n")
      : "📭 Cache already clean — nothing to delete";

    await message.reply(
`🧹 CACHE CLEAN COMPLETE
━━━━━━━━━━━━━━━━━━━━━
${report}

📊 Summary:
• Files deleted: ${totalCleaned}
• Freed: ~${beforeKB.toFixed(1)} KB
• Memory: ${memBefore} MB used
━━━━━━━━━━━━━━━━━━━━━
✅ SHAKIL BOT V3 Cache Cleared`
    );
  }
};
