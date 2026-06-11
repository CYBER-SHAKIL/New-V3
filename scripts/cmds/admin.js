const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
        config: {
                name: "admin",
                alias: ["operator"],
                version: "3.0",
                author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
                countDown: 5,
                role: 0,
                shortDescription: { en: "Operator system" },
                longDescription: { en: "Add/remove operator (only owner), list operator (everyone)" },
                category: "box chat",
                guide: {
                        en: " {pn} add @tag\n {pn} remove @tag\n {pn} list"
                }
        },

        langs: {
                en: {
                        added: "✅ Added %1 operator(s):\n%2",
                        alreadyAdmin: "\n⚠️ Already operator:\n%1",
                        missingIdAdd: "⚠️ Mention, reply, or give UID to add operator.",
                        removed: "✅ Removed %1 operator(s):\n%2",
                        notAdmin: "⚠️ Not an operator:\n%1",
                        missingIdRemove: "⚠️ Mention, reply, or give UID to remove operator."
                }
        },

        onStart: async function ({ message, args, usersData, event, getLang }) {

                const senderID = event.senderID;
                const OWNER = ["61590607769212"];
                const isOwner = OWNER.includes(senderID);

                switch (args[0]) {

                        case "add":
                        case "-a": {
                                if (!isOwner)
                                        return message.reply(
`👿━━━━━━━━━━━━━━━━━━👿
  ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 😈
👿━━━━━━━━━━━━━━━━━━👿
Only 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
can add operators.`);

                                let uids = [];
                                if (event.type === "message_reply") {
                                        uids.push(event.messageReply.senderID);
                                } else if (Object.keys(event.mentions).length > 0) {
                                        uids = Object.keys(event.mentions);
                                } else if (args.slice(1).length > 0) {
                                        uids = args.slice(1).filter(arg => !isNaN(arg));
                                }

                                if (uids.length === 0)
                                        return message.reply(getLang("missingIdAdd"));

                                const notAdminIds = [], adminIds = [];
                                for (const uid of uids) {
                                        if (config.adminBot.includes(uid)) adminIds.push(uid);
                                        else notAdminIds.push(uid);
                                }
                                config.adminBot.push(...notAdminIds);

                                const getNames = await Promise.all(
                                        uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                                );
                                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                return message.reply(
                                        (notAdminIds.length > 0 ? getLang("added", notAdminIds.length,
                                                getNames.filter(n => notAdminIds.includes(n.uid)).map(i => `  • ${i.name} (${i.uid})`).join("\n")
                                        ) : "") +
                                        (adminIds.length > 0 ? getLang("alreadyAdmin",
                                                adminIds.map(uid => `  • ${uid}`).join("\n")
                                        ) : "")
                                );
                        }

                        case "remove":
                        case "-r": {
                                if (!isOwner)
                                        return message.reply(
`👿━━━━━━━━━━━━━━━━━━👿
  ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 😈
👿━━━━━━━━━━━━━━━━━━👿
Only 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
can remove operators.`);

                                let uids = [];
                                if (event.type === "message_reply") {
                                        uids.push(event.messageReply.senderID);
                                } else if (Object.keys(event.mentions).length > 0) {
                                        uids = Object.keys(event.mentions);
                                } else if (args.slice(1).length > 0) {
                                        uids = args.slice(1).filter(arg => !isNaN(arg));
                                }

                                if (uids.length === 0)
                                        return message.reply(getLang("missingIdRemove"));

                                const notAdminIds = [], adminIds = [];
                                for (const uid of uids) {
                                        if (config.adminBot.includes(uid)) adminIds.push(uid);
                                        else notAdminIds.push(uid);
                                }
                                for (const uid of adminIds)
                                        config.adminBot.splice(config.adminBot.indexOf(uid), 1);

                                const getNames = await Promise.all(
                                        adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                                );
                                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                return message.reply(
                                        (adminIds.length > 0 ? getLang("removed", adminIds.length,
                                                getNames.map(i => `  • ${i.name} (${i.uid})`).join("\n")
                                        ) : "") +
                                        (notAdminIds.length > 0 ? getLang("notAdmin",
                                                notAdminIds.map(uid => `  • ${uid}`).join("\n")
                                        ) : "")
                                );
                        }

                        case "list":
                        case "-l": {
                                const getNames = await Promise.all(
                                        config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                                );

                                const ownerBlock =
`👿━━━━━━━━━━━━━━━━━━━━━━━━👿
  𝗦𝗛𝗔𝗞𝗜𝗟-𝗕𝗢𝗧-𝗩𝟯 | 𝗔𝗗𝗠𝗜𝗡 𝗟𝗜𝗦𝗧 😈
👿━━━━━━━━━━━━━━━━━━━━━━━━👿

╭──── 👑 𝗢𝗪𝗡𝗘𝗥 ──────────────╮
│  😈 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
│  🆔 61590607769212
╰────────────────────────────╯

╭──── 👿 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥𝗦 (${getNames.length}) ──────╮
${getNames.length > 0
  ? getNames.map((i, idx) => `│  ${idx + 1}. ${i.name || "Unknown"}\n│     🆔 ${i.uid}`).join("\n│\n")
  : "│  (No operators added yet)"}
╰────────────────────────────╯

👿━━━━━━━━━━━━━━━━━━━━━━━━👿`;

                                return message.reply(ownerBlock);
                        }

                        default:
                                return message.SyntaxError();
                }
        }
};