'use strict';
const axios = require('axios');

const BANGLA_ADVICE = [
  "প্রতিদিন একটু একটু করে শিখলে, একদিন অনেক কিছু জানবে।",
  "সফলতা মানে কখনো না পড়া নয়, পড়ে উঠে দাঁড়ানো।",
  "অন্যকে সাহায্য করলে নিজেও এগিয়ে যাও।",
  "সময়ের কাজ সময়ে করো — পরে করবো মানে কখনো করবো না।",
  "রেগে গেলে চুপ থাকো — রাগের মাথায় বলা কথা পরে কাঁদায়।",
  "স্বপ্ন দেখো, কিন্তু কাজও করো — শুধু স্বপ্নে সফলতা আসে না।",
  "প্রতিটি ব্যর্থতা তোমাকে সফলতার কাছে নিয়ে যায়।",
  "বড় কাজ শুরু করো ছোট ছোট পদক্ষেপে।",
  "অন্যের সাথে তুলনা কোরো না — তোমার পথ তোমার নিজের।",
  "ধৈর্য ধরো — ভালো ফল আসতে সময় লাগে।"
];

module.exports = {
  config: {
    name:     'advice',
    aliases:  ['tip', 'inspire', 'motivation', 'motivate'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 5,
    role:     0,
    shortDescription: { en: 'Get motivational advice or life tips' },
    category: 'fun',
    guide: { en: '{pn} — random advice\n{pn} bn — Bangla advice' }
  },

  onStart: async function ({ message, args }) {
    const lang = (args[0] || '').toLowerCase();

    if (lang === 'bn' || lang === 'bangla') {
      const a = BANGLA_ADVICE[Math.floor(Math.random() * BANGLA_ADVICE.length)];
      return message.reply(`Advice\n\n${a}`);
    }

    try {
      const res = await axios.get('https://api.adviceslip.com/advice', { timeout: 8000 });
      const txt = res.data?.slip?.advice;
      if (!txt) throw new Error();
      return message.reply(`Life Advice\n\n"${txt}"`);
    } catch {
      const a = BANGLA_ADVICE[Math.floor(Math.random() * BANGLA_ADVICE.length)];
      return message.reply(`Advice\n\n${a}`);
    }
  }
};
