'use strict';

const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "2.0",
    author: "SHAKIL-HOSSEN",
    countDown: 5,
    role: 1,
    shortDescription: { en: "Ban / unban / list banned users in group chat" },
    description: { en: "Ban user from box chat, view list, unban via reply" },
    category: "box chat",
    guide: {
      en: "  {pn} @tag/uid [reason] — Ban user\n"
        + "  {pn} unban @tag/uid — Unban user\n"
        + "  {pn} list — Show banned list (reply with number to unban)\n"
        + "  {pn} check — Kick all currently-banned members"
    }
  },

  langs: {
    en: {
      notFoundTarget:     "⚠️ Please tag / enter UID / reply to the person you want to ban.",
      notFoundTargetUnban:"⚠️ Please tag / enter UID / reply to the person you want to unban.",
      userNotBanned:      "⚠️ User %1 is not banned in this group.",
      unbannedSuccess:    "✅ Successfully unbanned %1 from this group!",
      cantSelfBan:        "⚠️ You cannot ban yourself!",
      cantBanAdmin:       "❌ You cannot ban a group administrator!",
      existedBan:         "❌ This user is already banned!",
      noReason:           "No reason provided",
      bannedSuccess:      "✅ Successfully banned %1 from this group!",
      needAdmin:          "⚠️ Bot needs admin permission to kick banned members.",
      noName:             "Facebook User",
      noData:             "📭 No banned members in this group.",
      needAdminToKick:    "⚠️ %1 (%2) is banned but bot lacks admin to kick them.",
      bannedKick:         "⚠️ %1 was already banned!\n🆔 %2\n📌 Reason: %3\n🕐 Time: %4\n\nBot auto-kicked this member."
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, usersData, api, GoatBot }) {
    const threadInfo  = await threadsData.get(event.threadID);
    const members     = Array.isArray(threadInfo.members)  ? threadInfo.members  : [];
    const adminIDs    = Array.isArray(threadInfo.adminIDs) ? threadInfo.adminIDs : [];
    const { senderID, threadID } = event;
    const dataBanned  = await threadsData.get(threadID, "data.banned_ban", []);

    const isAdmin     = uid => adminIDs.some(a => String(a.id || a) === String(uid));
    const getMemberName = uid => members.find(m => String(m.userID) === String(uid))?.name || null;
    const sub         = args[0]?.toLowerCase();

    // ─────────────── UNBAN ───────────────
    if (sub === "unban") {
      let target;
      if (!isNaN(args[1]) && args[1])          target = args[1];
      else if (args[1]?.startsWith("https"))   target = await findUid(args[1]);
      else if (Object.keys(event.mentions || {}).length) target = Object.keys(event.mentions)[0];
      else if (event.messageReply?.senderID)   target = event.messageReply.senderID;
      else return message.reply(getLang("notFoundTargetUnban"));

      const idx = dataBanned.findIndex(i => String(i.id) === String(target));
      if (idx === -1) return message.reply(getLang("userNotBanned", target));

      dataBanned.splice(idx, 1);
      await threadsData.set(threadID, dataBanned, "data.banned_ban");
      const name = getMemberName(target) || await usersData.getName(target) || getLang("noName");
      return message.reply(getLang("unbannedSuccess", name));
    }

    // ─────────────── CHECK (kick all banned) ───────────────
    if (sub === "check") {
      if (!dataBanned.length) return;
      for (const u of dataBanned)
        if ((event.participantIDs || []).includes(u.id))
          api.removeUserFromGroup(u.id, threadID);
      return;
    }

    // ─────────────── LIST ───────────────
    if (sub === "list") {
      if (!dataBanned.length) return message.reply(getLang("noData"));

      let msg = "📌𝑴𝑨𝑵𝑼𝑨𝑳 𝑩𝑨𝑵𝑵𝑬𝑫 𝑼𝑺𝑬𝑹𝑺\n\n";
      let count = 0;
      for (const u of dataBanned) {
        count++;
        const name = getMemberName(u.id) || await usersData.getName(u.id) || getLang("noName");
        msg += `${count}. 👤 ${name}\n🆔 ${u.id}\n📌 ${u.reason}\n🕐 ${u.time}\n\n`;
      }
      msg += "👉 Unban করতে চাইলে এই মেসেজে রিপ্লাই দিয়ে নাম্বার লেখো";

      return message.reply(msg, (err, info) => {
        if (err || !info) return;
        GoatBot.onReply.set(info.messageID, {
          commandName: "ban",
          author: senderID,
          threadID,
          dataBanned: [...dataBanned]
        });
      });
    }

    // ─────────────── BAN ───────────────
    let target, reason;
    if (event.messageReply?.senderID) {
      target = event.messageReply.senderID;
      reason = args.join(" ").trim();
    } else if (Object.keys(event.mentions || {}).length) {
      target = Object.keys(event.mentions)[0];
      reason = args.join(" ").replace(event.mentions[target], "").trim();
    } else if (!isNaN(args[0]) && args[0]) {
      target = args[0];
      reason = args.slice(1).join(" ").trim();
    } else if (args[0]?.startsWith("https")) {
      target = await findUid(args[0]);
      reason = args.slice(1).join(" ").trim();
    }

    if (!target)              return message.reply(getLang("notFoundTarget"));
    if (String(target) === String(senderID)) return message.reply(getLang("cantSelfBan"));
    if (isAdmin(target))      return message.reply(getLang("cantBanAdmin"));
    if (dataBanned.find(i => String(i.id) === String(target))) return message.reply(getLang("existedBan"));

    const name = getMemberName(target) || await usersData.getName(target) || getLang("noName");
    const time = moment().tz(global.GoatBot.config.timeZone || "Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const entry = { id: String(target), time, reason: reason || getLang("noReason") };

    dataBanned.push(entry);
    await threadsData.set(threadID, dataBanned, "data.banned_ban");

    message.reply(getLang("bannedSuccess", name), () => {
      const inGroup = members.some(m => String(m.userID) === String(target));
      if (!inGroup) return;
      if (isAdmin(api.getCurrentUserID())) {
        if ((event.participantIDs || []).includes(target))
          api.removeUserFromGroup(target, threadID);
      } else {
        message.send(getLang("needAdmin"));
      }
    });
  },

  onReply: async function ({ event, message, Reply, threadsData, usersData, getLang, api }) {
    if (event.senderID !== Reply.author) return;

    const num = parseInt(event.body?.trim());
    if (isNaN(num) || num < 1) return;

    const dataBanned = await threadsData.get(Reply.threadID, "data.banned_ban", []);
    const target = Reply.dataBanned[num - 1];
    if (!target) return message.reply(`⚠️ নাম্বার ${num} সঠিক না। মোট ${Reply.dataBanned.length} জন banned আছে।`);

    const idx = dataBanned.findIndex(i => String(i.id) === String(target.id));
    if (idx === -1) return message.reply(`⚠️ User ${target.id} ইতিমধ্যে unban হয়ে গেছে।`);

    dataBanned.splice(idx, 1);
    await threadsData.set(Reply.threadID, dataBanned, "data.banned_ban");

    const name = await usersData.getName(target.id) || getLang("noName");
    global.GoatBot.onReply.delete(event.messageReply?.messageID);
    return message.reply(`✅ ${name} (${target.id}) সফলভাবে unban করা হয়েছে!`);
  },

  onEvent: async function ({ event, api, threadsData, getLang, message }) {
    if (event.logMessageType !== "log:subscribe") return;
    const { threadID } = event;
    const dataBanned   = await threadsData.get(threadID, "data.banned_ban", []);
    const added        = event.logMessageData?.addedParticipants || [];

    for (const user of added) {
      const { userFbId, fullName } = user;
      const banned = dataBanned.find(i => String(i.id) === String(userFbId));
      if (!banned) continue;

      api.removeUserFromGroup(userFbId, threadID, err => {
        if (err) {
          message.send(getLang("needAdminToKick", fullName, userFbId));
        } else {
          message.send(getLang("bannedKick", fullName, userFbId, banned.reason, banned.time));
        }
      });
    }
  }
};
