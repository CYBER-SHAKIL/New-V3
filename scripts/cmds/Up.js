const { createCanvas, registerFont } = require("canvas");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const fontDir = path.join(__dirname, "fonts");

function ensureFont(filename, url) {
  const fp = path.join(fontDir, filename);
  if (!fs.existsSync(fp)) {
    try {
      fs.mkdirSync(fontDir, { recursive: true });
      execSync(`curl -L -o "${fp}" "${url}"`, { stdio: "pipe" });
    } catch {}
  }
  return fp;
}

ensureFont("NotoColorEmoji.ttf", "https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf");

registerFont(path.join(fontDir, "CourierPrime-Regular.ttf"), { family: "UI" });
registerFont(path.join(fontDir, "CourierPrime-Bold.ttf"),    { family: "UI", weight: "bold" });
try {
  registerFont(path.join(fontDir, "NotoColorEmoji.ttf"), { family: "Emoji" });
} catch {}

const themeMap = {};

const THEMES = {
  dark: {
    bg0: "#091525", bg1: "#0d1f3c", bg2: "#0c1a35", bg3: "#07101e",
    winBody: "rgba(10,18,38,0.84)",
    sidebar: "rgba(255,255,255,0.032)",
    tbFrom: "rgba(255,255,255,0.11)", tbTo: "rgba(255,255,255,0.04)",
    tbBorder: "rgba(255,255,255,0.10)",
    tbText: "rgba(255,255,255,0.80)",
    btnBg: "rgba(255,255,255,0.06)",
    btnText: "rgba(255,255,255,0.78)",
    sidebarBorder: "rgba(255,255,255,0.055)",
    activeItem: "rgba(0,120,212,0.22)",
    activeText: "rgba(255,255,255,0.88)",
    inactiveText: "rgba(255,255,255,0.34)",
    taskFrom: "rgba(18,28,52,0.97)", taskTo: "rgba(12,20,40,0.99)",
    taskBorder: "rgba(255,255,255,0.07)",
    taskText: "rgba(255,255,255,0.80)",
    taskSub: "rgba(255,255,255,0.42)",
    taskIcons: "rgba(255,255,255,0.55)",
    pageTitle: "#ffffff",
    dateText: "rgba(255,255,255,0.28)",
    cardBg: "rgba(255,255,255,0.052)",
    cardBorder: "rgba(255,255,255,0.09)",
    cardShine: "rgba(255,255,255,0.07)",
    cardShadow: "rgba(0,0,0,0.55)",
    labelText: "rgba(255,255,255,0.40)",
    labelText2: "rgba(255,255,255,0.38)",
    labelText3: "rgba(255,255,255,0.46)",
    labelText4: "rgba(255,255,255,0.68)",
    valueText: "rgba(255,255,255,0.80)",
    barLabel: "rgba(255,255,255,0.78)",
    barPct: "rgba(255,255,255,0.50)",
    barTrack: "rgba(255,255,255,0.10)",
    ringTrack: "rgba(255,255,255,0.07)",
    ringValue: "#ffffff",
    rowAlt: "rgba(255,255,255,0.022)",
    detailValue: "rgba(255,255,255,0.80)",
    subtitleText: "rgba(255,255,255,0.28)",
    networkIP: "rgba(255,255,255,0.55)",
    networkMask: "rgba(255,255,255,0.35)",
    cmdText: "rgba(255,255,255,0.55)",
    themeToggleBg: "rgba(255,255,255,0.06)",
    themeToggleBorder: "rgba(255,255,255,0.18)",
    themeActiveBg: "#0078d4",
    themeActiveText: "#ffffff",
    themeInactiveText: "rgba(255,255,255,0.45)",
  },
  light: {
    bg0: "#f0f4f8", bg1: "#e8edf5", bg2: "#edf1f7", bg3: "#e4eaf2",
    winBody: "rgba(255,255,255,0.92)",
    sidebar: "rgba(240,244,248,0.85)",
    tbFrom: "rgba(255,255,255,0.95)", tbTo: "rgba(240,244,248,0.90)",
    tbBorder: "rgba(0,0,0,0.10)",
    tbText: "rgba(20,20,20,0.82)",
    btnBg: "rgba(0,0,0,0.05)",
    btnText: "rgba(20,20,20,0.70)",
    sidebarBorder: "rgba(0,0,0,0.07)",
    activeItem: "rgba(0,120,212,0.12)",
    activeText: "#0078d4",
    inactiveText: "rgba(40,40,40,0.45)",
    taskFrom: "rgba(255,255,255,0.98)", taskTo: "rgba(240,244,248,0.99)",
    taskBorder: "rgba(0,0,0,0.08)",
    taskText: "rgba(20,20,20,0.80)",
    taskSub: "rgba(20,20,20,0.42)",
    taskIcons: "rgba(40,40,40,0.40)",
    pageTitle: "#1a1a2e",
    dateText: "rgba(30,30,30,0.38)",
    cardBg: "rgba(0,0,0,0.03)",
    cardBorder: "rgba(0,0,0,0.08)",
    cardShine: "rgba(255,255,255,0.60)",
    cardShadow: "rgba(0,0,0,0.12)",
    labelText: "rgba(30,30,30,0.45)",
    labelText2: "rgba(30,30,30,0.42)",
    labelText3: "rgba(30,30,30,0.55)",
    labelText4: "rgba(30,30,30,0.65)",
    valueText: "rgba(20,20,20,0.80)",
    barLabel: "rgba(30,30,30,0.80)",
    barPct: "rgba(30,30,30,0.45)",
    barTrack: "rgba(0,0,0,0.08)",
    ringTrack: "rgba(0,0,0,0.08)",
    ringValue: "#1a1a2e",
    rowAlt: "rgba(0,0,0,0.03)",
    detailValue: "rgba(20,20,20,0.80)",
    subtitleText: "rgba(30,30,30,0.38)",
    networkIP: "rgba(30,30,30,0.60)",
    networkMask: "rgba(30,30,30,0.40)",
    cmdText: "rgba(30,30,30,0.60)",
    themeToggleBg: "rgba(0,0,0,0.04)",
    themeToggleBorder: "rgba(0,0,0,0.15)",
    themeActiveBg: "#0078d4",
    themeActiveText: "#ffffff",
    themeInactiveText: "rgba(30,30,30,0.45)",
  }
};

