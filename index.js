/**
 * SHAKIL BOT V3
 * Customized by 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
 * FCA: xnil-ypb-fca
 * Base: GoatBot V2
 */

const { spawn } = require("child_process");
const http = require("http");
const log = require("./logger/log.js");

// ——— IMMEDIATE HEALTH SERVER (Railway / Render / Replit Deployments) ———
// Must bind to process.env.PORT so the platform knows the app is running.
// This starts BEFORE the bot login so health checks pass even during startup.
const HEALTH_PORT = Number(process.env.PORT) || 0;
if (HEALTH_PORT) {
        const healthServer = http.createServer((req, res) => {
                const uptime = process.uptime();
                const mem = process.memoryUsage();
                const body = JSON.stringify({
                        status: "ok",
                        bot: "SHAKIL BOT V3",
                        author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
                        uptime: Math.floor(uptime),
                        memory_mb: Math.round(mem.heapUsed / 1024 / 1024),
                        timestamp: new Date().toISOString()
                });
                res.writeHead(200, {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache"
                });
                res.end(body);
        });
        healthServer.listen(HEALTH_PORT, () => {
                console.log(`[HEALTH] Health check server on port ${HEALTH_PORT}`);
        });
        healthServer.on("error", (e) => {
                console.warn(`[HEALTH] Could not bind port ${HEALTH_PORT}:`, e.message);
        });
}

function startProject() {
        const child = spawn("node", ["Goat.js"], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true
        });

        child.on("close", (code) => {
                if (code == 2) {
                        log.info("Restarting Project...");
                        startProject();
                }
        });
}

startProject();
