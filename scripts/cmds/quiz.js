const axios = require("axios");

/**
 * @author MahMUD
 * @author: do not delete it
 */

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "2.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} [easy/medium/hard]\nExample: {pn} easy"
    }
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    try {
      const difficulty = ["easy", "medium", "hard"].includes((args[0] || "").toLowerCase())
        ? args[0].toLowerCase() : "easy";

      const res = await axios.get(
        `https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${difficulty}`,
        { timeout: 10000 }
      );

      if (res.data.response_code !== 0 || !res.data.results[0]) {
        return api.sendMessage("❌ Could not fetch a quiz question. Try again!", event.threadID, event.messageID);
      }

      const q = res.data.results[0];
      const decode = (str) => str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&ldquo;/g, "\u201C").replace(/&rdquo;/g, "\u201D");

      const question = decode(q.question);
      const correctAnswer = decode(q.correct_answer);
      const allOptions = [correctAnswer, ...q.incorrect_answers.map(decode)];
      allOptions.sort(() => Math.random() - 0.5);

      const letters = ["A", "B", "C", "D"];
      const correctLetter = letters[allOptions.indexOf(correctAnswer)];
      const optionText = allOptions.map((opt, i) => `├‣ 𝗔${letters[i]}) ${opt}`).join("\n");

      const quizMsg = {
        body: `👿━━━━━━━━━━━━━━━━━━━━👿\n  🧠 𝗤𝗨𝗜𝗭 | ${difficulty.toUpperCase()} 😈\n👿━━━━━━━━━━━━━━━━━━━━👿\n\n╭──✦ ${question}\n${optionText}\n╰──────────────────────‣\n\n💬 Reply with A, B, C or D\n⏳ You have 40 seconds!`
      };

      api.sendMessage(quizMsg, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswer: correctLetter,
          correctText: correctAnswer
        });
        setTimeout(() => { api.unsendMessage(info.messageID); }, 40000);
      }, event.messageID);

    } catch (error) {
      console.error("[quiz]", error.message);
      api.sendMessage("❌ Quiz failed! Try again later 😔", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, correctText, author } = Reply;
    if (event.senderID !== author) return api.sendMessage("🚫 এটা তোমার quiz না!", event.threadID, event.messageID);

    await api.unsendMessage(Reply.messageID);
    const userReply = event.body.trim().toUpperCase();

    if (userReply === correctAnswer) {
      const userData = await usersData.get(author);
      await usersData.set(author, {
        money: (userData.money || 0) + 500,
        exp: (userData.exp || 0) + 121,
        data: userData.data
      });
      api.sendMessage(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! Well done! 🎉\n✦ Answer: ${correctText}\n✦ +500 coins & +121 exp earned!`,
        event.threadID, event.messageID
      );
    } else {
      api.sendMessage(
        `❌ 𝗪𝗥𝗢𝗡𝗚! Better luck next time 😔\n✦ Correct Answer: ${correctAnswer}) ${correctText}`,
        event.threadID, event.messageID
      );
    }
  }
};
