// KKPhim API Service - Tối ưu theo tài liệu chính thức
// Tài liệu: https://kkphim1.com/tai-lieu-api
// API Base: https://phimapi.com
// Image Base: https://phimimg.com
// Player Base: https://player.phimapi.com/player/?url=

import KKPHIM_CONFIG from '../config/kkphimConfig';

const KKPHIM_API_BASE = KKPHIM_CONFIG.api.base;
const KKPHIM_IMG_BASE = KKPHIM_CONFIG.images.base;
const KKPHIM_PLAYER_BASE = KKPHIM_CONFIG.player.base;
const CACHE_DURATION = KKPHIM_CONFIG.rateLimit.cacheDuration;
const MAX_REQUESTS_PER_MINUTE = KKPHIM_CONFIG.rateLimit.requestsPerMinute;

class KKPhimApiService {
  constructor() {
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.cache = new Map();
  }

  // Rate limiting theo KKPhim
  async checkRateLimit() {
    const now = Date.now();
    
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - (now - this.lastResetTime);
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  // Cache management
  getCacheKey(endpoint, params = {}) {
    return `kkphim_${endpoint}_${JSON.stringify(params)}`;
  }

  getFromCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Main request method
  async makeRequest(endpoint, params = {}, options = {}) {
    try {
      await this.checkRateLimit();

      const cacheKey = this.getCacheKey(endpoint, params);
      
      // Check cache first
      if (!options.skipCache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          console.log(`✅ Cache hit for ${endpoint}`);
          return cached;
        }
      }

      // Build URL
      const url = new URL(`${KKPHIM_API_BASE}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log(`🌐 KKPhim API request: ${url.toString()}`);

      // Make request với timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'TupPhim/1.0 (https://tuphim.com)'
        },
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`KKPhim API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      if (!options.skipCache) {
        this.setCache(cacheKey, data);
      }

      return data;

    } catch (error) {
      console.error(`❌ KKPhim API error for ${endpoint}:`, error);
      
      // Try to return cached data if available
      if (!options.skipCache) {
        const cacheKey = this.getCacheKey(endpoint, params);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          console.log(`📦 Returning stale cache for ${endpoint}`);
          return cached;
        }
      }

      // Return fallback data
      return this.getFallbackData(endpoint, params);
    }
  }

  // 1. PHIM MỚI CẬP NHẬT
  async getNewMovies(page = 1, version = 'v3') {
    const endpoint = KKPHIM_CONFIG.api.newMovies[version] || KKPHIM_CONFIG.api.newMovies.v3;
    return await this.makeRequest(endpoint, { page });
  }

  // 2. THÔNG TIN PHIM & DANH SÁCH TẬP PHIM
  async getMovieDetail(slug) {
    const endpoint = KKPHIM_CONFIG.api.movieDetail.replace('{slug}', slug);
    return await this.makeRequest(endpoint);
  }

  // 3. THÔNG TIN DỰA THEO TMDB ID
  async getTMDBInfo(type, id) {
    const endpoint = KKPHIM_CONFIG.api.tmdb.replace('{type}', type).replace('{id}', id);
    return await this.makeRequest(endpoint);
  }

  // 4. DANH SÁCH TỔNG HỢP
  async getMoviesList(typeList, options = {}) {
    const {
      page = 1,
      sort_field = 'modified_time',
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      country = '',
      year = '',
      limit = 20
    } = options;

    const endpoint = KKPHIM_CONFIG.api.moviesList.replace('{type_list}', typeList);
    const params = {
      page,
      sort_field,
      sort_type,
      limit
    };

    if (sort_lang) params.sort_lang = sort_lang;
    if (category) params.category = category;
    if (country) params.country = country;
    if (year) params.year = year;

    return await this.makeRequest(endpoint, params);
  }

  // 5. TÌM KIẾM PHIM
  async searchMovies(keyword, options = {}) {
    const {
      page = 1,
      sort_field = 'modified_time',
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      country = '',
      year = '',
      limit = 20
    } = options;

    const endpoint = KKPHIM_CONFIG.api.search;
    const params = {
      keyword,
      page,
      sort_field,
      sort_type,
      limit
    };

    if (sort_lang) params.sort_lang = sort_lang;
    if (category) params.category = category;
    if (country) params.country = country;
    if (year) params.year = year;

    return await this.makeRequest(endpoint, params);
  }

  // 6. THỂ LOẠI
  async getCategories() {
    const endpoint = KKPHIM_CONFIG.api.categories;
    return await this.makeRequest(endpoint);
  }

  async getCategoryDetail(slug, options = {}) {
    const {
      page = 1,
      sort_field = 'modified_time',
      sort_type = 'desc',
      sort_lang = '',
      country = '',
      year = '',
      limit = 20
    } = options;

    const endpoint = KKPHIM_CONFIG.api.categoryDetail.replace('{slug}', slug);
    const params = {
      page,
      sort_field,
      sort_type,
      limit
    };

    if (sort_lang) params.sort_lang = sort_lang;
    if (country) params.country = country;
    if (year) params.year = year;

    return await this.makeRequest(endpoint, params);
  }

  // 7. QUỐC GIA
  async getCountries() {
    const endpoint = '/quoc-gia';
    return await this.makeRequest(endpoint);
  }

