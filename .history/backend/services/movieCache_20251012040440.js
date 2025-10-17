const fs = require('fs').promises;
const path = require('path');
const kkphimApi = require('./kkphimApi');

class MovieCache {
  constructor() {
    this.cacheFile = path.join(__dirname, '../data/movieCache.json');
    this.cache = {
      movies: [],
      categories: [],
      countries: [],
      lastUpdate: null,
      totalMovies: 0
    };
    this.isUpdating = false;
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
  }

  // Initialize cache on startup
  async initialize() {
    try {
      console.log('🚀 Initializing Movie Cache System...');
      
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.cacheFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Try to load existing cache
      await this.loadCache();
      
      // If cache is empty or old, start full update
      const cacheAge = this.cache.lastUpdate ? Date.now() - this.cache.lastUpdate : Infinity;
      if (this.cache.movies.length === 0 || cacheAge > this.updateInterval) {
        console.log('📦 Cache is empty or outdated, starting full update...');
        await this.fullUpdate();
      } else {
        console.log(`✅ Cache loaded: ${this.cache.movies.length} movies, last update: ${new Date(this.cache.lastUpdate).toLocaleString()}`);
        
        // Start background update if cache is older than 15 minutes
        if (cacheAge > 15 * 60 * 1000) {
          console.log('🔄 Starting background update...');
          this.backgroundUpdate();
        }
      }
      
      // Schedule regular updates
      setInterval(() => {
        this.backgroundUpdate();
      }, this.updateInterval);
      
    } catch (error) {
      console.error('❌ Error initializing cache:', error);
      throw error;
    }
  }

