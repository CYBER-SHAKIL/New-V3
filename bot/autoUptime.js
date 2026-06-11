const axios = require('axios');
const { config } = global.GoatBot;
const { log, getText } = global.utils;
if (global.timeOutUptime != undefined)
        clearTimeout(global.timeOutUptime);
if (!config.autoUptime.enable)
        return;

const PORT = config.dashBoard?.port || (!isNaN(config.serverUptime?.port) && config.serverUptime?.port) || 3002;

let myUrl = config.autoUptime.url;

if (!myUrl) {
        if (process.env.REPLIT_DEV_DOMAIN) {
                myUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
        } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
                myUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        } else if (process.env.API_SERVER_EXTERNAL == "https://api.glitch.com") {
                myUrl = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
        } else {
                myUrl = `http://localhost:${PORT}`;
        }
}

if (!myUrl.endsWith('/uptime')) {
        myUrl = myUrl.replace(/\/$/, '') + '/uptime';
}

let status = 'ok';
setTimeout(async function autoUptime() {
        try {
                await axios.get(myUrl, { timeout: 10000 });
                if (status != 'ok') {
                        status = 'ok';
                        log.info("UPTIME", "Bot is online");
                }
        }
        catch (e) {
                const err = e.response?.data || e;
                if (status != 'ok')
                        return;
                status = 'failed';

                if (err.statusAccountBot == "can't login") {
                        log.err("UPTIME", "Can't login account bot");
                }
                else if (err.statusAccountBot == "block spam") {
                        log.err("UPTIME", "Your account is blocked");
                }
        }
        global.timeOutUptime = setInterval(autoUptime, (config.autoUptime.timeInterval || 180) * 1000);
}, (config.autoUptime.timeInterval || 180) * 1000);
log.info("AUTO UPTIME", getText("autoUptime", "autoUptimeTurnedOn", myUrl));
