module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "github"],
    version: "3.0",
    author: "𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪",
    countDown: 5,
    role: 0,
    shortDescription: "Fork Goat Bot Repository",
    longDescription: "Get official GOAT-BOT-V3 repository",
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {

    const repoLink = "https://github.com/CYBER-SHAKIL/GOAT-BOT-V3";

    const msg = `
╭━━━━━━━━━━━━━━━━━━╮
      🚀 𝗚𝗢𝗔𝗧 𝗕𝗢𝗧 𝗩𝟯 🚀
╰━━━━━━━━━━━━━━━━━━╯

👑 Owner : 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪

━━━━━━━━━━━━━━━━━━

📦 𝗢𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝘆

🔗 ${repoLink}

━━━━━━━━━━━━━━━━━━

🌟 Features:

✅ Premium System
✅ Advanced Commands
✅ Easy Deploy
✅ GitHub Actions Support
✅ Render Support
✅ Railway Support
✅ Future Updates

━━━━━━━━━━━━━━━━━━

📚 Setup Tutorial

🎥 পরবর্তীতে আপডেট দেওয়া হবে
🎥 টিউটোরিয়াল ভিডিও আপাতত নাই

━━━━━━━━━━━━━━━━━━

💎 Powered By
𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡

❤️ Thanks For Using 𝐆𝐎𝐀𝐓-𝐁𝐎𝐓-𝐕𝟑
━━━━━━━━━━━━━━━━━━
`;

    await message.reply({
      body: msg
    });
  }
};