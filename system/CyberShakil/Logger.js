'use strict';
// ╔══════════════════════════════════════════════╗
// ║   CYBER SHAKIL AI CORE — Logger Module       ║
// ║   Developed by MD SHAKIL HOSSEN              ║
// ╚══════════════════════════════════════════════╝

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const MAGENTA= '\x1b[35m';
const BLUE   = '\x1b[34m';
const WHITE  = '\x1b[37m';

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

const Logger = {
  header() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║   🤖  CYBER SHAKIL AI AUTO FIXER SYSTEM      ║${RESET}`);
    console.log(`${BOLD}${CYAN}║   Developed by MD SHAKIL HOSSEN              ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════╝${RESET}\n`);
  },

  step(msg) {
    console.log(`${BOLD}${BLUE}[ CYBER SHAKIL AI CORE ]${RESET} ${WHITE}${ts()}${RESET} ${CYAN}▶${RESET} ${msg}`);
  },

  success(msg) {
    console.log(`${BOLD}${GREEN}[ ✅ SUCCESS ]${RESET} ${WHITE}${ts()}${RESET} ${GREEN}${msg}${RESET}`);
  },

  warn(msg) {
    console.log(`${BOLD}${YELLOW}[ ⚠️  WARN   ]${RESET} ${WHITE}${ts()}${RESET} ${YELLOW}${msg}${RESET}`);
  },

  error(msg) {
    console.log(`${BOLD}${RED}[ ❌ ERROR  ]${RESET} ${WHITE}${ts()}${RESET} ${RED}${msg}${RESET}`);
  },

  info(msg) {
    console.log(`${BOLD}${MAGENTA}[ ℹ️  INFO   ]${RESET} ${WHITE}${ts()}${RESET} ${DIM}${msg}${RESET}`);
  },

  ai(model, msg) {
    console.log(`${BOLD}${YELLOW}[ 🧠 AI     ]${RESET} ${WHITE}${ts()}${RESET} ${YELLOW}[${model}]${RESET} ${msg}`);
  },

  scan(msg) {
    console.log(`${BOLD}${CYAN}[ 🔍 SCAN   ]${RESET} ${WHITE}${ts()}${RESET} ${msg}`);
  },

  backup(msg) {
    console.log(`${BOLD}${BLUE}[ 💾 BACKUP ]${RESET} ${WHITE}${ts()}${RESET} ${msg}`);
  },

  divider() {
    console.log(`${DIM}${'─'.repeat(60)}${RESET}`);
  }
};

module.exports = Logger;