let prev = null;
const getCPU = () => {
  let idle = 0, total = 0;
  for (const c of os.cpus()) {
    for (const t in c.times) total += c.times[t];
    idle += c.times.idle;
  }
  const cur = { idle, total };
  if (!prev) { prev = cur; return 0; }
  const di = cur.idle - prev.idle, dt = cur.total - prev.total;
  prev = cur;
  return dt ? Math.round(100 - (100 * di / dt)) : 0;
};
const getDisk = () => {
  try {
    const d = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
    return Math.round((parseInt(d[2]) / parseInt(d[1])) * 100);
  } catch { return Math.floor(Math.random() * 30) + 40; }
};
const getDiskTotal = () => {
  try {
    const d = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
    return (parseInt(d[1]) / 1024 / 1024).toFixed(1);
  } catch { return "N/A"; }
};
const getDiskUsed = () => {
  try {
    const d = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
    return (parseInt(d[2]) / 1024 / 1024).toFixed(1);
  } catch { return "N/A"; }
};
const getNetwork = () => {
  try {
    const ifaces = os.networkInterfaces();
    let t = 0;
    for (const i in ifaces) ifaces[i].forEach(a => { if (!a.internal && a.family === "IPv4") t++; });
    return t;
  } catch { return 1; }
};
const getNetworkIPs = () => {
  try {
    const ifaces = os.networkInterfaces();
    const result = [];
    for (const name in ifaces) {
      ifaces[name].forEach(a => {
        if (!a.internal && a.family === "IPv4") result.push({ name, address: a.address, netmask: a.netmask });
      });
    }
    return result;
  } catch { return []; }
};
const getTemperature = () => {
  try {
    if (os.platform() === "linux") {
      return Math.round(parseInt(execSync("cat /sys/class/thermal/thermal_zone0/temp").toString()) / 1000);
    } else if (os.platform() === "darwin") {
      const t = execSync("sudo powermetrics --samplers smc -i1 -n1 | grep -i 'CPU die temperature'").toString();
      const m = t.match(/(\d+.?\d*)/);
      return m ? Math.round(parseFloat(m[0])) : 45;
    }
  } catch { return Math.floor(Math.random() * 20) + 40; }
  return 45;
};
const getDhakaTime = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" });
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Dhaka" });
  const fullStr = now.toLocaleString("en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Dhaka"
  }) + " BDT";
  return { timeStr, dateStr, fullStr };
};

