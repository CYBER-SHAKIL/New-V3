const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "2.0",
    author: "NTKhang | Modified by 𝗦𝗛𝗔𝗞𝗜𝗟",
    countDown: 5,
    role: 2,
    description: {
      en: "Send notification from admin to all groups. Replies are forwarded to admin."
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "Please enter the message you want to send to all groups",
      notification: "📢 Notification from Bot Admin\n(Reply to send feedback to admin)",
      sendingNotification: "⏳ Sending notification to %1 groups...",
      sentNotification: "✅ Sent to %1 groups successfully",
      errorSendingNotification: "❌ Error sending to %1 groups:\n%2",
      replyReceived: "💬 Reply from %1\n📌 Group: %2\n────────────\n%3",
      replyForwarded: "✅ Your reply has been forwarded to admin!"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, usersData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0])
      return message.reply(getLang("missingMessage"));

    const formSend = {
      body: `${getLang("notification")}\n────────────────\n${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(
      t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );
    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSucces = 0;
    const sendError = [];
    const wattingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        wattingSend.push({
          threadID: tid,
          threadName: thread.threadName || tid,
          pending: api.sendMessage(formSend, tid, (err, info) => {
            if (!err && info?.messageID) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                threadID: tid,
                threadName: thread.threadName || tid,
                authorID: event.senderID
              });
            }
          })
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of wattingSend) {
      try {
        await sended.pending;
        sendSucces++;
      } catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription))
          sendError.push({ threadIDs: [sended.threadID], errorDescription });
        else
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }

    let msg = "";
    if (sendSucces > 0)
      msg += getLang("sentNotification", sendSucces) + "\n";
    if (sendError.length > 0)
      msg += getLang("errorSendingNotification",
        sendError.reduce((a, b) => a + (b.threadIDs?.length || 1), 0),
        sendError.reduce((a, b) => a + `\n - ${b.errorDescription || b}\n  + ${(b.threadIDs || [b]).join("\n  + ")}`, "")
      );
    message.reply(msg);
  },

  onReply: async function ({ api, event, Reply, usersData, getLang }) {
    const { threadID: fromGroupID, threadName: fromGroupName, authorID } = Reply;

    const senderName = (await usersData.get(event.senderID))?.name || "Unknown";
    const replyText = event.body || "(no text)";

    const adminMsg = getLang("replyReceived", senderName, fromGroupName || fromGroupID, replyText);

    const adminBots = global.GoatBot?.config?.adminBot || [];
    for (const adminID of adminBots) {
      try {
        await api.sendMessage(adminMsg, adminID);
      } catch (_) {}
    }

    const ownerThread = global.GoatBot?.config?.ownerThread;
    if (ownerThread) {
      try {
        await api.sendMessage(adminMsg, ownerThread);
      } catch (_) {}
    }

    await api.sendMessage(getLang("replyForwarded"), event.threadID, event.messageID);
  }
};
