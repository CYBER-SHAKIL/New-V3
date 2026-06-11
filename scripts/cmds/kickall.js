module.exports = {
  config: {
    name: "kickall",
    aliases: ["removeall"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 10,
    role: 2,
    shortDescription: { en: "Kick all non-admin members from group" },
    longDescription: { en: "Removes all non-admin members from the group. Admins and the command sender are always protected." },
    category: "owner",
    guide: {
      en:
        "{pn}           — kick all non-admin members\n" +
        "{pn} confirm   — skip confirmation\n\n" +
        "⚠️ Use with caution! Admins are protected."
    }
  },

  onStart: async function ({ api, event, args, message, commandName }) {
    const { threadID, senderID } = event;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const botID = String(api.getCurrentUserID());

      if (!threadInfo.adminIDs.some(a => String(a.id) === botID))
        return message.reply("❌ Bot must be a group admin to use kickall!");

      const adminIDs = new Set(threadInfo.adminIDs.map(a => String(a.id)));
      const toKick = threadInfo.participantIDs.filter(
        id => String(id) !== botID &&
              String(id) !== String(senderID) &&
              !adminIDs.has(String(id))
      );

      if (toKick.length === 0)
        return message.reply(
          "✅ No non-admin members to kick!\n" +
          "🛡️ All remaining members are admins."
        );

      // Confirmation step
      const confirmed = (args[0] || "").toLowerCase() === "confirm";
      if (!confirmed) {
        const confirmMsg = await message.reply(
          `⚠️ KICKALL CONFIRMATION\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `👥 Members to kick : ${toKick.length}\n` +
          `🛡️ Protected (admins): ${adminIDs.size}\n\n` +
          `✅ React 👍 to confirm\n` +
          `❌ React 👎 to cancel`
        );
        global.GoatBot.onReaction.set(confirmMsg.messageID, {
          commandName,
          messageID: confirmMsg.messageID,
          author: senderID,
          data: { toKick, threadID }
        });
        return;
      }

      await _doKickAll(api, message, toKick, threadID);

    } catch (e) {
      console.error("[kickall.js]", e.message);
      message.reply("❌ Error: " + e.message);
    }
  },

  onReaction: async function ({ api, event, Reaction, message }) {
    if (String(event.senderID) !== String(Reaction.author)) return;
    const { reaction } = event;

    try { await api.unsendMessage(Reaction.messageID); } catch (_) {}

    if (reaction === "👍" || reaction === "✅" || reaction === "😆" || reaction === "😮") {
      const { toKick, threadID } = Reaction.data;
      await _doKickAll(api, message, toKick, threadID);
    } else {
      message.reply("❌ Kickall cancelled.");
    }
  }
};

async function _doKickAll(api, message, toKick, threadID) {
  const progMsg = await message.reply(
    `⏳ Starting kickall...\n` +
    `👥 Removing ${toKick.length} member(s)\n` +
    `[░░░░░░░░░░] 0%`
  );

  let kicked = 0, failed = 0;
  const total = toKick.length;

  for (let i = 0; i < toKick.length; i++) {
    try {
      await api.removeUserFromGroup(toKick[i], threadID);
      kicked++;
    } catch (_) { failed++; }

    // Update progress every 5 kicks
    if ((i + 1) % 5 === 0 || i === toKick.length - 1) {
      const pct = Math.floor(((i + 1) / total) * 100);
      const filled = Math.floor(pct / 10);
      const bar = "█".repeat(filled) + "░".repeat(10 - filled);
      try {
        await api.editMessage(
          `⏳ Kicking members...\n[${bar}] ${pct}%\n✅ ${kicked} kicked | ❌ ${failed} failed`,
          progMsg.messageID
        );
      } catch (_) {}
    }

    await new Promise(r => setTimeout(r, 500));
  }

  try { await api.unsendMessage(progMsg.messageID); } catch (_) {}

  return message.reply(
    `✅ KICKALL COMPLETE!\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `✅ Successfully kicked : ${kicked}\n` +
    `❌ Failed              : ${failed}\n` +
    `👥 Total processed     : ${total}\n` +
    `🛡️ Admins protected    : ✓`
  );
}
