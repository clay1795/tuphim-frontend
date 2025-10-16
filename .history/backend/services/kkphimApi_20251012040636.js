const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('./logger');

// Import KKPhim config from frontend
const KKPHIM_CONFIG = {
  api: {
    base: 'https://phimapi.com',
    newMovies: {
      v1: '/danh-sach/phim-moi-cap-nhat',
      v2: '/danh-sach/phim-moi-cap-nhat-v2',
      v3: '/danh-sach/phim-moi-cap-nhat-v3',
    },
    movieDetail: '/phim/{slug}',
    tmdb: '/tmdb/{type}/{id}',
    moviesList: '/v1/api/danh-sach/{type_list}',
    search: '/v1/api/tim-kiem',
    categories: '/the-loai',
    categoryDetail: '/v1/api/the-loai/{slug}',
    countries: '/quoc-gia',
    countryDetail: '/v1/api/quoc-gia/{slug}',
    yearDetail: '/v1/api/nam/{year}',
  },
  images: {
    base: 'https://phimimg.com',
  },
  player: {
    base: 'https://player.phimapi.com/player/?url=',
  },
  rateLimit: {
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    requestsPerMinute: 100,
  },
  utils: {
    getWebpImageUrl: (imageUrl) => {
      if (!imageUrl) return '';
      return `${KKPHIM_CONFIG.api.base}/image.php?url=${encodeURIComponent(imageUrl)}`;
    },
    getPlayerUrl: (videoUrl) => {
      if (!videoUrl) return '';
      return `${KKPHIM_CONFIG.player.base}${encodeURIComponent(videoUrl)}`;
    },
    getOptimizedImageUrl: (imageUrl) => {
      if (!imageUrl) return '';
      if (imageUrl.includes('phimimg.com')) {
        return imageUrl;
      }
      if (imageUrl.includes('kkphim') || imageUrl.includes('phimapi')) {
        return imageUrl.replace(/https?:\/\/[^\/]+/, KKPHIM_CONFIG.images.base);
      }
      return imageUrl;
    },
    getFallbackData: (type) => {
      const fallbackData = {
        movies: { items: [], totalItems: 0, fallback: true },
        movieDetail: { movie: null, episodes: [], fallback: true },
        categories: { items: [], fallback: true },
        countries: { items: [], fallback: true }
      };
      return fallbackData[type] || { fallback: true };
    }
  }
};

