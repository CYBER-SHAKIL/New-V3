const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

const ROOT_DIR = process.cwd();
const OWNER_UID = "61590607769212";

const MAX_FILE_SIZE = 250 * 1024;
const MAX_MESSAGE_LENGTH = 12000;

/* =========================
   🛡️ CORE PROTECTION LAYER
========================= */

const CORE_KEYWORDS = [
  "command",
  "cmd",
  "handler",
  "index.js",
  "main",
  "bot",
  "config",
  "global",
  "event",
  "module"
];

const DANGER_PATTERNS = [
  /index\.js$/i,
  /command/i,
  /cmd/i,
  /handler/i,
  /event/i,
  /config/i,
  /global/i
];

/* =========================
   🚫 SAFE FILE FILTERS
========================= */

const BLOCKED_EXTENSIONS = new Set([
  ".db", ".sqlite", ".pem", ".key", ".exe", ".dll", ".bin"
]);

/* =========================
   🔐 SAFETY FUNCTIONS
========================= */

function safeResolve(relPath = ".") {
  const abs = path.resolve(ROOT_DIR, relPath);

  if (!abs.startsWith(ROOT_DIR)) {
    throw new Error("🚫 Path escape blocked");
  }

  return abs;
}

function isCoreFile(name) {
  const lower = name.toLowerCase();

  return CORE_KEYWORDS.some(k => lower.includes(k));
}

function isDangerFile(name) {
  return DANGER_PATTERNS.some(p => p.test(name));
}

function isBlocked(name) {
  const ext = path.extname(name).toLowerCase();
  return BLOCKED_EXTENSIONS.has(ext);
}

function isProtected(name) {
  return isCoreFile(name) || isDangerFile(name);
}

/* =========================
   📂 FILE LIST
========================= */

async function getItems(relPath = ".") {
  const absPath = safeResolve(relPath);
  const dirents = await fsp.readdir(absPath, { withFileTypes: true });

  return dirents
    .filter(i => i.isDirectory() || !isBlocked(i.name))
    .map(i => ({
      name: i.name,
      isDirectory: i.isDirectory(),
      relPath: path.join(relPath, i.name)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* =========================
   🖥️ FORMAT UI
========================= */

function formatList(relPath, items) {
  let msg = `🛡️ OWNER FILE SYSTEM\n📂 ${relPath}\n\n`;

  if (relPath !== ".") msg += "0. 🔙 Back\n";

  msg += items.map((i, idx) =>
    `${idx + 1}. ${i.isDirectory ? "📁" : "📄"} ${i.name}`
  ).join("\n");

  msg += "\n\nReply number to open file/folder";
  return msg;
}

/* =========================
   📤 SEND LIST
========================= */

async function sendList(api, threadID, messageID, relPath = ".") {
  const items = await getItems(relPath);

  api.sendMessage(formatList(relPath, items), threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: "shell",
        messageID: info.messageID,
        author: OWNER_UID,
        relPath,
        items
      });
    }
  }, messageID);
}

/* =========================
   📄 FILE VIEW
========================= */

async function sendFile(api, threadID, filePath, fileName) {
  const stat = await fsp.stat(filePath);

  if (stat.size > MAX_FILE_SIZE) {
    return api.sendMessage("❌ File too large", threadID);
  }

  const content = await fsp.readFile(filePath, "utf8");

  if (content.length > MAX_MESSAGE_LENGTH) {
    return api.sendMessage("❌ File too long", threadID);
  }

  api.sendMessage(`📄 ${fileName}\n\n${content}`, threadID);
}

/* =========================
   ⚙️ MAIN CONFIG
========================= */

module.exports.config = {
  name: "shell",
  version: "4.0.0",
  role: 3,
  author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
  description: "OWNER ONLY ultra secure file manager",
  category: "system",
  cooldowns: 3
};

/* =========================
   🚀 ENTRY
========================= */

module.exports.onStart = async function ({ api, event }) {

  if (event.senderID !== OWNER_UID) {
    return api.sendMessage("⛔ OWNER ONLY ACCESS DENIED", event.threadID);
  }

  return sendList(api, event.threadID, event.messageID, ".");
};

/* =========================
   🔁 HANDLE REPLY
========================= */

module.exports.onReply = async function ({ api, event, handleReply }) {

  if (event.senderID !== OWNER_UID) {
    return api.sendMessage("⛔ Unauthorized", event.threadID);
  }

  const input = (event.body || "").trim();

  /* =========================
     📁 NAVIGATION
  ========================= */

  const choice = Number(input);
  if (!choice) return;

  const selected = handleReply.items[choice - 1];
  if (!selected) return;

  const abs = safeResolve(selected.relPath);
  const stat = await fsp.stat(abs);

  /* =========================
     🛡️ PROTECTION CHECK
  ========================= */

  if (isProtected(selected.name)) {
    return api.sendMessage(
      "🚫 CORE SYSTEM PROTECTED\nThis file cannot be accessed or modified.",
      event.threadID
    );
  }

  /* =========================
     📂 DIRECTORY
  ========================= */

  if (stat.isDirectory()) {
    return sendList(api, event.threadID, event.messageID, selected.relPath);
  }

  /* =========================
     📄 FILE OPEN
  ========================= */

  return sendFile(api, event.threadID, abs, selected.name);
};