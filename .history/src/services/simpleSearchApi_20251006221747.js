// Simple Search API - Tìm kiếm đơn giản với Persistent Cache
import persistentCache from './persistentCache';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Database storage
let preloadedMovies = [];
let preloadedCategories = [];
let preloadedCountries = [];
let preloadedYears = [];
let fullDatabaseLoaded = false;
let loadingProgress = { current: 0, total: 0, percentage: 0 };

export const simpleSearchApi = {
  // Khởi tạo database
  initialize: async () => {
    try {
      console.log('Initializing search database...');
      
      // Kiểm tra cache trước
      const cacheKey = 'full_database';
      const cachedData = await persistentCache.loadDatabase(cacheKey);
      
      if (cachedData && cachedData.movies && cachedData.movies.length > 0) {
        console.log(`Found cached database: ${cachedData.movies.length} movies`);
        
        // Load từ cache
        preloadedMovies = cachedData.movies;
        preloadedCategories = [...new Set(
          preloadedMovies.flatMap(movie => 
            (movie.category || []).map(cat => cat.name || cat)
          ).filter(Boolean)
        )];
        preloadedCountries = [...new Set(
          preloadedMovies.flatMap(movie => 
            (movie.country || []).map(country => country.name || country)
          ).filter(Boolean)
        )];
        preloadedYears = [...new Set(
          preloadedMovies.map(movie => movie.year).filter(Boolean)
        )].sort((a, b) => b - a);
        
        fullDatabaseLoaded = true;
        
        return {
          movies: preloadedMovies.length,
          categories: preloadedCategories.length,
          countries: preloadedCountries.length,
          years: preloadedYears.length,
          fromCache: true,
          cacheAge: Date.now() - cachedData.timestamp
        };
      }
      
      // Không có cache, load từ API
      console.log('No cache found, loading from API...');
      return await simpleSearchApi.loadFullDatabase();
      
    } catch (error) {
      console.error('Error initializing search:', error);
      return { movies: 0, categories: 0, countries: 0, years: 0, error: error.message };
    }
  },

  // Load full database từ API
  loadFullDatabase: async (onProgress = null) => {
    try {
      console.log('Loading full database from API...');
      
      const estimatedPages = 1000;
      loadingProgress = { current: 0, total: estimatedPages, percentage: 0 };
      
      let allMovies = [];
      const batchSize = 10;
      let currentPage = 1;
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 5;
      
      while (currentPage <= estimatedPages && consecutiveErrors < maxConsecutiveErrors) {
        const batchPromises = [];
        
        // Load batch
        for (let i = 0; i < batchSize && currentPage <= estimatedPages; i++) {
          batchPromises.push(
            fetch(`${BASE_URL}/items?page=${currentPage}`)
              .then(response => response.json())
              .catch(error => {
                console.warn(`Failed to load page ${currentPage}:`, error);
                return null;
              })
          );
          currentPage++;
        }
        
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(result => result && result.items && result.items.length > 0);
        
        if (validResults.length === 0) {
          consecutiveErrors++;
          console.log(`No valid results in batch, consecutive errors: ${consecutiveErrors}`);
          continue;
        }
        
        consecutiveErrors = 0;
        
        // Merge results
        for (const result of validResults) {
          if (result.items) {
            allMovies = allMovies.concat(result.items);
          }
        }
        
        // Update progress
        loadingProgress.current = currentPage - 1;
        loadingProgress.percentage = Math.min(100, (loadingProgress.current / loadingProgress.total) * 100);
        
        if (onProgress) {
          onProgress(loadingProgress);
        }
        
        console.log(`Loaded ${allMovies.length} movies (${loadingProgress.percentage.toFixed(1)}%)`);
        
        // Stop if we have enough movies
        if (allMovies.length >= 20000) {
          console.log('Reached target of 20k movies, stopping...');
          break;
        }
      }
      
      // Deduplicate movies
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      preloadedMovies = uniqueMovies;
      preloadedCategories = [...new Set(
        preloadedMovies.flatMap(movie => 
          (movie.category || []).map(cat => cat.name || cat)
        ).filter(Boolean)
      )];
      preloadedCountries = [...new Set(
        preloadedMovies.flatMap(movie => 
          (movie.country || []).map(country => country.name || country)
        ).filter(Boolean)
      )];
      preloadedYears = [...new Set(
        preloadedMovies.map(movie => movie.year).filter(Boolean)
      )].sort((a, b) => b - a);
      
      fullDatabaseLoaded = true;
      loadingProgress.percentage = 100;
      
      console.log(`Full database ready: ${preloadedMovies.length} movies`);
      
      // Lưu vào persistent cache
      const cacheKey = 'full_database';
      const metadata = {
        movies: preloadedMovies.length,
        categories: preloadedCategories.length,
        countries: preloadedCountries.length,
        years: preloadedYears.length
      };
      
      try {
        await persistentCache.saveDatabase(cacheKey, preloadedMovies, metadata);
        console.log('Database saved to persistent cache');
      } catch (cacheError) {
        console.error('Error saving to cache:', cacheError);
      }
      
      return {
        movies: preloadedMovies.length,
        categories: preloadedCategories.length,
        countries: preloadedCountries.length,
        years: preloadedYears.length,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Error loading full database:', error);
      fullDatabaseLoaded = false;
      return { movies: 0, categories: 0, countries: 0, years: 0, error: error.message };
    }
  },

  // Tìm kiếm movies
  searchMovies: async (keyword = '', options = {}) => {
    try {
      const {
        limit = 20,
        page = 1,
        category = '',
        country = '',
        year = '',
        type = ''
      } = options;

      if (fullDatabaseLoaded) {
        // Tìm kiếm trong database đã load
        let filteredMovies = preloadedMovies;

        // Apply keyword search
        if (keyword.trim()) {
          const searchTerm = keyword.toLowerCase();
          filteredMovies = preloadedMovies.filter(movie => {
            const name = (movie.name || '').toLowerCase();
            const originName = (movie.origin_name || '').toLowerCase();
            const slug = (movie.slug || '').toLowerCase();
            
            return name.includes(searchTerm) || 
                   originName.includes(searchTerm) || 
                   slug.includes(searchTerm);
          });
        }

        // Apply filters
        if (category || country || year || type) {
          filteredMovies = filteredMovies.filter(movie => {
            const hasCategory = !category || 
              (movie.category && movie.category.some(cat => 
                (cat.name || cat).toLowerCase().includes(category.toLowerCase())
              ));
            
            const hasCountry = !country || 
              (movie.country && movie.country.some(c => 
                (c.name || c).toLowerCase().includes(country.toLowerCase())
              ));
            
            const hasYear = !year || movie.year == year;
            const hasType = !type || movie.type === type;
            
            return hasCategory && hasCountry && hasYear && hasType;
          });
        }

        // Sort by year (newest first)
        filteredMovies.sort((a, b) => (b.year || 0) - (a.year || 0));

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

        return {
          items: paginatedMovies,
          totalItems: filteredMovies.length,
          totalPages: Math.ceil(filteredMovies.length / limit),
          currentPage: page
        };
      } else {
        // Fallback to API
        const response = await fetch(`${BASE_URL}/items?page=${page}&limit=${limit}&keyword=${keyword}`);
        const data = await response.json();
        
        return {
          items: data.items || [],
          totalItems: data.totalItems || 0,
          totalPages: data.totalPages || 1,
          currentPage: page
        };
      }
    } catch (error) {
      console.error('Search error:', error);
      return { items: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  // Lấy tất cả phim
  getAllMovies: async (options = {}) => {
    return await simpleSearchApi.searchMovies('', options);
  },

  // Lấy thống kê
  getStats: () => {
    return {
      movies: preloadedMovies.length,
      categories: preloadedCategories.length,
      countries: preloadedCountries.length,
      years: preloadedYears.length,
      fullDatabaseLoaded: fullDatabaseLoaded
    };
  },

  // Lấy trạng thái loading
  getLoadingStatus: () => {
    return {
      isLoaded: fullDatabaseLoaded,
      progress: loadingProgress,
      totalMovies: preloadedMovies.length
    };
  },

  // Lấy thông tin cache
  getCacheInfo: async () => {
    return await persistentCache.getCacheInfo();
  },

  // Xóa cache
  clearCache: async () => {
    try {
      await persistentCache.clearAllCache();
      fullDatabaseLoaded = false;
      preloadedMovies = [];
      preloadedCategories = [];
      preloadedCountries = [];
      preloadedYears = [];
      console.log('All cache cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  },

  // Lấy trạng thái cache
  getCacheStatus: async () => {
    const cacheInfo = await persistentCache.getCacheInfo();
    const cacheKey = 'full_database';
    const cachedData = await persistentCache.loadDatabase(cacheKey);
    
    return {
      hasCache: !!cachedData,
      cacheSize: cacheInfo,
      moviesLoaded: preloadedMovies.length,
      fullDatabaseLoaded: fullDatabaseLoaded,
      cacheAge: cachedData ? Date.now() - cachedData.timestamp : null,
      cacheValid: cachedData ? persistentCache.isCacheValid(cachedData) : false
    };
  }
};

export default simpleSearchApi;
