module.exports = {
  config: {
    name: "help2",
    aliases: ["cmdlist2"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    role: 0,
    countDown: 3,
    category: "system",
    shortDescription: { en: "Command list with 2 pages" }
  },

  onStart: async function ({ event, message }) {
    const { commands } = global.GoatBot;
    const allCmds = [...commands.keys()].sort();

    const page1 = allCmds.slice(0, Math.ceil(allCmds.length / 2));
    const page2 = allCmds.slice(Math.ceil(allCmds.length / 2));

    const text = buildPage(page1, page2, 1);

    const msg = await message.reply(text);

    global.GoatBot.onReply.set(msg.messageID, {
      commandName: "help2",
      author: event.senderID,
      page: 1
    });
  },

  onReply: async function ({ event, message, Reply }) {
    if (event.senderID !== Reply.author) return;

    const { commands } = global.GoatBot;
    const allCmds = [...commands.keys()].sort();

    const page1 = allCmds.slice(0, Math.ceil(allCmds.length / 2));
    const page2 = allCmds.slice(Math.ceil(allCmds.length / 2));

    let page = Reply.page;

    const body = (event.body || "").toLowerCase();

    if (body === "next" || body === "2") page = 2;
    else if (body === "back" || body === "1") page = 1;
    else return;

    const text = buildPage(page1, page2, page);

    const msg = await message.reply(text);

    global.GoatBot.onReply.set(msg.messageID, {
      commandName: "help2",
      author: event.senderID,
      page
    });
  }
};

function buildPage(page1, page2, page) {
  const list = page === 1 ? page1 : page2;

  let body = "";

  body += `╭━━━━━━━━━━━━━━━━━━╮\n`;
  body += `┃  📋 SHAKIL BOT MENU  ┃\n`;
  body += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;

  body += `📄 Page: ${page}/2\n\n`;

  list.forEach((cmd, i) => {
    body += `➤ ${cmd}\n`;
  });

  body += `\n━━━━━━━━━━━━━━━━━━\n`;

  if (page === 1) body += `➡ Reply: next\n📖 Page 2`;
  else body += `⬅ Reply: back\n📖 Page 1`;

  return body;
}