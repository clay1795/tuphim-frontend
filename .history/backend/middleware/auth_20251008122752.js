const authService = require('../services/authService');
const logger = require('../services/logger');

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'No Token Provided',
        message: 'Authorization header is required'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid Token Format',
        message: 'Token must start with "Bearer "'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'No Token Provided',
        message: 'Token is required'
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Add user info to request object
    req.user = decoded;

    // Log successful authentication
    logger.debug(`User authenticated: ${decoded.email}`);

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.message.includes('Invalid or expired token')) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The provided token is invalid or has expired'
      });
    }

    res.status(500).json({
      error: 'Authentication Failed',
      message: 'Failed to authenticate user'
    });
  }
};

/**
 * Optional authentication middleware
 * Verifies JWT token if provided, but doesn't require it
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    req.user = decoded;

    logger.debug(`Optional authentication successful: ${decoded.email}`);
    next();
  } catch (error) {
    // Token is invalid, but we don't want to block the request
    logger.debug('Optional authentication failed:', error.message);
    req.user = null;
    next();
  }
};

/**
 * Admin authorization middleware
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User must be authenticated'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin privileges required'
      });
    }

    logger.debug(`Admin access granted: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Admin authorization error:', error);
    res.status(500).json({
      error: 'Authorization Failed',
      message: 'Failed to verify admin privileges'
    });
  }
};

/**
 * User authorization middleware
 * Ensures user can only access their own data
 */
const userAuthorizationMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User must be authenticated'
      });
    }

    const requestedUserId = req.params.userId || req.params.id;
    
    // Admin can access any user's data
    if (req.user.role === 'admin') {
      return next();
    }

    // User can only access their own data
    if (req.user.userId !== requestedUserId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own data'
      });
    }

    next();
  } catch (error) {
    logger.error('User authorization error:', error);
    res.status(500).json({
      error: 'Authorization Failed',
      message: 'Failed to verify user authorization'
    });
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = (req, res, next) => {
  // This would typically use a more sophisticated rate limiting library
  // For now, we'll rely on the global rate limiter
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  userAuthorizationMiddleware,
  authRateLimit
};





