const axios = require("axios");
const fs = require("fs-extra");
const { execSync, exec } = require("child_process");
const path = require("path");

const GITHUB_REPO = "mdshakilhossen/shakil-bot-v3";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;

module.exports = {
	config: {
		name: "update",
		version: "3.0",
		author: "𝗦𝗛𝗔𝗞𝗜𝗟",
		role: 2,
		description: {
			en: "Check, view and install the latest update for SHAKIL BOT V3. Shows bot version, Node.js version, and all changelog details.",
			vi: "Kiểm tra, xem và cài đặt bản cập nhật mới nhất cho SHAKIL BOT V3."
		},
		category: "owner",
		guide: {
			en: "   {pn} — check for updates\n   {pn} install — force install latest update\n   {pn} info — show version & system info",
			vi: "   {pn} — kiểm tra cập nhật\n   {pn} install — cài đặt bản mới nhất\n   {pn} info — xem thông tin phiên bản"
		}
	},

	langs: {
		en: {
			checking: "🔍 | Checking for updates...",
			noUpdates: "✅ BOT IS UP TO DATE!\n\n📦 Bot Version : v%1\n🟢 Node.js     : %2\n📅 Released    : %3\n\nNo new updates available.",
			updateFound: "🚀 NEW UPDATE AVAILABLE!\n\n📦 Current Version : v%1\n✨ Latest Version  : v%2\n🟢 Node.js         : %3\n📅 Released        : %4\n\n📋 CHANGELOG:\n%5\n\n💡 React to this message to start the update.",
			updateConfirmed: "⚡ Update confirmed! Installing v%1...\n\nThis will:\n• Download latest files\n• Update npm packages\n• Restart the bot automatically",
			updating: "📥 Downloading and applying update...",
			npmUpdating: "📦 Updating npm packages...",
			updateComplete: "✅ UPDATE COMPLETE!\n\n📦 Updated to : v%1\n🟢 Node.js    : %2\n📅 Updated at : %3\n\nBot will restart now! 🔄",
			updateFailed: "❌ Update failed: %1\n\nPlease update manually.",
			noSource: "❌ Cannot connect to GitHub. Check internet connection.",
			infoMsg: "📊 SHAKIL BOT V3 — SYSTEM INFO\n\n📦 Bot Version  : v%1\n🟢 Node.js      : %2\n📦 npm          : %3\n🖥️  Platform     : %4\n🧠 Memory Used  : %5 MB\n⏱️  Uptime       : %6\n📅 Build Date   : %7\n\n👨‍💻 Author: MD SHAKIL HOSSEN\n🔗 GitHub: github.com/mdshakilhossen/shakil-bot-v3",
			installForce: "🔄 Force installing latest update..."
		},
		vi: {
			checking: "🔍 | Đang kiểm tra cập nhật...",
			noUpdates: "✅ BOT ĐÃ CẬP NHẬT!\n\n📦 Phiên bản Bot : v%1\n🟢 Node.js       : %2\n📅 Phát hành     : %3\n\nKhông có bản cập nhật mới.",
			updateFound: "🚀 CÓ BẢN CẬP NHẬT MỚI!\n\n📦 Phiên bản hiện tại : v%1\n✨ Phiên bản mới      : v%2\n🟢 Node.js            : %3\n📅 Phát hành          : %4\n\n📋 THAY ĐỔI:\n%5\n\n💡 Thả cảm xúc để xác nhận cập nhật.",
			updateConfirmed: "⚡ Đã xác nhận! Đang cài đặt v%1...",
			updating: "📥 Đang tải và áp dụng cập nhật...",
			npmUpdating: "📦 Đang cập nhật gói npm...",
			updateComplete: "✅ CẬP NHẬT HOÀN TẤT!\n\n📦 Đã cập nhật : v%1\n🟢 Node.js     : %2\n📅 Thời gian   : %3\n\nBot sẽ khởi động lại! 🔄",
			updateFailed: "❌ Cập nhật thất bại: %1",
			noSource: "❌ Không thể kết nối GitHub.",
			infoMsg: "📊 THÔNG TIN HỆ THỐNG\n\n📦 Phiên bản Bot : v%1\n🟢 Node.js       : %2\n📦 npm           : %3\n🖥️  Nền tảng      : %4\n🧠 Bộ nhớ dùng   : %5 MB\n⏱️  Uptime        : %6\n📅 Ngày build     : %7",
			installForce: "🔄 Đang cài đặt bản mới nhất..."
		}
	},

	onLoad: async function ({ api }) {
		const restartFile = path.join(__dirname, "tmp", "rebootUpdated.txt");
		if (fs.existsSync(restartFile)) {
			const threadID = fs.readFileSync(restartFile, "utf-8").trim();
			fs.removeSync(restartFile);
			const pkg = require("../../package.json");
			const nodeVer = process.version;
			setTimeout(() => {
				api.sendMessage(
					`✅ SHAKIL BOT V3 restarted successfully!\n\n📦 Version : v${pkg.version}\n🟢 Node.js : ${nodeVer}\n📅 Time    : ${new Date().toLocaleString()}`,
					threadID
				);
			}, 3000);
		}
	},

	onStart: async function ({ message, getLang, event, args }) {
		const subCmd = (args[0] || "").toLowerCase();

		if (subCmd === "info") {
			return handleInfo(message, getLang);
		}

		if (subCmd === "install") {
			await message.reply(getLang("installForce"));
			return doUpdate(message, getLang, event, true);
		}

		await message.reply(getLang("checking"));

		try {
			const [releaseData, currentPkg] = await Promise.all([
				axios.get(`${GITHUB_API}/releases/latest`, { timeout: 10000 }).catch(() => null),
				Promise.resolve(require("../../package.json"))
			]);

			const nodeVer = process.version;
			const currentVersion = currentPkg.version;

			if (!releaseData || !releaseData.data) {
				// No releases on GitHub, show current info
				return message.reply(getLang("noUpdates", currentVersion, nodeVer, "N/A"));
			}

			const latest = releaseData.data;
			const latestVersion = latest.tag_name.replace(/^v/, "");
			const releaseDate = new Date(latest.published_at).toLocaleString();
			const changelog = latest.body
				? latest.body.split("\n").slice(0, 10).map(l => `  ${l}`).join("\n")
				: "  No changelog provided.";

			const isNewer = compareVersions(latestVersion, currentVersion) > 0;

			if (!isNewer) {
				return message.reply(getLang("noUpdates", currentVersion, nodeVer, releaseDate));
			}

			const sent = await message.reply(
				getLang("updateFound", currentVersion, latestVersion, nodeVer, releaseDate, changelog)
			);

			global.GoatBot.onReaction.set(sent.messageID, {
				commandName: "update",
				messageID: sent.messageID,
				author: event.senderID,
				latestVersion,
				threadID: event.threadID
			});

		} catch (err) {
			return message.reply(getLang("noSource"));
		}
	},

	onReaction: async function ({ message, getLang, reaction, event }) {
		if (reaction.userID !== reaction.author) return;
		await message.reply(getLang("updateConfirmed", reaction.latestVersion));
		return doUpdate(message, getLang, event, false, reaction.latestVersion);
	},

	onReply: async function ({ message, getLang, event }) {
		if (["yes", "y"].includes((event.body || "").toLowerCase())) {
			await message.reply(getLang("updateComplete", require("../../package.json").version, process.version, new Date().toLocaleString()));
			setTimeout(() => process.exit(2), 2000);
		}
	}
};

