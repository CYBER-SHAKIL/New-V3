const fs = require("fs-extra");

module.exports = {
  config: {
    name: "mantion",
    version: "9.0.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 0,
    role: 0,
    shortDescription: "Admin mention reply system ON/OFF",
    longDescription: "Shakil mention system control panel",
    category: "system",
    guide: {
      en: "{pn} on/off"
    }
  },

  onStart: async function ({ message, event, args, threadsData, role }) {

    if (role < 1)
      return message.reply("❌ শুধু গ্রুপ এডমিন এই সিস্টেম কন্ট্রোল করতে পারবে");

    const status = args[0]?.toLowerCase();

    if (!["on", "off"].includes(status))
      return message.reply("📌 ব্যবহার:\nmantion on\nmantion off");

    const threadData = await threadsData.get(event.threadID);

    threadData.mantion = status === "on";

    await threadsData.set(event.threadID, threadData);

    return message.reply(`✅ Mention System ${status.toUpperCase()} করা হয়েছে`);
  },

  onChat: async function ({ event, message, threadsData }) {

    const threadData = await threadsData.get(event.threadID);

    if (threadData.mantion === undefined) {
      threadData.mantion = true;
      await threadsData.set(event.threadID, threadData);
    }

    if (threadData.mantion === false) return;

    // 🔥 VIDEO POOL (ADD NEW VIDEOS HERE)
    const videos = [
      "https://i.imgur.com/6Q2REDp.jpeg",
      "https://files.catbox.moe/qg25b3.mp4",
      "https://files.catbox.moe/dslsa0.jpg",
      ""
      // ,"https://files.catbox.moe/video2.mp4"
      // ,"https://files.catbox.moe/video3.mp4"
    ];

    const admins = [
      {
        uid: "61590607769212",
        names: [
          "মিৃঁ'স্টাৃঁ'রৃঁ 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪",
          "ヽ｟𝗖𝗘𝗢｠▁▁ዐዐዐ 🙁😚☺️👿"
        ]
      }
    ];

    const senderID = String(event.senderID);

    if (admins.some(a => a.uid === senderID)) return;

    const text = (event.body || "").toLowerCase().trim();
    const mentionedIDs = event.mentions ? Object.keys(event.mentions) : [];

    const isMentioning = admins.some(admin =>
      mentionedIDs.includes(admin.uid) ||
      text.includes(admin.uid) ||
      admin.names.some(name =>
        text.includes(name.toLowerCase())
      )
    );

    if (!isMentioning) return;

    const captions = [
      "Mantion_দিস না _𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 বস এর মন মন ভালো নেই আস্কে-!💔🥀",
      "- আমার বস শাকিল এর সাথে কেউ সেক্স করে না থুক্কু টেক্স করে নাহ🫂💔",
      "👉আমার বস ♻️ 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 এখন বিজি আছে । তার ইনবক্সে এ মেসেজ দিয়ে রাখো 🔰 বস ফ্রি হলে আসবে🧡😁😜🐒",
      "বস 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 কে এত মেনশন না দিয়ে বক্স আসো হট করে দিবো🤷‍ঝাং 😘🥒",
      "বস শাকিল কে Mantion দিলে উত্তর দিমু না 😼🔨",
      "𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 বস এখন বিজি জা বলার আমাকে বলতে পারেন_!!😼🥰",
      "𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 বস কে এতো মেনশন নাহ দিয়া বস কে একটা জি এফ দে 😒 😏",
      "Mantion_না দিয়ে বস 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 এর সাথে সিরিয়াস প্রেম করতে চাইলে ইনবক্স",
      "বস 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 কে মেনশন দিসনা পারলে একটা জি এফ দে",
      "বাল পাকনা Mantion_দিস না বস শাকিল প্রচুর বিজি আছে 🥵🥀🤐",
      "চুমু খাওয়ার বয়স টা আমার বস শাকিল চকলেট🍫খেয়ে উড়িয়ে দিল 🤗"
    ];


    const randomCaption =
      captions[Math.floor(Math.random() * captions.length)];

    const randomVideo =
      videos[Math.floor(Math.random() * videos.length)];

    const replyBody = `
━━━━━━━━━━━━━━━━━━━━
${randomCaption}
━━━━━━━━━━━━━━━━━━━━

👑 𝗢𝗪𝗡𝗘𝗥 ➜ 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪
`;

    try {
      const stream = await global.utils.getStreamFromURL(randomVideo);
      return message.reply({ body: replyBody, attachment: stream });
    } catch (err) {
      return message.reply(replyBody);
    }
  }
};