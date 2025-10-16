// API Proxy Service - Quản lý external API calls với caching và rate limiting
import { persistentCache } from './persistentCache';

const EXTERNAL_API_BASE = 'https://phimapi.com'; // KKPhim API
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
const MAX_REQUESTS_PER_MINUTE = 60; // Rate limiting

class ApiProxy {
  constructor() {
    this.requestQueue = [];
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.isProcessing = false;
  }

  // Rate limiting
  async checkRateLimit() {
    const now = Date.now();
    
    // Reset counter mỗi phút
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Nếu vượt quá limit, chờ
    if (this.requestCount >= MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - (now - this.lastResetTime);
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  // Cache key generator
  getCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `api_${endpoint}_${sortedParams}`;
  }

  // Main API call method với caching và error handling
  async makeRequest(endpoint, params = {}, options = {}) {
    try {
      // Check rate limit
      await this.checkRateLimit();

      // Generate cache key
      const cacheKey = this.getCacheKey(endpoint, params);
      
      // Try to get from cache first
      if (!options.skipCache) {
        const cached = await persistentCache.loadDatabase(cacheKey);
        if (cached && this.isCacheValid(cached)) {
          console.log(`Cache hit for ${endpoint}`);
          return cached.data;
        }
      }

      // Build URL
      const url = new URL(`${EXTERNAL_API_BASE}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log(`Making API request to: ${url.toString()}`);

      // Make request với timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'TupPhim/1.0'
        },
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      if (!options.skipCache) {
        await persistentCache.saveDatabase(cacheKey, data, {
          endpoint,
          params,
          timestamp: Date.now()
        });
      }

      return data;

    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      
      // Try to return cached data if available
      if (!options.skipCache) {
        const cacheKey = this.getCacheKey(endpoint, params);
        const cached = await persistentCache.loadDatabase(cacheKey);
        if (cached) {
          console.log(`Returning stale cache for ${endpoint}`);
          return cached.data;
        }
      }

      // Return fallback data
      return this.getFallbackData(endpoint, params);
    }
  }

  // Check if cache is still valid
  isCacheValid(cachedData) {
    if (!cachedData.metadata || !cachedData.metadata.timestamp) {
      return false;
    }
    
    const age = Date.now() - cachedData.metadata.timestamp;
    return age < CACHE_DURATION;
  }

  // Fallback data when API fails
  getFallbackData(endpoint, params) {
    console.log(`Returning fallback data for ${endpoint}`);
    
    if (endpoint.includes('search')) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        fallback: true
      };
    }
    
    if (endpoint.includes('detail')) {
      return {
        movie: null,
        episodes: [],
        fallback: true
      };
    }

    return {
      items: [],
      fallback: true
    };
  }

  // Specific API methods
  async searchMovies(keyword, options = {}) {
    return await this.makeRequest('/danh-sach/phim-moi-cap-nhat-v3', {
      page: options.page || 1,
      sort: options.sort || 'modified_time',
      sortType: options.sortType || 'desc',
      ...options
    });
  }

  async getMovieDetail(slug) {
    return await this.makeRequest(`/phim/${slug}`);
  }

  async getCategories() {
    return await this.makeRequest('/the-loai');
  }

  async getCountries() {
    return await this.makeRequest('/quoc-gia');
  }

  async getMoviesByCategory(category, options = {}) {
    return await this.makeRequest(`/v1/api/the-loai/${category}`, {
      page: options.page || 1,
      sort_field: options.sort || 'modified_time',
      sort_type: options.sortType || 'desc',
      limit: options.limit || 20
    });
  }

  async getMoviesByCountry(country, options = {}) {
    return await this.makeRequest(`/v1/api/quoc-gia/${country}`, {
      page: options.page || 1,
      sort_field: options.sort || 'modified_time',
      sort_type: options.sortType || 'desc',
      limit: options.limit || 20
    });
  }

  async getMoviesByYear(year, options = {}) {
    return await this.makeRequest(`/v1/api/nam/${year}`, {
      page: options.page || 1,
      sort_field: options.sort || 'modified_time',
      sort_type: options.sortType || 'desc',
      limit: options.limit || 20
    });
  }

  // Clear cache
  async clearCache() {
    await persistentCache.clearAllCache();
    console.log('API cache cleared');
  }

  // Get cache stats
  async getCacheStats() {
    return await persistentCache.getCacheInfo();
  }
}

// Export singleton instance
const apiProxy = new ApiProxy();
export default apiProxy;
