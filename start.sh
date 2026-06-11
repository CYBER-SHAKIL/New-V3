#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SHAKIL BOT V3 — Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Restore account.txt from env var (Render / Railway fresh deploy) ─────────
if [ ! -f "account.txt" ] || [ ! -s "account.txt" ]; then
    if [ -n "$APPSTATE" ]; then
        echo "[*] Restoring account.txt from APPSTATE environment variable..."
        echo "$APPSTATE" > account.txt
    else
        echo "[!] WARNING: account.txt missing and APPSTATE env var not set."
        echo "[!] Bot will fail to login. Set APPSTATE on Render/Railway."
    fi
else
    echo "[*] account.txt found."
fi

# ── Ensure required directories exist ────────────────────────────────────────
mkdir -p scripts/cmds/cache scripts/cmds/tmp scripts/events/tmp \
         scripts/events/data/leaveAttachment scripts/events/data/welcomeAttachment \
         database/data cache logs

# ── Install dependencies ──────────────────────────────────────────────────────
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.modules.yaml" ]; then
    echo "[*] Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install --frozen-lockfile 2>/dev/null || pnpm install
    else
        npm install --legacy-peer-deps
    fi
else
    echo "[*] Dependencies already installed, skipping..."
fi

echo "[*] Applying FCA patches..."
node scripts/patch-fca.js

echo "[*] Starting bot..."
node index.js
