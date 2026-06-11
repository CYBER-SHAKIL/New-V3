'use strict';

const fs   = require("fs-extra");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config.json");

function loadConfig() {
  try { return fs.readJsonSync(CONFIG_PATH); }
  catch { return {}; }
}
function saveConfig(cfg) {
  fs.writeJsonSync(CONFIG_PATH, cfg, { spaces: 2 });
}

const MENU = `👑 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡 👑

⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗣𝗔𝗡𝗘𝗟  ⚙️ 

[ 1 ] 🔄 𝗥𝗘𝗕𝗢𝗢𝗧 𝗕𝗢𝗧
[ 2 ] ♻️ 𝗥𝗘𝗟𝗢𝗔𝗗 𝗖𝗢𝗡𝗙𝗜𝗚
[ 3 ] 📊 𝗨𝗣𝗗𝗔𝗧𝗘 𝗕𝗢𝗫 𝗗𝗔𝗧𝗔
[ 4 ] 👤 𝗨𝗣𝗗𝗔𝗧𝗘 𝗨𝗦𝗘𝗥 𝗗𝗔𝗧𝗔
[ 5 ] 🚪 𝗟𝗢𝗚𝗢𝗨𝗧 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞

━━━━━━━━━━━━━━━━━━

[ 6 ] 🔒 𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬 𝗠𝗢𝗗𝗘
[ 7 ] 🚫 𝗔𝗡𝗧𝗜 𝗝𝗢𝗜𝗡
[ 8 ] 🛡️ 𝗔𝗡𝗧𝗜 𝗥𝗢𝗕𝗕𝗘𝗥𝗬
[ 9 ] 🚷 𝗔𝗡𝗧𝗜 𝗢𝗨𝗧
[ 10 ] 👢 𝗞𝗜𝗖𝗞 𝗨𝗦𝗘𝗥𝗦

━━━━━━━━━━━━━━━━━━

[ 11 ] 🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢
[ 12 ] 📦 𝗕𝗢𝗫 𝗜𝗡𝗙𝗢
[ 13 ] 👮 𝗚𝗥𝗢𝗨𝗣 𝗔𝗗𝗠𝗜𝗡 𝗟𝗜𝗦𝗧
[ 14 ] 👑 𝗔𝗗𝗠𝗜𝗡 𝗕𝗢𝗧 𝗟𝗜𝗦𝗧
[ 15 ] 📋 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧

━━━━━━━━━━━━━━━━━━
👉 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗔 𝗡𝗨𝗠𝗕𝗘𝗥`;

module.exports = {
  config: {
    name:             "settings",
    version:          "2.0",
    author:           "SHAKIL-HOSSEN",
    countDown:        5,
    role:             2,
    shortDescription: { en: "Bot Settings Control Panel" },
    description:      { en: "Full settings panel for bot owner" },
    category:         "owner",
    guide:            { en: "{pn} — open settings panel\n{pn} <number> — run option directly" }
  },

  onStart: async function ({ api, event, args, message, GoatBot, threadsData, usersData }) {
    const input = args[0];

    if (!input) {
      return message.reply(MENU, (err, info) => {
        if (err || !info) return;
        GoatBot.onReply.set(info.messageID, {
          commandName: "settings",
          author:      event.senderID,
          threadID:    event.threadID
        });
      });
    }

    await handleOption(input, args, api, event, message, GoatBot, threadsData, usersData);
  },

  onReply: async function ({ event, message, Reply, api, GoatBot, threadsData, usersData }) {
    if (event.senderID !== Reply.author) return;
    const input = event.body?.trim();
    GoatBot.onReply.delete(event.messageReply?.messageID);
    await handleOption(input, input.split(/ +/), api, event, message, GoatBot, threadsData, usersData);
  }
};

