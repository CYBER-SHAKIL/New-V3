const axios = require("axios");

const LOCAL_RIDDLES = [
  { question: "🐅 কোন প্রাণীকে 'বনের রাজা' বলা হয়?", answer: "সিংহ", hints: ["এটা গর্জন করে", "হলুদ রঙের", "Africa তে পাওয়া যায়"] },
  { question: "🌊 পৃথিবীর সবচেয়ে বড় মহাসাগরের নাম কী?", answer: "প্রশান্ত", hints: ["Pacific নামেও পরিচিত", "এশিয়ার পূর্বে", "সবচেয়ে গভীরও"] },
  { question: "🍎 কোন ফলকে 'Doctor দূরে রাখে' বলা হয়?", answer: "আপেল", hints: ["লাল বা সবুজ", "খুব পুষ্টিকর", "Apple নামেও চেনা যায়"] },
  { question: "☀️ সৌরজগতের কেন্দ্রে কী আছে?", answer: "সূর্য", hints: ["আলো ও তাপ দেয়", "বিশাল আগুনের গোলা", "পৃথিবী এটাকে ঘোরে"] },
  { question: "🐬 কোন সামুদ্রিক প্রাণী সবচেয়ে বুদ্ধিমান?", answer: "ডলফিন", hints: ["মানুষের বন্ধু", "পানিতে লাফ দেয়", "Dolphin ইংরেজি"] },
  { question: "🏔️ পৃথিবীর সবচেয়ে উঁচু পাহাড় কোনটি?", answer: "এভারেস্ট", hints: ["Nepal এ অবস্থিত", "8848 মিটার উঁচু", "Everest ইংরেজি নাম"] },
  { question: "🌍 বাংলাদেশের রাজধানী কোথায়?", answer: "ঢাকা", hints: ["বুড়িগঙ্গা নদীর তীরে", "মসজিদের শহর", "Dhaka ইংরেজি"] },
  { question: "🎵 কোন বাদ্যযন্ত্রকে 'সুরের রানী' বলা হয়?", answer: "বাঁশি", hints: ["ফুঁ দিয়ে বাজায়", "বাঁশ দিয়ে তৈরি", "কৃষ্ণ বাজাতেন"] },
  { question: "🦁 কোন প্রাণীর ঘাড়ে কেশর থাকে?", answer: "সিংহ", hints: ["মাংসাশী", "প্রাইডে থাকে", "Lion ইংরেজি"] },
  { question: "🌺 বাংলাদেশের জাতীয় ফুল কোনটি?", answer: "শাপলা", hints: ["পানিতে ফোটে", "সাদা রঙের", "Water lily"] }
];

module.exports = {
  config: {
    name: "dhbc",
    aliases: ["riddle", "quiz2"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    description: { en: "Bangla riddle quiz game" },
    category: "game",
    guide: { en: "{pn} — start a riddle, reply with your answer!" }
  },

  onStart: async function ({ message, event, commandName }) {
    const riddle = LOCAL_RIDDLES[Math.floor(Math.random() * LOCAL_RIDDLES.length)];

    const msg = await message.reply(
      `🧩 𝗥𝗜𝗗𝗗𝗟𝗘 𝗤𝗨𝗜𝗭!\n\n` +
      `❓ ${riddle.question}\n\n` +
      `💡 Hint 1: ${riddle.hints[0]}\n\n` +
      `↩️ Reply with your answer!\n⏰ You have 60 seconds.`
    );

    global.GoatBot.onReply.set(msg.messageID, {
      commandName,
      messageID: msg.messageID,
      author: event.senderID,
      answer: riddle.answer.toLowerCase(),
      hints: riddle.hints,
      hintUsed: 1,
      startTime: Date.now()
    });

    setTimeout(() => {
      if (global.GoatBot.onReply.has(msg.messageID)) {
        global.GoatBot.onReply.delete(msg.messageID);
        message.reply(`⏰ Time's up! The answer was: 𝗮𝗻𝘀𝘄𝗲𝗿: ${riddle.answer}`).catch(() => {});
      }
    }, 60000);
  },

  onReply: async function ({ message, Reply, event }) {
    const { author, answer, hints, hintUsed, messageID, startTime } = Reply;
    if (String(event.senderID) !== String(author))
      return message.reply("⚠️ এটা তোমার quiz না!");

    const userAnswer = (event.body || "").toLowerCase().trim();

    if (userAnswer === "hint" || userAnswer === "?") {
      if (hintUsed < hints.length) {
        Reply.hintUsed++;
        return message.reply(`💡 Hint ${hintUsed + 1}: ${hints[hintUsed]}`);
      }
      return message.reply("❌ No more hints!");
    }

    global.GoatBot.onReply.delete(messageID);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const normalized = s => s.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").trim();

    if (normalized(userAnswer).includes(normalized(answer)) || normalized(answer).includes(normalized(userAnswer))) {
      return message.reply(`🎉 𝗖𝗼𝗿𝗿𝗲𝗰𝘁! ✅\n\n✅ Answer: ${answer}\n⏱️ Time: ${elapsed}s\n\n🔥 Well done!`);
    } else {
      return message.reply(`❌ Wrong answer!\n\n✅ Correct was: ${answer}\n\nTry again with -dhbc!`);
    }
  }
};
