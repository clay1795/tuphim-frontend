const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('./logger');
require('dotenv').config();

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 7;
    this.compressBackups = process.env.BACKUP_COMPRESS === 'true';
    this.mongoUri = process.env.MONGODB_URI;
    
    if (!this.mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
  }

  /**
   * Tạo backup MongoDB
   */
  async createMongoBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `tuphim-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupFileName);

      logger.info(`🔄 Creating MongoDB backup: ${backupFileName}`);

      // Tạo thư mục backup nếu chưa có
      await fs.mkdir(this.backupDir, { recursive: true });

      // Kết nối MongoDB để lấy thông tin database
      await mongoose.connect(this.mongoUri);
      const dbName = mongoose.connection.db.databaseName;
      await mongoose.disconnect();

      // Tạo backup command
      const backupCommand = `mongodump --uri="${this.mongoUri}" --out="${backupPath}"`;

      // Thực hiện backup
      const { stdout, stderr } = await execAsync(backupCommand);
      
      if (stderr && !stderr.includes('done dumping')) {
        throw new Error(`MongoDB backup error: ${stderr}`);
      }

      logger.info(`✅ MongoDB backup created successfully: ${backupPath}`);

      // Nén backup nếu được yêu cầu
      if (this.compressBackups) {
        const compressedPath = `${backupPath}.tar.gz`;
        const compressCommand = `tar -czf "${compressedPath}" -C "${this.backupDir}" "${backupFileName}"`;
        
        await execAsync(compressCommand);
        
        // Xóa thư mục backup gốc sau khi nén
        await execAsync(`rmdir /s /q "${backupPath}"`);
        
        logger.info(`🗜️ Backup compressed: ${compressedPath}`);
        return compressedPath;
      }

      return backupPath;

    } catch (error) {
      logger.error('❌ MongoDB backup failed:', error);
      throw error;
    }
  }

  /**
   * Tạo backup JSON (dự phòng)
   */
  async createJsonBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `tuphim-json-backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFileName);

      logger.info(`🔄 Creating JSON backup: ${backupFileName}`);

      // Kết nối MongoDB
      await mongoose.connect(this.mongoUri);
      
      // Lấy dữ liệu movies
      const Movie = mongoose.model('Movie', new mongoose.Schema({}, { strict: false }));
      const movies = await Movie.find({}).lean();
      
      // Lấy dữ liệu users
      const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
      const users = await User.find({}).lean();

      await mongoose.disconnect();

      // Tạo thư mục backup
      await fs.mkdir(this.backupDir, { recursive: true });

      // Tạo dữ liệu backup
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        database: 'tuphim',
        collections: {
          movies: {
            count: movies.length,
            data: movies
          },
          users: {
            count: users.length,
            data: users
          }
        }
      };

      // Ghi file backup
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

      logger.info(`✅ JSON backup created successfully: ${backupPath} (${movies.length} movies, ${users.length} users)`);

      return backupPath;

    } catch (error) {
      logger.error('❌ JSON backup failed:', error);
      throw error;
    }
  }

  /**
   * Xóa backup cũ theo retention policy
   */
  async cleanupOldBackups() {
    try {
      logger.info(`🧹 Cleaning up backups older than ${this.retentionDays} days...`);

      const files = await fs.readdir(this.backupDir);
      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        if (file.includes('tuphim-backup-')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > retentionMs) {
            await fs.unlink(filePath);
            deletedCount++;
            logger.info(`🗑️ Deleted old backup: ${file}`);
          }
        }
      }

      logger.info(`✅ Cleanup completed: ${deletedCount} old backups deleted`);

    } catch (error) {
      logger.error('❌ Backup cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách backup
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.includes('tuphim-backup-')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime,
            type: file.endsWith('.tar.gz') ? 'compressed' : file.endsWith('.json') ? 'json' : 'mongodb'
          });
        }
      }

      return backups.sort((a, b) => b.created - a.created);

    } catch (error) {
      logger.error('❌ List backups failed:', error);
      throw error;
    }
  }

  /**
   * Khôi phục từ backup
   */
  async restoreFromBackup(backupPath) {
    try {
      logger.info(`🔄 Restoring from backup: ${backupPath}`);

      if (backupPath.endsWith('.json')) {
        return await this.restoreFromJsonBackup(backupPath);
      } else {
        return await this.restoreFromMongoBackup(backupPath);
      }

    } catch (error) {
      logger.error('❌ Restore backup failed:', error);
      throw error;
    }
  }

  /**
   * Khôi phục từ JSON backup
   */
  async restoreFromJsonBackup(backupPath) {
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    
    await mongoose.connect(this.mongoUri);
    
    // Restore movies
    if (backupData.collections.movies.data.length > 0) {
      const Movie = mongoose.model('Movie', new mongoose.Schema({}, { strict: false }));
      await Movie.deleteMany({});
      await Movie.insertMany(backupData.collections.movies.data);
      logger.info(`✅ Restored ${backupData.collections.movies.count} movies`);
    }
    
    // Restore users
    if (backupData.collections.users.data.length > 0) {
      const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
      await User.deleteMany({});
      await User.insertMany(backupData.collections.users.data);
      logger.info(`✅ Restored ${backupData.collections.users.count} users`);
    }
    
    await mongoose.disconnect();
    
    logger.info('✅ JSON backup restore completed');
  }

  /**
   * Khôi phục từ MongoDB backup
   */
  async restoreFromMongoBackup(backupPath) {
    const restoreCommand = `mongorestore --uri="${this.mongoUri}" --drop "${backupPath}"`;
    
    const { stdout, stderr } = await execAsync(restoreCommand);
    
    if (stderr && !stderr.includes('done')) {
      throw new Error(`MongoDB restore error: ${stderr}`);
    }
    
    logger.info('✅ MongoDB backup restore completed');
  }

  /**
   * Tạo backup đầy đủ (MongoDB + JSON)
   */
  async createFullBackup() {
    try {
      logger.info('🚀 Starting full backup process...');
      
      const results = {
        mongoBackup: null,
        jsonBackup: null,
        cleanup: null
      };

      // Tạo MongoDB backup
      results.mongoBackup = await this.createMongoBackup();
      
      // Tạo JSON backup (dự phòng)
      results.jsonBackup = await this.createJsonBackup();
      
      // Cleanup backup cũ
      results.cleanup = await this.cleanupOldBackups();
      
      logger.info('✅ Full backup process completed successfully');
      
      return results;

    } catch (error) {
      logger.error('❌ Full backup process failed:', error);
      throw error;
    }
  }
}

module.exports = new BackupService();