function roundRect(ctx, x, y, w, h, r) {
  const tl = Array.isArray(r) ? r[0] : r;
  const tr = Array.isArray(r) ? r[1] : r;
  const br = Array.isArray(r) ? r[2] : r;
  const bl = Array.isArray(r) ? r[3] : r;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

function acrylicCardT(ctx, x, y, w, h, r, th) {
  ctx.save();
  ctx.shadowColor   = th.cardShadow;
  ctx.shadowBlur    = 18;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = th.cardBg;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = th.cardBorder;
  ctx.lineWidth   = 1;
  ctx.stroke();
  roundRect(ctx, x + 1, y + 1, w - 2, 2, 1);
  ctx.fillStyle = th.cardShine;
  ctx.fill();
}

function win11BarT(ctx, x, y, w, value, color1, color2, label, pct, th) {
  const trackH = 10;
  ctx.font      = "bold 24px 'UI'";
  ctx.fillStyle = th.barLabel;
  ctx.textAlign = "left";
  ctx.fillText(label, x, y - 10);
  ctx.fillStyle = th.barPct;
  ctx.textAlign = "right";
  ctx.fillText(`${pct}%`, x + w, y - 10);
  roundRect(ctx, x, y, w, trackH, trackH / 2);
  ctx.fillStyle = th.barTrack;
  ctx.fill();
  if (value > 0) {
    const fw = Math.max((value / 100) * w, trackH);
    const g  = ctx.createLinearGradient(x, 0, x + fw, 0);
    g.addColorStop(0, color1);
    g.addColorStop(1, color2);
    roundRect(ctx, x, y, fw, trackH, trackH / 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.shadowColor = color1;
    ctx.shadowBlur  = 12;
    roundRect(ctx, x + fw - 4, y, 4, trackH, trackH / 2);
    ctx.fillStyle = color2;
    ctx.fill();
    ctx.restore();
  }
  ctx.textAlign = "left";
}

function clipText(ctx, text, maxW) {
  let t = text;
  while (ctx.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1);
  if (t !== text) t = t.slice(0, -1) + "..";
  return t;
}

function drawBase(c, W, H, activePage, version, th) {
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,    th.bg0);
  bg.addColorStop(0.4,  th.bg1);
  bg.addColorStop(0.75, th.bg2);
  bg.addColorStop(1,    th.bg3);
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);

  const glow = (gx, gy, gr, col) => {
    const rg = c.createRadialGradient(gx, gy, 0, gx, gy, gr);
    rg.addColorStop(0, col);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = rg;
    c.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
  };
  glow(280, 200, 480, "rgba(0,120,212,0.17)");
  glow(1520, 820, 440, "rgba(90,60,200,0.13)");
  glow(900, 580, 560, "rgba(0,80,170,0.08)");

  const WIN_X = 55, WIN_Y = 28, WIN_W = W - 110;
  const TB_H  = 50;

  roundRect(c, WIN_X, WIN_Y, WIN_W, TB_H, [12, 12, 0, 0]);
  const tbG = c.createLinearGradient(WIN_X, WIN_Y, WIN_X, WIN_Y + TB_H);
  tbG.addColorStop(0, th.tbFrom);
  tbG.addColorStop(1, th.tbTo);
  c.fillStyle = tbG;
  c.fill();
  c.strokeStyle = th.tbBorder;
  c.lineWidth   = 1;
  c.stroke();

  c.beginPath();
  c.arc(WIN_X + 22, WIN_Y + 25, 9, 0, Math.PI * 2);
  c.fillStyle = "#0078d4";
  c.fill();

  c.font      = "bold 23px 'UI'";
  c.fillStyle = th.tbText;
  c.textAlign = "left";
  c.fillText(`System Monitor  \u2014  v${version}`, WIN_X + 46, WIN_Y + 32);

  [
    { x: WIN_X + WIN_W - 138, label: "\u2014", bg: th.btnBg },
    { x: WIN_X + WIN_W - 92,  label: "\u25A1",  bg: th.btnBg },
    { x: WIN_X + WIN_W - 46,  label: "\u2715",  bg: "rgba(196,43,28,0.85)" },
  ].forEach(btn => {
    roundRect(c, btn.x - 8, WIN_Y + 1, 44, TB_H - 2, 0);
    c.fillStyle = btn.bg;
    c.fill();
    c.font      = "19px 'UI'";
    c.fillStyle = btn.label === "\u2715" ? "rgba(255,255,255,0.90)" : th.btnText;
    c.textAlign = "center";
    c.fillText(btn.label, btn.x + 14, WIN_Y + 30);
  });

  const BODY_Y = WIN_Y + TB_H;
  const BODY_H = H - TB_H - WIN_Y - 30 - 72;
  roundRect(c, WIN_X, BODY_Y, WIN_W, BODY_H, [0, 0, 12, 12]);
  c.fillStyle = th.winBody;
  c.fill();
  c.strokeStyle = th.tbBorder;
  c.lineWidth   = 1;
  c.stroke();

  const SB_W = 265;
  roundRect(c, WIN_X + 1, BODY_Y + 1, SB_W, BODY_H - 2, [0, 0, 0, 12]);
  c.fillStyle = th.sidebar;
  c.fill();
  c.strokeStyle = th.sidebarBorder;
  c.lineWidth   = 1;
  c.beginPath();
  c.moveTo(WIN_X + SB_W, BODY_Y + 8);
  c.lineTo(WIN_X + SB_W, BODY_Y + BODY_H - 8);
  c.stroke();

  const pages = ["Overview", "Performance", "Network", "Storage", "Settings"];
  pages.forEach((label, i) => {
    const ny     = BODY_Y + 28 + i * 66;
    const active = label.toLowerCase() === activePage;
    if (active) {
      roundRect(c, WIN_X + 10, ny - 4, SB_W - 20, 54, 8);
      c.fillStyle = th.activeItem;
      c.fill();
      c.fillStyle = "#0078d4";
      c.fillRect(WIN_X + 10, ny + 4, 4, 34);
    }
    c.font      = "bold 21px 'UI'";
    c.fillStyle = active ? th.activeText : th.inactiveText;
    c.textAlign = "left";
    c.fillText(label, WIN_X + 28, ny + 30);
  });

  const { timeStr, dateStr } = getDhakaTime();
  const TASK_Y = H - 70;
  const taskBg = c.createLinearGradient(0, TASK_Y, 0, H);
  taskBg.addColorStop(0, th.taskFrom);
  taskBg.addColorStop(1, th.taskTo);
  c.fillStyle = taskBg;
  c.fillRect(0, TASK_Y, W, 70);
  c.strokeStyle = th.taskBorder;
  c.lineWidth   = 1;
  c.beginPath();
  c.moveTo(0, TASK_Y);
  c.lineTo(W, TASK_Y);
  c.stroke();

  roundRect(c, W / 2 - 230, TASK_Y + 9, 50, 50, 8);
  c.fillStyle = "rgba(0,120,212,0.88)";
  c.fill();
  c.font      = "bold 26px 'UI'";
  c.fillStyle = "#ffffff";
  c.textAlign = "center";
  c.fillText("\u229E", W / 2 - 205, TASK_Y + 43);

  ["\u25A3", "\u25A6", "\u2740", "\u25CE", "\u2699"].forEach((icon, i) => {
    const ix = W / 2 - 120 + i * 58;
    c.font      = "26px 'UI'";
    c.textAlign = "center";
    c.fillStyle = i === 0 ? th.taskText : th.taskIcons;
    c.fillText(icon, ix, TASK_Y + 43);
    if (i === 0) {
      c.beginPath();
      c.arc(ix, TASK_Y + 62, 3, 0, Math.PI * 2);
      c.fillStyle = "#0078d4";
      c.fill();
    }
  });

  c.font      = "bold 21px 'UI'";
  c.fillStyle = th.taskText;
  c.textAlign = "right";
  c.fillText(timeStr, W - 28, TASK_Y + 32);
  c.font      = "19px 'UI'";
  c.fillStyle = th.taskSub;
  c.fillText(dateStr, W - 28, TASK_Y + 56);

  ["\u266B", "\u25D0", "\u2602"].forEach((ico, i) => {
    c.font      = "22px 'UI'";
    c.fillStyle = th.taskIcons;
    c.textAlign = "center";
    c.fillText(ico, W - 165 + i * 34, TASK_Y + 40);
  });

  return { WIN_X, WIN_Y, WIN_W, TB_H, BODY_Y, BODY_H, SB_W };
}

