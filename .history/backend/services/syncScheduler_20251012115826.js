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
    healthJob.start();
    
    // dailyJob.start(); // Uncomment if needed

    logger.info('✅ Sync scheduler started');
    logger.info('📅 Hourly incremental sync: Every hour at minute 0');
    logger.info('📅 Daily full sync: 3:00 AM (disabled)');
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
