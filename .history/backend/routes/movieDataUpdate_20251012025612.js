const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const MovieDataUpdater = require('../middleware/movieDataUpdater');
const User = require('../models/User');
const logger = require('../services/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/movie-data/update-single
 * @desc    Update a single movie's data with real data from KKPhim API
 * @access  Private
 */
router.post('/update-single', [
  body('movieId').notEmpty().withMessage('Movie ID is required'),
  body('movieSlug').notEmpty().withMessage('Movie slug is required'),
  body('listType').isIn(['favorites', 'watchlist', 'history']).withMessage('List type must be favorites, watchlist, or history')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { movieId, movieSlug, listType } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the movie in the specified list
    let movieIndex = -1;
    let movie = null;

    if (listType === 'favorites') {
      movieIndex = user.preferences.favorites.findIndex(item => item.movieId === movieId);
      movie = user.preferences.favorites[movieIndex];
    } else if (listType === 'watchlist') {
      movieIndex = user.preferences.watchlist.findIndex(item => item.movieId === movieId);
      movie = user.preferences.watchlist[movieIndex];
    } else if (listType === 'history') {
      movieIndex = user.preferences.watchHistory.findIndex(item => item.movieId === movieId);
      movie = user.preferences.watchHistory[movieIndex];
    }

    if (movieIndex === -1 || !movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in the specified list'
      });
    }

    // Update movie data
    const updatedMovieData = await MovieDataUpdater.updateMovieData({
      ...movie,
      movieSlug: movieSlug || movie.movieSlug
    });

    // Update the movie in the user's list
    if (listType === 'favorites') {
      user.preferences.favorites[movieIndex] = updatedMovieData;
    } else if (listType === 'watchlist') {
      user.preferences.watchlist[movieIndex] = updatedMovieData;
    } else if (listType === 'history') {
      user.preferences.watchHistory[movieIndex] = updatedMovieData;
    }

    await user.save();

    logger.info(`Updated movie data for ${listType}: ${movieId} for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Movie data updated successfully',
      data: {
        movie: updatedMovieData,
        listType
      }
    });

  } catch (error) {
    logger.error('Update single movie data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie data',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/movie-data/update-list
 * @desc    Update all movies in a specific list with real data from KKPhim API
 * @access  Private
 */
router.post('/update-list', [
  body('listType').isIn(['favorites', 'watchlist', 'history']).withMessage('List type must be favorites, watchlist, or history')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { listType } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get the specified list
    let movies = [];
    if (listType === 'favorites') {
      movies = user.preferences.favorites || [];
    } else if (listType === 'watchlist') {
      movies = user.preferences.watchlist || [];
    } else if (listType === 'history') {
      movies = user.preferences.watchHistory || [];
    }

    // Get update statistics
    const stats = MovieDataUpdater.getUpdateStats(movies);
    
    // Update movies that need updating
    const updatedMovies = await MovieDataUpdater.updateMultipleMoviesData(movies);

    // Update the user's list
    if (listType === 'favorites') {
      user.preferences.favorites = updatedMovies;
    } else if (listType === 'watchlist') {
      user.preferences.watchlist = updatedMovies;
    } else if (listType === 'history') {
      user.preferences.watchHistory = updatedMovies;
    }

    await user.save();

    logger.info(`Updated ${listType} list for user: ${user.email}`);

    res.json({
      success: true,
      message: `${listType} list updated successfully`,
      data: {
        listType,
        stats: {
          ...stats,
          updated: updatedMovies.length
        },
        movies: updatedMovies
      }
    });

  } catch (error) {
    logger.error('Update list movie data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie list',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movie-data/stats
 * @desc    Get statistics about movie data in user's lists
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      favorites: MovieDataUpdater.getUpdateStats(user.preferences.favorites || []),
      watchlist: MovieDataUpdater.getUpdateStats(user.preferences.watchlist || []),
      history: MovieDataUpdater.getUpdateStats(user.preferences.watchHistory || [])
    };

    res.json({
      success: true,
      message: 'Movie data statistics retrieved successfully',
      data: { stats }
    });

  } catch (error) {
    logger.error('Get movie data stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movie data statistics',
      error: error.message
    });
  }
});

module.exports = router;




