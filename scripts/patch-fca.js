"use strict";
const fs = require("fs");
const path = require("path");

const sendMessagePath = path.join(
    __dirname,
    "../node_modules/.pnpm/xnil-ypb-fca@1.1.3_undici@7.27.2/node_modules/xnil-ypb-fca/src/apis/sendMessage.js"
);

const altPath = path.join(
    __dirname,
    "../node_modules/xnil-ypb-fca/src/apis/sendMessage.js"
);

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, "utf8");
    if (content.includes("threadID.toString().length <= 15")) {
        content = content.replace(
            "threadID.toString().length <= 15",
            "threadID.toString().length < 15"
        );
        fs.writeFileSync(filePath, content, "utf8");
        console.log("[patch-fca] Fixed sendMessage.js: <= 15 -> < 15 in", filePath);
        return true;
    } else if (content.includes("threadID.toString().length < 15")) {
        console.log("[patch-fca] sendMessage.js already patched at", filePath);
        return true;
    }
    console.log("[patch-fca] Pattern not found in", filePath);
    return false;
}

let patched = patchFile(sendMessagePath);
if (!patched) patched = patchFile(altPath);
if (!patched) {
    const base = path.join(__dirname, "../node_modules");
    try {
        const hits = require("child_process")
            .execSync(`find "${base}" -path "*/xnil-ypb-fca/src/apis/sendMessage.js" 2>/dev/null`)
            .toString().trim().split("\n").filter(Boolean);
        for (const h of hits) patchFile(h);
    } catch (_) {}
}
