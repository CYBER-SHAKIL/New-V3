/**
 * SHAKIL AUTO-REPLY SYSTEM v2.0
 * Triggers:
 *  - fork / ফর্ক              → fork দেওয়া যাবে না
 *  - তোর বস কে / তোর মালিক কে
 *    তোকে বানিয়েছে কে / Shakil কে
 *    admin/boss/owner queries   → 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹, 𝘁𝗶𝗻𝗶 𝗮𝗺𝗮𝗸𝗲 𝗯𝗮𝗻𝗶𝘆𝗲𝘀𝗲𝗻🐣
 *  - mahmud / wrong name        → correct to Shakil
 * Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
 */

module.exports = {
  config: {
    name: "shakil_autoreply",
    version: "2.0.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    category: "events"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    if (!event.body) return;

    const botID = api.getCurrentUserID();
    if (event.senderID === botID) return;

    const body = event.body.toLowerCase().trim();
    const { threadID, messageID } = event;

    // ════════════════════════════════════════
    // 1.  FORK / ফর্ক
    // ════════════════════════════════════════
    const forkTriggers = [
      "fork", "ফর্ক", "forking", "ফর্ক দাও", "ফর্ক দে",
      "give fork", "bot fork", "source code dao", "code dao",
      "bot er code dao", "বটের কোড দাও"
    ];

    if (forkTriggers.some(w => body.includes(w))) {
      const replies = [
        "❌ 𝐅𝐎𝐑𝐊 দেওয়া যাবে না!\n\n🔒 এই বটটি 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗽𝗼𝗼𝗸𝗶𝗲 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 𝗯𝗮𝗯𝘆😘🎀 এর নিজের তৈরি।\nকোনো fork/copy করা সম্পূর্ণ নিষেধ।\n\n📛 Author: 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡",
        "⛔ ভাই, 𝐅𝐎𝐑𝐊 চাইলেও পাবা না!\n\n👑 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹 😘🎀 এর permission ছাড়া\nএই বটের code কেউ নিতে পারবে না।",
        "🚫 𝐅𝐎𝐑𝐊 = 𝐍𝐎𝐓 𝐀𝐋𝐋𝐎𝐖𝐄𝐃!\n\n💡 নিজে বানাও, copy করো না।\n\n👑 𝗢𝗪𝗡𝗘𝗥 ➜ 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗽𝗼𝗼𝗸𝗶𝗲 𝗦𝗵𝗮𝗸𝗶𝗹 𝗯𝗮𝗯𝘆😘🎀",
        "❌ এই বটের 𝗙𝗢𝗥𝗞 দেওয়া হয় না ভাই!\n\n🔐 Source code protected by 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹 𝗯𝗮𝗯𝘆😘🎀\nচুরি করলে বস জানবে 😈"
      ];
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID, messageID);
    }

    // ════════════════════════════════════════
    // 2.  BOSS / MALIK / CREATOR / SHAKIL QUERIES
    //     → reply: 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹, 𝘁𝗶𝗻𝗶 𝗮𝗺𝗮𝗸𝗲 𝗯𝗮𝗻𝗶𝘆𝗲𝘀𝗲𝗻🐣
    // ════════════════════════════════════════
    const bossTriggers = [
      // Bengali — "তোর বস কে"
      "তোর বস কে", "তোর বস কে?", "তোর বস কি", "তোর বস",
      // Bengali — "তোর মালিক কে"
      "তোর মালিক কে", "তোর মালিক কে?", "তোর মালিক কি", "তোর মালিক",
      // Bengali — "তোকে বানিয়েছে কে"
      "তোকে বানিয়েছে কে", "তোকে বানিয়েছে কে?",
      "তোমাকে বানিয়েছে কে", "তোমাকে কে বানিয়েছে",
      "কে বানিয়েছে তোকে", "কে বানিয়েছে তোমাকে",
      "তোকে কে বানিয়েছে", "তোকে কে বানালো",
      "তোমাকে কে বানালো", "কে বানালো তোমাকে",
      // Bengali — "শাকিল কে"
      "শাকিল কে", "শাকিল কে?", "শাকিল কি",
      // Banglish / Roman
      "tor boss ke", "tor boss ki", "tor boss kon",
      "tor malik ke", "tor malik ki",
      "toke baniyese ke", "toke baniyese ki",
      "tomake baniyese ke", "tomake baniyese ki",
      "ke baniyese toke", "ke baniyese tomake",
      "shakil ke", "shakil ki", "shakil kon",
      // English
      "who is your boss", "who is your owner", "who is your admin",
      "who is your creator", "who made you", "who created you",
      "who built you", "who is shakil",
      // Other combos
      "admin কে", "admin কে?", "boss কে", "boss কে?",
      "owner কে", "owner কে?", "কে বস", "কে admin", "কে owner",
      "who is admin", "who is boss", "who is owner",
      "bot er admin", "bot er boss", "bot er owner",
      "বটের বস", "বটের মালিক", "বটের admin", "বটের owner"
    ];

    if (bossTriggers.some(w => body.includes(w))) {
      const replies = [
        "𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹, 𝘁𝗶𝗻𝗶 𝗮𝗺𝗮𝗸𝗲 𝗯𝗮𝗻𝗶𝘆𝗲𝘀𝗲𝗻🐣\n\n👑 𝗢𝗪𝗡𝗘𝗥 ➜ 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪\n🆔 UID ➜ 61590607769212\n🌍 Location ➜ Jhenaidah, Bangladesh",
          "𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹, 𝘁𝗶𝗻𝗶 𝗮𝗺𝗮𝗸𝗲 𝗯𝗮𝗻𝗶𝘆𝗲𝘀𝗲𝗻🐣\n\n💬 তাঁর Facebook ➜ fb.com/61590607769212\n\n━━━━━━━━━━━━\n🤖 Made with ❤️ by 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪",
          "👑 আমার বস হলেন 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪!\n\n𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹, 𝘁𝗶𝗻𝗶 𝗮𝗺𝗮𝗸𝗲 𝗯𝗮𝗻𝗶𝘆𝗲𝘀𝗲𝗻🐣\n\n🔰 তিনিই আমার creator এবং owner।\nতাঁর ইনবক্সে যোগাযোগ করতে পারো।",
          "আমার 𝗕𝗢𝗦𝗦/𝗠𝗔𝗟𝗜𝗞 একজনই —\n\n👑 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 বস!\n\n𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗦𝗵𝗮𝗸𝗶𝗹, 𝘁𝗶𝗻𝗶 𝗮𝗺𝗮𝗸𝗲 𝗯𝗮𝗻𝗶𝘆𝗲𝘀𝗲𝗻🐣\n\n💬 𝗦𝗛𝗔𝗞𝗜𝗟 ছাড়া আমার কোনো বস নেই!"
      ];
      api.setMessageReaction("👑", messageID, () => {}, true);
      return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID, messageID);
    }

    // ════════════════════════════════════════
    // 3.  WRONG NAME CORRECTION
    //     (someone calls the bot's owner by a wrong name)
    // ════════════════════════════════════════
    const wrongNames = ["mahmud", "মাহমুদ", "mahmod", "mahmudul", "siyam", "rahat"];

    const foundWrong = wrongNames.find(n => body.includes(n));
    if (foundWrong) {
      const displayName = foundWrong.charAt(0).toUpperCase() + foundWrong.slice(1);
      const replies = [
        `😎 ভাই, আমার বসের নাম ${displayName} না!\n\n👑 আমার বসের নাম হলো 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗽𝗼𝗼𝗸𝗶𝗲 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 𝗯𝗮𝗯𝘆😘🎀 😄`,
        `❌ আরে ভাই! আমার owner এর নাম ${displayName} না!\n\n✅ সঠিক নাম: 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗽𝗼𝗼𝗸𝗶𝗲 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 𝗯𝗮𝗯𝘆😘🎀 👑`,
        `😅 কে বললো ${displayName}? আমার বসের নাম হলো — 𝗦𝗛𝗔𝗞𝗜𝗟!\n\n💖 𝗔𝗺𝗿 𝗯𝗼𝘀𝘀 𝗽𝗼𝗼𝗸𝗶𝗲 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 𝗯𝗮𝗯𝘆😘🎀 জিন্দাবাদ 🔥`
      ];
      api.setMessageReaction("😎", messageID, () => {}, true);
      return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID, messageID);
    }
  }
};
