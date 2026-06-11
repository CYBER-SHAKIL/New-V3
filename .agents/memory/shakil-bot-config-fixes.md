---
name: SHAKIL BOT V3 config and handler fixes
description: Key decisions made to fix group response, double-reply, noPrefix, and reactUnsend
---

## Rules applied

**adminOnly must be false for group usage**
- `config.json adminOnly.enable: false` — leaving it `true` blocks ALL non-admin users from every command.
- Per-command `role:` field still handles individual command permissions.
- **Why:** adminOnly is a global gate; the per-command role system is the right place for restrictions.

**whiteListMode whiteListIds must contain USER IDs, not thread IDs**
- The field was set to `["954864920667693"]` (a thread ID), not user IDs → nobody except adminBot could use the bot.
- Disabled `whiteListMode.enable: false` for general open usage.
- **Why:** whiteListMode.whiteListIds is checked against `event.senderID` (user UID), not threadID.

**Double-reply fix: isUserCallCommand pattern**
- Commands with BOTH `onStart` AND `onChat` fire both when user types a prefix command.
- Fix: add `if (isUserCallCommand) return;` at top of `onChat` in Bot.js and Baby.js.
- Other commands (rank, count, badwords, busy, rankup, translate, shortcut, prefix) have `onChat` as background trackers — do NOT add isUserCallCommand guard there.
- **Why:** handlerEvents passes `isUserCallCommand` flag to onChat; it's `true` when onStart already ran.

**noPrefix for admin — handlerEvents.js onStart()**
- Original: `if (!body || !body.startsWith(prefix)) return;`
- Fixed: check `config.adminBot.includes(senderID)` + `config.noPrefix?.enable === true` before returning.
- Args parsing: `(usedPrefix ? body.slice(prefix.length) : body).trim().split(/ +/)`.

**reactUnsend — handlerEvents.js onReaction()**
- Added at top of onReaction(), BEFORE the GoatBot.onReaction.get(messageID) check.
- Reads `config.reactUnsend` — checks enable, onlyAdmin, emojis list.
- Calls `api.unsendMessage(event.messageID)` when matched.
- **How to apply:** event.reaction holds the emoji; event.messageID is the reacted-to message.

## Bot requires account.txt
- Bot crashes on startup with ENOENT if `account.txt` (Facebook appstate/fbstate JSON) is missing.
- File must exist at project root before bot can login.