async function handleOption(input, args, api, event, message, GoatBot, threadsData, usersData) {
  const cfg = loadConfig();
  const { threadID, senderID } = event;

  switch (String(input).trim()) {

    // ── 1. REBOOT ──
    case "1": case "reboot":
      return message.reply("🔄 𝗥𝗲𝗯𝗼𝗼𝘁𝗶𝗻𝗴 𝗯𝗼𝘁… 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁!", () => process.exit(1));

    // ── 2. RELOAD CONFIG ──
    case "2": case "reload": {
      try {
        Object.keys(require.cache).forEach(k => {
          if (k.includes("config.json")) delete require.cache[k];
        });
        const fresh = loadConfig();
        GoatBot.config = fresh;
        return message.reply("♻️ 𝗖𝗼𝗻𝗳𝗶𝗴 𝗿𝗲𝗹𝗼𝗮𝗱𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!");
      } catch (e) {
        return message.reply("❌ Failed to reload config: " + e.message);
      }
    }

    // ── 3. UPDATE BOX DATA ──
    case "3": {
      try {
        const threads = global.db?.allThreadData || [];
        return message.reply(`📊 𝗕𝗼𝘅 𝗗𝗮𝘁𝗮 𝗨𝗽𝗱𝗮𝘁𝗲𝗱!\n📦 Total Groups: ${threads.length}`);
      } catch (e) {
        return message.reply("❌ Error: " + e.message);
      }
    }

    // ── 4. UPDATE USER DATA ──
    case "4": {
      try {
        const users = global.db?.allUserData || [];
        return message.reply(`👤 𝗨𝘀𝗲𝗿 𝗗𝗮𝘁𝗮 𝗨𝗽𝗱𝗮𝘁𝗲𝗱!\n👥 Total Users: ${users.length}`);
      } catch (e) {
        return message.reply("❌ Error: " + e.message);
      }
    }

    // ── 5. LOGOUT FACEBOOK ──
    case "5": case "logout":
      return message.reply("🚪 𝗟𝗼𝗴𝗴𝗶𝗻𝗴 𝗼𝘂𝘁 𝗼𝗳 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸…", () => {
        try { global.GoatBot?.fcaApi?.logout?.(() => process.exit(0)); }
        catch { process.exit(0); }
      });

    // ── 6. ADMIN ONLY MODE ──
    case "6": {
      const cur = cfg.adminOnly?.enable ?? false;
      if (!cfg.adminOnly) cfg.adminOnly = { enable: false, ignoreCommand: [] };
      cfg.adminOnly.enable = !cur;
      saveConfig(cfg);
      GoatBot.config = cfg;
      return message.reply(`🔒 𝗔𝗱𝗺𝗶𝗻 𝗢𝗻𝗹𝘆 𝗠𝗼𝗱𝗲: ${cfg.adminOnly.enable ? "✅ ON" : "❌ OFF"}`);
    }

    // ── 7. ANTI JOIN ──
    case "7": {
      const threads = global.db?.allThreadData || [];
      const thread  = threads.find(t => t.threadID === threadID);
      if (thread?.data) {
        thread.data.antiJoin = !thread.data.antiJoin;
        try { await threadsData.set(threadID, thread.data.antiJoin, "data.antiJoin"); } catch {}
        return message.reply(`🚫 𝗔𝗻𝘁𝗶 𝗝𝗼𝗶𝗻: ${thread.data.antiJoin ? "✅ ON" : "❌ OFF"}`);
      }
      return message.reply("🚫 𝗔𝗻𝘁𝗶 𝗝𝗼𝗶𝗻 𝘁𝗼𝗴𝗴𝗹𝗲𝗱! ✅");
    }

    // ── 8. ANTI ROBBERY ──
    case "8": {
      const threads = global.db?.allThreadData || [];
      const thread  = threads.find(t => t.threadID === threadID);
      if (thread?.data) {
        thread.data.antiRobbery = !thread.data.antiRobbery;
        try { await threadsData.set(threadID, thread.data.antiRobbery, "data.antiRobbery"); } catch {}
        return message.reply(`🛡️ 𝗔𝗻𝘁𝗶 𝗥𝗼𝗯𝗯𝗲𝗿𝘆: ${thread.data.antiRobbery ? "✅ ON" : "❌ OFF"}`);
      }
      return message.reply("🛡️ 𝗔𝗻𝘁𝗶 𝗥𝗼𝗯𝗯𝗲𝗿𝘆 𝘁𝗼𝗴𝗴𝗹𝗲𝗱! ✅");
    }

    // ── 9. ANTI OUT ──
    case "9": {
      const threads = global.db?.allThreadData || [];
      const thread  = threads.find(t => t.threadID === threadID);
      if (thread?.data) {
        thread.data.antiOut = !thread.data.antiOut;
        try { await threadsData.set(threadID, thread.data.antiOut, "data.antiOut"); } catch {}
        return message.reply(`🚷 𝗔𝗻𝘁𝗶 𝗢𝘂𝘁: ${thread.data.antiOut ? "✅ ON" : "❌ OFF"}`);
      }
      return message.reply("🚷 𝗔𝗻𝘁𝗶 𝗢𝘂𝘁 𝘁𝗼𝗴𝗴𝗹𝗲𝗱! ✅");
    }

    // ── 10. KICK USERS ──
    case "10": {
      const uid = args[1];
      if (!uid || isNaN(uid))
        return message.reply("👢 𝗞𝗶𝗰𝗸 𝗨𝘀𝗲𝗿𝘀\n\n𝗨𝘀𝗮𝗴𝗲: settings 10 <userID>\n\nExample: settings 10 61588178231072");
      try {
        await api.removeUserFromGroup(uid, threadID);
        return message.reply(`👢 𝗨𝘀𝗲𝗿 ${uid} 𝗸𝗶𝗰𝗸𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!`);
      } catch (e) {
        return message.reply("❌ 𝗞𝗶𝗰𝗸 𝗳𝗮𝗶𝗹𝗲𝗱: " + e.message);
      }
    }

    // ── 11. BOT INFO ──
    case "11": {
      const uptime  = process.uptime();
      const hrs     = Math.floor(uptime / 3600);
      const mins    = Math.floor((uptime % 3600) / 60);
      const secs    = Math.floor(uptime % 60);
      const cmds    = GoatBot.commands?.size || 0;
      const version = require(process.cwd() + "/package.json").version;
      return message.reply(
        `🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢\n\n`
        + `📛 Name: SHAKIL-BOT-V3\n`
        + `📦 Version: ${version}\n`
        + `🟢 Node.js: ${process.version}\n`
        + `⏱️ Uptime: ${hrs}h ${mins}m ${secs}s\n`
        + `💬 Commands: ${cmds}\n`
        + `🆔 Bot ID: ${GoatBot.botID || "N/A"}\n`
        + `👑 Author: MD SHAKIL HOSSEN`
      );
    }

    // ── 12. BOX INFO ──
    case "12": {
      try {
        const info = await api.getThreadInfo(threadID);
        const adminCount = (info.adminIDs || []).length;
        const memberCount = (info.participantIDs || []).length;
        return message.reply(
          `📦 𝗕𝗢𝗫 𝗜𝗡𝗙𝗢\n\n`
          + `📛 Name: ${info.threadName || "N/A"}\n`
          + `🆔 Thread ID: ${threadID}\n`
          + `👥 Members: ${memberCount}\n`
          + `👮 Admins: ${adminCount}\n`
          + `🔒 Approval: ${info.approvalMode ? "ON" : "OFF"}`
        );
      } catch (e) {
        return message.reply("❌ Error fetching box info: " + e.message);
      }
    }

    // ── 13. GROUP ADMIN LIST ──
    case "13": {
      try {
        const info   = await api.getThreadInfo(threadID);
        const admins = info.adminIDs || [];
        if (!admins.length) return message.reply("👮 𝗡𝗼 𝗮𝗱𝗺𝗶𝗻𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗴𝗿𝗼𝘂𝗽.");
        let msg = "👮 𝗚𝗥𝗢𝗨𝗣 𝗔𝗗𝗠𝗜𝗡 𝗟𝗜𝗦𝗧\n━━━━━━━━━━━━━━━━━━\n";
        let i   = 0;
        for (const a of admins) {
          i++;
          const uid  = a.id || a;
          const name = await usersData?.getName?.(uid).catch(() => null) || "Facebook User";
          msg += `${i}. 👤 ${name}\n   🆔 ${uid}\n`;
        }
        return message.reply(msg);
      } catch (e) {
        return message.reply("❌ Error: " + e.message);
      }
    }

    // ── 14. ADMIN BOT LIST ──
    case "14": {
      const botAdmins = GoatBot.config?.adminBot || [];
      if (!botAdmins.length) return message.reply("👑 𝗡𝗼 𝗯𝗼𝘁 𝗮𝗱𝗺𝗶𝗻𝘀 𝗳𝗼𝘂𝗻𝗱.");
      let msg = "👑 𝗔𝗗𝗠𝗜𝗡 𝗕𝗢𝗧 𝗟𝗜𝗦𝗧\n━━━━━━━━━━━━━━━━━━\n";
      let i   = 0;
      for (const uid of botAdmins) {
        i++;
        const name = await usersData?.getName?.(uid).catch(() => null) || "Facebook User";
        msg += `${i}. 👤 ${name}\n   🆔 ${uid}\n`;
      }
      return message.reply(msg);
    }

    // ── 15. GROUP LIST ──
    case "15": {
      const threads = global.db?.allThreadData || [];
      if (!threads.length) return message.reply("📋 𝗡𝗼 𝗴𝗿𝗼𝘂𝗽𝘀 𝗳𝗼𝘂𝗻𝗱.");
      let msg = `📋 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧 (${threads.length} groups)\n━━━━━━━━━━━━━━━━━━\n`;
      let i   = 0;
      for (const t of threads.slice(0, 30)) {
        i++;
        msg += `${i}. 📦 ${t.threadName || "Unknown"}\n   🆔 ${t.threadID}\n`;
      }
      if (threads.length > 30) msg += `\n... and ${threads.length - 30} more`;
      return message.reply(msg);
    }

    default:
      return message.reply("❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗼𝗽𝘁𝗶𝗼𝗻! 𝗨𝘀𝗲 𝟭-𝟭𝟱\n\nType: settings (no number) to see the menu again.");
  }
}
