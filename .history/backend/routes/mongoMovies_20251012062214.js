const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../services/logger');

// Import Movie model from existing service
const kkphimSyncService = require('../services/kkphimSyncService');
const Movie = kkphimSyncService.Movie || mongoose.model('Movie');

/**
 * @route   GET /api/mongo-movies/search
 * @desc    Search movies from MongoDB database
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      keyword = '', 
      page = 1, 
      limit = 20, 
      type = '', 
      category = '', 
      country = '', 
      year = '', 
      sort = 'last_sync', 
      sortType = 'desc' 
    } = req.query;
    
    logger.info(`MongoDB search - Keyword: "${keyword}", Type: "${type}", Page: ${page}`);

    // Build query
    let query = {};
    
    // Keyword search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { origin_name: { $regex: keyword, $options: 'i' } },
        { slug: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Type filter
    if (type) {
      query.type = type;
    }
    
    // Category filter
    if (category) {
      query['category.slug'] = category;
    }
    
    // Country filter
    if (country) {
      query['country.slug'] = country;
    }
    
    // Year filter
    if (year) {
      query.year = parseInt(year);
    }
    
    // Build sort object
    const sortObj = {};
    if (sort === 'name') {
      sortObj.name = sortType === 'asc' ? 1 : -1;
    } else if (sort === 'year') {
      sortObj.year = sortType === 'asc' ? 1 : -1;
    } else if (sort === 'modified_time') {
      sortObj.kkphim_modified = sortType === 'asc' ? 1 : -1;
    } else {
      sortObj.last_sync = sortType === 'asc' ? 1 : -1;
    }
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [movies, totalCount] = await Promise.all([
      Movie.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Movie.countDocuments(query)
    ]);
    
    // Transform movies to match expected format
    const transformedMovies = movies.map(movie => ({
      _id: movie._id,
      name: movie.name,
      slug: movie.slug,
      origin_name: movie.origin_name,
      type: movie.type,
      year: movie.year,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      banner_url: movie.banner_url,
      episode_current: movie.episode_current,
      episode_total: movie.episode_total,
      time: movie.time,
      quality: movie.quality,
      lang: movie.lang,
      category: movie.category,
      country: movie.country,
      sub_docquyen: movie.sub_docquyen,
      tmdb: movie.tmdb,
      imdb: movie.imdb,
      modified: movie.modified
    }));
    
    res.json({
      success: true,
      message: 'MongoDB search completed successfully',
      data: {
        items: transformedMovies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        },
        database: {
          totalMovies: await Movie.countDocuments(),
          lastSync: await Movie.findOne({}, { last_sync: 1 }).sort({ last_sync: -1 }).select('last_sync')
        }
      }
    });
  } catch (error) {
    logger.error('MongoDB search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search movies in MongoDB',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mongo-movies/new
 * @desc    Get new movies from MongoDB (paginated)
 * @access  Public
 */
router.get('/new', async (req, res) => {
  try {
    const { page = 1, limit = 24 } = req.query;
    
    logger.info(`Fetching new movies from MongoDB - Page: ${page}, Limit: ${limit}`);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [movies, totalCount] = await Promise.all([
      Movie.find({})
        .sort({ last_sync: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Movie.countDocuments()
    ]);
    
    // Transform movies
    const transformedMovies = movies.map(movie => ({
      _id: movie._id,
      name: movie.name,
      slug: movie.slug,
      origin_name: movie.origin_name,
      type: movie.type,
      year: movie.year,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      banner_url: movie.banner_url,
      episode_current: movie.episode_current,
      episode_total: movie.episode_total,
      time: movie.time,
      quality: movie.quality,
      lang: movie.lang,
      category: movie.category,
      country: movie.country,
      sub_docquyen: movie.sub_docquyen,
      tmdb: movie.tmdb,
      imdb: movie.imdb,
      modified: movie.modified
    }));
    
    res.json({
      success: true,
      message: 'New movies retrieved successfully',
      data: {
        items: transformedMovies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          totalItemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get new movies from MongoDB error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new movies from MongoDB',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mongo-movies/stats
 * @desc    Get MongoDB movie statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Movie.aggregate([
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              year: '$year'
            }
          }
        }
      }
    ]);
    
    const typeStats = await Movie.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const yearStats = await Movie.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);
    
    const lastSync = await Movie.findOne({}, { last_sync: 1 }).sort({ last_sync: -1 });
    
    res.json({
      success: true,
      message: 'MongoDB stats retrieved successfully',
      data: {
        totalMovies: stats[0]?.totalMovies || 0,
        byType: typeStats,
        topYears: yearStats,
        lastSync: lastSync?.last_sync
      }
    });
  } catch (error) {
    logger.error('Get MongoDB stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MongoDB stats',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mongo-movies/clear-cache
 * @desc    Clear all caches (KKPhim API cache and MovieCache)
 * @access  Public
 */
router.post('/clear-cache', async (req, res) => {
  try {
    logger.info('Clearing all caches...');
    
    // Clear KKPhim API cache
    const kkphimApi = require('../services/kkphimApi');
    kkphimApi.clearCache();
    
    // Clear MovieCache
    const movieCache = require('../services/movieCache');
    // Force refresh cache
    await movieCache.fullUpdate();
    
    res.json({
      success: true,
      message: 'All caches cleared and refreshed',
      data: {
        timestamp: new Date(),
        kkphimApiCache: 'cleared',
        movieCache: 'refreshed'
      }
    });
  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear caches',
      error: error.message
    });
  }
});

module.exports = router;
