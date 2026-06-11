module.exports = {
  config: {
    name: "autoreact",
    version: "1.1",
    author: "Loid Butter",
    countDown: 5,
    role: 0,
    shortDescription: "Auto-react to keywords in messages",
    longDescription: "Automatically reacts with emoji when certain keywords are detected in chat",
    category: "events",
  },

  onStart: async function () {},

  onChat: async function ({ event, api }) {
    if (!event.body || typeof event.body !== "string") return;

    const body = event.body.toLowerCase();
    const { messageID, threadID } = event;

    const react = (emoji) => api.setMessageReaction(emoji, messageID, threadID);

    if (body.includes("iloveyou"))     return react("😙");
    if (body.includes("i love you"))   return react("😙");
    if (body.includes("good night"))   return react("😴");
    if (body.includes("good morning")) return react("🫩");
    if (body.includes("good afternoon")) return react("❤");
    if (body.includes("good evening")) return react("❤");
    if (body.includes("i miss you"))   return react("💗");
    if (body.includes("mahal"))        return react("🙀");
    if (body.includes("mwa"))          return react("😺");
    if (body.includes("gandao"))       return react("💗");
    if (body.includes("sad"))          return react("😔");
    if (body.includes("i hate you"))   return react("😞");
    if (body.includes("useless"))      return react("😓");
    if (body.includes("omg"))          return react("😮");
    if (body.includes("shoti"))        return react("😏");
    if (body.includes("shakil"))       return react("😎");
    if (body.includes("hi"))           return react("🧑‍🍼");
    if (body.includes("hello"))        return react("🙌");
    if (body.includes("zope"))         return react("⏳");
    if (body.includes("pakyo"))        return react("😠");
    if (body.includes("pakyu"))        return react("🤬");
    if (body.includes("tangina"))      return react("😡");
    if (body.includes("gago"))         return react("😡");
    if (body.includes("fuck you"))     return react("🤬");
    if (body.includes("pangit"))       return react("😠");
    if (body.includes("bastos"))       return react("😳");
    if (body.includes("bas2s"))        return react("😳");
    if (body.includes("bastog"))       return react("😳");
    if (body.includes("bata"))         return react("👧");
    if (body.includes("kid"))          return react("👧");
    if (body.includes("redroom"))      return react("😏");
    if (body.includes("😢"))           return react("😢");
    if (body.includes("😆"))           return react("😆");
    if (body.includes("😂"))           return react("😆");
    if (body.includes("🤣"))           return react("😆");
    if (body.includes("😏"))           return react("😏");
  }
};
