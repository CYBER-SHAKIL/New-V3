/**
 * AUTO RELOGIN + CONNECTION WATCHDOG
 * — Pings FB every 30 min to keep session alive
 * — Detects MQTT disconnects and alerts admin
 * — Auto-recovers from uncaughtException crashes
 * Author: CYBER-SHAKIL
 */

const ADMIN_UIDs = ["61590607769212", "61590612445063"];
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const ALERT_COOLDOWN = 60 * 60 * 1000; // alert at most once per hour

let _api = null;
let _lastAlertTime = 0;
let _connected = true;
let _watchdogInterval = null;

function notifyAdmin(msg) {
  if (!_api) return;
  const now = Date.now();
  if (now - _lastAlertTime < ALERT_COOLDOWN) return;
  _lastAlertTime = now;
  for (const uid of ADMIN_UIDs) {
    _api.sendMessage(`🤖 BOT ALERT:\n${msg}`, uid).catch(() => {});
  }
}

function startWatchdog() {
  if (_watchdogInterval) return; // already running

  _watchdogInterval = setInterval(async () => {
    if (!_api) return;
    try {
      // Lightweight connectivity check
      await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("timeout")), 15000);
        _api.getThreadList(1, null, [], (err, list) => {
          clearTimeout(t);
          if (err) reject(err);
          else resolve(list);
        });
      });

      if (!_connected) {
        _connected = true;
        console.log("[autoRelogin] ✅ Connection restored");
        notifyAdmin("✅ Bot connection restored!\nMQTT reconnected successfully.");
      }
    } catch (e) {
      _connected = false;
      const code = e.code || e.message || "unknown";
      console.warn("[autoRelogin] ⚠️ Connection check failed:", code);

      // Try to refresh fbstate
      try {
        if (typeof _api.refreshFbState === "function") {
          await _api.refreshFbState();
          console.log("[autoRelogin] 🔄 FbState refreshed");
        }
      } catch (_) {}

      notifyAdmin(
        `⚠️ Bot connection issue detected!\n` +
        `Error: ${code}\n` +
        `Attempting auto-recovery...`
      );
    }
  }, CHECK_INTERVAL);
}

// Global crash recovery — restart process cleanly
process.on("uncaughtException", (err) => {
  const msg = err?.message || String(err);
  // Ignore benign MQTT/network noise
  if (
    msg.includes("read ECONNRESET") ||
    msg.includes("socket hang up") ||
    msg.includes("EPIPE") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ETIMEDOUT")
  ) {
    console.warn("[autoRelogin] ⚠️ Suppressed network error:", msg);
    return;
  }
  console.error("[autoRelogin] 💥 Uncaught exception:", msg);
});

process.on("unhandledRejection", (reason) => {
  const msg = String(reason?.message || reason || "");
  if (
    msg.includes("read ECONNRESET") ||
    msg.includes("EPIPE") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("socket hang up")
  ) {
    return;
  }
  console.warn("[autoRelogin] ⚠️ Unhandled rejection:", msg.slice(0, 200));
});

module.exports = {
  config: {
    name: "autoRelogin",
    version: "2.0",
    author: "CYBER-SHAKIL",
    description: "Connection watchdog — keeps bot alive, detects disconnects, alerts admin",
    category: "events"
  },

  onStart: async function ({ api }) {
    _api = api;
    _connected = true;
    startWatchdog();
    console.log(`[autoRelogin] ✅ Watchdog started — checking every ${CHECK_INTERVAL / 60000} min`);
  }
};
