const axios = require("axios");

/**
 * Check if Facebook cookies are still valid by testing against FB endpoints.
 * @param {string} cookie Cookie string as `c_user=123;xs=123;` format
 * @param {string} userAgent User agent string
 * @returns {Promise<Boolean>} True if cookie is valid, false if not
 */
module.exports = async function (cookie, userAgent) {
        const ua = userAgent || "Mozilla/5.0 (Linux; Android 12; M2102J20SG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36";
        const headers = {
                cookie,
                "user-agent": ua,
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9",
                "upgrade-insecure-requests": "1"
        };

        // Try mbasic first
        try {
                const res = await axios.get("https://mbasic.facebook.com/settings", { headers, timeout: 10000, maxRedirects: 5 });
                const body = res.data || "";
                // Valid if logged-in markers present OR if NOT a login redirect page
                const isLoggedIn =
                        body.includes("/notifications.php?") ||
                        body.includes("/privacy/xcs/action/logging/") ||
                        body.includes("href=\"/login/save-password") ||
                        body.includes("name=\"mbasic_logout") ||
                        body.includes("account_settings") ||
                        body.includes("logout.php") ||
                        body.includes("Notification");
                const isLoginPage =
                        body.includes("id=\"login_form\"") ||
                        body.includes("action=\"/login/device-based/") ||
                        (body.includes("login") && body.includes("email") && body.includes("password") && !body.includes("logout"));
                if (isLoggedIn) return true;
                if (isLoginPage) return false;
                // If neither clear pattern — try next endpoint
        }
        catch (e) { /* try next */ }

        // Try www.facebook.com home
        try {
                const res = await axios.get("https://www.facebook.com/", { headers, timeout: 10000, maxRedirects: 5 });
                const body = res.data || "";
                const isLoggedIn =
                        body.includes("data-pagelet=\"Stories\"") ||
                        body.includes("logout.php") ||
                        body.includes("\"USER_ID\"") ||
                        body.includes("userID") ||
                        body.includes("CometHome") ||
                        body.includes("notif_") ||
                        body.includes("\"viewer\":{\"actor\"");
                const isLoginPage =
                        body.includes("id=\"loginbutton\"") ||
                        body.includes("id=\"login_form\"");
                if (isLoggedIn) return true;
                if (isLoginPage) return false;
        }
        catch (e) { /* try next */ }

        // Fallback: try graph API me endpoint
        try {
                const res = await axios.get("https://www.facebook.com/me", { headers, timeout: 10000, maxRedirects: 5 });
                const body = res.data || "";
                // If we get redirected to login, body will contain login form
                if (body.includes("id=\"login_form\"") || body.includes("\"login\"")) return false;
                return true;
        }
        catch (e) {
                // Network error — assume valid to avoid blocking startup
                return true;
        }
};
