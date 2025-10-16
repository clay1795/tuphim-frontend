const express = require('express');
const router = express.Router();
const mongoMovieService = require('../services/mongoMovieService');
const logger = require('../services/logger');

// Search movies with advanced filtering
router.get('/search', async (req, res) => {
  try {
    const result = await mongoMovieService.searchMovies(req.query);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get movie by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await mongoMovieService.getMovieBySlug(req.params.slug);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    logger.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get new movies
router.get('/new', async (req, res) => {
  try {
    const result = await mongoMovieService.getNewMovies(req.query.page, req.query.limit);
    res.json(result);
  } catch (error) {
    logger.error('Get new movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get movies by category
router.get('/category/:category', async (req, res) => {
  try {
    const result = await mongoMovieService.getMoviesByCategory(
      req.params.category,
      req.query.page,
      req.query.limit
    );
    res.json(result);
  } catch (error) {
    logger.error('Get movies by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get movies by country
router.get('/country/:country', async (req, res) => {
  try {
    const result = await mongoMovieService.getMoviesByCountry(
      req.params.country,
      req.query.page,
      req.query.limit
    );
    res.json(result);
  } catch (error) {
    logger.error('Get movies by country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get movies by year
router.get('/year/:year', async (req, res) => {
  try {
    const result = await mongoMovieService.getMoviesByYear(
      req.params.year,
      req.query.page,
      req.query.limit
    );
    res.json(result);
  } catch (error) {
    logger.error('Get movies by year error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get movies by type
router.get('/type/:type', async (req, res) => {
  try {
    const result = await mongoMovieService.getMoviesByType(
      req.params.type,
      req.query.page,
      req.query.limit
    );
    res.json(result);
  } catch (error) {
    logger.error('Get movies by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get filter options
router.get('/filters/categories', async (req, res) => {
  try {
    const result = await mongoMovieService.getCategories();
    res.json(result);
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.get('/filters/countries', async (req, res) => {
  try {
    const result = await mongoMovieService.getCountries();
    res.json(result);
  } catch (error) {
    logger.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.get('/filters/years', async (req, res) => {
  try {
    const result = await mongoMovieService.getYears();
    res.json(result);
  } catch (error) {
    logger.error('Get years error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get movie statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await mongoMovieService.getStats();
    res.json(result);
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
