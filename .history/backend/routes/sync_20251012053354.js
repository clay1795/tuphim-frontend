const express = require('express');
const router = express.Router();
const kkphimSyncService = require('../services/kkphimSyncService');
const syncScheduler = require('../services/syncScheduler');
const logger = require('../services/logger');

/**
 * GET /api/sync/status - Lấy trạng thái sync
 */
router.get('/status', async (req, res) => {
  try {
    const syncStatus = await kkphimSyncService.getSyncStatus();
    const schedulerStatus = syncScheduler.getStatus();
    const nextSchedules = syncScheduler.getNextSchedules();

    res.json({
      success: true,
      data: {
        sync: syncStatus,
        scheduler: schedulerStatus,
        nextSchedules: nextSchedules
      }
    });

  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
});

/**
 * POST /api/sync/full - Chạy full sync ngay lập tức
 */
router.post('/full', async (req, res) => {
  try {
    logger.info('🚀 Manual full sync requested');
    
    // Chạy trong background để không block request
    kkphimSyncService.fullSync()
      .then(stats => {
        logger.info('✅ Manual full sync completed:', stats);
      })
      .catch(error => {
        logger.error('❌ Manual full sync failed:', error);
      });

    res.json({
      success: true,
      message: 'Full sync started in background',
      data: {
        started: new Date(),
        type: 'full'
      }
    });

  } catch (error) {
    logger.error('Error starting full sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start full sync',
      error: error.message
    });
  }
});

/**
 * POST /api/sync/incremental - Chạy incremental sync ngay lập tức
 */
router.post('/incremental', async (req, res) => {
  try {
    logger.info('🔄 Manual incremental sync requested');
    
    // Chạy trong background
    kkphimSyncService.incrementalSync()
      .then(stats => {
        logger.info('✅ Manual incremental sync completed:', stats);
      })
      .catch(error => {
        logger.error('❌ Manual incremental sync failed:', error);
      });

    res.json({
      success: true,
      message: 'Incremental sync started in background',
      data: {
        started: new Date(),
        type: 'incremental'
      }
    });

  } catch (error) {
    logger.error('Error starting incremental sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start incremental sync',
      error: error.message
    });
  }
});

/**
 * POST /api/sync/start-scheduler - Khởi động scheduler
 */
router.post('/start-scheduler', async (req, res) => {
  try {
    syncScheduler.start();

    res.json({
      success: true,
      message: 'Sync scheduler started',
      data: {
        started: new Date(),
        status: syncScheduler.getStatus()
      }
    });

  } catch (error) {
    logger.error('Error starting scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start scheduler',
      error: error.message
    });
  }
});

/**
 * POST /api/sync/stop-scheduler - Dừng scheduler
 */
router.post('/stop-scheduler', async (req, res) => {
  try {
    syncScheduler.stop();

    res.json({
      success: true,
      message: 'Sync scheduler stopped',
      data: {
        stopped: new Date(),
        status: syncScheduler.getStatus()
      }
    });

  } catch (error) {
    logger.error('Error stopping scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop scheduler',
      error: error.message
    });
  }
});

/**
 * GET /api/sync/stats - Lấy sync statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = kkphimSyncService.getSyncStats();
    const syncStatus = await kkphimSyncService.getSyncStatus();

    res.json({
      success: true,
      data: {
        currentStats: stats,
        totalMovies: syncStatus.totalMovies,
        lastSync: syncStatus.lastSyncTime
      }
    });

  } catch (error) {
    logger.error('Error getting sync stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync stats',
      error: error.message
    });
  }
});

/**
 * POST /api/sync/force-hourly - Force chạy hourly sync
 */
router.post('/force-hourly', async (req, res) => {
  try {
    const stats = await syncScheduler.runManualSync('incremental');

    res.json({
      success: true,
      message: 'Hourly sync completed',
      data: stats
    });

  } catch (error) {
    logger.error('Error running hourly sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run hourly sync',
      error: error.message
    });
  }
});

/**
 * GET /api/sync/logs - Lấy sync logs (recent)
 */
router.get('/logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Đọc logs từ file (có thể implement sau)
    // Tạm thời return empty
    res.json({
      success: true,
      data: {
        logs: [],
        message: 'Logs feature coming soon'
      }
    });

  } catch (error) {
    logger.error('Error getting sync logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync logs',
      error: error.message
    });
  }
});

module.exports = router;
