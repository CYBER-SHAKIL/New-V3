'use strict';
const fs = require("fs-extra");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config.json");
const ADMIN_UIDS = ["61590607769212", "61590672960902"];

function isOwner(uid) {
  return ADMIN_UIDS.includes(String(uid));
}

module.exports = {
  config: {
    name: "setprefix",
    aliases: ["prefix", "changeprefix"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 1,
    shortDescription: { en: "Change bot prefix" },
    longDescription: { en: "Change the prefix for this group (admin) or globally (owner). Use 'reset' to restore global prefix." },
    category: "box chat",
    guide: {
      en: "  {pn} <new_prefix>   — change prefix for this group\n"
        + "  {pn} reset          — reset to global prefix\n"
        + "  {pn} global <p>     — change global prefix (owner only)\n"
        + "  {pn}                — show current prefix\n\n"
        + "  Examples:\n"
        + "  {pn} !\n"
        + "  {pn} /\n"
        + "  {pn} .\n"
        + "  {pn} reset"
    }
  },

  onStart: async function ({ api, event, args, message, threadsData }) {
    const { threadID, senderID } = event;
    const currentPrefix = global.utils.getPrefix(threadID);
    const globalPrefix = global.GoatBot.config.prefix;

    if (!args[0]) {
      return message.reply(
        `╔══ 🔑 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢 ══╗\n\n`
        + `📌 This Group : ${currentPrefix}\n`
        + `🌐 Global     : ${globalPrefix}\n\n`
        + `📖 Usage:\n`
        + `  -setprefix !       → set ! as prefix\n`
        + `  -setprefix reset   → reset to global\n`
        + `  -setprefix global ! → change global (owner)\n`
        + `╚═══════════════════════╝`
      );
    }

    const input = args[0].toLowerCase().trim();

    if (input === "reset") {
      await threadsData.set(threadID, null, "data.prefix");
      const threadData = global.db.allThreadData.find(t => t.threadID == threadID);
      if (threadData?.data) threadData.data.prefix = null;
      return message.reply(
        `✅ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗥𝗲𝘀𝗲𝘁!\n\n`
        + `🔄 This group is now using global prefix: ${globalPrefix}`
      );
    }

    if (input === "global") {
      if (!isOwner(senderID))
        return message.reply("❌ Only the bot owner can change the global prefix!");

      const newGlobal = args[1]?.trim();
      if (!newGlobal)
        return message.reply("❌ Usage: -setprefix global <new_prefix>\nExample: -setprefix global !");

      if (newGlobal.length > 5)
        return message.reply("❌ Prefix too long! Max 5 characters.");

      try {
        const config = fs.readJsonSync(CONFIG_PATH);
        config.prefix = newGlobal;
        fs.writeJsonSync(CONFIG_PATH, config, { spaces: 2 });
        global.GoatBot.config.prefix = newGlobal;

        return message.reply(
          `✅ 𝗚𝗹𝗼𝗯𝗮𝗹 𝗣𝗿𝗲𝗳𝗶𝘅 𝗖𝗵𝗮𝗻𝗴𝗲𝗱!\n\n`
          + `🌐 New Global Prefix : ${newGlobal}\n`
          + `📝 All groups without a custom prefix will now use: ${newGlobal}`
        );
      } catch (e) {
        return message.reply("❌ Failed to save global prefix: " + e.message);
      }
    }

    const newPrefix = args[0].trim();

    if (newPrefix.length > 5)
      return message.reply("❌ Prefix too long! Max 5 characters.\nExample: -setprefix !");

    if (newPrefix.length < 1)
      return message.reply("❌ Prefix can't be empty!");

    await threadsData.set(threadID, newPrefix, "data.prefix");

    const threadData = global.db.allThreadData.find(t => t.threadID == threadID);
    if (threadData?.data) threadData.data.prefix = newPrefix;

    return message.reply(
      `✅ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗖𝗵𝗮𝗻𝗴𝗲𝗱!\n\n`
      + `🔑 New Prefix : ${newPrefix}\n`
      + `📌 Group      : This group only\n`
      + `💡 Try it     : ${newPrefix}help\n\n`
      + `🔄 To reset: ${newPrefix}setprefix reset`
    );
  }
};
