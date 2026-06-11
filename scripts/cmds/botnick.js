module.exports = {
  config: {
    name: "botnick",
    aliases: [],
    version: "3.1",
    author: "MD_SHAKIL", // ⚠️ DO NOT CHANGE
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Change bot nickname in current group"
    },
    longDescription: {
      en: "Change nickname of the bot only in the current group"
    },
    category: "owner",
    guide: {
      en: "{pn} <new nickname>"
    }
  },

  langs: {
    en: {
      authorLock: "🚫 | Don't change author name!",
      missingNickname: "❌ | Please enter a nickname",
      tooLong: "❌ | Nickname max 32 characters",
      alreadySet: "⚠️ | Already using this nickname",
      successMessage: "✅ | Bot nickname changed to: %1",
      failedMessage: "❌ | Failed to change nickname!"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {

    // 🔒 AUTHOR LOCK SYSTEM
    if (module.exports.config.author !== "MD_SHAKIL") {
      return message.reply(getLang("authorLock"));
    }

    const { threadID } = event;
    const botID = api.getCurrentUserID();
    const newNickname = args.join(" ").trim();

    // ❌ Empty check
    if (!newNickname) {
      return message.reply(getLang("missingNickname"));
    }

    // ❌ Length limit
    if (newNickname.length > 32) {
      return message.reply(getLang("tooLong"));
    }

    try {
      // 🔍 Current nickname check
      const threadInfo = await api.getThreadInfo(threadID);
      const currentNick = threadInfo.nicknames?.[botID] || "";

      if (currentNick === newNickname) {
        return message.reply(getLang("alreadySet"));
      }

      // ✅ Change nickname
      await api.changeNickname(newNickname, threadID, botID);

      return message.reply(getLang("successMessage", newNickname));

    } catch (err) {
      console.error("BotNick Error:", err);
      return message.reply(getLang("failedMessage"));
    }
  }
};
