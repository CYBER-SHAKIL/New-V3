const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "gay",
        aliases: ["gay"],
        version: "2.0",
        author: "SHAKIL-HOSSEN",
        countDown: 5,
        role: 0,
        shortDescription: "rainbowify someone's avatar",
        longDescription: "Places a rainbow/gay flag overlay on the target's profile picture.",
        category: "fun",
        guide: "{pn} [@mention | reply]"
    },

    onStart: async function ({ message, event, api }) {
        const mentions = Object.keys(event.mentions || {});
        const targetID = event.type === "message_reply"
            ? event.messageReply.senderID
            : mentions.length > 0
                ? mentions[0]
                : event.senderID;

        const targetName = event.type === "message_reply"
            ? (event.messageReply.senderName || "User")
            : mentions.length > 0
                ? Object.values(event.mentions)[0]
                : "You";

        try {
            message.reaction("⏳", event.messageID);

            const avatarBuf = await fetchAvatar(targetID);
            const outPath = path.join(__dirname, "cache", `gay_${targetID}_${Date.now()}.png`);
            await applyRainbowOverlay(avatarBuf, outPath);

            message.reaction("✅", event.messageID);
            await message.reply({
                body: `🏳️‍🌈 ${targetName} is gay! 🌈`,
                attachment: fs.createReadStream(outPath)
            });
            setTimeout(() => { try { fs.unlinkSync(outPath); } catch (_) {} }, 5000);
        } catch (err) {
            console.error("[gay.js]", err.message);
            message.reaction("❌", event.messageID);
            message.reply("❌ Profile picture load করা সম্ভব হয়নি। আবার চেষ্টা করো।");
        }
    }
};

async function fetchAvatar(uid) {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    return Buffer.from(res.data, 'binary');
}

async function applyRainbowOverlay(avatarBuf, outPath) {
    const avatar = await loadImage(avatarBuf);
    const SIZE = 512;
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 0, 0, SIZE, SIZE);
    ctx.restore();

    const stripeHeight = SIZE / 6;
    const colors = ['#FF0018', '#FFA52C', '#FFFF41', '#008018', '#0000F9', '#86007D'];
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = 0.40;
        ctx.fillRect(0, i * stripeHeight, SIZE, stripeHeight);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const cacheDir = path.dirname(outPath);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
}
