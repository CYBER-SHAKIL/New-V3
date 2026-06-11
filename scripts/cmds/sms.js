const axios = require("axios");
const deltaNext = 5;

function expToLevel(exp) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

const SMS_APIS = [
  (num) => `https://smsbd-bomber.vercel.app/api/bomb?num=${num}&count=1`,
  (num) => `https://bd-sms-bomb.vercel.app/bomb?number=${num}&count=1`,
  (num) => `https://sms-bomber-bd.vercel.app/api?num=${num}&c=1`,
];

module.exports = {
  config: {
    name: "sms",
    version: "2.0",
    author: "MD_SHAKIL",
    countDown: 15,
    role: 0,
    shortDescription: { en: "SMS API call (BD)" },
    category: "tools",
    guide: { en: "{pn} bom 01xxxxxxxxx" }
  },

  onStart: async function ({ event, message, args, usersData }) {
    const sub = args[0];
    const number = args[1];

    if (sub !== "bom") {
      return message.reply("📱 Usage: sms bom 01xxxxxxxxx");
    }

    if (!number || !/^01[3-9]\d{8}$/.test(number)) {
      return message.reply("📵 বৈধ BD নাম্বার দিন\nউদাহরণ: sms bom 01XXXXXXXXX");
    }

    const senderID = event.senderID;

    const userData = await usersData.get(senderID);
    const exp = userData?.exp || 0;
    const balance = userData?.money || 0;
    const level = expToLevel(exp);

    if (level < 2) {
      return message.reply("🚫 Level 2+ লাগবে এই command ব্যবহার করতে");
    }

    if (balance < 100) {
      return message.reply(`❌ কম coins আছে\n💵 তোমার কাছে: ${balance}\n📝 দরকার: 100`);
    }

    await usersData.set(senderID, { money: balance - 100 });
    await message.reply(`📡 Request পাঠানো হচ্ছে...\n📩 Target: ${number}`);

    for (const apiBuilder of SMS_APIS) {
      try {
        const url = apiBuilder(number);
        const res = await axios.get(url, { timeout: 15000 });
        const data = res.data;

        if (data && (data.success || data.status === "success" || data.sent || data.message)) {
          return message.reply(
            `✅ Request accepted!\n` +
            `📩 Target: ${number}\n` +
            `ℹ️ Message: ${data.message || data.info || "SMS পাঠানো হয়েছে"}`
          );
        }
      } catch (_) { continue; }
    }

    // All APIs failed — refund coins
    await usersData.set(senderID, { money: balance });
    return message.reply("❌ SMS API বর্তমানে বন্ধ আছে।\n💵 তোমার 100 coins ফেরত দেওয়া হয়েছে।");
  }
};
