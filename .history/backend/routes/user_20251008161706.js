const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const { authMiddleware, userAuthorizationMiddleware } = require('../middleware/auth');
const logger = require('../services/logger');
const kkphimApi = require('../services/kkphimApi');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation rules
const updateProfileValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('preferences.favoriteGenres')
    .optional()
    .isArray()
    .withMessage('Favorite genres must be an array'),
  body('preferences.settings.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  body('preferences.settings.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be between 2 and 5 characters')
];

const addToWatchlistValidation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .trim(),
  body('movieSlug')
    .optional()
    .trim(),
  body('movieName')
    .optional()
    .trim()
    .escape()
];

const addToFavoritesValidation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .trim(),
  body('movieSlug')
    .optional()
    .trim(),
  body('movieName')
    .optional()
    .trim()
    .escape(),
  body('poster_url')
    .optional()
    .trim(),
  body('thumb_url')
    .optional()
    .trim(),
  body('banner_url')
    .optional()
    .trim(),
  body('originalName')
    .optional()
    .trim()
];

const addToHistoryValidation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .trim(),
  body('movieSlug')
    .optional()
    .trim(),
  body('movieName')
    .optional()
    .trim()
    .escape(),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100')
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
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req, res) => {
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
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateProfileValidation, validate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const updatedUser = await authService.updateProfile(userId, updateData);

    logger.info(`User profile updated: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Username Already Exists',
        message: 'The username is already taken'
      });
    }

    res.status(500).json({
      error: 'Profile Update Failed',
      message: 'Failed to update profile. Please try again.'
    });
  }
});

/**
 * @route   GET /api/users/watchlist
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get('/watchlist', async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    const watchlist = user.preferences.watchlist || [];

    res.json({
      success: true,
      message: 'Watchlist retrieved successfully',
      data: { 
        watchlist,
        count: watchlist.length
      }
    });
  } catch (error) {
    logger.error('Get watchlist error:', error);
    
    res.status(500).json({
      error: 'Failed to get watchlist',
      message: 'Unable to retrieve watchlist. Please try again.'
    });
  }
});

/**
 * @route   POST /api/users/watchlist
 * @desc    Add movie to watchlist
 * @access  Private
 */
router.post('/watchlist', addToWatchlistValidation, validate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId, movieSlug, movieName } = req.body;

    const updatedUser = await authService.addToWatchlist(userId, {
      movieId,
      movieSlug,
      movieName
    });

    logger.info(`Movie added to watchlist: ${movieId} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movie added to watchlist successfully',
      data: { 
        user: updatedUser,
        watchlist: updatedUser.preferences.watchlist
      }
    });
  } catch (error) {
    logger.error('Add to watchlist error:', error);
    
    if (error.message.includes('already in watchlist')) {
      return res.status(409).json({
        error: 'Movie Already in Watchlist',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to add to watchlist',
      message: 'Unable to add movie to watchlist. Please try again.'
    });
  }
});

/**
 * @route   DELETE /api/users/watchlist/:movieId
 * @desc    Remove movie from watchlist
 * @access  Private
 */
router.delete('/watchlist/:movieId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.params;

    const updatedUser = await authService.removeFromWatchlist(userId, movieId);

    logger.info(`Movie removed from watchlist: ${movieId} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movie removed from watchlist successfully',
      data: { 
        user: updatedUser,
        watchlist: updatedUser.preferences.watchlist
      }
    });
  } catch (error) {
    logger.error('Remove from watchlist error:', error);
    
    res.status(500).json({
      error: 'Failed to remove from watchlist',
      message: 'Unable to remove movie from watchlist. Please try again.'
    });
  }
});

/**
 * @route   GET /api/users/favorites
 * @desc    Get user's favorites
 * @access  Private
 */
router.get('/favorites', async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    const favorites = user.preferences.favorites || [];

    res.json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: { 
        favorites,
        count: favorites.length
      }
    });
  } catch (error) {
    logger.error('Get favorites error:', error);
    
    res.status(500).json({
      error: 'Failed to get favorites',
      message: 'Unable to retrieve favorites. Please try again.'
    });
  }
});

/**
 * @route   POST /api/users/favorites
 * @desc    Add movie to favorites
 * @access  Private
 */
router.post('/favorites', addToFavoritesValidation, validate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId, movieSlug, movieName, poster_url, thumb_url, banner_url, originalName } = req.body;

    let movieData = {
      movieId,
      movieSlug,
      movieName,
      poster_url,
      thumb_url,
      banner_url,
      originalName,
      addedAt: new Date()
    };

    // If we have a movieSlug, try to get real data from KKPhim API
    if (movieSlug) {
      try {
        logger.info(`Fetching real movie data from KKPhim API for slug: ${movieSlug}`);
        const kkphimData = await kkphimApi.getMovieDetail(movieSlug);
        
        if (kkphimData && kkphimData.movie) {
          const movie = kkphimData.movie;
          movieData = {
            movieId: movie._id || movieId,
            movieSlug: movie.slug || movieSlug,
            movieName: movie.name || movieName,
            originalName: movie.original_name || originalName,
            poster_url: movie.poster_url || poster_url,
            thumb_url: movie.thumb_url || thumb_url,
            banner_url: movie.banner_url || banner_url,
            addedAt: new Date()
          };
          logger.info(`Successfully fetched real movie data for: ${movieData.movieName}`);
        }
      } catch (apiError) {
        logger.warn(`Failed to fetch movie data from KKPhim API for slug: ${movieSlug}`, apiError.message);
        // Continue with provided data if API fails
      }
    }

    const updatedUser = await authService.addToFavorites(userId, movieData);

    logger.info(`Movie added to favorites: ${movieData.movieId} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movie added to favorites successfully',
      data: { 
        user: updatedUser,
        favorites: updatedUser.preferences.favorites
      }
    });
  } catch (error) {
    logger.error('Add to favorites error:', error);
    
    if (error.message.includes('already in favorites')) {
      return res.status(409).json({
        error: 'Movie Already in Favorites',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to add to favorites',
      message: 'Unable to add movie to favorites. Please try again.'
    });
  }
});

