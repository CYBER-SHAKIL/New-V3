                        const axios = require("axios");

                        const triggerWords = [
                          "বট",
                          "bot",
                          "shakil",
                          "baby",
                          "bby",
                          "শাকিল",
                          "bbu",
                          "jan",
                          "sona",
                          "জান",
                          "জানু",
                          "বেবি",
                          "janu",
                          "bbz"
                        ];

                        // =======================
                        // BASE API URL
                        // =======================
                        const baseApiUrl = async () => {
                          try {
                            const res = await axios.get(
                              "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
                            );

                            return res.data.mahmud || "https://hinata-rest-api.onrender.com";
                          } catch (e) {
                            console.log("Base URL Error:", e.message);
                            return "https://hinata-rest-api.onrender.com";
                          }
                        };

                        module.exports = {
                          config: {
                            name: "shakil",
                            aliases: ["baby", "bby", "bbu", "jan", "janu", "bbz", "শাকিল"],
                            version: "2.0",
                            author: "SHAKIL-HOSSEN",
                            countDown: 2,
                            role: 0,

                            shortDescription: {
                              en: "Advanced AI Chat Bot"
                            },

                            longDescription: {
                              en: "Chat with Shakil AI and teach it new things"
                            },

                            category: "chat",

                            guide: {
                              en:
                                "{pn} hi\n" +
                                "{pn} teach question - answer\n" +
                                "{pn} edit question - new answer\n" +
                                "{pn} remove question - index\n" +
                                "{pn} msg question\n" +
                                "{pn} list\n" +
                                "{pn} list all"
                            }
                          },

                          langs: {
                            en: {
                              noInput: "🥺 | Bolo baby...",
                              teachUsage: "❌ | Usage:\nshakil teach question - answer",
                              teachSuccess:
                                "✅ Successfully taught!\n📝 Question: %1\n💬 Answer: %2\n👤 Teacher: %3\n📚 Total Data: %4",
                              editUsage: "❌ | Usage:\nshakil edit question - new answer",
                              editSuccess:
                                "✅ Answer updated successfully!\n📝 Question: %1\n💬 New Answer: %2",
                              removeUsage: "❌ | Usage:\nshakil remove question - index",
                              error: "❌ Error: %1"
                            }
                          },

                          // =======================
                          // MAIN COMMAND
                          // =======================
                          onStart: async function ({
                            api,
                            event,
                            args,
                            usersData,
                            getLang,
                            commandName
                          }) {
                            try {
                              const uid = event.senderID;

                              if (!args[0]) {
                                return api.sendMessage(
                                  getLang("noInput"),
                                  event.threadID,
                                  (err, info) => {
                                    if (!err) {
                                      global.GoatBot.onReply.set(info.messageID, {
                                        commandName,
                                        author: uid
                                      });
                                    }
                                  },
                                  event.messageID
                                );
                              }

                              const baseUrl = await baseApiUrl();
                              const action = args[0].toLowerCase();

                              // =======================
                              // TEACH
                              // =======================
                              if (action === "teach") {
                                const input = args.slice(1).join(" ");

                                const parts = input.split(" - ");

                                if (parts.length < 2) {
                                  return api.sendMessage(
                                    getLang("teachUsage"),
                                    event.threadID,
                                    event.messageID
                                  );
                                }

                                const trigger = parts[0];
                                const responses = parts.slice(1).join(" - ");

                                const res = await axios.post(`${baseUrl}/api/jan/teach`, {
                                  trigger,
                                  responses,
                                  userID: uid
                                });

                                const name = await usersData.getName(uid);

                                return api.sendMessage(
                                  getLang(
                                    "teachSuccess",
                                    trigger,
                                    responses,
                                    name,
                                    res.data.count || 0
                                  ),
                                  event.threadID,
                                  event.messageID
                                );
                              }

                              // =======================
                              // EDIT
                              // =======================
                              if (action === "edit") {
                                const input = args.slice(1).join(" ");

                                const parts = input.split(" - ");

                                if (parts.length < 2) {
                                  return api.sendMessage(
                                    getLang("editUsage"),
                                    event.threadID,
                                    event.messageID
                                  );
                                }

                                const oldTrigger = parts[0];
                                const newResponse = parts.slice(1).join(" - ");

                                await axios.put(`${baseUrl}/api/jan/edit`, {
                                  oldTrigger,
                                  newResponse
                                });

                                return api.sendMessage(
                                  getLang("editSuccess", oldTrigger, newResponse),
                                  event.threadID,
                                  event.messageID
                                );
                              }

                              // =======================
                              // REMOVE
                              // =======================
                              if (action === "remove") {
                                const input = args.slice(1).join(" ");

                                const parts = input.split(" - ");

                                if (parts.length < 2) {
                                  return api.sendMessage(
                                    getLang("removeUsage"),
                                    event.threadID,
                                    event.messageID
                                  );
                                }

                                const trigger = parts[0];
                                const index = parseInt(parts[1]);

                                if (isNaN(index)) {
                                  return api.sendMessage(
                                    "❌ Invalid index number.",
                                    event.threadID,
                                    event.messageID
                                  );
                                }

                                const res = await axios.delete(`${baseUrl}/api/jan/remove`, {
                                  data: {
                                    trigger,
                                    index
                                  }
                                });

                                return api.sendMessage(
                                  res.data.message || "✅ Removed successfully.",
                                  event.threadID,
                                  event.messageID
                                );
                              }

                              // =======================
                              // SEARCH MESSAGE
                              // =======================
                              if (action === "msg") {
                                const searchText = args.slice(1).join(" ");

                                if (!searchText) {
                                  return api.sendMessage(
                                    "❌ Please provide a search text.",
                                    event.threadID,
                                    event.messageID
                                  );
                                }

                                try {
                                  const res = await axios.get(`${baseUrl}/api/jan/msg`, {
                                    params: {
                                      userMessage: searchText
                                    }
                                  });

                                  return api.sendMessage(
                                    res.data.message || "❌ No reply found.",
                                    event.threadID,
                                    event.messageID
                                  );
                                } catch (e) {
                                  return api.sendMessage(
                                    "❌ Failed to search message.",
                                    event.threadID,
                                    event.messageID
                                  );
                                }
                              }

                              // =======================
                              // LIST
                              // =======================
                              if (action === "list") {
                                const endpoint =
                                  args[1] && args[1].toLowerCase() === "all"
                                    ? "/list/all"
                                    : "/list";

                                const res = await axios.get(`${baseUrl}/api/jan${endpoint}`);

                                // LIST ALL
                                if (args[1] && args[1].toLowerCase() === "all") {
                                  const data = Object.entries(res.data.data || {});

                                  if (!data.length) {
                                    return api.sendMessage(
                                      "❌ No teacher data found.",
                                      event.threadID,
                                      event.messageID
                                    );
                                  }

                                  let msg = "👑 | TOP TEACHERS\n\n";

                                  const sorted = data
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 30);

                                  for (let i = 0; i < sorted.length; i++) {
                                    const [uID, count] = sorted[i];

                                    let name;

                                    try {
                                      name = await usersData.getName(uID);
                                    } catch {
                                      name = "Unknown User";
                                    }

                                    msg += `${i + 1}. ${name} — ${count}\n`;
                                  }

                                  return api.sendMessage(
                                    msg,
                                    event.threadID,
                                    event.messageID
                                  );
                                }

                                return api.sendMessage(
                                  res.data.message || "❌ No data.",
                                  event.threadID,
                                  event.messageID
                                );
                              }

                              // =======================
                              // NORMAL AI CHAT
                              // =======================
                              const userText = args.join(" ");

                              const res = await axios.post(`${baseUrl}/api/hinata`, {
                                text: userText,
                                style: 3,
                                attachments: event.attachments || []
                              });

                              return api.sendMessage(
                                res.data.message || "😔 No response.",
                                event.threadID,
                                (err, info) => {
                                  if (!err) {
                                    global.GoatBot.onReply.set(info.messageID, {
                                      commandName,
                                      author: uid
                                    });
                                  }
                                },
                                event.messageID
                              );
                            } catch (err) {
                              console.log(err);

                              return api.sendMessage(
                                `❌ Error:\n${err.message}`,
                                event.threadID,
                                event.messageID
                              );
                            }
                          },

                          // =======================
                          // REPLY SYSTEM
                          // =======================
                          onReply: async function ({
                            api,
                            event,
                            commandName
                          }) {
                            try {
                              const baseUrl = await baseApiUrl();

                              const res = await axios.post(`${baseUrl}/api/hinata`, {
                                text: event.body || "hi",
                                style: 3,
                                attachments: event.attachments || []
                              });

                              return api.sendMessage(
                                res.data.message || "😔 No reply.",
                                event.threadID,
                                (err, info) => {
                                  if (!err) {
                                    global.GoatBot.onReply.set(info.messageID, {
                                      commandName,
                                      author: event.senderID
                                    });
                                  }
                                },
                                event.messageID
                              );
                            } catch (err) {
                              console.log("Reply Error:", err.message);
                            }
                          },

                          // =======================
                          // AUTO CHAT
                          // =======================
                          onChat: async function ({
                            api,
                            event,
                            commandName
                          }) {
                            try {
                              if (!event.body) return;

                              const message = event.body.toLowerCase();

                              if (
                                event.type !== "message_reply" &&
                                triggerWords.some(word => message.startsWith(word))
                              ) {
                                api.setMessageReaction(
                                  "🪽",
                                  event.messageID,
                                  () => {},
                                  true
                                );

                                const text = message.replace(
                                  /^(বট|bot|shakil|baby|bby|শাকিল|bbu|jan|sona|জান|জানু|বেবি|janu|bbz)\s*/i,
                                  ""
                                );

                                const baseUrl = await baseApiUrl();

                                const res = await axios.post(`${baseUrl}/api/hinata`, {
                                  text: text || "hi",
                                  style: 3,
                                  attachments: event.attachments || []
                                });

                                return api.sendMessage(
                                  res.data.message || "😔 No response.",
                                  event.threadID,
                                  (err, info) => {
                                    if (!err) {
                                      global.GoatBot.onReply.set(info.messageID, {
                                        commandName,
                                        author: event.senderID
                                      });
                                    }
                                  },
                                  event.messageID
                                );
                              }
                            } catch (err) {
                              console.log("Chat Error:", err.message);
                            }
                          }
                        };