  async getCountryDetail(slug, options = {}) {
    const {
      page = 1,
      sort_field = 'modified_time',
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      year = '',
      limit = 20
    } = options;

    const endpoint = `/v1/api/quoc-gia/${slug}`;
    const params = {
      page,
      sort_field,
      sort_type,
      limit
    };

    if (sort_lang) params.sort_lang = sort_lang;
    if (category) params.category = category;
    if (year) params.year = year;

    return await this.makeRequest(endpoint, params);
  }

  // 8. NĂM
  async getMoviesByYear(year, options = {}) {
    const {
      page = 1,
      sort_field = 'modified_time',
      sort_type = 'desc',
      sort_lang = '',
      category = '',
      country = '',
      limit = 20
    } = options;

    const endpoint = `/v1/api/nam/${year}`;
    const params = {
      page,
      sort_field,
      sort_type,
      limit
    };

    if (sort_lang) params.sort_lang = sort_lang;
    if (category) params.category = category;
    if (country) params.country = country;

    return await this.makeRequest(endpoint, params);
  }

  // 9. CHUYỂN ĐỔI ẢNH SANG WEBP
  getWebpImage(imageUrl) {
    if (!imageUrl) return '';
    return `${KKPHIM_API_BASE}/image.php?url=${encodeURIComponent(imageUrl)}`;
  }

  // 10. TRÌNH PHÁT VIDEO
  getPlayerUrl(videoUrl) {
    if (!videoUrl) return '';
    return `${KKPHIM_PLAYER_BASE}${encodeURIComponent(videoUrl)}`;
  }

  // 11. OPTIMIZE IMAGE URL
  getOptimizedImageUrl(imageUrl, size = 'original') {
    if (!imageUrl) return '';
    
    // Nếu đã là URL từ phimimg.com, trả về nguyên
    if (imageUrl.includes('phimimg.com')) {
      return imageUrl;
    }
    
    // Nếu là URL từ KKPhim, chuyển đổi sang phimimg.com
    if (imageUrl.includes('kkphim') || imageUrl.includes('phimapi')) {
      return imageUrl.replace(/https?:\/\/[^\/]+/, KKPHIM_IMG_BASE);
    }
    
    return imageUrl;
  }

  // Helper methods cho các loại phim phổ biến
  async getPhimBo(options = {}) {
    return await this.getMoviesList('phim-bo', options);
  }

  async getPhimLe(options = {}) {
    return await this.getMoviesList('phim-le', options);
  }

  async getTVShows(options = {}) {
    return await this.getMoviesList('tv-shows', options);
  }

  async getHoatHinh(options = {}) {
    return await this.getMoviesList('hoat-hinh', options);
  }

  async getPhimVietSub(options = {}) {
    return await this.getMoviesList('phim-vietsub', options);
  }

  async getPhimThuyetMinh(options = {}) {
    return await this.getMoviesList('phim-thuyet-minh', options);
  }

  async getPhimLongTieng(options = {}) {
    return await this.getMoviesList('phim-long-tieng', options);
  }

  // Fallback data methods
  getFallbackData(endpoint, params) {
    console.log(`📦 Returning fallback data for ${endpoint}`);
    
    if (endpoint.includes('search') || endpoint.includes('tim-kiem')) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        fallback: true,
        message: 'Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau.'
      };
    }
    
    if (endpoint.includes('phim/')) {
      return {
        movie: null,
        episodes: [],
        fallback: true,
        message: 'Không thể tải thông tin phim. Vui lòng thử lại sau.'
      };
    }

    if (endpoint.includes('the-loai')) {
      return {
        items: [
          { name: 'Hành động', slug: 'hanh-dong' },
          { name: 'Tình cảm', slug: 'tinh-cam' },
          { name: 'Hài hước', slug: 'hai-huoc' },
          { name: 'Kinh dị', slug: 'kinh-di' },
          { name: 'Viễn tưởng', slug: 'vien-tuong' }
        ],
        fallback: true
      };
    }

    if (endpoint.includes('quoc-gia')) {
      return {
        items: [
          { name: 'Việt Nam', slug: 'viet-nam' },
          { name: 'Trung Quốc', slug: 'trung-quoc' },
          { name: 'Hàn Quốc', slug: 'han-quoc' },
          { name: 'Nhật Bản', slug: 'nhat-ban' },
          { name: 'Mỹ', slug: 'my' }
        ],
        fallback: true
      };
    }

    return {
      items: [],
      fallback: true,
      message: 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
    };
  }

  // Cache management
  clearCache() {
    this.cache.clear();
    console.log('✅ KKPhim API cache cleared');
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      requestCount: this.requestCount,
      lastResetTime: this.lastResetTime
    };
  }

  // Utility methods
  getAvailableTypeLists() {
    return [
      'phim-bo',
      'phim-le', 
      'tv-shows',
      'hoat-hinh',
      'phim-vietsub',
      'phim-thuyet-minh',
      'phim-long-tieng'
    ];
  }

  getAvailableSortFields() {
    return [
      'modified_time',
      '_id',
      'year'
    ];
  }

  getAvailableSortTypes() {
    return ['desc', 'asc'];
  }

  getAvailableSortLangs() {
    return [
      'vietsub',
      'thuyet-minh',
      'long-tieng'
    ];
  }

  getAvailableYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1970; year--) {
      years.push(year);
    }
    return years;
  }
}

// Export singleton instance
const kkphimApi = new KKPhimApiService();
export default kkphimApi;
