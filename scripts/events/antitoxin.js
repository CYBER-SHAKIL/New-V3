// ═══════════════════════════════════════════
//  ANTITOXIN — Security Engine v4.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Rate limit + Flood + Bad Link + Anti-Spam
// ═══════════════════════════════════════════

const RATE_LIMIT = 10;        // max msgs per window
const RATE_WINDOW = 6000;     // 6 second window
const FLOOD_LIMIT = 18;       // hard kick threshold
const WARN_LIMIT = 3;         // warns before kick
const MAX_MSG_LEN = 3000;     // max message length before warn

const BAD_DOMAINS = [
  "bit.ly", "tinyurl.com", "cutt.ly", "rb.gy", "gg.gg",
  "grabify.link", "iplogger.org", "iplogger.com", "2no.co",
  "blasze.tk", "ps3cfw.com", "freegiftcards.co", "yoittu.com",
  "discord.gg/free", "free-nitro", "steamcommunity.ru",
  "freerobux", "freevbucks", "get-robux"
];

// ISIS / terrorist propaganda triggers
const ISIS_TRIGGERS = [
  "我是 ISIS☝", "我是杀人犯☝", "我是一名恐怖分子",
  "allahu akbar bomb", "join isis", "islamic state bomb"
];

const floodMap  = new Map(); // threadID → { users: { uid: {count, time, warns} } }
const muteMap   = new Set(); // muted userIDs (global)

function getThreadData(threadID) {
  if (!floodMap.has(threadID)) floodMap.set(threadID, { users: {} });
  return floodMap.get(threadID);
}

function hasBadLink(text) {
  if (!text) return false;
  return BAD_DOMAINS.some(d => text.toLowerCase().includes(d));
}

function hasISISTrigger(text) {
  if (!text) return false;
  return ISIS_TRIGGERS.some(t => text.includes(t));
}

module.exports = {
  config: {
    name: "antitoxin",
    version: "4.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    description: "Comprehensive security: rate limit, flood, bad links, ISIS triggers",
    category: "events"
  },

  onStart: async () => {},

  onChat: async ({ api, event, threadsData }) => {
    try {
      const { senderID, threadID, body, type } = event;
      if (!senderID || !threadID) return;

      const botID = api.getCurrentUserID();
      if (senderID === botID) return;
      if (global.GoatBot?.config?.adminBot?.includes(senderID)) return;

      // ── Fetch thread info (cached) ────────────────────────────
      let isAdmin = false;
      try {
        const info = await api.getThreadInfo(threadID);
        isAdmin = info.adminIDs?.some(a => a.id === senderID);
      } catch {}
      if (isAdmin) return;

      const text = body || "";
      const td = getThreadData(threadID);
      if (!td.users[senderID]) td.users[senderID] = { count: 0, time: Date.now(), warns: 0 };
      const u = td.users[senderID];

      const now = Date.now();
      const elapsed = now - u.time;

      if (elapsed > RATE_WINDOW) {
        u.count = 1;
        u.time = now;
      } else {
        u.count++;
      }

      // ── ISIS / Terror trigger → instant leave ─────────────────
      if (hasISISTrigger(text)) {
        try { await api.removeUserFromGroup(senderID, threadID); } catch {}
        await api.sendMessage(
          `🚨 SECURITY ALERT\n\n⛔ User removed for terrorist/ISIS propaganda.\nID: ${senderID}\n\n🛡 Protected by SHAKIL BOT V3`,
          threadID
        );
        return;
      }

      // ── Bad / Phishing link ───────────────────────────────────
      if (hasBadLink(text)) {
        u.warns++;
        try { await api.unsendMessage(event.messageID); } catch {}
        if (u.warns >= WARN_LIMIT) {
          try { await api.removeUserFromGroup(senderID, threadID); } catch {}
          await api.sendMessage(
            `🚫 Phishing/tracking link detected.\nUser kicked after ${WARN_LIMIT} warnings.\nID: ${senderID}`,
            threadID
          );
        } else {
          await api.sendMessage(
            `⚠️ [WARNING ${u.warns}/${WARN_LIMIT}]\n@${senderID} Bad/suspicious link detected and removed.\nNext offense may result in kick.`,
            threadID,
            null,
            { mentions: [{ tag: `@${senderID}`, id: senderID }] }
          );
        }
        return;
      }

      // ── Flood / Spam detection ────────────────────────────────
      if (u.count > FLOOD_LIMIT) {
        try { await api.removeUserFromGroup(senderID, threadID); } catch {}
        td.users[senderID] = { count: 0, time: now, warns: 0 };
        await api.sendMessage(
          `⚡ FLOOD PROTECTION\n\n🔴 User kicked for message flooding.\nID: ${senderID}\n📊 Sent ${u.count} messages in ${(RATE_WINDOW/1000)}s`,
          threadID
        );
        return;
      }

      if (u.count > RATE_LIMIT) {
        u.warns++;
        if (u.warns === 1) {
          await api.sendMessage(
            `⚠️ Slow down! You're sending messages too fast.\n[${u.count}/${FLOOD_LIMIT} rate limit]`,
            threadID
          );
        }
        return;
      }

      // ── Oversized message spam ────────────────────────────────
      if (text.length > MAX_MSG_LEN) {
        u.warns++;
        try { await api.unsendMessage(event.messageID); } catch {}
        await api.sendMessage(
          `⚠️ Message too long (${text.length} chars). Max allowed: ${MAX_MSG_LEN}.`,
          threadID
        );
      }

    } catch (err) {
      // Silent fail — never crash the bot
    }
  }
};
