module.exports = {
  config: {
    name: "tag",
    aliases: ["everyone"],
    category: "GROUP",
    role: 0,
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    description: {
      en: "Tag by reply, name or tag all members"
    },
    guide: {
      en: "{pm}tag all [msg]       → সব members tag\n{pm}tag [name] [msg]    → নাম দিয়ে tag\nReply + {pm}tag [msg]  → reply করা জনকে tag"
    }
  },

  onStart: async ({ api, event, usersData, threadsData, args }) => {
    const { threadID, messageID, messageReply } = event;

    try {
      const threadData = await threadsData.get(threadID);

      const members = (threadData.members || [])
        .filter(m => m.inGroup === true)
        .map(m => ({ name: m.name || "User", id: m.userID }));

      let tagUsers = [];
      let text = "";

      // ── Mode 1: Reply করা ব্যক্তিকে tag ──────────────────────
      if (messageReply) {
        const uid = messageReply.senderID;
        let name;
        try { name = await usersData.getName(uid); } catch (_) { name = "User"; }
        tagUsers.push({ name: name || "User", id: uid });
        text = args.join(" ");
      }

      // ── Mode 2: -tag all → সব members ────────────────────────
      else if (args[0] && ["all", "cdi", "সবাই", "সব"].includes(args[0].toLowerCase())) {
        if (members.length === 0) {
          return api.sendMessage("❌ Group member list পাওয়া যায়নি।", threadID, messageID);
        }
        tagUsers = members;
        text = args.slice(1).join(" ");
      }

      // ── Mode 3: নাম দিয়ে search ──────────────────────────────
      else {
        if (!args[0]) {
          return api.sendMessage(
            "📌 ব্যবহার:\n• -tag all [msg]      → সবাইকে tag\n• -tag [name] [msg]   → নাম দিয়ে tag\n• Reply করে -tag [msg] → ঐ জনকে tag",
            threadID,
            messageID
          );
        }

        const searchName = args[0].toLowerCase();
        text = args.slice(1).join(" ");

        tagUsers = members.filter(m =>
          m.name && m.name.toLowerCase().includes(searchName)
        );

        if (tagUsers.length === 0) {
          return api.sendMessage(`❌ "${args[0]}" নামের কেউ group এ নেই।`, threadID, messageID);
        }
      }

      // ── Chunk করে পাঠাই (max 50 mentions per message) ────────
      const CHUNK_SIZE = 50;

      for (let i = 0; i < tagUsers.length; i += CHUNK_SIZE) {
        const chunk = tagUsers.slice(i, i + CHUNK_SIZE);
        const isLast = i + CHUNK_SIZE >= tagUsers.length;

        const mentions = chunk.map(u => ({ tag: u.name, id: u.id }));
        const namesText = chunk.map(u => u.name).join(", ");
        const body = (isLast && text) ? `${namesText}\n${text}` : namesText;

        await api.sendMessage({ body, mentions }, threadID, messageID);
      }

    } catch (err) {
      api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
