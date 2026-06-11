const axios = require("axios");

const LOCAL_HADITHS = [
  { text: "নিশ্চয়ই প্রতিটি কাজ নিয়তের উপর নির্ভরশীল।", source: "সহীহ বুখারী, হাদিস নং ১" },
  { text: "তোমাদের মধ্যে সর্বোত্তম সে, যে কুরআন শিক্ষা করে এবং অন্যকে শিক্ষা দেয়।", source: "সহীহ বুখারী, হাদিস নং ৫০২৭" },
  { text: "মুসলিম সে ব্যক্তি যার হাত ও মুখ থেকে অন্য মুসলিম নিরাপদ।", source: "সহীহ বুখারী, হাদিস নং ১০" },
  { text: "সহজ করো, কঠিন করো না। সুসংবাদ দাও, বিতাড়িত করো না।", source: "সহীহ বুখারী, হাদিস নং ৬৯" },
  { text: "তোমরা যমীনে যারা আছে তাদের উপর দয়া করো, আসমানে যিনি আছেন তিনি তোমাদের উপর দয়া করবেন।", source: "তিরমিযী, হাদিস নং ১৯২৪" },
  { text: "প্রতিবেশীর সাথে ভালো ব্যবহার করো।", source: "সহীহ বুখারী, হাদিস নং ৬০১৬" },
  { text: "সত্য শান্তির দিকে পথ দেখায়, আর শান্তি জান্নাতের দিকে নিয়ে যায়।", source: "সহীহ বুখারী, হাদিস নং ৬০৯৪" },
  { text: "কেউ যদি আল্লাহ ও পরকালে বিশ্বাস রাখে, সে যেন ভালো কথা বলে, নইলে চুপ থাকে।", source: "সহীহ বুখারী, হাদিস নং ৬১৩৫" },
  { text: "আমানতদার না হলে তার ঈমান নেই, আর প্রতিশ্রুতি পালন না করলে তার দ্বীন নেই।", source: "মুসনাদ আহমাদ, হাদিস নং ১২৩৮৩" },
  { text: "দুনিয়ায় এমনভাবে থাকো যেন তুমি একজন মুসাফির বা পথচারী।", source: "সহীহ বুখারী, হাদিস নং ৬৪১৬" },
  { text: "সবচেয়ে ভালো মানুষ সে যে মানুষের জন্য সবচেয়ে বেশি উপকারী।", source: "আল-মু'জামুল আওসাত, হাদিস নং ৫৭৮৭" },
  { text: "যে ব্যক্তি লজ্জা করে না, সে যা ইচ্ছা করতে পারে।", source: "সহীহ বুখারী, হাদিস নং ৩৪৮৩" },
  { text: "হাসিমুখে তোমার ভাইয়ের সাথে সাক্ষাৎ করাও সদকা।", source: "তিরমিযী, হাদিস নং ১৯৫৬" },
  { text: "শক্তিশালী সে নয় যে কুস্তিতে জেতে; বরং শক্তিশালী সে যে রাগের সময় নিজেকে নিয়ন্ত্রণ করতে পারে।", source: "সহীহ বুখারী, হাদিস নং ৬১১৪" },
  { text: "যে ব্যক্তি আল্লাহকে খুশি করতে গিয়ে মানুষকে অসন্তুষ্ট করে, আল্লাহ তার পক্ষ থেকে মানুষকে সন্তুষ্ট করবেন।", source: "তিরমিযী, হাদিস নং ২৪১৪" },
  { text: "নিজের জন্য যা পছন্দ করো, তোমার ভাইয়ের জন্যও তা পছন্দ করো।", source: "সহীহ বুখারী, হাদিস নং ১৩" },
  { text: "পরিষ্কার-পরিচ্ছন্নতা ঈমানের অংশ।", source: "সহীহ মুসলিম, হাদিস নং ২২৩" },
  { text: "যে কেউ বিশ্বাস করে আল্লাহ তার জন্য একটি পথ বের করে দেন।", source: "সূরা তালাক: ২-৩" },
  { text: "দোয়া হলো ইবাদতের মস্তিষ্ক।", source: "তিরমিযী, হাদিস নং ৩৩৭১" },
  { text: "জ্ঞান অর্জন করা প্রতিটি মুসলিমের উপর ফরয।", source: "ইবনে মাজাহ, হাদিস নং ২২৪" }
];

const getApiBase = async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json", { timeout: 5000 });
    return res.data.mahmud || null;
  } catch {
    return null;
  }
};

module.exports = {
  config: {
    name: "hadis",
    aliases: ["hadith"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟",
    countDown: 5,
    role: 0,
    category: "islamic",
    shortDescription: { en: "Random Bangla Hadis" },
    longDescription: { en: "Sends a random Bangla Hadis with source" },
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {
    try {
      const base = await getApiBase();
      if (base) {
        const res = await axios.get(`${base}/api/hadis`, { timeout: 8000 });
        const hadis = res.data;
        if (hadis?.text) {
          return message.reply(`📖 হাদিস:\n\n${hadis.text}\n\n📚 সূত্র: ${hadis.source || "অজ্ঞাত"} 🖤`);
        }
      }
    } catch (_) {}

    const hadis = LOCAL_HADITHS[Math.floor(Math.random() * LOCAL_HADITHS.length)];
    return message.reply(`📖 হাদিস:\n\n${hadis.text}\n\n📚 সূত্র: ${hadis.source} 🖤`);
  }
};
