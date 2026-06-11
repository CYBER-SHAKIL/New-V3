---
name: SHAKIL BOT V3 repo sync
description: Lessons from syncing commands from CYBER-SHAKIL/Goat-bot-v3 GitHub repo — conflicts, dead APIs, system folder.
---

## Key lessons

### Case-sensitive filename conflicts (skip these from repo)
Linux treats `Admin.js` ≠ `admin.js`, `Baby.js` ≠ `baby.js`, `Bot.js` ≠ `bot.js`, `Antiout.js` ≠ `antiout.js`.
The repo has uppercase versions but the bot already has lowercase versions with identical command names → importing both causes "duplicate command" loader error.
**Rule:** Before copying any file from repo, grep existing cmds for same `name:` value.

### system/CyberShakil folder required for fix.js
fix.js depends on `require('../../system/CyberShakil/AutoFixer')`.
This folder is NOT in scripts/cmds — it lives at repo root `system/CyberShakil/`.
**Rule:** When fix.js shows AutoFixer=null, copy `system/` folder from repo: `cp -r /tmp/repo/system /home/runner/workspace/`

### Dead API replacements used
- arch2devs.ct.ws → pollinations.ai (imggen, sdxl, wgen)
- kaiz-apis.gleeze.com removebg → api.betabotz.eu.org/api/tools/removebg?apikey=lalilulelo
- kaiz-apis.gleeze.com imgbb → catbox.moe upload (form-data POST to https://catbox.moe/user/api.php)
- akashx404-ff-liker-api.onrender.com (fflike) → confirmed live at 200, copy as-is

### Alias "wallpaper" owned by pin.js (pinterest)
wgen.js tried aliases ["wallpaper","wallgen"] — "wallpaper" conflicts with pin.js.
Fix: remove "wallpaper" alias, keep "wallgen" only.

### autosticker conflict
Auto_Stickers.js (bot) and autosticker.js (repo) both have name "autosticker".
Solution: delete Auto_Stickers.js, copy repo's autosticker.js (cleaner version).

### setting.js → Setting.js upgrade
Repo's Setting.js is v2.0 with 15-option interactive panel (vs bare setting.js).
Solution: delete setting.js, copy Setting.js from repo.
