const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../services/logger');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('fullName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim()
    .escape()
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, validate, async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    const result = await authService.register({
      email,
      password,
      username,
      fullName
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Registration Failed',
      message: 'Failed to register user. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, validate, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await authService.login(identifier, password);

    logger.info(`User logged in: ${result.user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    logger.error('Login error:', error);
    
    if (error.message.includes('Invalid credentials') || error.message.includes('Account is deactivated')) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Login Failed',
      message: 'Failed to login. Please try again.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    
    res.status(500).json({
      error: 'Failed to get user profile',
      message: 'Unable to retrieve user profile. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No Token Provided',
        message: 'Authorization token is required'
      });
    }

    const newToken = await authService.refreshToken(token);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token: newToken }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    res.status(401).json({
      error: 'Token Refresh Failed',
      message: 'Failed to refresh token. Please login again.'
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authMiddleware, changePasswordValidation, validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    await authService.changePassword(userId, currentPassword, newPassword);

    logger.info(`Password changed for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    
    if (error.message.includes('Current password is incorrect')) {
      return res.status(400).json({
        error: 'Invalid Current Password',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Password Change Failed',
      message: 'Failed to change password. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authMiddleware, (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Generate reset token (simple implementation)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      resetToken: resetToken // In production, send via email
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