async function handleInfo(message, getLang) {
	const pkg = require("../../package.json");
	const nodeVer = process.version;
	let npmVer = "N/A";
	try { npmVer = execSync("npm --version", { timeout: 5000 }).toString().trim(); } catch (_) {}
	const platform = `${process.platform} (${process.arch})`;
	const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
	const uptimeSec = Math.floor(process.uptime());
	const h = Math.floor(uptimeSec / 3600);
	const m = Math.floor((uptimeSec % 3600) / 60);
	const s = uptimeSec % 60;
	const uptime = `${h}h ${m}m ${s}s`;
	const buildDate = pkg.buildDate || "N/A";

	return message.reply(getLang("infoMsg", pkg.version, nodeVer, npmVer, platform, memMB, uptime, buildDate));
}

async function doUpdate(message, getLang, event, force = false, targetVersion = null) {
	try {
		await message.reply(getLang("updating"));

		const rootDir = path.join(__dirname, "..", "..");
		const filesToUpdate = ["Goat.js", "index.js", "package.json"];

		for (const file of filesToUpdate) {
			try {
				const url = `${RAW_BASE}/${file}`;
				const resp = await axios.get(url, { timeout: 15000, responseType: "text" });
				if (resp.status === 200) {
					fs.writeFileSync(path.join(rootDir, file), resp.data, "utf-8");
				}
			} catch (_) {}
		}

		await message.reply(getLang("npmUpdating"));

		await new Promise((resolve) => {
			exec("npm install --legacy-peer-deps --no-audit --prefer-offline", {
				cwd: rootDir,
				timeout: 120000
			}, (err, stdout, stderr) => {
				resolve();
			});
		});

		const updatedPkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
		const newVersion = updatedPkg.version;
		const nodeVer = process.version;

		const restartFile = path.join(__dirname, "tmp", "rebootUpdated.txt");
		fs.ensureDirSync(path.dirname(restartFile));
		fs.writeFileSync(restartFile, event.threadID, "utf-8");

		await message.reply(getLang("updateComplete", newVersion, nodeVer, new Date().toLocaleString()));

		setTimeout(() => process.exit(2), 3000);

	} catch (err) {
		return message.reply(getLang("updateFailed", err.message));
	}
}

function compareVersions(a, b) {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const na = pa[i] || 0;
		const nb = pb[i] || 0;
		if (na > nb) return 1;
		if (na < nb) return -1;
	}
	return 0;
}
