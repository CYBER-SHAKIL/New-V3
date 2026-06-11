module.exports = {
  config: {
    name: "spamkick",
    version: "2.0.0",
    role: 2,
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    description: {
      en: "Auto-kick users who spam messages in this group"
    },
    category: "group",
    guide: { en: "{pn} on | {pn} off | {pn} set [limit] [seconds]" }
  },

  langs: {
    en: {
      on: "✅ Spam kick is now ON for this group.\n⚡ Limit: %1 messages in %2 seconds.",
      off: "✅ Spam kick is now OFF for this group.",
      alreadyOff: "⚠️ Spam kick is not active on this group.",
      kicked: "%1 was kicked for spamming!\nReact to this message to add them back.",
      setUsage: "⚠️ Usage: spamkick set [message limit] [time in seconds]\nExample: spamkick set 10 30",
      setDone: "✅ Spam settings updated!\n⚡ Limit: %1 messages in %2 seconds.",
      usage: "❓ Usage:\n• spamkick on — activate\n• spamkick off — deactivate\n• spamkick set [limit] [seconds] — configure"
    }
  },

  onStart: async function ({ api, event, args, message, commandName, getLang }) {
    if (!global.antispam) global.antispam = new Map();
    if (!global.antispamSettings) global.antispamSettings = new Map();

    const { threadID } = event;
    const cmd = (args[0] || "").toLowerCase();

    if (cmd === "on") {
      const settings = global.antispamSettings.get(threadID) || { limit: 10, time: 30000 };
      global.antispam.set(threadID, { users: {}, enabled: true });
      global.antispamSettings.set(threadID, settings);
      return message.reply(getLang("on", settings.limit, settings.time / 1000));
    }

    if (cmd === "off") {
      if (!global.antispam.has(threadID) || !global.antispam.get(threadID)?.enabled) {
        return message.reply(getLang("alreadyOff"));
      }
      global.antispam.delete(threadID);
      return message.reply(getLang("off"));
    }

    if (cmd === "set") {
      const limit = parseInt(args[1]);
      const secs = parseInt(args[2]);
      if (isNaN(limit) || isNaN(secs) || limit < 3 || secs < 5) {
        return message.reply(getLang("setUsage"));
      }
      global.antispamSettings.set(threadID, { limit, time: secs * 1000 });
      if (global.antispam.has(threadID)) {
        global.antispam.get(threadID).users = {};
      }
      return message.reply(getLang("setDone", limit, secs));
    }

    return message.reply(getLang("usage"));
  },

  onChat: async function ({ api, event, usersData, commandName, getLang }) {
    if (!global.antispam) return;
    const { senderID, threadID } = event;

    const threadData = global.antispam.get(threadID);
    if (!threadData?.enabled) return;

    if (global.GoatBot?.config?.adminBot?.includes(senderID)) return;
    if (senderID === api.getCurrentUserID()) return;

    const settings = global.antispamSettings?.get(threadID) || { limit: 10, time: 30000 };

    if (!threadData.users) threadData.users = {};
    if (!threadData.users[senderID]) {
      threadData.users[senderID] = { count: 1, time: Date.now() };
    } else {
      threadData.users[senderID].count++;
      const timePassed = Date.now() - threadData.users[senderID].time;

      if (threadData.users[senderID].count > settings.limit && timePassed < settings.time) {
        try {
          const name = await usersData.getName(senderID);
          await api.removeUserFromGroup(senderID, threadID);
          threadData.users[senderID] = { count: 0, time: Date.now() };

          api.sendMessage(
            getLang("kicked", name),
            threadID,
            (err, info) => {
              if (!err) {
                global.GoatBot.onReaction.set(info.messageID, {
                  commandName,
                  uid: senderID,
                  messageID: info.messageID
                });
              }
            }
          );
        } catch (err) {
          console.error("[spamkick]", err.message);
        }
      } else if (timePassed >= settings.time) {
        threadData.users[senderID] = { count: 1, time: Date.now() };
      }
    }
  },

  onReaction: async function ({ api, event, Reaction, threadsData, usersData, role }) {
    if (role < 1) return;
    const { uid, messageID } = Reaction;
    try {
      await api.addUserToGroup(uid, event.threadID);
      const name = await usersData.getName(uid);
      await api.unsendMessage(messageID).catch(() => {});
      api.sendMessage(`✅ ${name} has been added back.`, event.threadID);
    } catch (err) {
      const name = await usersData.getName(uid).catch(() => uid);
      api.sendMessage(`❌ Failed to add back ${name}.`, event.threadID);
    }
  }
};
