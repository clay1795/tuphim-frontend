const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - User and token
   */
  async register(userData) {
    try {
      const { email, password, username, fullName } = userData;

      // Check if user already exists
      const existingUser = await User.findByEmailOrUsername(email);
      if (existingUser) {
        throw new Error('User already exists with this email or username');
      }

      // Create new user
      const user = new User({
        email,
        password,
        username,
        fullName,
        role: 'user'
      });

      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info(`New user registered: ${user.email}`);

      return {
        user: user.getPublicProfile(),
        token
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} identifier - Email or username
   * @param {string} password - User password
   * @returns {Object} - User and token
   */
  async login(identifier, password) {
    try {
      // Find user by email or username
      const user = await User.findByEmailOrUsername(identifier);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: user.getPublicProfile(),
        token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} - User object
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.getPublicProfile();
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Updated user
   */
  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = ['fullName', 'username', 'preferences'];
      const updates = {};

      // Filter allowed updates
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User profile updated: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} - Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      return true;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {string} - New JWT token
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.generateToken(user);
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Add movie to user's watchlist
   * @param {string} userId - User ID
   * @param {Object} movieData - Movie data
   * @returns {Object} - Updated user
   */
  async addToWatchlist(userId, movieData) {
    try {
      const { movieId, movieSlug, movieName } = movieData;
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already in watchlist
      const existingItem = user.preferences.watchlist.find(
        item => item.movieId === movieId
      );

      if (existingItem) {
        throw new Error('Movie already in watchlist');
      }

      // Add to watchlist
      user.preferences.watchlist.push({
        movieId,
        movieSlug,
        movieName,
        addedAt: new Date()
      });

      await user.save();

      logger.info(`Movie added to watchlist: ${movieId} for user: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Add to watchlist error:', error);
      throw error;
    }
  }

  /**
   * Remove movie from user's watchlist
   * @param {string} userId - User ID
   * @param {string} movieId - Movie ID
   * @returns {Object} - Updated user
   */
  async removeFromWatchlist(userId, movieId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove from watchlist
      user.preferences.watchlist = user.preferences.watchlist.filter(
        item => item.movieId !== movieId
      );

      await user.save();

      logger.info(`Movie removed from watchlist: ${movieId} for user: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Remove from watchlist error:', error);
      throw error;
    }
  }

  /**
   * Add movie to user's favorites
   * @param {string} userId - User ID
   * @param {Object} movieData - Movie data
   * @returns {Object} - Updated user
   */
  async addToFavorites(userId, movieData) {
    try {
      const { movieId, movieSlug, movieName } = movieData;
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already in favorites
      const existingItem = user.preferences.favorites.find(
        item => item.movieId === movieId
      );

      if (existingItem) {
        throw new Error('Movie already in favorites');
      }

      // Add to favorites
      user.preferences.favorites.push({
        movieId,
        movieSlug,
        movieName,
        addedAt: new Date()
      });

      await user.save();

      logger.info(`Movie added to favorites: ${movieId} for user: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Add to favorites error:', error);
      throw error;
    }
  }

  /**
   * Add movie to user's watch history
   * @param {string} userId - User ID
   * @param {Object} movieData - Movie data
   * @param {number} progress - Watch progress percentage
   * @returns {Object} - Updated user
   */
  async addToWatchHistory(userId, movieData, progress = 0) {
    try {
      const { movieId, movieSlug, movieName } = movieData;
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already in history
      const existingItem = user.preferences.watchHistory.find(
        item => item.movieId === movieId
      );

      if (existingItem) {
        // Update existing entry
        existingItem.watchedAt = new Date();
        existingItem.progress = progress;
      } else {
        // Add new entry
        user.preferences.watchHistory.push({
          movieId,
          movieSlug,
          movieName,
          watchedAt: new Date(),
          progress
        });
      }

      await user.save();

      logger.info(`Movie added to watch history: ${movieId} for user: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Add to watch history error:', error);
      throw error;
    }
  }

  /**
   * Remove movie from user's watch history
   * @param {string} userId - User ID
   * @param {string} movieId - Movie ID
   * @returns {Object} - Updated user
   */
  async removeFromWatchHistory(userId, movieId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove from watch history
      user.preferences.watchHistory = user.preferences.watchHistory.filter(
        item => item.movieId !== movieId
      );

      await user.save();

      logger.info(`Movie removed from watch history: ${movieId} for user: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Remove from watch history error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();




