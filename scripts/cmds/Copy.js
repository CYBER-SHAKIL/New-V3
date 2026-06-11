module.exports = {
  config: {
    name: "copy",
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: "Copy spam",
    longDescription: "Repeat text many times",
    category: "fun",
    guide: {
      en: "copy 500x hello"
    }
  },

  _AUTHOR: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",

  checkIntegrity(config) {
    return config.author === this._AUTHOR;
  },

  onStart: async function ({ message, event, args }) {

    // 🔐 safe author lock
    if (!this.checkIntegrity(module.exports.config)) {
      return message.reply("⛔ Command modified detected! Disabled.");
    }

    if (!args[0]) {
      return message.reply(
        "😹 | 𝗦𝗛𝗔𝗞𝗜𝗟 𝗕𝗢𝗦𝗦 𝗸𝗲 𝗯𝗼𝗹 𝗸𝗶𝘃𝗮𝗯𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝘂𝘀𝗲 𝗸𝗼𝗿𝘁𝗲 𝗵𝗼𝗶 𝘀𝗶𝗸𝗵𝗶𝘆𝗲 𝗱𝗶𝗯𝗲 𝗮𝗯𝗮𝗹🤣😎\n\nExample:\ncopy 500x hello"
      );
    }

    const match = args[0].match(/^(\d+)x$/i);

    if (!match) {
      return message.reply(
        "😹 | 𝗫 𝗸𝗼𝗶 𝗯𝗼𝗹𝗼𝗱? 🤣\n\nExample:\ncopy 200x hello"
      );
    }

    const count = parseInt(match[1]);

    if (count < 1 || count > 1000) {
      return message.reply("⚠️ | Limit only 1x - 1000x");
    }

    let text = args.slice(1).join(" ");

    if (!text && event.messageReply) {
      text = event.messageReply.body;
    }

    if (!text) {
      return message.reply("🙄 | Text koi?\nReply dao nahole text lekho 🐸");
    }

    // smart chunk system
    let chunkSize = 250;

    if (text.length > 20) chunkSize = 150;
    if (text.length > 50) chunkSize = 80;

    for (let i = 0; i < count; i += chunkSize) {

      const current = Math.min(chunkSize, count - i);

      const spamText = Array(current)
        .fill(text)
        .join("\n");

      await message.reply(spamText);
    }
  }
};