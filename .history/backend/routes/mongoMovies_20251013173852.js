const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../services/logger');

// Import Movie model from existing service
const kkphimSyncService = require('../services/kkphimSyncService');

// Get Movie model safely - always use the one from kkphimSyncService
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
      limit = 24, 
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
 * @route   GET /api/mongo-movies/series-grouped
 * @desc    Get movies grouped by series (only latest part of each series)
 * @access  Public
 */
router.get('/series-grouped', async (req, res) => {
  try {
    const { page = 1, limit = 24, type = '', category = '', country = '', year = '' } = req.query;
    
    logger.info(`Fetching series-grouped movies from MongoDB - Page: ${page}, Limit: ${limit}`);

    // Build query
    let query = {};
    
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

    // Get all movies first
    const allMovies = await Movie.find(query).sort({ last_sync: -1 }).lean();
    
    // Group movies by series and get latest part of each series
    const seriesMap = new Map();
    const singleMovies = [];
    
    allMovies.forEach(movie => {
      // Check if it's a series movie
      const isSeries = isSeriesMovie(movie);
      
      if (isSeries) {
        const baseName = getSeriesBaseName(movie.name);
        const partNumber = getSeriesPartNumber(movie.name);
        
        if (!seriesMap.has(baseName)) {
          seriesMap.set(baseName, {
            baseName,
            latestMovie: null,
            partNumber: 0
          });
        }
        
        const series = seriesMap.get(baseName);
        if (partNumber > series.partNumber) {
          series.latestMovie = movie;
          series.partNumber = partNumber;
        }
      } else {
        singleMovies.push(movie);
      }
    });
    
    // Combine single movies and latest series parts
    const seriesMovies = Array.from(seriesMap.values()).map(s => s.latestMovie);
    const combinedMovies = [...singleMovies, ...seriesMovies];
    
    // Sort by last_sync
    combinedMovies.sort((a, b) => new Date(b.last_sync) - new Date(a.last_sync));
    
    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMovies = combinedMovies.slice(skip, skip + parseInt(limit));
    
    // Transform movies
    const transformedMovies = paginatedMovies.map(movie => ({
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
      modified: movie.modified,
      isSeriesLatest: seriesMovies.includes(movie),
      seriesBaseName: seriesMovies.includes(movie) ? getSeriesBaseName(movie.name) : null
    }));
    
    res.json({
      success: true,
      message: 'Series-grouped movies retrieved successfully',
      data: {
        items: transformedMovies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(combinedMovies.length / parseInt(limit)),
          totalItems: combinedMovies.length,
          itemsPerPage: parseInt(limit)
        },
        stats: {
          totalMovies: allMovies.length,
          seriesCount: seriesMap.size,
          singleMoviesCount: singleMovies.length,
          groupedMoviesCount: combinedMovies.length
        }
      }
    });
  } catch (error) {
    logger.error('Series-grouped movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get series-grouped movies',
      error: error.message
    });
  }
});

// Helper functions for series detection
function isSeriesMovie(movie) {
  if (!movie) return false;
  
  const movieName = (movie.name || '').toLowerCase();
  const originName = (movie.origin_name || '').toLowerCase();
  const episodeTotal = parseInt(movie.episode_total || 0);
  const episodeCurrent = parseInt(movie.episode_current || 0);
  
  const hasSeriesKeywords = movieName.includes('tập') || 
                           movieName.includes('season') || 
                           movieName.includes('phần') ||
                           movieName.includes('series') ||
                           movieName.includes('bộ phim') ||
                           movieName.includes('dài tập') ||
                           movieName.includes('phim truyền hình') ||
                           originName.includes('season') ||
                           originName.includes('series') ||
                           originName.includes('tập');
  
  const hasEpisodePattern = /\b(tập|episode|ep|part|phần|season|s)\s*\d+/i.test(movieName) ||
                           /\b(tập|episode|ep|part|phần|season|s)\s*\d+/i.test(originName);
  
  const hasMultipleEpisodes = episodeTotal > 1 || episodeCurrent > 1;
  
  return hasSeriesKeywords || hasEpisodePattern || hasMultipleEpisodes;
}

