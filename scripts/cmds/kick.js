module.exports = {
  config: {
    name: "kick",
    aliases: ["remove"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 1,
    description: { en: "Kick member(s) from group" },
    category: "owner",
    guide: {
      en:
        "{pn} @mention         — kick mentioned user(s)\n" +
        "{pn} [UID]            — kick by user ID\n" +
        "{pn} (reply)          — kick replied user\n" +
        "{pn} all              — kick ALL non-admin members\n\n" +
        "Example: -kick all"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const { threadID, senderID, mentions, messageReply } = event;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const botID = String(api.getCurrentUserID());

      if (!threadInfo.adminIDs.some(a => String(a.id) === botID))
        return message.reply("⚠️ Bot must be a group admin to kick!");

      // ─── KICK ALL ──────────────────────────────────────────────
      if ((args[0] || "").toLowerCase() === "all") {
        const adminIDs = new Set(threadInfo.adminIDs.map(a => String(a.id)));
        const toKick = threadInfo.participantIDs.filter(
          id => String(id) !== botID &&
                String(id) !== String(senderID) &&
                !adminIDs.has(String(id))
        );

        if (toKick.length === 0)
          return message.reply("❌ No kickable members found.\n🛡️ Admins and you are protected.");

        const progMsg = await message.reply(
          `⏳ Kicking ${toKick.length} member(s)...\n🛡️ Admins are protected.`
        );

        let kicked = 0, failed = 0;
        for (const uid of toKick) {
          try {
            await api.removeUserFromGroup(uid, threadID);
            kicked++;
          } catch (_) { failed++; }
          await new Promise(r => setTimeout(r, 500));
        }

        try { await api.unsendMessage(progMsg.messageID); } catch (_) {}
        return message.reply(
          `✅ Kick All Complete!\n` +
          `━━━━━━━━━━━━━━━\n` +
          `✅ Kicked : ${kicked}\n` +
          `❌ Failed : ${failed}\n` +
          `🛡️ Protected: Admins`
        );
      }

      // ─── KICK SPECIFIC USER(S) ─────────────────────────────────
      const targets = [];
      const mentionUIDs = Object.keys(mentions || {});

      if (mentionUIDs.length > 0) {
        for (const uid of mentionUIDs) {
          if (String(uid) !== botID && String(uid) !== String(senderID))
            targets.push(String(uid));
        }
      }
      if (targets.length === 0 && messageReply) {
        const rid = String(messageReply.senderID);
        if (rid !== botID && rid !== String(senderID)) targets.push(rid);
      }
      if (targets.length === 0 && args[0] && /^\d{10,}$/.test(args[0])) {
        const uid = args[0];
        if (uid !== botID && uid !== String(senderID)) targets.push(uid);
      }

      if (targets.length === 0)
        return message.reply(
          "⚠️ Who to kick?\n\n" +
          "• Mention  : -kick @Name\n" +
          "• Reply    : -kick (reply to msg)\n" +
          "• By UID   : -kick 123456789\n" +
          "• Everyone : -kick all"
        );

      let kicked = 0, failed = 0, failNames = [];
      for (const uid of targets) {
        try {
          await api.removeUserFromGroup(uid, threadID);
          kicked++;
          await new Promise(r => setTimeout(r, 400));
        } catch (_) {
          failed++;
          const info = threadInfo.userInfo?.find(u => String(u.id) === String(uid));
          failNames.push(info?.name || uid);
        }
      }

      let msg = "";
      if (kicked > 0) msg += `✅ Kicked ${kicked} member(s)!`;
      if (failed > 0) msg += `\n❌ Failed: ${failNames.join(", ")}\n(May be admin or not in group)`;
      return message.reply(msg.trim());

    } catch (e) {
      console.error("[kick.js]", e.message);
      return message.reply("❌ Error: " + e.message);
    }
  }
};
