module.exports = {
	config: {
		name: "alive",
		aliases: ["r", "ping", "status"],
		version: "1.0",
		author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
		countDown: 5,
		role: 0,
		shortDescription: { en: "Check if bot is alive" },
		longDescription: { en: "Shows bot status, uptime and system info" },
		category: "info",
		guide: { en: "{pn}" }
	},

	onStart: async function ({ api, event, message }) {
		const uptimeSec = Math.floor(process.uptime());
		const hours = Math.floor(uptimeSec / 3600);
		const mins = Math.floor((uptimeSec % 3600) / 60);
		const secs = uptimeSec % 60;
		const uptimeStr = `${hours}h ${mins}m ${secs}s`;

		const mem = process.memoryUsage();
		const memMB = Math.round(mem.heapUsed / 1024 / 1024);

		const cmds = global.GoatBot?.commands?.size || 0;
		const prefix = global.utils?.getPrefix(event.threadID) || "-";

		const msg = [
			"𝗛𝗲𝘆! I'm alive 🌿",
			"━━━━━━━━━━━━━━━━━",
			`› ${prefix}help to see all commands`,
			`› Commands loaded: ${cmds}`,
			`› Uptime: ${uptimeStr}`,
			`› RAM: ${memMB} MB`,
			`› Node: ${process.version}`,
			"━━━━━━━━━━━━━━━━━",
			"⚡ 𝗦𝗛𝗔𝗞𝗜𝗟 𝗕𝗢𝗧 𝗩𝟯 — Online"
		].join("\n");

		return message.reply(msg);
	}
};
