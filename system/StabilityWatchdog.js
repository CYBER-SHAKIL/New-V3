'use strict';
/**
 * StabilityWatchdog — lightweight health monitor for Goat Bot V3
 * - Tracks memory usage and warns if too high
 * - Detects truly stale MQTT (no events for 60 min)
 * - Cleans up temp files every hour
 * - Logs uptime stats every 10 min
 */

const fs   = require('fs-extra');
const path = require('path');
const log  = global.utils?.log || console;

const MEM_WARN_MB    = 450;            // warn at 450 MB RSS
const MEM_CRIT_MB    = 700;            // restart at 700 MB RSS
const STALE_MQTT_MS  = 60 * 60 * 1000; // 60 minutes no activity → restart (was 20min, causing false restarts)
const CHECK_INTERVAL = 5 * 60 * 1000;  // check every 5 minutes
const LOG_INTERVAL   = 10 * 60 * 1000; // log stats every 10 minutes
const CLEANUP_INTERVAL = 60 * 60 * 1000; // cleanup temp every hour

let lastEventTime = Date.now();
let watchdogStarted = false;

function updateLastEvent() {
  lastEventTime = Date.now();
}

function getMB(bytes) { return Math.round(bytes / 1024 / 1024); }

function cleanTempFiles() {
  const cacheDirs = [
    path.join(process.cwd(), 'scripts', 'events', 'cache'),
    path.join(process.cwd(), 'scripts', 'cmds',   'cache'),
    path.join(process.cwd(), 'tmp'),
  ];
  let removed = 0;
  const cutoff = Date.now() - 30 * 60 * 1000; // older than 30 min
  for (const dir of cacheDirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const fp = path.join(dir, f);
        try {
          const stat = fs.statSync(fp);
          if (stat.isFile() && stat.mtimeMs < cutoff) {
            fs.removeSync(fp);
            removed++;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }
  if (removed > 0)
    (log.info || console.log)('WATCHDOG', `Cleaned ${removed} temp files`);
}

function memCheck() {
  const m   = process.memoryUsage();
  const rss = getMB(m.rss);
  const heap = getMB(m.heapUsed);

  if (rss >= MEM_CRIT_MB) {
    (log.error || console.error)('WATCHDOG', `CRITICAL memory: RSS=${rss}MB — forcing restart`);
    setTimeout(() => process.exit(2), 2000);
    return;
  }
  if (rss >= MEM_WARN_MB) {
    (log.warn || console.warn)('WATCHDOG', `High memory: RSS=${rss}MB heap=${heap}MB — monitoring`);
  }

  const staleSec = Math.round((Date.now() - lastEventTime) / 1000);
  if (staleSec > STALE_MQTT_MS / 1000) {
    (log.warn || console.warn)('WATCHDOG', `No MQTT events for ${Math.round(staleSec/60)}min — forcing restart`);
    setTimeout(() => process.exit(2), 2000);
  }
}

function logStats() {
  const m   = process.memoryUsage();
  const rss = getMB(m.rss);
  const heap = getMB(m.heapUsed);
  const up  = Math.round(process.uptime() / 60);
  const staleSec = Math.round((Date.now() - lastEventTime) / 1000);
  (log.info || console.log)(
    'WATCHDOG',
    `Uptime: ${up}min | RSS: ${rss}MB | Heap: ${heap}MB | LastEvent: ${staleSec}s ago`
  );
}

function start() {
  if (watchdogStarted) return;
  watchdogStarted = true;

  const checkTimer   = setInterval(memCheck,   CHECK_INTERVAL);
  const logTimer     = setInterval(logStats,   LOG_INTERVAL);
  const cleanTimer   = setInterval(cleanTempFiles, CLEANUP_INTERVAL);

  if (checkTimer.unref) checkTimer.unref();
  if (logTimer.unref)   logTimer.unref();
  if (cleanTimer.unref) cleanTimer.unref();

  (log.info || console.log)('WATCHDOG', 'StabilityWatchdog started ✅');
}

module.exports = { start, updateLastEvent };
