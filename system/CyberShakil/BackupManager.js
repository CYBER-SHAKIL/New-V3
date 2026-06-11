'use strict';
// CYBER SHAKIL AI SYSTEM — Backup Manager
// Developed by MD SHAKIL HOSSEN

const fs   = require('fs-extra');
const path = require('path');
const Logger = require('./Logger');

const BACKUP_DIR = path.join(process.cwd(), 'backup');

const BackupManager = {
  ensureDir() {
    fs.ensureDirSync(BACKUP_DIR);
  },

  create(filePath) {
    this.ensureDir();
    const content = fs.readFileSync(filePath, 'utf8');
    const stamp   = Date.now();
    const base    = path.basename(filePath);
    const dest    = path.join(BACKUP_DIR, `${stamp}_${base}`);
    fs.writeFileSync(dest, content, 'utf8');
    Logger.backup(`Backup created → backup/${stamp}_${base}`);
    return { dest, stamp, base, content };
  },

  restore(backupPath, targetPath) {
    const content = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(targetPath, content, 'utf8');
    Logger.warn(`Restored from backup: ${path.basename(backupPath)}`);
  },

  list() {
    this.ensureDir();
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.js'))
      .sort()
      .reverse();
  },

  getLatest(basename) {
    return this.list().find(f => f.endsWith(`_${basename}`)) || null;
  },

  clean(keepLast = 20) {
    this.ensureDir();
    const files = this.list();
    if (files.length > keepLast) {
      files.slice(keepLast).forEach(f => {
        try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch (_) {}
      });
    }
  }
};

module.exports = BackupManager;