function drawPageHeader(c, MX, MY, WIN_X, WIN_W, title, subtitle, subtitleColor, th) {
  c.font      = "bold 46px 'UI'";
  c.fillStyle = th.pageTitle;
  c.textAlign = "left";
  c.fillText(title, MX, MY + 42);

  if (subtitle) {
    const pillW = c.measureText(subtitle).width + 44;
    roundRect(c, MX + 232, MY + 12, pillW, 34, 17);
    c.fillStyle = subtitleColor + "20";
    c.fill();
    roundRect(c, MX + 232, MY + 12, pillW, 34, 17);
    c.strokeStyle = subtitleColor + "55";
    c.lineWidth   = 1;
    c.stroke();
    c.beginPath();
    c.arc(MX + 250, MY + 29, 6, 0, Math.PI * 2);
    c.fillStyle = subtitleColor;
    c.fill();
    c.font      = "bold 19px 'UI'";
    c.fillStyle = subtitleColor;
    c.textAlign = "left";
    c.fillText(subtitle, MX + 263, MY + 34);
  }

  c.font      = "21px 'UI'";
  c.fillStyle = th.subtitleText;
  c.textAlign = "right";
  c.fillText(getDhakaTime().fullStr, WIN_X + WIN_W - 28, MY + 42);
}

