const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");
const os = require("os");

module.exports = {
config: {
name: "catbox2",
aliases: ["c2", "upload"],
version: "1.0.0",
author: "Siyam", /* ⚠️ এই ফাইলের নাম পরিবর্তন করলে কাজ করবে না  বন্ধ হয়ে যাবে। */
countDown: 5,
role: 0,
shortDescription: {
en: "Upload media"
},
longDescription: {
en: "Upload image, video, audio and get direct link"
},
category: "tools",
guide: {
en: "{pn} reply to an image/video/audio"
}
},

onStart: async function ({ event, message, api }) {  
        let tempPath = null;  

        try {  
                // লেখক নাম পরিবর্তনের সিকিউরিটি চেক  
                if (this.config.author !== "Siyam") {  
                        throw new Error("Unauthorized Modification: এই ফাইলের মূল লেখক 'Siyam'। লেখকের নাম পরিবর্তন করার কারণে ফাইলটি নিষ্ক্রিয় করা হয়েছে।");  
                }  

                const reply = event.messageReply;  

                if (  
                        !reply ||  
                        !reply.attachments ||  
                        !reply.attachments.length  
                ) {  
                        return message.reply(  
                                "⚠️ Please reply to an image, video, audio or GIF."  
                        );  
                }  

                api.setMessageReaction(  
                        "📤",  
                        event.messageID,  
                        () => {},  
                        true  
                );  

                const loadingMsg = await message.reply(  
                        "⚡ Uploading..."  
                );  

                const attachment = reply.attachments[0];  

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

                        default:  
                                ext = ".jpg";  
                }  

                tempPath = path.join(  
                        os.tmpdir(),  
                        `catbox_${Date.now()}${ext}`  
                );  

                const response = await axios({  
                        method: "GET",  
                        url: attachment.url,  
                        responseType: "stream"  
                });  

                const writer = fs.createWriteStream(tempPath);  

                response.data.pipe(writer);  

                await new Promise((resolve, reject) => {  
                        writer.on("finish", resolve);  
                        writer.on("error", reject);  
                });  

                let finalLink = null;  

                // ======================  
                // CATBOX  
                // ======================  

                try {  
                        const form = new FormData();  

                        form.append(  
                                "reqtype",  
                                "fileupload"  
                        );  

                        form.append(  
                                "fileToUpload",  
                                fs.createReadStream(tempPath)  
                        );  

                        const upload = await axios.post(  
                                "https://catbox.moe/user/api.php",  
                                form,  
                                {  
                                        headers: form.getHeaders(),  
                                        maxBodyLength: Infinity,  
                                        maxContentLength: Infinity  
                                }  
                        );  

                        const link = upload.data  
                                ?.toString()  
                                .trim();  

                        if (  
                                link &&  
                                link.startsWith("https://")  
                        ) {  
                                finalLink = link;  
                        }  
                } catch {}  

                // ======================  
                // TMPFILES  
                // ======================  

                if (!finalLink) {  
                        try {  
                                const form = new FormData();  

                                form.append(  
                                        "file",  
                                        fs.createReadStream(tempPath)  
                                );  

                                const upload = await axios.post(  
                                        "https://tmpfiles.org/api/v1/upload",  
                                        form,  
                                        {  
                                                headers: form.getHeaders()  
                                        }  
                                );  

                                const raw =  
                                        upload.data?.data?.url;  

                                if (raw) {  
                                        finalLink = raw.replace(  
                                                "https://tmpfiles.org/",  
                                                "https://tmpfiles.org/dl/"  
                                        );  
                                }  
                        } catch {}  
                }  

                // ======================  
                // 0x0.st  
                // ======================  

                if (!finalLink) {  
                        const form = new FormData();  

                        form.append(  
                                "file",  
                                fs.createReadStream(tempPath)  
                        );  

                        const upload = await axios.post(  
                                "https://0x0.st",  
                                form,  
                                {  
                                        headers: form.getHeaders()  
                                }  
                        );  

                        finalLink = upload.data  
                                .toString()  
                                .trim();  
                }  

                if (!finalLink) {  
                        throw new Error(  
                                "All upload servers failed."  
                        );  
                }  

                if (loadingMsg?.messageID) {  
                        try {  
                                await api.unsendMessage(  
                                        loadingMsg.messageID  
                                );  
                        } catch {}  
                }  

                api.setMessageReaction(  
                        "✅",  
                        event.messageID,  
                        () => {},  
                        true  
                );  

                return message.reply(  
                        `✅ Upload Successful\n\n🔗 ${finalLink}`  
                );  

        } catch (err) {  
                console.error(err);  

                api.setMessageReaction(  
                        "❌",  
                        event.messageID,  
                        () => {},  
                        true  
                );  

                return message.reply(  
                        `❌ Upload Failed\n\n${err.message}`  
                );  

        } finally {  
                try {  
                        if (  
                                tempPath &&  
                                fs.existsSync(tempPath)  
                        ) {  
                                fs.unlinkSync(tempPath);  
                        }  
                } catch {}  
        }  
}

};