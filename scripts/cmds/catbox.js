const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");
const os = require("os");

module.exports = {
        config: {
                name: "catbox",
                aliases: ["c1"],
                version: "6.0",
                author: "𝆠፝𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
                countDown: 5,
                role: 0,
                shortDescription: "Upload media",
                longDescription: "Upload image/video/audio",
                category: "tools",
                guide: {
                        en: "{pn} reply to media"
                }
        },

        onStart: async function ({
                api,
                event,
                message
        }) {

                try {

                        // =========================
                        // OWNER UID
                        // =========================

                        const allowedUIDs = [
                                "61588178231072"
                        ];

                        const senderID = event.senderID;

                        // =========================
                        // BOT ADMIN CHECK
                        // =========================

                        const threadInfo =
                                await api.getThreadInfo(
                                        event.threadID
                                );

                        const botAdmins =
                                threadInfo.adminIDs.map(
                                        item => item.id
                                );

                        const isAllowed =
                                allowedUIDs.includes(senderID) ||
                                botAdmins.includes(senderID);

                        if (!isAllowed) {

                                return message.reply(
                                        "❌ | এএ🙄 মাদারচোদ 🖕 আইছে 🧑‍🍼বট মনে হয় তোর 🤬বাপের আবালচোদা🖕 নিজে বানাইয়া ইউজ কর😼 আমার বস 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 চাইছিল🫶 কই তোরা কেউ তো দিলি না🤬 🫤গরিব ছেসরার দল🥴🐸"
                                );
                        }

                        // =========================
                        // CHECK REPLY
                        // =========================

                        const reply =
                                event.messageReply;

                        if (
                                !reply ||
                                !reply.attachments ||
                                !reply.attachments.length
                        ) {

                                return message.reply(
                                        "⚠️ | Reply to image/video/audio"
                                );
                        }

                        api.setMessageReaction(
                                "📤",
                                event.messageID,
                                () => {},
                                true
                        );

                        const loading =
                                await message.reply(
                                        "⚡ Uploading Please Wait..."
                                );

                        const attachment =
                                reply.attachments[0];

                        // =========================
                        // FILE EXTENSION
                        // =========================

                        let ext = ".jpg";

                        switch (attachment.type) {

                                case "video":
                                        ext = ".mp4";
                                        break;

                                case "audio":
                                        ext = ".mp3";
                                        break;

                                case "animated_image":
                                        ext = ".gif";
                                        break;
                        }

                        // =========================
                        // TEMP FILE
                        // =========================

                        const tempPath = path.join(
                                os.tmpdir(),
                                `upload_${Date.now()}${ext}`
                        );

                        // =========================
                        // DOWNLOAD FILE
                        // =========================

                        const response = await axios({
                                method: "GET",
                                url: attachment.url,
                                responseType: "stream"
                        });

                        const writer =
                                fs.createWriteStream(
                                        tempPath
                                );

                        response.data.pipe(writer);

                        await new Promise(
                                (resolve, reject) => {

                                        writer.on(
                                                "finish",
                                                resolve
                                        );

                                        writer.on(
                                                "error",
                                                reject
                                        );
                                }
                        );

                        let finalLink;

                        // =========================
                        // SERVER 1 => CATBOX
                        // =========================

                        try {

                                const form1 =
                                        new FormData();

                                form1.append(
                                        "reqtype",
                                        "fileupload"
                                );

                                form1.append(
                                        "fileToUpload",
                                        fs.createReadStream(
                                                tempPath
                                        )
                                );

                                const upload1 =
                                        await axios.post(
                                                "https://catbox.moe/user/api.php",
                                                form1,
                                                {
                                                        headers:
                                                                form1.getHeaders(),

                                                        maxBodyLength:
                                                                Infinity,

                                                        maxContentLength:
                                                                Infinity
                                                }
                                        );

                                const link =
                                        upload1.data
                                        ?.toString()
                                        .trim();

                                if (
                                        link &&
                                        link.startsWith(
                                                "https://"
                                        )
                                ) {

                                        finalLink = link;

                                } else {

                                        throw new Error(
                                                "Catbox Failed"
                                        );
                                }

                        } catch {

                                // =========================
                                // SERVER 2 => TMPFILES
                                // =========================

                                try {

                                        const form2 =
                                                new FormData();

                                        form2.append(
                                                "file",
                                                fs.createReadStream(
                                                        tempPath
                                                )
                                        );

                                        const upload2 =
                                                await axios.post(
                                                        "https://tmpfiles.org/api/v1/upload",
                                                        form2,
                                                        {
                                                                headers:
                                                                        form2.getHeaders()
                                                        }
                                                );

                                        const rawLink =
                                                upload2.data
                                                ?.data?.url;

                                        if (rawLink) {

                                                finalLink =
                                                        rawLink.replace(
                                                                "https://tmpfiles.org/",
                                                                "https://tmpfiles.org/dl/"
                                                        );

                                        } else {

                                                throw new Error(
                                                        "Tmpfiles Failed"
                                                );
                                        }

                                } catch {

                                        // =========================
                                        // SERVER 3 => 0x0.st
                                        // =========================

                                        const form3 =
                                                new FormData();

                                        form3.append(
                                                "file",
                                                fs.createReadStream(
                                                        tempPath
                                                )
                                        );

                                        const upload3 =
                                                await axios.post(
                                                        "https://0x0.st",
                                                        form3,
                                                        {
                                                                headers:
                                                                        form3.getHeaders()
                                                        }
                                                );

                                        finalLink =
                                                upload3.data
                                                .toString()
                                                .trim();
                                }
                        }

                        // =========================
                        // DELETE TEMP FILE
                        // =========================

                        try {

                                if (
                                        fs.existsSync(
                                                tempPath
                                        )
                                ) {

                                        fs.unlinkSync(
                                                tempPath
                                        );
                                }

                        } catch {}

                        // =========================
                        // SEND RESULT
                        // =========================

                        api.setMessageReaction(
                                "✅",
                                event.messageID,
                                () => {},
                                true
                        );

                        if (loading && loading.messageID) {
                                api.unsendMessage(loading.messageID);
                        }

                        if (finalLink) {
                                return message.reply(
                                        `✅ Uploaded Successfully!\n\n🔗 Link: ${finalLink}`
                                );
                        } else {
                                return message.reply(
                                        "❌ All upload servers failed. Try again later."
                                );
                        }

                } catch (err) {
                        return message.reply(
                                `❌ Upload Error: ${err.message}`
                        );
                }
        }
};