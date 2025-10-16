// Optimized Movie API Service - Tối ưu cho external API với intelligent caching
import apiProxy from './apiProxy';
import { persistentCache } from './persistentCache';

class OptimizedMovieApi {
  constructor() {
    this.searchCache = new Map();
    this.detailCache = new Map();
    this.categoriesCache = null;
    this.countriesCache = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 phút
  }

  // Intelligent search với progressive loading
  async searchMovies(keyword, options = {}) {
    try {
      console.log(`🔍 Searching movies: "${keyword}"`);
      
      // Check cache first
      const cacheKey = `search_${keyword}_${JSON.stringify(options)}`;
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('✅ Search cache hit');
        return cached.data;
      }

      // Progressive search strategy
      let results = await this.progressiveSearch(keyword, options);
      
      // Cache results
      this.searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results;

    } catch (error) {
      console.error('Search error:', error);
      return this.getFallbackSearchResults(keyword);
    }
  }

  // Progressive search - tìm kiếm từng bước để tối ưu performance
  async progressiveSearch(keyword, options) {
    const { page = 1, limit = 24 } = options;
    
    // Bước 1: Tìm kiếm trong 5 trang đầu (100 phim)
    let quickResults = [];
    const quickSearchPages = 5;
    
    for (let currentPage = 1; currentPage <= quickSearchPages; currentPage++) {
      try {
        const pageData = await apiProxy.searchMovies(keyword, {
          page: currentPage,
          ...options
        });
        
        if (pageData.items && Array.isArray(pageData.items)) {
          // Filter movies that match keyword
          const filteredMovies = pageData.items.filter(movie => {
            const movieName = (movie.name || '').toLowerCase();
            const keywordLower = keyword.toLowerCase();
            return movieName.includes(keywordLower);
          });
          
          quickResults = [...quickResults, ...filteredMovies];
        }
        
        // If we have enough results, stop
        if (quickResults.length >= limit * 2) {
          break;
        }
        
      } catch (error) {
        console.warn(`Error searching page ${currentPage}:`, error);
      }
    }

    // Bước 2: Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = quickResults.slice(startIndex, endIndex);

    return {
      items: paginatedResults,
      totalItems: quickResults.length,
      totalPages: Math.ceil(quickResults.length / limit),
      currentPage: page,
      keyword: keyword,
      searchMode: 'progressive'
    };
  }

  // Get movie detail với caching
  async getMovieDetail(slug) {
    try {
      console.log(`🎬 Getting movie detail: ${slug}`);
      
      // Check cache
      const cached = this.detailCache.get(slug);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('✅ Detail cache hit');
        return cached.data;
      }

      // Fetch from API
      const data = await apiProxy.getMovieDetail(slug);
      
      // Cache result
      this.detailCache.set(slug, {
        data: data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      console.error('Movie detail error:', error);
      return this.getFallbackMovieDetail(slug);
    }
  }

  // Get categories với caching
  async getCategories() {
    try {
      if (this.categoriesCache && Date.now() - this.categoriesCache.timestamp < this.cacheExpiry) {
        return this.categoriesCache.data;
      }

      const data = await apiProxy.getCategories();
      
      this.categoriesCache = {
        data: data,
        timestamp: Date.now()
      };

      return data;

    } catch (error) {
      console.error('Categories error:', error);
      return this.getFallbackCategories();
    }
  }

  // Get countries với caching
  async getCountries() {
    try {
      if (this.countriesCache && Date.now() - this.countriesCache.timestamp < this.cacheExpiry) {
        return this.countriesCache.data;
      }

      const data = await apiProxy.getCountries();
      
      this.countriesCache = {
        data: data,
        timestamp: Date.now()
      };

      return data;

    } catch (error) {
      console.error('Countries error:', error);
      return this.getFallbackCountries();
    }
  }

  // Get movies by category với intelligent caching
  async getMoviesByCategory(category, options = {}) {
    try {
      const cacheKey = `category_${category}_${JSON.stringify(options)}`;
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const data = await apiProxy.getMoviesByCategory(category, options);
      
      this.searchCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      console.error('Category movies error:', error);
      return this.getFallbackCategoryResults(category);
    }
  }

  // Get movies by country
  async getMoviesByCountry(country, options = {}) {
    try {
      const cacheKey = `country_${country}_${JSON.stringify(options)}`;
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const data = await apiProxy.getMoviesByCountry(country, options);
      
      this.searchCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      console.error('Country movies error:', error);
      return this.getFallbackCountryResults(country);
    }
  }

  // Get movies by year
  async getMoviesByYear(year, options = {}) {
    try {
      const cacheKey = `year_${year}_${JSON.stringify(options)}`;
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const data = await apiProxy.getMoviesByYear(year, options);
      
      this.searchCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      console.error('Year movies error:', error);
      return this.getFallbackYearResults(year);
    }
  }

  // Get trending movies (cached for 1 hour)
  async getTrendingMovies(options = {}) {
    try {
      const cacheKey = 'trending_movies';
      const cached = await persistentCache.loadDatabase(cacheKey);
      
      if (cached && Date.now() - cached.metadata.timestamp < 60 * 60 * 1000) {
        return cached.data;
      }

      // Get latest movies as trending
      const data = await apiProxy.searchMovies('', {
        page: 1,
        sort: 'modified_time',
        sortType: 'desc',
        limit: 24,
        ...options
      });

      // Cache for 1 hour
      await persistentCache.saveDatabase(cacheKey, data, {
        timestamp: Date.now(),
        type: 'trending'
      });

      return data;

    } catch (error) {
      console.error('Trending movies error:', error);
      return this.getFallbackTrendingResults();
    }
  }

  // Fallback methods
  getFallbackSearchResults(keyword) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      keyword: keyword,
      fallback: true,
      message: 'Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau.'
    };
  }

  getFallbackMovieDetail(slug) {
    return {
      movie: null,
      episodes: [],
      fallback: true,
      message: 'Không thể tải thông tin phim. Vui lòng thử lại sau.'
    };
  }

  getFallbackCategories() {
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

  getFallbackCountries() {
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

  getFallbackCategoryResults(category) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      category: category,
      fallback: true
    };
  }

  getFallbackCountryResults(country) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      country: country,
      fallback: true
    };
  }

  getFallbackYearResults(year) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      year: year,
      fallback: true
    };
  }

  getFallbackTrendingResults() {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      fallback: true
    };
  }

  // Cache management
  clearCache() {
    this.searchCache.clear();
    this.detailCache.clear();
    this.categoriesCache = null;
    this.countriesCache = null;
    console.log('✅ Movie API cache cleared');
  }

  getCacheStats() {
    return {
      searchCache: this.searchCache.size,
      detailCache: this.detailCache.size,
      categoriesCached: !!this.categoriesCache,
      countriesCached: !!this.countriesCache
    };
  }
}

// Export singleton instance
const optimizedMovieApi = new OptimizedMovieApi();
export default optimizedMovieApi;


