/**
 * SecurityManager — SHAKIL BOT V3
 * Protects cookies, prevents ban, secures session, guards the repo.
 */

const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const KEY_FILE = path.join(process.cwd(), ".local", "v3.key");

function getEncryptionKey() {
	if (fs.existsSync(KEY_FILE)) {
		return Buffer.from(fs.readFileSync(KEY_FILE, "utf8"), "hex");
	}
	const key = crypto.randomBytes(32);
	fs.ensureDirSync(path.dirname(KEY_FILE));
	fs.writeFileSync(KEY_FILE, key.toString("hex"), "utf8");
	return key;
}

function encryptData(plaintext) {
	const key = getEncryptionKey();
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
	let encrypted = cipher.update(plaintext, "utf8", "hex");
	encrypted += cipher.final("hex");
	return iv.toString("hex") + ":" + encrypted;
}

function decryptData(ciphertext) {
	const key = getEncryptionKey();
	const [ivHex, encrypted] = ciphertext.split(":");
	const iv = Buffer.from(ivHex, "hex");
	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

function maskSensitiveData(str, showChars = 8) {
	if (!str || str.length <= showChars) return "***";
	return str.substring(0, showChars) + "..." + "*".repeat(Math.min(str.length - showChars, 20));
}

function getSessionSecret() {
	const secretFile = path.join(process.cwd(), ".local", "session.secret");
	if (fs.existsSync(secretFile)) {
		return fs.readFileSync(secretFile, "utf8").trim();
	}
	const secret = crypto.randomBytes(48).toString("hex");
	fs.ensureDirSync(path.dirname(secretFile));
	fs.writeFileSync(secretFile, secret, "utf8");
	return secret;
}

function generateRequestToken() {
	return crypto.randomBytes(32).toString("hex");
}

function validateOrigin(req) {
	const origin = req.headers.origin || req.headers.referer || "";
	const host = req.headers.host || "";
	return origin.includes(host) || origin === "" || process.env.NODE_ENV === "development";
}

function securityHeaders(req, res, next) {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "SAMEORIGIN");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
	next();
}

function rateLimiter(maxRequests = 20, windowMs = 60000) {
	const requests = new Map();
	return (req, res, next) => {
		const ip = req.ip || req.connection?.remoteAddress || "unknown";
		const now = Date.now();
		const windowStart = now - windowMs;
		const userRequests = (requests.get(ip) || []).filter(t => t > windowStart);
		userRequests.push(now);
		requests.set(ip, userRequests);
		if (userRequests.length > maxRequests) {
			return res.status(429).json({ status: "error", message: "Too many requests. Please wait." });
		}
		next();
	};
}

function sanitizeInput(input) {
	if (typeof input !== "string") return input;
	return input
		.replace(/[<>]/g, "")
		.replace(/javascript:/gi, "")
		.replace(/on\w+=/gi, "")
		.trim();
}

function isValidCookieFormat(cookieStr) {
	try {
		const parsed = JSON.parse(cookieStr);
		return Array.isArray(parsed) && parsed.every(c => c.key && c.value);
	} catch {
		return false;
	}
}

function getAntiDetectionDelay(base = 1000, variance = 2000) {
	return base + Math.floor(Math.random() * variance);
}

module.exports = {
	encryptData,
	decryptData,
	maskSensitiveData,
	getSessionSecret,
	generateRequestToken,
	validateOrigin,
	securityHeaders,
	rateLimiter,
	sanitizeInput,
	isValidCookieFormat,
	getAntiDetectionDelay
};
