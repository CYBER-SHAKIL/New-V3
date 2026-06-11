const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "delete",
    aliases: ["delcmd", "removecmd"],
    version: "3.1",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 2,
    category: "system",
    shortDescription: {
      en: "Delete a command/event file from the bot"
    },
    longDescription: {
      en: "Permanently deletes a .js file from scripts/cmds or scripts/events folder."
    },
    guide: {
      en: "{pn} <filename.js>\nExample: {pn} help.js"
    }
  },

  langs: {
    en: {
      noFile: "⚠️ Please specify a filename!\nUsage: -delete <filename.js>",
      notFound: "❌ File not found!\n\nSearched in:\n📁 scripts/cmds/%1\n📁 scripts/events/%1",
      success: "✅ Successfully deleted: %1",
      failed: "❌ Failed to delete file: %1"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    if (!args[0]) {
      return message.reply(getLang("noFile"));
    }

    let fileName = args[0].trim();

    if (!fileName.endsWith(".js"))
      fileName += ".js";

    const cmdsPath = path.join(__dirname, "..", "cmds", fileName);
    const eventsPath = path.join(__dirname, "..", "events", fileName);

    let targetPath = null;

    if (fs.existsSync(cmdsPath)) {
      targetPath = cmdsPath;
    }
    else if (fs.existsSync(eventsPath)) {
      targetPath = eventsPath;
    }
    else {
      return message.reply(getLang("notFound", fileName));
    }

    try {
      await fs.remove(targetPath);

      const cmdName = fileName
        .replace(".js", "")
        .toLowerCase();

      if (global.GoatBot?.commands?.has(cmdName)) {
        global.GoatBot.commands.delete(cmdName);
      }

      if (global.GoatBot?.aliases) {
        for (const [alias, command] of global.GoatBot.aliases.entries()) {
          if (
            command === cmdName ||
            command?.config?.name?.toLowerCase?.() === cmdName
          ) {
            global.GoatBot.aliases.delete(alias);
          }
        }
      }

      return message.reply(getLang("success", fileName));

    } catch (err) {
      console.error(err);
      return message.reply(getLang("failed", err.message));
    }
  }
};
