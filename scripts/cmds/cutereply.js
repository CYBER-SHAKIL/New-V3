const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const AUTHOR = "SHAKIL-HOSSEN";

exports.config = {
  name: "cutereply",
  version: "2.2.0",
  author: AUTHOR,
  countDown: 0,
  role: 0,
  shortDescription: "Reply with text + image on trigger",
  longDescription: "Trigger মেসেজে reply দিয়ে text + image পাঠাবে",
  category: "system"
};

const cooldown = 10000; // 10 sec
const last = {};

const TRIGGERS = [
  {
    words: ["shakil", "Shakil", "SHAKIL", "শাকিল"],
    text: "👉আমার বস♻️ 𝗦𝗛𝗔𝗞𝗜𝗟 এখন বিজি আছে । তার ইনবক্সে মেসেজ দিয়ে রাখো [https://www.facebook.com/61588178231072] 🔰 ♪√বস ফ্রি হলে আসবে,! 😜🐒",
    images: []
  },
  {
    words: ["@Samia", "@Samia R jamai", "@সিৃঁ'জুৃঁ'কাৃঁ সিৃঁ'জুৃঁ"],
    text: "-আমাকে মেনশন দিয়ে লাভ নাই- কারণ আমি একটা মেসেঞ্জার চ্যাট রোবট,🤖 আমাকে বানানো হয়েছে শুধুমাত্র আপনাদেরকে বিনোদনের জন্য, আমাকে বানিয়েছেন আমার বস SHAKIL-😽🫶 [https://www.facebook.com/61588178231072] 🌺",
    images: []
  }
];

exports.onStart = async function () {};

exports.onChat = async function ({ event, api }) {
  try {
    const { threadID, senderID, messageID } = event;
    const body = (event.body || "").toLowerCase().trim();
    if (!body) return;

    if (senderID === api.getCurrentUserID()) return;

    const now = Date.now();
    if (last[threadID] && now - last[threadID] < cooldown) return;

    let matched = null;
    for (const t of TRIGGERS) {
      if (t.words.some(w => body.includes(w.toLowerCase()))) {
        matched = t;
        break;
      }
    }
    if (!matched) return;

    last[threadID] = now;

    const validImages = (matched.images || []).filter(u => u && u.trim().startsWith("http"));

    if (validImages.length === 0) {
      return api.sendMessage({ body: matched.text }, threadID, messageID);
    }

    const imgUrl = validImages[Math.floor(Math.random() * validImages.length)];
    const imgName = `cutereply_${Date.now()}_${path.basename(imgUrl)}`;
    const imgPath = path.join(__dirname, "cache", imgName);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    try {
      await download(imgUrl, imgPath);
      api.sendMessage(
        { body: matched.text, attachment: fs.createReadStream(imgPath) },
        threadID,
        () => { try { fs.unlinkSync(imgPath); } catch (_) {} },
        messageID
      );
    } catch (_) {
      api.sendMessage({ body: matched.text }, threadID, messageID);
    }

  } catch (e) {
    console.log("[cutereply] error:", e.message);
  }
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error("HTTP " + res.statusCode));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}
