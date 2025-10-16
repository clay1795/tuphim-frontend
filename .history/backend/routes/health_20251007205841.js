const express = require('express');
const database = require('../config/database');
const kkphimApi = require('../services/kkphimApi');
const logger = require('../services/logger');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'TupPhim Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with all services
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {}
    };

    // Check database connection
    try {
      const dbHealth = await database.healthCheck();
      healthCheck.services.database = dbHealth;
    } catch (error) {
      healthCheck.services.database = {
        status: 'unhealthy',
        error: error.message
      };
      healthCheck.status = 'degraded';
    }

    // Check KKPhim API
    try {
      const startTime = Date.now();
      const apiTest = await kkphimApi.getNewMovies(1, 'v3');
      const responseTime = Date.now() - startTime;
      
      healthCheck.services.kkphimApi = {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        dataReceived: apiTest?.items?.length || 0
      };
    } catch (error) {
      healthCheck.services.kkphimApi = {
        status: 'unhealthy',
        error: error.message
      };
      healthCheck.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    healthCheck.services.memory = {
      status: 'healthy',
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };

    // Check CPU usage
    const cpuUsage = process.cpuUsage();
    healthCheck.services.cpu = {
      status: 'healthy',
      user: `${cpuUsage.user / 1000}ms`,
      system: `${cpuUsage.system / 1000}ms`
    };

    // Determine overall status
    const serviceStatuses = Object.values(healthCheck.services).map(service => service.status);
    if (serviceStatuses.includes('unhealthy')) {
      healthCheck.status = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      healthCheck.status = 'degraded';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/database
 * @desc    Database health check
 * @access  Public
 */
router.get('/database', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(dbHealth);
  } catch (error) {
    logger.error('Database health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/kkphim-api
 * @desc    KKPhim API health check
 * @access  Public
 */
router.get('/kkphim-api', async (req, res) => {
  try {
    const startTime = Date.now();
    const apiTest = await kkphimApi.getNewMovies(1, 'v3');
    const responseTime = Date.now() - startTime;
    
    const apiHealth = {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      dataReceived: apiTest?.items?.length || 0,
      timestamp: new Date().toISOString()
    };

    res.json(apiHealth);
  } catch (error) {
    logger.error('KKPhim API health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      message: 'KKPhim API health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness check for load balancers
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    const dbHealth = await database.healthCheck();
    
    if (dbHealth.status !== 'healthy') {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database is not ready',
        timestamp: new Date().toISOString()
      });
    }

    // Check if KKPhim API is accessible
    try {
      await kkphimApi.getNewMovies(1, 'v3');
    } catch (error) {
      return res.status(503).json({
        status: 'not ready',
        message: 'KKPhim API is not accessible',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'ready',
      message: 'Service is ready to accept requests',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not ready',
      message: 'Service is not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness check for load balancers
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;