  // Load cache from file
  async loadCache() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf8');
      this.cache = JSON.parse(data);
      console.log(`📂 Loaded cache from file: ${this.cache.movies.length} movies`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📂 No cache file found, starting fresh');
      } else {
        console.error('❌ Error loading cache:', error);
        throw error;
      }
    }
  }

  // Save cache to file
  async saveCache() {
    try {
      this.cache.lastUpdate = Date.now();
      await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2));
      console.log(`💾 Cache saved: ${this.cache.movies.length} movies`);
    } catch (error) {
      console.error('❌ Error saving cache:', error);
      throw error;
    }
  }

  // Full update - fetch all movies from API
  async fullUpdate() {
    if (this.isUpdating) {
      console.log('⏳ Update already in progress...');
      return;
    }

    this.isUpdating = true;
    console.log('🔄 Starting full cache update...');
    
    try {
      const startTime = Date.now();
      let allMovies = [];
      let page = 1;
      let hasMore = true;
      const batchSize = 50; // Increased batch size for faster fetching
      
      while (hasMore && page <= 3000) { // Increased limit to fetch all movies like KKPhim
        console.log(`📡 Fetching pages ${page}-${Math.min(page + batchSize - 1, 2000)}...`);
        
        // Create batch of pages to fetch
        const pages = [];
        for (let i = page; i < Math.min(page + batchSize, 2001); i++) {
          pages.push(i);
        }
        
        // Fetch all pages in batch in parallel
        const batchPromises = pages.map(async (currentPage) => {
          try {
            const result = await kkphimApi.getNewMovies(currentPage, 20);
            return { page: currentPage, data: result, success: true };
          } catch (error) {
            console.error(`❌ Error fetching page ${currentPage}:`, error);
            return { page: currentPage, data: null, success: false };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        let batchMovies = [];
        let totalPages = 1;
        
        batchResults.forEach(({ page, data, success }) => {
          // Fix: API returns data.items directly, not data.data.items
          if (success && data && data.items && Array.isArray(data.items)) {
            batchMovies = batchMovies.concat(data.items);
            totalPages = data.pagination?.totalPages || 1;
            console.log(`✅ Page ${page}: ${data.items.length} movies`);
          } else {
            console.log(`❌ Page ${page}: Invalid response structure`, {
              hasData: !!data,
              hasItems: !!(data && data.items),
              isArray: !!(data && data.items && Array.isArray(data.items)),
              actualStructure: data ? Object.keys(data) : 'no data'
            });
          }
        });
        
        if (batchMovies.length === 0) {
          console.log(`🛑 No more movies found at page ${page}, stopping...`);
          hasMore = false;
          break;
        }
        
        allMovies = allMovies.concat(batchMovies);
        page += batchSize;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if we've reached the end
        if (page > totalPages) {
          hasMore = false;
        }
        
        console.log(`📊 Progress: ${allMovies.length} movies fetched (Batch ${Math.ceil(page/batchSize)}/${Math.ceil(2000/batchSize)})`);
      }
      
      // Remove duplicates based on slug
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      allMovies.forEach(movie => {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      });
      
      this.cache.movies = uniqueMovies;
      this.cache.totalMovies = uniqueMovies.length;
      
      // Fetch categories and countries
      try {
        const [categoriesResult, countriesResult] = await Promise.all([
          kkphimApi.getCategories(),
          kkphimApi.getCountries()
        ]);
        
        this.cache.categories = categoriesResult.data || [];
        this.cache.countries = countriesResult.data || [];
      } catch (error) {
        console.error('❌ Error fetching categories/countries:', error);
      }
      
      // Save to file
      await this.saveCache();
      
      const duration = Date.now() - startTime;
      console.log(`🎉 Full update completed in ${Math.round(duration/1000)}s: ${uniqueMovies.length} unique movies`);
      
    } catch (error) {
      console.error('❌ Error during full update:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  // Background update - incremental update
  async backgroundUpdate() {
    if (this.isUpdating) {
      console.log('⏳ Background update skipped - full update in progress');
      return;
    }

    console.log('🔄 Starting background cache update...');
    
    try {
      // Fetch latest movies (first few pages)
      const latestMovies = [];
      for (let page = 1; page <= 5; page++) {
        try {
          const result = await kkphimApi.getNewMovies(page, 20);
          if (result && result.data && result.data.items) {
            latestMovies.push(...result.data.items);
          }
        } catch (error) {
          console.error(`❌ Error fetching latest page ${page}:`, error);
        }
      }
      
      // Update cache with new movies
      const existingSlugs = new Set(this.cache.movies.map(m => m.slug));
      const newMovies = latestMovies.filter(movie => 
        movie.slug && !existingSlugs.has(movie.slug)
      );
      
      if (newMovies.length > 0) {
        this.cache.movies = [...newMovies, ...this.cache.movies];
        this.cache.totalMovies = this.cache.movies.length;
        
        // Keep only latest 25000 movies to prevent memory issues
        if (this.cache.movies.length > 25000) {
          this.cache.movies = this.cache.movies.slice(0, 25000);
          this.cache.totalMovies = this.cache.movies.length;
        }
        
        await this.saveCache();
        console.log(`✅ Background update: Added ${newMovies.length} new movies, total: ${this.cache.totalMovies}`);
      } else {
        console.log('✅ Background update: No new movies found');
      }
      
    } catch (error) {
      console.error('❌ Error during background update:', error);
    }
  }

  // Search movies in cache
  searchMovies(query, filters = {}) {
    let movies = [...this.cache.movies];
    
    // Apply keyword filter
    if (query) {
      const keyword = query.toLowerCase();
      movies = movies.filter(movie => 
        movie.name?.toLowerCase().includes(keyword) ||
        movie.origin_name?.toLowerCase().includes(keyword) ||
        movie.slug?.toLowerCase().includes(keyword)
      );
    }
    
    // Apply type filter
    if (filters.type) {
      movies = movies.filter(movie => {
        const movieType = movie.type || movie.movieType || '';
        return movieType === filters.type;
      });
    }
    
    // Apply category filter
    if (filters.category) {
      movies = movies.filter(movie => 
        movie.category && movie.category.some(cat => cat.slug === filters.category)
      );
    }
    
    // Apply country filter
    if (filters.country) {
      movies = movies.filter(movie => 
        movie.country && movie.country.some(country => country.slug === filters.country)
      );
    }
    
    // Apply year filter
    if (filters.year) {
      movies = movies.filter(movie => movie.year == filters.year);
    }
    
    // Apply sorting
    if (filters.sort) {
      movies.sort((a, b) => {
        const field = filters.sort;
        const direction = filters.sortType === 'asc' ? 1 : -1;
        
        if (field === 'name') {
          return direction * (a.name?.localeCompare(b.name) || 0);
        } else if (field === 'year') {
          return direction * ((a.year || 0) - (b.year || 0));
        } else if (field === 'modified_time') {
          return direction * ((new Date(a.modified_time) || 0) - (new Date(b.modified_time) || 0));
        }
        return 0;
      });
    }
    
    return movies;
  }

  // Get cache stats
  getStats() {
    return {
      totalMovies: this.cache.totalMovies,
      lastUpdate: this.cache.lastUpdate,
      isUpdating: this.isUpdating,
      categories: this.cache.categories.length,
      countries: this.cache.countries.length
    };
  }

  // Get all movies
  getAllMovies() {
    return this.cache.movies;
  }

  // Get categories
  getCategories() {
    return this.cache.categories;
  }

  // Get countries
  getCountries() {
    return this.cache.countries;
  }
}

module.exports = new MovieCache();
