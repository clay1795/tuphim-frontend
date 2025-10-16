const cron = require('node-cron');
const kkphimSyncService = require('./kkphimSyncService');
const backupService = require('./backupService');
const logger = require('../services/logger');

class SyncScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  /**
   * Khởi động scheduler
   */
  start() {
    logger.info('🕐 Starting KKPhim sync scheduler...');

    // Job 1: Chạy incremental sync + backup mỗi giờ
    const hourlyJob = cron.schedule('0 * * * *', async () => {
      await this.runIncrementalSync();
      await this.runHourlyBackup();
    }, {
      scheduled: false,
      timezone: 'Asia/Ho_Chi_Minh'
    });

    // Job 2: Chạy full backup mỗi ngày lúc 3:00 AM
    const dailyJob = cron.schedule('0 3 * * *', async () => {
      logger.info('🌅 Daily full backup scheduled');
      await this.runDailyBackup();
    }, {
      scheduled: false,
      timezone: 'Asia/Ho_Chi_Minh'
    });

    // Job 3: Health check mỗi 10 phút
    const healthJob = cron.schedule('*/10 * * * *', async () => {
      await this.healthCheck();
    }, {
      scheduled: false,
      timezone: 'Asia/Ho_Chi_Minh'
    });

    // Lưu jobs
    this.jobs.set('hourly', hourlyJob);
    this.jobs.set('daily', dailyJob);
    this.jobs.set('health', healthJob);

    // Start jobs
    hourlyJob.start();
    dailyJob.start();
    healthJob.start();

    logger.info('✅ Sync scheduler started');
    logger.info('📅 Hourly incremental sync + backup: Every hour at minute 0');
    logger.info('📅 Daily full backup: 3:00 AM');
    logger.info('📅 Health check: Every 10 minutes');

    this.isRunning = true;
  }

  /**
   * Dừng scheduler
   */
  stop() {
    logger.info('🛑 Stopping sync scheduler...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`✅ Stopped ${name} job`);
    }

    this.jobs.clear();
    this.isRunning = false;
    logger.info('✅ Sync scheduler stopped');
  }

  /**
   * Chạy incremental sync
   */
  async runIncrementalSync() {
    if (this.isRunning) {
      logger.info('⏰ Hourly incremental sync triggered');
      
      try {
        const stats = await kkphimSyncService.incrementalSync();
        
        logger.info('✅ Hourly sync completed:', {
          newMovies: stats.newMovies,
          updatedMovies: stats.updatedMovies,
          errors: stats.errors
        });

        // Log nếu có phim mới
        if (stats.newMovies > 0 || stats.updatedMovies > 0) {
          logger.info(`🎬 New content found: ${stats.newMovies} new movies, ${stats.updatedMovies} updated movies`);
        }

      } catch (error) {
        logger.error('❌ Hourly sync failed:', error);
      }
    }
  }

  /**
   * Chạy full sync
   */
  async runFullSync() {
    if (this.isRunning) {
      logger.info('🌅 Daily full sync triggered');
      
      try {
        const stats = await kkphimSyncService.fullSync();
        
        logger.info('✅ Full sync completed:', {
          totalMovies: stats.totalMovies,
          newMovies: stats.newMovies,
          errors: stats.errors
        });

      } catch (error) {
        logger.error('❌ Full sync failed:', error);
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const status = await kkphimSyncService.getSyncStatus();
      
      // Log status mỗi 10 phút (chỉ khi có thay đổi)
      if (status.totalMovies > 0) {
        logger.debug('💚 Sync health check:', {
          totalMovies: status.totalMovies,
          lastSync: status.lastSyncTime,
          isRunning: status.isInitialSync || status.isIncrementalSync
        });
      }

    } catch (error) {
      logger.error('❌ Health check failed:', error);
    }
  }

  /**
   * Backup hàng giờ (sau khi sync)
   */
  async runHourlyBackup() {
    try {
      logger.info('💾 Starting hourly backup...');
      
      // Tạo JSON backup nhỏ (chỉ phim mới/đã update)
      const result = await backupService.createJsonBackup();
      
      logger.info('✅ Hourly backup completed:', result);

    } catch (error) {
      logger.error('❌ Hourly backup failed:', error);
    }
  }

  /**
   * Backup đầy đủ hàng ngày
   */
  async runDailyBackup() {
    try {
      logger.info('💾 Starting daily full backup...');
      
      const results = await backupService.createFullBackup();
      
      logger.info('✅ Daily backup completed:', results);

    } catch (error) {
      logger.error('❌ Daily backup failed:', error);
    }
  }

  /**
   * Chạy sync ngay lập tức (manual trigger)
   */
  async runManualSync(type = 'incremental') {
    logger.info(`🔄 Manual ${type} sync triggered`);
    
    try {
      let stats;
      if (type === 'full') {
        stats = await kkphimSyncService.fullSync();
      } else {
        stats = await kkphimSyncService.incrementalSync();
      }

      logger.info(`✅ Manual ${type} sync completed:`, stats);
      return stats;

    } catch (error) {
      logger.error(`❌ Manual ${type} sync failed:`, error);
      throw error;
    }
  }

  /**
   * Chạy backup ngay lập tức (manual trigger)
   */
  async runManualBackup(type = 'json') {
    logger.info(`🔄 Manual ${type} backup triggered`);
    
    try {
      let result;
      if (type === 'full') {
        result = await backupService.createFullBackup();
      } else if (type === 'mongo') {
        result = await backupService.createMongoBackup();
      } else {
        result = await backupService.createJsonBackup();
      }

      logger.info(`✅ Manual ${type} backup completed:`, result);
      return result;

    } catch (error) {
      logger.error(`❌ Manual ${type} backup failed:`, error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái scheduler
   */
  getStatus() {
    const jobStatus = {};
    for (const [name, job] of this.jobs) {
      jobStatus[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }

    return {
      isRunning: this.isRunning,
      jobs: jobStatus
    };
  }

  /**
   * Lấy lịch trình tiếp theo
   */
  getNextSchedules() {
    return {
      hourly: 'Every hour at minute 0',
      daily: 'Every day at 3:00 AM (disabled)',
      health: 'Every 10 minutes'
    };
  }
}

module.exports = new SyncScheduler();
