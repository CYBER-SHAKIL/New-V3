module.exports = {
        config: {
                name: "vip",
                version: "1.0.0",
                author: "𝗦𝗛𝗔𝗞𝗜𝗟",
                category: "system",
                description: "VIP user system — gives special privileges to VIP users"
        },

        onLoad: async function () {
                const vipUsers = global.GoatBot?.config?.vipUsers || [];
                if (vipUsers.length > 0) {
                        console.log(`[VIP] ${vipUsers.length} VIP user(s) loaded: ${vipUsers.join(", ")}`);
                }
        },

        onStart: async function ({ event, usersData }) {
                const { senderID } = event;
                const vipUsers = global.GoatBot?.config?.vipUsers || [];

                if (vipUsers.includes(senderID) || vipUsers.includes(String(senderID))) {
                        if (!global.vipCache) global.vipCache = new Set();
                        global.vipCache.add(String(senderID));
                }
        },

        onChat: async function ({ event }) {
                const { senderID } = event;
                const vipUsers = global.GoatBot?.config?.vipUsers || [];
                const ownerUID = global.GoatBot?.config?.ownerUID;

                const isVip = vipUsers.includes(String(senderID)) || String(senderID) === String(ownerUID);

                if (isVip) {
                        if (!global.vipCache) global.vipCache = new Set();
                        global.vipCache.add(String(senderID));

                        if (global.GoatBot?.cooldowns && global.GoatBot.cooldowns.has(senderID)) {
                                global.GoatBot.cooldowns.delete(senderID);
                        }
                }
        }
};
