module.exports = {
  config: {
    name: "help",
    aliases: ["cmdlist", "menu"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    role: 0,
    countDown: 5,
    category: "system",
    shortDescription: { en: "Show all commands in one page" },
    guide: { en: "{pn}" }
  },

  onStart: async function ({ event, message }) {
    const { commands } = global.GoatBot;

    const threadData = (global.db?.allThreadData || []).find(
      t => t.threadID === event.threadID
    );

    const prefix = threadData?.data?.prefix || global.GoatBot.config.prefix || "-";

    const allCmds = [...commands.keys()].sort();

    let body = "";

    body += `╭━━━━━━━━━━━━━━━━━━━━━━╮\n`;
    body += `┃   ✦ 𝗦𝗛𝗔𝗞𝗜𝗟 𝗕𝗢𝗧 𝗠𝗘𝗡𝗨 ✦   ┃\n`;
    body += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

    body += `⚡ Prefix : ${prefix}\n`;
    body += `🤖 Total Commands : ${commands.size}\n\n`;

    body += `━━━━━━━━━━━━━━━━━━\n`;

    allCmds.forEach((cmd, i) => {
      body += `➤ ${i + 1}. ${cmd}\n`;
    });

    body += `━━━━━━━━━━━━━━━━━━\n\n`;
    body += `✨ Type ${prefix}help for menu\n`;
    body += `🔥 SHAKIL BOT ACTIVE`;

    return message.reply(body);
  }
};