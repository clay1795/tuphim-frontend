const express = require('express');
const kkphimApi = require('../services/kkphimApi');
const { optionalAuthMiddleware } = require('../middleware/auth');
const logger = require('../services/logger');

const router = express.Router();

// Apply optional authentication middleware to all routes
router.use(optionalAuthMiddleware);

/**
 * @route   GET /api/movies/new
 * @desc    Get new movies from KKPhim API
 * @access  Public
 */
router.get('/new', async (req, res) => {
  try {
    const { page = 1, version = 'v3', limit = 24 } = req.query;
    
    logger.info(`Fetching new movies - Page: ${page}, Version: ${version}, Limit: ${limit}, User: ${req.user?.email || 'anonymous'}`);

    const movies = await kkphimApi.getNewMovies(parseInt(page), version, parseInt(limit));

    res.json({
      success: true,
      message: 'New movies retrieved successfully',
      data: movies
    });
  } catch (error) {
    logger.error('Get new movies error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch new movies',
      message: 'Unable to retrieve new movies. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/detail/:slug
 * @desc    Get movie detail from KKPhim API
 * @access  Public
 */
router.get('/detail/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    logger.info(`Fetching movie detail - Slug: ${slug}, User: ${req.user?.email || 'anonymous'}`);

    const movieDetail = await kkphimApi.getMovieDetail(slug);

    res.json({
      success: true,
      message: 'Movie detail retrieved successfully',
      data: movieDetail
    });
  } catch (error) {
    logger.error('Get movie detail error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch movie detail',
      message: 'Unable to retrieve movie detail. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/search
 * @desc    Search movies from KKPhim API
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      keyword, 
      page = 1, 
      sort_field = 'modified_time', 
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      country = '',
      year = '',
      type = '',
      limit = 20
    } = req.query;

    if (!keyword) {
      return res.status(400).json({
        error: 'Missing Required Parameter',
        message: 'Keyword is required for search'
      });
    }
    
    logger.info(`Searching movies - Keyword: ${keyword}, Page: ${page}, User: ${req.user?.email || 'anonymous'}`);

    const searchResults = await kkphimApi.searchMovies(keyword, {
      page: parseInt(page),
      sort_field,
      sort_type,
      sort_lang,
      category,
      country,
      year,
      type,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: searchResults
    });
  } catch (error) {
    logger.error('Search movies error:', error);
    
    res.status(500).json({
      error: 'Failed to search movies',
      message: 'Unable to search movies. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/categories
 * @desc    Get movie categories from KKPhim API
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    logger.info(`Fetching categories - User: ${req.user?.email || 'anonymous'}`);

    const categories = await kkphimApi.getCategories();

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'Unable to retrieve categories. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/category/:slug
 * @desc    Get movies by category from KKPhim API
 * @access  Public
 */
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      page = 1, 
      sort_field = 'modified_time', 
      sort_type = 'desc',
      sort_lang = '',
      country = '',
      year = '',
      limit = 20
    } = req.query;
    
    logger.info(`Fetching movies by category - Slug: ${slug}, Page: ${page}, User: ${req.user?.email || 'anonymous'}`);

    const categoryMovies = await kkphimApi.getMoviesByCategory(slug, {
      page: parseInt(page),
      sort_field,
      sort_type,
      sort_lang,
      country,
      year,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Category movies retrieved successfully',
      data: categoryMovies
    });
  } catch (error) {
    logger.error('Get category movies error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch category movies',
      message: 'Unable to retrieve category movies. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/countries
 * @desc    Get movie countries from KKPhim API
 * @access  Public
 */
router.get('/countries', async (req, res) => {
  try {
    logger.info(`Fetching countries - User: ${req.user?.email || 'anonymous'}`);

    const countries = await kkphimApi.getCountries();

    res.json({
      success: true,
      message: 'Countries retrieved successfully',
      data: countries
    });
  } catch (error) {
    logger.error('Get countries error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch countries',
      message: 'Unable to retrieve countries. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/country/:slug
 * @desc    Get movies by country from KKPhim API
 * @access  Public
 */
router.get('/country/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      page = 1, 
      sort_field = 'modified_time', 
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      year = '',
      limit = 20
    } = req.query;
    
    logger.info(`Fetching movies by country - Slug: ${slug}, Page: ${page}, User: ${req.user?.email || 'anonymous'}`);

    const countryMovies = await kkphimApi.getMoviesByCountry(slug, {
      page: parseInt(page),
      sort_field,
      sort_type,
      sort_lang,
      category,
      year,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Country movies retrieved successfully',
      data: countryMovies
    });
  } catch (error) {
    logger.error('Get country movies error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch country movies',
      message: 'Unable to retrieve country movies. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/year/:year
 * @desc    Get movies by year from KKPhim API
 * @access  Public
 */
router.get('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { 
      page = 1, 
      sort_field = 'modified_time', 
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      country = '',
      limit = 20
    } = req.query;
    
    logger.info(`Fetching movies by year - Year: ${year}, Page: ${page}, User: ${req.user?.email || 'anonymous'}`);

    const yearMovies = await kkphimApi.getMoviesByYear(parseInt(year), {
      page: parseInt(page),
      sort_field,
      sort_type,
      sort_lang,
      category,
      country,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Year movies retrieved successfully',
      data: yearMovies
    });
  } catch (error) {
    logger.error('Get year movies error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch year movies',
      message: 'Unable to retrieve year movies. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/type/:type
 * @desc    Get movies by type from KKPhim API
 * @access  Public
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { 
      page = 1, 
      sort_field = 'modified_time', 
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      country = '',
      year = '',
      limit = 20
    } = req.query;
    
    logger.info(`Fetching movies by type - Type: ${type}, Page: ${page}, User: ${req.user?.email || 'anonymous'}`);

    const typeMovies = await kkphimApi.getMoviesByType(type, {
      page: parseInt(page),
      sort_field,
      sort_type,
      sort_lang,
      category,
      country,
      year,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Type movies retrieved successfully',
      data: typeMovies
    });
  } catch (error) {
    logger.error('Get type movies error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch type movies',
      message: 'Unable to retrieve type movies. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/tmdb/:type/:id
 * @desc    Get TMDB info from KKPhim API
 * @access  Public
 */
router.get('/tmdb/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    logger.info(`Fetching TMDB info - Type: ${type}, ID: ${id}, User: ${req.user?.email || 'anonymous'}`);

    const tmdbInfo = await kkphimApi.getTMDBInfo(type, id);

    res.json({
      success: true,
      message: 'TMDB info retrieved successfully',
      data: tmdbInfo
    });
  } catch (error) {
    logger.error('Get TMDB info error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch TMDB info',
      message: 'Unable to retrieve TMDB info. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/optimize-image
 * @desc    Get optimized image URL
 * @access  Public
 */
router.get('/optimize-image', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Missing Required Parameter',
        message: 'Image URL is required'
      });
    }

    const optimizedUrl = kkphimApi.getOptimizedImageUrl(url);
    const webpUrl = kkphimApi.getWebpImage(url);

    res.json({
      success: true,
      message: 'Image URLs generated successfully',
      data: {
        original: url,
        optimized: optimizedUrl,
        webp: webpUrl
      }
    });
  } catch (error) {
    logger.error('Optimize image error:', error);
    
    res.status(500).json({
      error: 'Failed to optimize image',
      message: 'Unable to generate optimized image URL. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/movies/player-url
 * @desc    Get player URL for video
 * @access  Public
 */
router.get('/player-url', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Missing Required Parameter',
        message: 'Video URL is required'
      });
    }

    const playerUrl = kkphimApi.getPlayerUrl(url);

    res.json({
      success: true,
      message: 'Player URL generated successfully',
      data: {
        original: url,
        player: playerUrl
      }
    });
  } catch (error) {
    logger.error('Generate player URL error:', error);
    
    res.status(500).json({
      error: 'Failed to generate player URL',
      message: 'Unable to generate player URL. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/image
 * @desc    Proxy image requests to phimimg.com
 * @access  Public
 */
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL parameter',
        message: 'Please provide a valid image URL'
      });
    }
    
    logger.debug(`Image proxy request: ${url}`);
    
    // Proxy to phimimg.com
    const imageUrl = `https://phimimg.com/image.php?url=${encodeURIComponent(url)}`;
    
    // Fetch the image and proxy it
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      'Access-Control-Allow-Origin': '*'
    });
    
    // Pipe the image data to response
    response.body.pipe(res);
  } catch (error) {
    logger.error('Image proxy error:', error);
    
    res.status(500).json({
      error: 'Failed to proxy image',
      message: 'Unable to load image. Please try again later.'
    });
  }
});

module.exports = router;


