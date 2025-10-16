// Instant Search API - Tìm kiếm tức thì với đầy đủ kết quả và Persistent Cache
import persistentCache from './persistentCache';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Cache system for instant search
const instantCache = new Map();
const INSTANT_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache
const FULL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

// Cache helper functions
const getCacheKey = (type, params) => {
  return `${type}_${JSON.stringify(params)}`;
};

const getFromCache = (cacheKey, duration = INSTANT_CACHE_DURATION) => {
  const cached = instantCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < duration) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cached.data;
  }
  return null;
};

const setToCache = (cacheKey, data, duration = INSTANT_CACHE_DURATION) => {
  instantCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    duration
  });
  console.log(`Cached: ${cacheKey}`);
};

// Preload full database for instant access
let preloadedMovies = [];
let preloadedCategories = [];
let preloadedCountries = [];
let preloadedYears = [];
let fullDatabaseLoaded = false;
let loadingProgress = { current: 0, total: 0, percentage: 0 };

export const instantSearchApi = {
  // Khởi tạo dữ liệu sẵn có
  initialize: async (loadFullDatabase = true) => {
    try {
      console.log('Initializing instant search data...');
      
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
      if (loadFullDatabase && !fullDatabaseLoaded) {
        console.log('No cache found, auto-loading full database...');
        return await instantSearchApi.loadFullDatabase();
      }
      
      // Quick preload 10 trang đầu tiên (200 phim)
      const preloadPromises = [];
      for (let page = 1; page <= 10; page++) {
        preloadPromises.push(
          fetch(`${BASE_URL}/new?page=${page}`)
            .then(res => res.json())
            .then(data => {
              let movieData = [];
              if (data.items && Array.isArray(data.items)) {
                movieData = data.items;
              } else if (data.data && Array.isArray(data.data)) {
                movieData = data.data;
              } else if (Array.isArray(data)) {
                movieData = data;
              }
              return movieData;
            })
            .catch(error => {
              console.error(`Error loading page ${page}:`, error);
              return [];
            })
        );
      }
      
      const results = await Promise.all(preloadPromises);
      preloadedMovies = results.flat();
      
      // Update categories and countries
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
      
      console.log(`Preloaded ${preloadedMovies.length} movies, ${preloadedCategories.length} categories, ${preloadedCountries.length} countries`);
      
      return {
        movies: preloadedMovies.length,
        categories: preloadedCategories.length,
        countries: preloadedCountries.length,
        years: preloadedYears.length,
        fromCache: false
      };
    } catch (error) {
      console.error('Error initializing instant search:', error);
      return { movies: 0, categories: 0, countries: 0, years: 0 };
    }
  },

  // Tải toàn bộ database
  loadFullDatabase: async (onProgress = null) => {
    try {
      console.log('Starting full database load...');
      
      // Estimate total pages (usually around 1000-2000 pages for 20k+ movies)
      const estimatedPages = 1000;
      loadingProgress = { current: 0, total: estimatedPages, percentage: 0 };
      
      let allMovies = [];
      const batchSize = 10; // Load 10 pages at a time
      let currentPage = 1;
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 5;
      
      while (currentPage <= estimatedPages && consecutiveErrors < maxConsecutiveErrors) {
        const batchPromises = [];
        
        // Load batch of pages
        for (let i = 0; i < batchSize && currentPage <= estimatedPages; i++) {
          batchPromises.push(
            fetch(`${BASE_URL}/new?page=${currentPage}`)
              .then(res => res.json())
              .then(data => {
                let movieData = [];
                if (data.items && Array.isArray(data.items)) {
                  movieData = data.items;
                } else if (data.data && Array.isArray(data.data)) {
                  movieData = data.data;
                } else if (Array.isArray(data)) {
                  movieData = data;
                }
                return { page: currentPage, movies: movieData };
              })
              .catch(error => {
                console.error(`Error loading page ${currentPage}:`, error);
                return { page: currentPage, movies: [] };
              })
          );
          currentPage++;
        }
        
        const batchResults = await Promise.all(batchPromises);
        
        // Process batch results
        let batchMovies = [];
        let hasValidData = false;
        
        for (const result of batchResults) {
          if (result.movies && result.movies.length > 0) {
            batchMovies = [...batchMovies, ...result.movies];
            hasValidData = true;
            consecutiveErrors = 0;
          } else {
            consecutiveErrors++;
          }
        }
        
        allMovies = [...allMovies, ...batchMovies];
        
        // Update progress
        loadingProgress.current = Math.min(currentPage - 1, estimatedPages);
        loadingProgress.percentage = Math.min((loadingProgress.current / estimatedPages) * 100, 100);
        
        if (onProgress) {
          onProgress(loadingProgress);
        }
        
        // If no valid data in this batch, we might have reached the end
        if (!hasValidData) {
          console.log(`No valid data found in batch, stopping at page ${currentPage - batchSize}`);
          break;
        }
        
        console.log(`Loaded batch: ${batchMovies.length} movies, total: ${allMovies.length}, progress: ${loadingProgress.percentage.toFixed(1)}%`);
      }
      
      // Deduplicate movies by slug
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      preloadedMovies = uniqueMovies;
      
      // Update categories, countries, years
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
        fullDatabase: true,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Error loading full database:', error);
      fullDatabaseLoaded = false;
      return { movies: 0, categories: 0, countries: 0, years: 0, error: error.message };
    }
  },

  // Load full database with progress callback
  loadFullDatabaseWithProgress: async (onProgress) => {
    return await instantSearchApi.loadFullDatabase(onProgress);
  },

  // Instant search in preloaded data
  instantSearch: async (keyword = '', options = {}) => {
    try {
      const cacheKey = getCacheKey('instant', { keyword, ...options });
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      console.log(`Instant search for: "${keyword}" in ${preloadedMovies.length} movies`);
      
      let results = preloadedMovies;
      
      // Apply filters
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        results = results.filter(movie => {
          const name = (movie.name || '').toLowerCase();
          const originName = (movie.origin_name || '').toLowerCase();
          const slug = (movie.slug || '').toLowerCase();
          const content = (movie.content || '').toLowerCase();
          
          return name.includes(searchTerm) || 
                 originName.includes(searchTerm) || 
                 slug.includes(searchTerm) ||
                 content.includes(searchTerm);
        });
      }
      
      // Apply other filters
      if (options.category) {
        results = results.filter(movie => 
          movie.category?.some(cat => 
            (cat.name || cat).toLowerCase().includes(options.category.toLowerCase())
          )
        );
      }
      
      if (options.country) {
        results = results.filter(movie => 
          movie.country?.some(country => 
            (country.name || country).toLowerCase().includes(options.country.toLowerCase())
          )
        );
      }
      
      if (options.year) {
        results = results.filter(movie => movie.year == options.year);
      }
      
      if (options.type) {
        results = results.filter(movie => {
          const episodeTotal = parseInt(movie.episode_total || 0);
          const episodeCurrent = parseInt(movie.episode_current || 0);
          
          if (options.type === 'Phim Bộ') {
            return episodeTotal > 1 || episodeCurrent > 1;
          } else if (options.type === 'Phim Lẻ') {
            return episodeTotal <= 1 && episodeCurrent <= 1;
          }
          return true;
        });
      }
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      const response = {
        items: paginatedResults,
        totalItems: results.length,
        totalPages: Math.ceil(results.length / limit),
        currentPage: page,
        instant: true,
        searchStats: {
          totalMovies: preloadedMovies.length,
          filteredResults: results.length
        }
      };
      
      setToCache(cacheKey, response);
      return response;
      
    } catch (error) {
      console.error('Instant search error:', error);
      return { items: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }
  },

  // Extended search (more pages from API)
  extendedSearch: async (keyword = '', options = {}) => {
    try {
      const cacheKey = getCacheKey('extended', { keyword, ...options });
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      console.log(`Extended search for: "${keyword}"`);
      
      // Load more data from API if needed
      const additionalPages = 20; // Load 20 more pages
      const additionalPromises = [];
      
      for (let page = 11; page <= 11 + additionalPages; page++) {
        additionalPromises.push(
          fetch(`${BASE_URL}/new?page=${page}`)
            .then(res => res.json())
            .then(data => {
              let movieData = [];
              if (data.items && Array.isArray(data.items)) {
                movieData = data.items;
              } else if (data.data && Array.isArray(data.data)) {
                movieData = data.data;
              } else if (Array.isArray(data)) {
                movieData = data;
              }
              return movieData;
            })
            .catch(error => {
              console.error(`Error loading page ${page}:`, error);
              return [];
            })
        );
      }
      
      const additionalResults = await Promise.all(additionalPromises);
      const additionalMovies = additionalResults.flat();
      
      // Combine with preloaded data
      const allMovies = [...preloadedMovies, ...additionalMovies];
      
      // Deduplicate
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      // Apply search and filters (same logic as instant search)
      let results = uniqueMovies;
      
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        results = results.filter(movie => {
          const name = (movie.name || '').toLowerCase();
          const originName = (movie.origin_name || '').toLowerCase();
          const slug = (movie.slug || '').toLowerCase();
          const content = (movie.content || '').toLowerCase();
          
          return name.includes(searchTerm) || 
                 originName.includes(searchTerm) || 
                 slug.includes(searchTerm) ||
                 content.includes(searchTerm);
        });
      }
      
      // Apply other filters (same as instant search)
      if (options.category) {
        results = results.filter(movie => 
          movie.category?.some(cat => 
            (cat.name || cat).toLowerCase().includes(options.category.toLowerCase())
          )
        );
      }
      
      if (options.country) {
        results = results.filter(movie => 
          movie.country?.some(country => 
            (country.name || country).toLowerCase().includes(options.country.toLowerCase())
          )
        );
      }
      
      if (options.year) {
        results = results.filter(movie => movie.year == options.year);
      }
      
      if (options.type) {
        results = results.filter(movie => {
          const episodeTotal = parseInt(movie.episode_total || 0);
          const episodeCurrent = parseInt(movie.episode_current || 0);
          
          if (options.type === 'Phim Bộ') {
            return episodeTotal > 1 || episodeCurrent > 1;
          } else if (options.type === 'Phim Lẻ') {
            return episodeTotal <= 1 && episodeCurrent <= 1;
          }
          return true;
        });
      }
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      const response = {
        items: paginatedResults,
        totalItems: results.length,
        totalPages: Math.ceil(results.length / limit),
        currentPage: page,
        extended: true,
        searchStats: {
          totalMovies: uniqueMovies.length,
          filteredResults: results.length
        }
      };
      
      setToCache(cacheKey, response);
      return response;
      
    } catch (error) {
      console.error('Extended search error:', error);
      return { items: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }
  },

  // Get all movies (full database search)
  getAllMovies: async (options = {}) => {
    try {
      const cacheKey = getCacheKey('all', options);
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Full database search');
      
      // Use preloaded movies if available
      let results = preloadedMovies;
      
      // Apply filters
      if (options.category) {
        results = results.filter(movie => 
          movie.category?.some(cat => 
            (cat.name || cat).toLowerCase().includes(options.category.toLowerCase())
          )
        );
      }
      
      if (options.country) {
        results = results.filter(movie => 
          movie.country?.some(country => 
            (country.name || country).toLowerCase().includes(options.country.toLowerCase())
          )
        );
      }
      
      if (options.year) {
        results = results.filter(movie => movie.year == options.year);
      }
      
      if (options.type) {
        results = results.filter(movie => {
          const episodeTotal = parseInt(movie.episode_total || 0);
          const episodeCurrent = parseInt(movie.episode_current || 0);
          
          if (options.type === 'Phim Bộ') {
            return episodeTotal > 1 || episodeCurrent > 1;
          } else if (options.type === 'Phim Lẻ') {
            return episodeTotal <= 1 && episodeCurrent <= 1;
          }
          return true;
        });
      }
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      const response = {
        items: paginatedResults,
        totalItems: results.length,
        totalPages: Math.ceil(results.length / limit),
        currentPage: page,
        fullDatabase: true,
        searchStats: {
          totalMovies: preloadedMovies.length,
          filteredResults: results.length
        }
      };
      
      setToCache(cacheKey, response);
      return response;
      
    } catch (error) {
      console.error('Full database search error:', error);
      return { items: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }
  },

  // Get search statistics
  getStats: () => {
    return {
      movies: preloadedMovies.length,
      categories: preloadedCategories.length,
      countries: preloadedCountries.length,
      years: preloadedYears.length,
      fullDatabaseLoaded,
      cacheSize: instantCache.size
    };
  },

  // Clear cache
  clearCache: () => {
    instantCache.clear();
    console.log('Instant cache cleared');
  },

  // Refresh data
  refresh: async () => {
    instantCache.clear();
    preloadedMovies = [];
    preloadedCategories = [];
    preloadedCountries = [];
    preloadedYears = [];
    fullDatabaseLoaded = false;
    
    return await instantSearchApi.initialize(true);
  },

  // Get cache info
  getCacheInfo: () => {
    return {
      instantCacheSize: instantCache.size,
      preloadedMovies: preloadedMovies.length,
      fullDatabaseLoaded,
      categories: preloadedCategories.length,
      countries: preloadedCountries.length,
      years: preloadedYears.length
    };
  },

  // Clear persistent cache
  clearPersistentCache: async () => {
    try {
      await persistentCache.clearAllCache();
      console.log('Persistent cache cleared');
      return true;
    } catch (error) {
      console.error('Error clearing persistent cache:', error);
      return false;
    }
  },

  // Get cache status
  getCacheStatus: async () => {
    try {
      const cacheKey = 'full_database';
      const cachedData = await persistentCache.loadDatabase(cacheKey);
      
      if (cachedData && cachedData.movies && cachedData.movies.length > 0) {
        return {
          hasCache: true,
          cacheAge: Date.now() - cachedData.timestamp,
          fromCache: true,
          movieCount: cachedData.movies.length
        };
      }
      
      return {
        hasCache: false,
        cacheAge: null,
        fromCache: false,
        movieCount: preloadedMovies.length
      };
    } catch (error) {
      console.error('Error getting cache status:', error);
      return {
        hasCache: false,
        cacheAge: null,
        fromCache: false,
        movieCount: preloadedMovies.length
      };
    }
  },

  // Load from cache
  loadFromCache: async (cacheKey) => {
    try {
      return await persistentCache.loadDatabase(cacheKey);
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }
};

export default instantSearchApi;
