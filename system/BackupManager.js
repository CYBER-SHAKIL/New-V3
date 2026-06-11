'use strict';

const fs = require('fs-extra');
const path = require('path');
const log = require('../logger/log.js');

const BACKUP_DIR = path.resolve(__dirname, '../backup');

class BackupManager {
  constructor(backupDir = BACKUP_DIR) {
    this.backupDir = backupDir;
    fs.ensureDirSync(this.backupDir);
  }

  _timestamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
  }

  backup(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const filename = path.basename(filePath);
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      const backupName = `${base}_${this._timestamp()}${ext}`;
      const backupPath = path.join(this.backupDir, backupName);
      fs.copySync(filePath, backupPath);
      log.info('BACKUP', `Saved backup: ${backupName}`);
      return backupPath;
    } catch (err) {
      log.error('BACKUP', `Failed to backup ${filePath}: ${err.message}`);
      throw err;
    }
  }

  restore(backupPath, targetPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup not found: ${backupPath}`);
      }
      fs.copySync(backupPath, targetPath, { overwrite: true });
      log.info('BACKUP', `Restored: ${path.basename(backupPath)} → ${path.basename(targetPath)}`);
    } catch (err) {
      log.error('BACKUP', `Failed to restore: ${err.message}`);
      throw err;
    }
  }

  listBackups(basename) {
    try {
      const all = fs.readdirSync(this.backupDir);
      return basename
        ? all.filter(f => f.startsWith(path.basename(basename, path.extname(basename))))
        : all;
    } catch {
      return [];
    }
  }

  latestBackup(basename) {
    const backups = this.listBackups(basename).sort().reverse();
    return backups.length ? path.join(this.backupDir, backups[0]) : null;
  }

  cleanOld(basename, keepCount = 5) {
    const backups = this.listBackups(basename).sort().reverse();
    const toDelete = backups.slice(keepCount);
    for (const f of toDelete) {
      try {
        fs.removeSync(path.join(this.backupDir, f));
      } catch {}
    }
  }
}

module.exports = new BackupManager();
module.exports.BackupManager = BackupManager;