/**
 * @route   DELETE /api/users/favorites/:movieId
 * @desc    Remove movie from favorites
 * @access  Private
 */
router.delete('/favorites/:movieId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.params;

    // Get user and remove from favorites
    const user = await authService.getUserById(userId);
    user.preferences.favorites = user.preferences.favorites.filter(
      item => item.movieId !== movieId
    );

    const updatedUser = await authService.updateProfile(userId, {
      preferences: user.preferences
    });

    logger.info(`Movie removed from favorites: ${movieId} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movie removed from favorites successfully',
      data: { 
        user: updatedUser,
        favorites: updatedUser.preferences.favorites
      }
    });
  } catch (error) {
    logger.error('Remove from favorites error:', error);
    
    res.status(500).json({
      error: 'Failed to remove from favorites',
      message: 'Unable to remove movie from favorites. Please try again.'
    });
  }
});

/**
 * @route   GET /api/users/history
 * @desc    Get user's watch history
 * @access  Private
 */
router.get('/history', async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    const history = user.preferences.watchHistory || [];

    // Sort by most recent first
    const sortedHistory = history.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

    res.json({
      success: true,
      message: 'Watch history retrieved successfully',
      data: { 
        history: sortedHistory,
        count: history.length
      }
    });
  } catch (error) {
    logger.error('Get watch history error:', error);
    
    res.status(500).json({
      error: 'Failed to get watch history',
      message: 'Unable to retrieve watch history. Please try again.'
    });
  }
});

/**
 * @route   POST /api/users/history
 * @desc    Add movie to watch history
 * @access  Private
 */
router.post('/history', addToHistoryValidation, validate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId, movieSlug, movieName, progress = 0 } = req.body;

    const updatedUser = await authService.addToWatchHistory(userId, {
      movieId,
      movieSlug,
      movieName
    }, progress);

    logger.info(`Movie added to watch history: ${movieId} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movie added to watch history successfully',
      data: { 
        user: updatedUser,
        history: updatedUser.preferences.watchHistory
      }
    });
  } catch (error) {
    logger.error('Add to watch history error:', error);
    
    res.status(500).json({
      error: 'Failed to add to watch history',
      message: 'Unable to add movie to watch history. Please try again.'
    });
  }
});

/**
 * @route   DELETE /api/users/history
 * @desc    Remove movie from watch history
 * @access  Private
 */
router.delete('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    const updatedUser = await authService.removeFromWatchHistory(userId, movieId);

    logger.info(`Movie removed from watch history: ${movieId} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movie removed from watch history successfully',
      data: { 
        user: updatedUser,
        history: updatedUser.preferences.watchHistory
      }
    });
  } catch (error) {
    logger.error('Remove from watch history error:', error);
    
    res.status(500).json({
      error: 'Failed to remove from watch history',
      message: 'Unable to remove movie from watch history. Please try again.'
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    const stats = {
      watchlistCount: user.preferences.watchlist?.length || 0,
      favoritesCount: user.preferences.favorites?.length || 0,
      watchHistoryCount: user.preferences.watchHistory?.length || 0,
      accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)), // days
      lastLogin: user.lastLogin,
      memberSince: user.createdAt
    };

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    
    res.status(500).json({
      error: 'Failed to get user statistics',
      message: 'Unable to retrieve user statistics. Please try again.'
    });
  }
});

module.exports = router;





