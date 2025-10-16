const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import services
const database = require('./config/database');
const logger = require('./services/logger');
const movieCache = require('./services/movieCache');
const kkphimSyncService = require('./services/kkphimSyncService');
const syncScheduler = require('./services/syncScheduler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movie');
const mongoMovieRoutes = require('./routes/mongoMovies');
const commentRoutes = require('./routes/comments');
const healthRoutes = require('./routes/health');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://phimimg.com", "https://phimapi.com", "https://image.tmdb.org"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://phimapi.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://player.phimapi.com"],
      frameSrc: ["'self'", "https://player.phimapi.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://www.tuphim.online',
      'https://tuphim.online',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176'
    ];
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow VS Code Port Forwarding domains and Dev Tunnels
    if (origin && (
      origin.includes('.ngrok.io') ||
      origin.includes('.ngrok-free.dev') ||
      origin.includes('.loca.lt') ||
      origin.includes('.preview.app.github.dev') ||
      origin.includes('.app.github.dev') ||
      origin.includes('.githubpreview.dev') ||
      origin.includes('.github.dev') ||
      origin.includes('.devtunnels.ms') ||
      origin.includes('.vercel.app')
    )) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

// app.use('/api/', limiter); // Disabled for development

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Test routes for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test route working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'TupPhim Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api', movieRoutes); // Mount movie routes at /api level for /api/image
app.use('/api/mongo-movies', mongoMovieRoutes); // MongoDB movies routes
app.use('/api/comments', commentRoutes); // Comments routes
app.use('/api/movie-data', require('./routes/movieDataUpdate'));
app.use('/api/sync', syncRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TupPhim Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TupPhim Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      movies: '/api/movies',
      health: '/api/health'
    },
    documentation: 'https://github.com/your-repo/tuphim-backend'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'GET /api/movies/search',
      'GET /api/health'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Field Error',
      message: `${field} already exists`,
      field: field
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'The provided token has expired'
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed by CORS policy'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Initialize movie cache
    await movieCache.initialize();
    
    // Start sync scheduler (auto-start)
    syncScheduler.start();
    logger.info('🕐 KKPhim sync scheduler started');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 TupPhim Backend Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api`);
      logger.info(`💾 Movie Cache: ${movieCache.getStats().totalMovies} movies loaded`);
      logger.info(`🔄 Sync Endpoints: /api/sync/*`);
      logger.info(`🌍 Network Access: Available on 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;