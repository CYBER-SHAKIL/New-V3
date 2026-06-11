// ═══════════════════════════════════════════
//  AUTO BACKUP — v2.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Auto-backup database every 6 hours
//  Keep last 7 backups, notify admin
// ═══════════════════════════════════════════

const fs   = require("fs-extra");
const path = require("path");

const BACKUP_DIR     = path.join(process.cwd(), "database", "backups");
const BACKUP_EVERY   = 6 * 60 * 60 * 1000;  // 6 hours
const MAX_BACKUPS    = 7;
let   backupInterval = null;

function getTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}_${String(d.getHours()).padStart(2,"0")}-${String(d.getMinutes()).padStart(2,"0")}`;
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith("backup_") && f.endsWith(".json"))
      .sort()
      .reverse();
    if (files.length > MAX_BACKUPS) {
      files.slice(MAX_BACKUPS).forEach(f => {
        try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
      });
    }
  } catch {}
}

async function performBackup(api) {
  try {
    fs.ensureDirSync(BACKUP_DIR);

    const db = global.db;
    if (!db) return;

    const snapshot = {
      timestamp : new Date().toISOString(),
      threads   : db.allThreadData  || [],
      users     : db.allUserData    || [],
      globalData: db.allGlobalData  || {},
      version   : "3.0"
    };

    const filename = `backup_${getTimestamp()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
    cleanOldBackups();

    console.log(`[AUTO BACKUP] Saved: ${filename} (${db.allThreadData?.length || 0} threads, ${db.allUserData?.length || 0} users)`);

    // Notify admins
    const adminList = global.GoatBot?.config?.adminBot || [];
    if (adminList.length > 0 && api) {
      const fileSizeKB = (fs.statSync(filepath).size / 1024).toFixed(1);
      for (const adminID of adminList.slice(0, 2)) {
        try {
          await api.sendMessage(
            `🔒 AUTO BACKUP COMPLETE\n━━━━━━━━━━━━━━\n📁 File  : ${filename}\n📦 Size  : ${fileSizeKB} KB\n👥 Threads: ${db.allThreadData?.length || 0}\n👤 Users  : ${db.allUserData?.length || 0}\n🕐 Time  : ${new Date().toLocaleString()}\n━━━━━━━━━━━━━━\n✅ SHAKIL BOT V3`,
            adminID
          );
        } catch {}
      }
    }
  } catch (err) {
    console.error("[AUTO BACKUP] Error:", err.message);
  }
}

module.exports = {
  config: {
    name: "autobackup",
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    description: "Auto database backup every 6 hours, keeps 7 backups",
    category: "events"
  },

  onStart: async ({ api }) => {
    try {
      fs.ensureDirSync(BACKUP_DIR);

      // Initial backup on startup
      setTimeout(() => performBackup(api), 30000); // 30 sec after start

      // Schedule recurring backup
      if (backupInterval) clearInterval(backupInterval);
      backupInterval = setInterval(() => performBackup(api), BACKUP_EVERY);

      console.log("[AUTO BACKUP] Scheduled — every 6 hours, keeping last 7 backups");
    } catch (err) {
      console.error("[AUTO BACKUP] Init error:", err.message);
    }
  },

  onChat: async () => {}
};