function getSeriesBaseName(movieName) {
  if (!movieName) return '';
  
  return movieName
    .replace(/\s*(tập|episode|ep|part|phần|season|s)\s*\d+/gi, '')
    .replace(/\s*(tập|episode|ep|part|phần|season|s)\s*[ivxlcdm]+/gi, '')
    .replace(/\s*\d+$/g, '')
    .replace(/\s*-\s*\d+$/g, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s*\[.*?\]/g, '')
    .replace(/\s*\{.*?\}/g, '')
    .trim();
}

function getSeriesPartNumber(movieName) {
  if (!movieName) return 1;
  
  const patterns = [
    /\b(phần|part)\s*(\d+)/i,
    /\b(season|s)\s*(\d+)/i,
    /\b(tập|episode|ep)\s*(\d+)/i,
    /\b(\d+)\s*(phần|part)/i,
    /\b(\d+)\s*(season|s)/i,
    /\b(\d+)\s*(tập|episode|ep)/i,
    /\b(\d+)$/,
    /-\s*(\d+)$/
  ];
  
  for (const pattern of patterns) {
    const match = movieName.match(pattern);
    if (match) {
      const number = parseInt(match[2] || match[1]);
      if (!isNaN(number) && number > 0) {
        return number;
      }
    }
  }
  
  return 1;
}

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
 * @route   GET /api/mongo-movies/top
 * @desc    Get top movies from MongoDB (by rating/view count)
 * @access  Public
 */
router.get('/top', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    logger.info(`Fetching top movies from MongoDB - Limit: ${limit}`);

    // Lấy phim có rating cao nhất hoặc phim mới nhất
    const movies = await Movie.find({})
      .sort({ 
        'tmdb.vote_average': -1,
        'tmdb.vote_count': -1,
        last_sync: -1 
      })
      .limit(parseInt(limit))
      .lean();
    
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
      modified: movie.modified,
      rating: movie.tmdb?.vote_average || 0,
      voteCount: movie.tmdb?.vote_count || 0
    }));
    
    res.json({
      success: true,
      message: 'Top movies retrieved successfully',
      data: transformedMovies
    });
  } catch (error) {
    logger.error('Get top movies from MongoDB error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top movies from MongoDB',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mongo-movies/featured
 * @desc    Get featured movies from MongoDB (newest/trending)
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit = 24 } = req.query;
    
    logger.info(`Fetching featured movies from MongoDB - Limit: ${limit}`);

    // Lấy phim mới nhất và có rating tốt
    const movies = await Movie.find({})
      .sort({ 
        last_sync: -1,
        'tmdb.vote_average': -1
      })
      .limit(parseInt(limit))
      .lean();
    
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
      modified: movie.modified,
      rating: movie.tmdb?.vote_average || 0,
      voteCount: movie.tmdb?.vote_count || 0
    }));
    
    res.json({
      success: true,
      message: 'Featured movies retrieved successfully',
      data: transformedMovies
    });
  } catch (error) {
    logger.error('Get featured movies from MongoDB error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured movies from MongoDB',
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

/**
 * @route   GET /api/mongo-movies/detail/:slug
 * @desc    Get movie detail by slug from MongoDB
 * @access  Public
 */
router.get('/detail/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const movie = await Movie.findOne({ slug }).lean();
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        error: 'Movie not found'
      });
    }
    
    // Transform movie to match expected format
    const transformedMovie = {
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
      modified: movie.modified,
      content: movie.content || '',
      episodes: movie.episodes || []
    };
    
    res.json({
      success: true,
      message: 'Movie detail retrieved successfully',
      data: transformedMovie
    });
  } catch (error) {
    logger.error('Get movie detail from MongoDB error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie detail from MongoDB',
      error: error.message
    });
  }
});

module.exports = router;
