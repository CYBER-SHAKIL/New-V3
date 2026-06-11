'use strict';
const axios = require('axios');

const BANGLA_JOKES = [
  "এক লোক ডাক্তারের কাছে গেল: 'ডাক্তার সাহেব, আমি যখন ঘুম থেকে উঠি তখন ৩০ মিনিট ধরে কিছুই দেখতে পাই না!'\nডাক্তার: 'আপনি কি চোখ খোলার চেষ্টা করেছেন?'",
  "শিক্ষক: 'বলো, পানি কীভাবে তৈরি হয়?'\nছাত্র: 'স্যার, H2O'\nশিক্ষক: 'আর মেঘ?'\nছাত্র: 'H2O + স্যার এর দীর্ঘশ্বাস!'",
  "বাবা ছেলেকে: 'তুমি বড় হয়ে কী হবে?'\nছেলে: 'ডাক্তার।'\nবাবা: 'কেন?'\nছেলে: 'কারণ ডাক্তাররা অসুস্থ থাকলেও কাজে আসতে হয়। আমি এমন চাকরি চাই যেখানে অসুস্থ হলেই ছুটি পাওয়া যায়!'",
  "ফেসবুকে পোস্ট: 'ভালোবাসা অন্ধ'\nকমেন্ট: 'তাহলে প্রেমিকা কেন সব দেখতে পায়?'",
  "স্বামী: 'তুমি বলেছিলে বিয়ের পরে আমার জন্য সব করবে!'\nস্ত্রী: 'হ্যাঁ, কিন্তু আমি বলিনি কখন করবো!'",
  "শিক্ষক: 'বাক্যে নদী ব্যবহার করো।'\nছাত্র: 'নদীতে মাছ আছে।'\nশিক্ষক: 'আরেকটু বড় করো।'\nছাত্র: 'নদীতে অনেক অনেক মাছ আছে!'",
  "মা ছেলেকে: 'পড়তে বোস!'\nছেলে: 'মা, বৃষ্টি হচ্ছে।'\nমা: 'তাতে কী?'\nছেলে: 'বৃষ্টির দিন মাথা কাজ করে না!'",
  "এক বন্ধু অপরজনকে: 'তুমি এত বোকা কেন?'\nসে: 'ভাই, জন্মের সময় ডাক্তার মাথায় মেরেছিল!'\nবন্ধু: 'কেন?'\nসে: 'মনে হয় খুব রেগে গিয়েছিল!'"
];

module.exports = {
  config: {
    name:     'joke',
    aliases:  ['jokes', 'hasir', 'jk'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 5,
    role:     0,
    shortDescription: { en: 'Get a random funny joke in Bangla or English' },
    category: 'fun',
    guide: { en: '{pn} — random joke\n{pn} en — English joke\n{pn} bn — Bangla joke' }
  },

  langs: {
    en: {
      error: 'Could not get a joke right now. Try again!',
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const lang = (args[0] || '').toLowerCase();

    if (lang === 'bn' || lang === 'bangla') {
      const j = BANGLA_JOKES[Math.floor(Math.random() * BANGLA_JOKES.length)];
      return message.reply(`Bangla Joke\n\n${j}`);
    }

    try {
      const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist&type=twopart', { timeout: 8000 });
      const d = res.data;
      if (!d || d.error) throw new Error('No joke');
      return message.reply(`English Joke\n\n${d.setup}\n\n${d.delivery}`);
    } catch {
      const j = BANGLA_JOKES[Math.floor(Math.random() * BANGLA_JOKES.length)];
      return message.reply(`Bangla Joke\n\n${j}`);
    }
  }
};
