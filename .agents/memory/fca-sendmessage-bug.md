---
name: FCA sendMessage group bug
description: xnil-ypb-fca sendMessage.js uses <= 15 threshold for thread ID length to detect group vs DM, which breaks 15-digit group IDs.
---

## The bug
`sendMessage.js` line 273:
```js
const isSingleUser = (...) ? (threadID.toString().length <= 15) : !isGroup;
```
`<= 15` treats exactly-15-digit group thread IDs as DMs, sending `other_user_fbid` instead of `thread_fbid` → Facebook error 1545012.

**Why:** Facebook DM user IDs are < 15 digits; group thread IDs are >= 15 digits. The correct threshold is `< 15`.

## Fixes applied
1. **FCA patch**: `scripts/patch-fca.js` changes `<= 15` → `< 15` in the installed FCA library.
2. **utils.js**: `message.send` and `message.reply` now pass `event.isGroup` as 5th arg to `api.sendMessage` so FCA uses the boolean path instead of length fallback.
3. **Persistence**: `start.sh` runs `node scripts/patch-fca.js` before bot start; `package.json` postinstall also runs it.

**How to apply:** After any `pnpm install`, the postinstall script auto-patches. On Railway/Render, nixpacks.toml + railway.json (no --ignore-scripts) ensures native builds work.