async function renderPage(page, sysData, th) {
  const W = 1800, H = 1160;
  const cv = createCanvas(W, H);
  const c  = cv.getContext("2d");

  const { WIN_X, WIN_Y, WIN_W, TB_H, BODY_Y, BODY_H, SB_W } = drawBase(c, W, H, page, "3.0", th);

  const MX  = WIN_X + SB_W + 28;
  const MY  = BODY_Y + 22;
  const MCW = WIN_W - SB_W - 46;
  const gap = 18;

  const { cpu, ram, disk, network, temp, threads, platform, arch, hostname,
    load, cpuModel, ramGB, usedGB, uptime, ping, pingLabel, pingAccent,
    sysStatus, sysStatusColor, diskTotal, diskUsed, netIPs, themeName } = sysData;

  if (page === "overview") {
    drawPageHeader(c, MX, MY, WIN_X, WIN_W, "Overview", sysStatus, sysStatusColor, th);

    const R1Y = MY + 62, R1H = 120;
    const C4W = (MCW - gap * 3) / 4;
    [
      { label: "Hostname",  value: hostname.substring(0, 16), accent: "#60a5fa", large: false },
      { label: "OS / Arch", value: `${platform}  ${arch}`,   accent: "#a78bfa", large: false },
      { label: "Processor", value: cpuModel,                  accent: "#f59e0b", large: false },
      { label: "Uptime",    value: uptime,                    accent: "#34d399", large: true  },
    ].forEach((card, i) => {
      const cx = MX + i * (C4W + gap);
      acrylicCardT(c, cx, R1Y, C4W, R1H, 12, th);
      c.font      = "19px 'UI'";
      c.fillStyle = th.labelText;
      c.textAlign = "left";
      c.fillText(card.label, cx + 16, R1Y + 28);
      if (card.large) {
        c.font      = "bold 44px 'UI'";
        c.fillStyle = card.accent;
        c.textAlign = "left";
        c.fillText(card.value, cx + 16, R1Y + 88);
      } else {
        c.font = "bold 26px 'UI'";
        const clipped = clipText(c, card.value, C4W - 28);
        c.fillStyle = card.accent;
        c.textAlign = "left";
        c.fillText(clipped, cx + 16, R1Y + 78);
      }
    });

    const R2Y = R1Y + R1H + 18;
    const PERF_W = Math.floor((MCW * 0.60 - gap * 2) / 3);
    const PERF_H = 235;
    [
      { label: "CPU",    value: cpu,  sub: `${threads} Cores \u00b7 Load ${load}`, c1: "#0078d4", c2: "#60a5fa" },
      { label: "Memory", value: ram,  sub: `${usedGB} GB / ${ramGB} GB`,           c1: "#7c3aed", c2: "#a78bfa" },
      { label: "Disk",   value: disk, sub: `Usage ${disk}% \u00b7 Active`,          c1: "#db2777", c2: "#f472b6" },
    ].forEach((card, i) => {
      const px = MX + i * (PERF_W + gap);
      acrylicCardT(c, px, R2Y, PERF_W, PERF_H, 14, th);
      const ringCX = px + PERF_W / 2, ringCY = R2Y + 102, ringR = 68;
      c.beginPath(); c.arc(ringCX, ringCY, ringR, Math.PI * 0.75, Math.PI * 2.25);
      c.strokeStyle = th.ringTrack; c.lineWidth = 11; c.lineCap = "round"; c.stroke();
      const arcEnd = Math.PI * 0.75 + (card.value / 100) * Math.PI * 1.5;
      const arcG = c.createLinearGradient(px, R2Y, px + PERF_W, R2Y + PERF_H);
      arcG.addColorStop(0, card.c1); arcG.addColorStop(1, card.c2);
      c.beginPath(); c.arc(ringCX, ringCY, ringR, Math.PI * 0.75, arcEnd);
      c.strokeStyle = arcG; c.lineWidth = 11; c.lineCap = "round"; c.stroke();
      c.save(); c.shadowColor = card.c1; c.shadowBlur = 16;
      c.beginPath(); c.arc(ringCX, ringCY, ringR, arcEnd - 0.04, arcEnd);
      c.strokeStyle = card.c2; c.lineWidth = 11; c.stroke(); c.restore();
      c.font = "bold 44px 'UI'"; c.fillStyle = th.ringValue; c.textAlign = "center";
      c.fillText(`${card.value}%`, ringCX, ringCY + 15);
      c.font = "bold 26px 'UI'"; c.fillStyle = card.c2; c.fillText(card.label, ringCX, R2Y + 192);
      c.font = "19px 'UI'"; c.fillStyle = th.labelText; c.fillText(card.sub, ringCX, R2Y + 218);
    });

    const DPX = MX + PERF_W * 3 + gap * 3;
    const DPW = MCW - PERF_W * 3 - gap * 3;
    acrylicCardT(c, DPX, R2Y, DPW, PERF_H, 14, th);
    c.font = "bold 24px 'UI'"; c.fillStyle = th.labelText4; c.textAlign = "left";
    c.fillText("System Details", DPX + 18, R2Y + 34);
    [
      { k: "Node.js",  v: process.version },
      { k: "Threads",  v: `${threads}`    },
      { k: "Temp",     v: `${temp}\u00b0C` },
      { k: "Net IFs",  v: `${network}`    },
      { k: "Load Avg", v: `${load}`       },
    ].forEach((row, i) => {
      const dy = R2Y + 64 + i * 34;
      if (i % 2 === 0) {
        roundRect(c, DPX + 10, dy - 16, DPW - 20, 30, 6);
        c.fillStyle = th.rowAlt; c.fill();
      }
      c.font = "19px 'UI'"; c.fillStyle = th.labelText2; c.textAlign = "left";
      c.fillText(row.k, DPX + 20, dy + 5);
      c.font = "bold 19px 'UI'"; c.fillStyle = th.detailValue; c.textAlign = "right";
      c.fillText(row.v, DPX + DPW - 18, dy + 5);
    });

    const R3Y = R2Y + PERF_H + 18, R3H = 160;
    acrylicCardT(c, MX, R3Y, MCW, R3H, 14, th);
    c.font = "bold 22px 'UI'"; c.fillStyle = th.labelText3; c.textAlign = "left";
    c.fillText("Resource Usage", MX + 18, R3Y + 30);
    const barW = (MCW - 90) / 3;
    [
      { label: "CPU Usage",    value: cpu,  c1: "#0078d4", c2: "#60a5fa" },
      { label: "Memory Usage", value: ram,  c1: "#7c3aed", c2: "#a78bfa" },
      { label: "Disk Usage",   value: disk, c1: "#db2777", c2: "#f472b6" },
    ].forEach((bar, i) => {
      win11BarT(c, MX + 18 + i * (barW + 27), R3Y + 86, barW, bar.value, bar.c1, bar.c2, bar.label, bar.value, th);
    });

    