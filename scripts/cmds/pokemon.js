// ═══════════════════════════════════════════
//  POKEMON — v3.0
//  Author: 𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡
//  Pokemon info + canvas card via PokéAPI
// ═══════════════════════════════════════════

const axios  = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs     = require("fs-extra");
const path   = require("path");

const TYPE_COLORS = {
  fire:"#FF4500",water:"#1E90FF",grass:"#3CB371",electric:"#FFD700",
  psychic:"#FF69B4",ice:"#00CED1",dragon:"#7B68EE",dark:"#2F4F4F",
  fairy:"#FF1493",normal:"#A9A9A9",fighting:"#B22222",flying:"#87CEEB",
  poison:"#8B008B",ground:"#D2691E",rock:"#808080",bug:"#556B2F",
  ghost:"#483D8B",steel:"#708090"
};

async function buildPokemonCard(poke) {
  const W = 900, H = 500;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  const mainType = poke.types[0]?.type?.name || "normal";
  const col      = TYPE_COLORS[mainType] || "#555";

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1a1a2e"); bg.addColorStop(1, "#16213e");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Side accent
  ctx.fillStyle = col + "33";
  ctx.beginPath(); ctx.roundRect(0, 0, 8, H, [0, 0, 4, 4]); ctx.fill();
  ctx.fillStyle = col + "22";
  ctx.beginPath(); ctx.roundRect(W - 8, 0, 8, H, [0, 0, 4, 4]); ctx.fill();

  // Pokemon image
  try {
    const spriteUrl = poke.sprites?.other?.["official-artwork"]?.front_default
      || poke.sprites?.front_default;
    if (spriteUrl) {
      const buf = (await axios.get(spriteUrl, { responseType: "arraybuffer" })).data;
      const img = await loadImage(buf);
      ctx.drawImage(img, W - 320, 20, 290, 290);
    }
  } catch {}

  // Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "left";
  ctx.fillText(
    poke.name.charAt(0).toUpperCase() + poke.name.slice(1),
    40, 70
  );

  ctx.fillStyle = "#aaaaaa";
  ctx.font = "28px Arial";
  ctx.fillText(`#${String(poke.id).padStart(3, "0")}`, 40, 110);

  // Types
  poke.types.forEach((t, i) => {
    const tc = TYPE_COLORS[t.type.name] || "#555";
    ctx.fillStyle = tc;
    ctx.beginPath(); ctx.roundRect(40 + i * 130, 130, 120, 36, 18); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center";
    ctx.fillText(t.type.name.toUpperCase(), 40 + i * 130 + 60, 155);
    ctx.textAlign = "left";
  });

  // Stats
  const stats = poke.stats.slice(0, 6);
  const statLabels = ["HP","ATK","DEF","SpAtk","SpDef","SPD"];
  stats.forEach((s, i) => {
    const y = 190 + i * 46;
    const val = s.base_stat;
    ctx.fillStyle = "#888"; ctx.font = "18px Arial"; ctx.textAlign = "left";
    ctx.fillText(statLabels[i] || s.stat.name.toUpperCase().slice(0,6), 40, y + 18);
    ctx.fillStyle = "#555";
    ctx.beginPath(); ctx.roundRect(110, y + 2, 380, 20, 10); ctx.fill();
    const barColor = val >= 100 ? "#00ff88" : val >= 60 ? "#FFD700" : "#ff5555";
    ctx.fillStyle = barColor;
    ctx.beginPath(); ctx.roundRect(110, y + 2, Math.min(val / 255 * 380, 380), 20, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 18px Arial"; ctx.textAlign = "right";
    ctx.fillText(val, 510, y + 18);
    ctx.textAlign = "left";
  });

  // Height / weight
  ctx.fillStyle = "#aaa"; ctx.font = "20px Arial";
  ctx.fillText(`📏 Height: ${(poke.height / 10).toFixed(1)}m   ⚖️ Weight: ${(poke.weight / 10).toFixed(1)}kg`, 40, 490);

  ctx.fillStyle = col + "88"; ctx.font = "italic 16px Arial"; ctx.textAlign = "right";
  ctx.fillText("SHAKIL BOT V3 • Pokédex", W - 20, H - 10);

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "pokemon",
    aliases: ["pokedex", "pkm"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Pokémon info & stat card" },
    longDescription:  { en: "Get full Pokémon info with stat bars and artwork" },
    category: "fun",
    guide: { en: "{pn} [name or number]\nExample: {pn} pikachu | {pn} 25" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;
    if (!args[0]) return message.reply("🎮 Usage: -pokemon [name or number]\nExample: -pokemon pikachu");

    api.setMessageReaction("🎮", messageID, () => {}, true);
    const query = args[0].toLowerCase().trim();

    try {
      const res  = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query}`, { timeout: 10000 });
      const poke = res.data;

      fs.ensureDirSync(path.join(__dirname, "cache"));
      const imgPath = path.join(__dirname, "cache", `pokemon_${Date.now()}.png`);
      const buf = await buildPokemonCard(poke);
      fs.writeFileSync(imgPath, buf);

      const abilities = poke.abilities.map(a => a.ability.name).join(", ");
      const types     = poke.types.map(t => t.type.name).join(", ");

      api.setMessageReaction("✅", messageID, () => {}, true);
      await message.reply({
        body:
`🎮 Pokédex — #${poke.id}
━━━━━━━━━━━━━━━━━
🔤 Name    : ${poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}
🏷️ Type    : ${types}
⚡ Ability : ${abilities}
📏 Height  : ${(poke.height / 10).toFixed(1)} m
⚖️ Weight  : ${(poke.weight / 10).toFixed(1)} kg`,
        attachment: fs.createReadStream(imgPath)
      });
      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 8000);

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (err.response?.status === 404)
        return message.reply(`❌ Pokémon "${query}" not found.\nTry a name like pikachu or a number like 25.`);
      message.reply("❌ PokéAPI error. Try again later.");
    }
  }
};
