/**
 * SHAKIL BOT V3 — Single Instance Guard
 * Ensures only ONE bot instance runs at a time.
 * When a new instance starts, it claims the lock.
 * Any older instance detects the new lock and shuts down within 60 seconds.
 */

const fs = require('fs');
const path = require('path');

const LOCK_FILE  = path.join(process.cwd(), '.instance.lock');
const RENEW_MS   = 15 * 1000;   // renew lock every 15s
const SHUTDOWN_DELAY_MS = 60 * 1000; // old instance waits 60s then exits

function readLock() {
  try { return JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8')); }
  catch { return null; }
}

function writeLock(id) {
  fs.writeFileSync(LOCK_FILE, JSON.stringify({
    instanceId: id,
    pid: process.pid,
    startedAt: Date.now()
  }), 'utf8');
}

function removeLock(id) {
  const cur = readLock();
  if (cur && cur.instanceId === id) {
    try { fs.unlinkSync(LOCK_FILE); } catch {}
  }
}

function start() {
  const myId = `${Date.now()}_${process.pid}`;
  let shuttingDown = false;

  // --- claim lock immediately (this instance is newest) ---
  writeLock(myId);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[INSTANCE GUARD] New instance started: ${myId}`);
  console.log(`[INSTANCE GUARD] Any older instance will shut down in 60s`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // --- renew lock & watch for newer instances ---
  const interval = setInterval(() => {
    if (shuttingDown) return;

    const cur = readLock();
    if (!cur || cur.instanceId === myId) {
      // still ours — renew
      writeLock(myId);
      return;
    }

    // A newer instance claimed the lock
    if (shuttingDown) return;
    shuttingDown = true;
    clearInterval(interval);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[INSTANCE GUARD] Newer instance detected (ID: ${cur.instanceId})`);
    console.log(`[INSTANCE GUARD] This OLD instance (${myId}) will exit in 60 seconds...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    setTimeout(() => {
      console.log(`[INSTANCE GUARD] Graceful shutdown — old instance exiting.`);
      process.exit(0);
    }, SHUTDOWN_DELAY_MS);
  }, RENEW_MS);

  // keep timer alive (don't block event loop exit)
  interval.unref();

  // cleanup on normal exit
  process.on('exit',    () => removeLock(myId));
  process.on('SIGTERM', () => { removeLock(myId); });
  process.on('SIGINT',  () => { removeLock(myId); });

  return myId;
}

module.exports = { start };