class KKPhimApiService {
  constructor() {
    this.baseURL = KKPHIM_CONFIG.api.base;
    this.cache = new NodeCache({ 
      stdTTL: KKPHIM_CONFIG.rateLimit.cacheDuration / 1000,
      checkperiod: 120 
    });
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'TupPhim-Backend/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`KKPhim API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('KKPhim API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`KKPhim API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('KKPhim API Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check rate limit
   */
  checkRateLimit() {
    const now = Date.now();
    const timeDiff = now - this.lastResetTime;
    
    // Reset counter every minute
    if (timeDiff >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    // Check if we've exceeded the rate limit
    if (this.requestCount >= KKPHIM_CONFIG.rateLimit.requestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.requestCount++;
  }

  /**
   * Make request with caching and error handling
   */
  async makeRequest(endpoint, params = {}) {
    try {
      // Check rate limit
      this.checkRateLimit();
      
      // Create cache key
      const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache HIT for: ${endpoint}`);
        return cached;
      }
      
      logger.debug(`Cache MISS for: ${endpoint}`);
      
      // Make request
      const response = await this.client.get(endpoint, { params });
      
      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = response.data;
      
      // Cache the response
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      logger.error(`KKPhim API Error for ${endpoint}:`, error.message);
      
      // Return fallback data
      return KKPHIM_CONFIG.utils.getFallbackData('movies');
    }
  }

  /**
   * Get new movies
   */
  async getNewMovies(page = 1, version = 'v3') {
    const endpoint = KKPHIM_CONFIG.api.newMovies[version] || KKPHIM_CONFIG.api.newMovies.v3;
    return await this.makeRequest(endpoint, { page });
  }

  /**
   * Get movies from any endpoint (for full database fetch)
   */
  async getMoviesFromEndpoint(endpoint, page = 1, limit = 20) {
    return await this.makeRequest(endpoint, { page, limit });
  }

  /**
   * Get movie detail
   */
  async getMovieDetail(slug) {
    const endpoint = KKPHIM_CONFIG.api.movieDetail.replace('{slug}', slug);
    return await this.makeRequest(endpoint);
  }

  /**
   * Search movies
   */
  async searchMovies(keyword, options = {}) {
    const params = {
      keyword,
      page: options.page || 1,
      sort_field: options.sort_field || 'modified_time',
      sort_type: options.sort_type || 'desc',
      sort_lang: options.sort_lang || '',
      category: options.category || '',
      country: options.country || '',
      year: options.year || '',
      type: options.type || '',
      limit: options.limit || 20
    };
    
    return await this.makeRequest(KKPHIM_CONFIG.api.search, params);
  }

  /**
   * Get movies by type
   */
  async getMoviesByType(type, options = {}) {
    const typeMap = {
      'single': 'phim-le',
      'series': 'phim-bo', 
      'hoathinh': 'hoat-hinh'
    };
    
    const typeSlug = typeMap[type] || type;
    const endpoint = `/danh-sach/${typeSlug}`;
    
    const params = {
      page: options.page || 1,
      sort_field: options.sort_field || 'modified_time',
      sort_type: options.sort_type || 'desc',
      sort_lang: options.sort_lang || '',
      category: options.category || '',
      country: options.country || '',
      year: options.year || '',
      limit: options.limit || 20
    };
    
    return await this.makeRequest(endpoint, params);
  }

  /**
   * Get categories
   */
  async getCategories() {
    return await this.makeRequest(KKPHIM_CONFIG.api.categories);
  }

  /**
   * Get movies by category
   */
  async getMoviesByCategory(slug, options = {}) {
    const endpoint = KKPHIM_CONFIG.api.categoryDetail.replace('{slug}', slug);
    const params = {
      page: options.page || 1,
      sort_field: options.sort_field || 'modified_time',
      sort_type: options.sort_type || 'desc',
      sort_lang: options.sort_lang || '',
      country: options.country || '',
      year: options.year || '',
      limit: options.limit || 20
    };
    
    return await this.makeRequest(endpoint, params);
  }

  /**
   * Get countries
   */
  async getCountries() {
    return await this.makeRequest(KKPHIM_CONFIG.api.countries);
  }

  /**
   * Get movies by country
   */
  async getMoviesByCountry(slug, options = {}) {
    const endpoint = KKPHIM_CONFIG.api.countryDetail.replace('{slug}', slug);
    const params = {
      page: options.page || 1,
      sort_field: options.sort_field || 'modified_time',
      sort_type: options.sort_type || 'desc',
      sort_lang: options.sort_lang || '',
      category: options.category || '',
      year: options.year || '',
      limit: options.limit || 20
    };
    
    return await this.makeRequest(endpoint, params);
  }

  /**
   * Get movies by year
   */
  async getMoviesByYear(year, options = {}) {
    const endpoint = KKPHIM_CONFIG.api.yearDetail.replace('{year}', year);
    const params = {
      page: options.page || 1,
      sort_field: options.sort_field || 'modified_time',
      sort_type: options.sort_type || 'desc',
      sort_lang: options.sort_lang || '',
      category: options.category || '',
      country: options.country || '',
      limit: options.limit || 20
    };
    
    return await this.makeRequest(endpoint, params);
  }

  /**
   * Get TMDB info
   */
  async getTMDBInfo(type, id) {
    const endpoint = KKPHIM_CONFIG.api.tmdb.replace('{type}', type).replace('{id}', id);
    return await this.makeRequest(endpoint);
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(imageUrl) {
    return KKPHIM_CONFIG.utils.getOptimizedImageUrl(imageUrl);
  }

  /**
   * Get WebP image URL
   */
  getWebpImage(imageUrl) {
    return KKPHIM_CONFIG.utils.getWebpImageUrl(imageUrl);
  }

  /**
   * Get player URL
   */
  getPlayerUrl(videoUrl) {
    return KKPHIM_CONFIG.utils.getPlayerUrl(videoUrl);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.flushAll();
    logger.info('KKPhim API cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      await this.getNewMovies(1, 'v3');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        cacheStats: this.getCacheStats(),
        rateLimit: {
          current: this.requestCount,
          limit: KKPHIM_CONFIG.rateLimit.requestsPerMinute,
          resetTime: new Date(this.lastResetTime + 60000).toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        cacheStats: this.getCacheStats()
      };
    }
  }
}

module.exports = new KKPhimApiService();






