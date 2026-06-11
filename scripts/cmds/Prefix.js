'use strict';
const axios = require('axios');
const path  = require('path');
const fs    = require('fs-extra');

// ── Same GIF list as original ─────────────────────────────────────────────
const GIFS = [
  "https://i.imgur.com/GZsIMDD.gif",
  "https://i.imgur.com/TeCvnYx.gif",
  "https://i.imgur.com/61hTdN3.gif",
  "https://i.imgur.com/oYpzLg0.gif",
  "https://i.imgur.com/MOuHXRh.gif",
  "https://i.imgur.com/NWrwi30.gif",
  "https://i.imgur.com/QklhKzM.gif",
  "https://i.imgur.com/TeCvnYx.gif",
  "https://i.imgur.com/YUKbZeN.gif",
  "https://i.imgur.com/GPd6rdT.gif",
  "https://i.imgur.com/DT4rWmV.gif",
  "https://i.imgur.com/L8C6OKO.gif",
  "https://i.imgur.com/EJC0nN5.gif",
  "https://i.imgur.com/1TT7J4s.gif",
  "https://i.imgur.com/aHExnbz.gif",
  "https://i.imgur.com/T4nc1dC.gif",
  "https://i.imgur.com/wtS2oC0.gif",
  "https://i.imgur.com/ZplnzRl.gif",
  "https://i.imgur.com/Kj9cK5G.gif",
  "https://i.imgur.com/lbaSgl2.gif"
];

// ── Same trigger words as original ────────────────────────────────────────
const TRIGGERS = [
  "prefix", "mprefix", "mpre", "bot prefix", "what is the prefix", "bot name",
  "how to use bot", "bot not working", "bot is offline", "prefx", "prfix",
  "perfix", "bot not talking", "where is bot", "bot dead", "bots dead",
  "dấu lệnh", "daulenh", "what prefix", "freefix", "what is bot", "what prefix bot",
  "how use bot", "where are the bots", "where prefix"
];

function getPrefix(threadID) {
  try {
    const td = global.db?.allThreadData?.find(t => t.threadID == threadID);
    return td?.data?.prefix || global.GoatBot?.config?.prefix || "-";
  } catch (_) {
    return global.GoatBot?.config?.prefix || "-";
  }
}

async function sendPrefixCard(api, threadID) {
  const prefix = getPrefix(threadID);

  // ── Exact original message design ─────────────────────────────────────
  const messageBody =
`🌐 𝗦𝘆𝘀𝘁𝗲𝗺 𝗽𝗿𝗲𝗳𝗶𝘅:   ${prefix}  \n🛸 𝗬𝗼𝘂𝗿 𝗯𝗼𝘅 𝗰𝗵𝗮𝘁 𝗽𝗿𝗲𝗳𝗶𝘅:   ${prefix}
 `;

  const gifUrl  = GIFS[Math.floor(Math.random() * GIFS.length)];
  const gifPath = path.join(__dirname, `prefix_tmp_${Date.now()}.gif`);

  try {
    const res = await axios.get(gifUrl, { responseType: 'arraybuffer', timeout: 8000 });
    await fs.writeFile(gifPath, Buffer.from(res.data));
    await api.sendMessage(
      { body: messageBody, attachment: fs.createReadStream(gifPath) },
      threadID,
      () => fs.remove(gifPath).catch(() => {})
    );
  } catch (_) {
    // GIF download failed — send text only, no crash
    api.sendMessage(messageBody, threadID);
  }
}

module.exports = {
  config: {
    name: "prefix",
    version: "2.2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show the bot prefix" },
    longDescription:  { en: "Displays current prefix with a random GIF" },
    category: "system",
    guide: { en: "Just type '{pn}' or say 'prefix' without the prefix symbol" }
  },

  // ── -prefix command ──────────────────────────────────────────────────────
  onStart: async function ({ api, event }) {
    await sendPrefixCard(api, event.threadID);
  },

  // ── Keyword trigger (no prefix needed) ──────────────────────────────────
  onChat: async function ({ api, event, isUserCallCommand }) {
    if (isUserCallCommand) return; // already handled by onStart — no double reply
    if (!event.body) return;
    const lowerBody = event.body.toLowerCase().trim();
    if (!TRIGGERS.some(t => lowerBody === t || lowerBody.includes(t))) return;
    await sendPrefixCard(api, event.threadID);
  }
};
