// Instant Search API - Tìm kiếm tức thì với đầy đủ kết quả và Persistent Cache
import persistentCache from './persistentCache';
import { simpleMovieApi } from './simpleMovieApi';

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

// Helper function to apply filters to movie results
const applyFiltersToResults = (results, keyword, options, searchType = '') => {
  let filteredResults = [...results];
  
  // Apply keyword search first
  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase().trim();
    filteredResults = filteredResults.filter(movie => {
      const name = (movie.name || '').toLowerCase();
      const originName = (movie.origin_name || '').toLowerCase();
      const slug = (movie.slug || '').toLowerCase();
      const content = (movie.content || '');
      const actor = (movie.actor || '').toLowerCase();
      const director = (movie.director || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             originName.includes(searchTerm) || 
             slug.includes(searchTerm) ||
             content.toLowerCase().includes(searchTerm) ||
             actor.includes(searchTerm) ||
             director.includes(searchTerm);
    });
    console.log(`${searchType} - After keyword filter "${keyword}": ${filteredResults.length} movies`);
  }
  
  // Apply category filter
  if (options.category && options.category.trim()) {
    const categoryTerm = options.category.toLowerCase().trim();
    filteredResults = filteredResults.filter(movie => 
      movie.category?.some(cat => {
        const catName = (cat.name || cat || '').toLowerCase();
        return catName.includes(categoryTerm);
      })
    );
    console.log(`${searchType} - After category filter "${options.category}": ${filteredResults.length} movies`);
  }
  
  // Apply country filter
  if (options.country && options.country.trim()) {
    const countryTerm = options.country.toLowerCase().trim();
    filteredResults = filteredResults.filter(movie => 
      movie.country?.some(country => {
        const countryName = (country.name || country || '').toLowerCase();
        return countryName.includes(countryTerm);
      })
    );
    console.log(`${searchType} - After country filter "${options.country}": ${filteredResults.length} movies`);
  }
  
  // Apply year filter
  if (options.year && options.year.toString().trim()) {
    const yearValue = parseInt(options.year);
    if (!isNaN(yearValue)) {
      filteredResults = filteredResults.filter(movie => {
        const movieYear = parseInt(movie.year);
        return !isNaN(movieYear) && movieYear === yearValue;
      });
      console.log(`${searchType} - After year filter "${options.year}": ${filteredResults.length} movies`);
    }
  }
  
  // Apply type filter
  if (options.type && options.type.trim()) {
    filteredResults = filteredResults.filter(movie => {
      const episodeTotal = parseInt(movie.episode_total || 0);
      const episodeCurrent = parseInt(movie.episode_current || 0);
      const movieName = (movie.name || '').toLowerCase();
      
      // Check for series indicators in name
      const hasSeriesKeywords = movieName.includes('tập') || 
                               movieName.includes('season') || 
                               movieName.includes('phần') ||
                               movieName.includes('hoàn tất');
      
      if (options.type === 'Phim Bộ') {
        return episodeTotal > 1 || episodeCurrent > 1 || hasSeriesKeywords;
      } else if (options.type === 'Phim Lẻ') {
        return episodeTotal <= 1 && episodeCurrent <= 1 && !hasSeriesKeywords;
      } else if (options.type === 'TV Shows') {
        return movieName.includes('show') || movieName.includes('series') || episodeTotal > 1;
      } else if (options.type === 'Hoạt Hình') {
        const categories = (movie.category || []).map(cat => (cat.name || cat || '').toLowerCase());
        return categories.some(cat => 
          cat.includes('hoạt hình') || 
          cat.includes('animation') || 
          cat.includes('anime') ||
          cat.includes('cartoon')
        );
      }
      return true;
    });
    console.log(`${searchType} - After type filter "${options.type}": ${filteredResults.length} movies`);
  }
  
  return filteredResults;
};

export const instantSearchApi = {
  // Khởi tạo dữ liệu sẵn có
  initialize: async (loadFullDatabase = true) => {
    try {
      console.log('Initializing instant search data...');
      
      // Kiểm tra cache trước
      const cacheKey = 'full_database';
      const cachedData = await persistentCache.loadDatabase(cacheKey);
      
      if (cachedData && cachedData.data && cachedData.data.length > 0) {
        console.log(`Found cached database: ${cachedData.data.length} movies`);
        
        // Load từ cache
        preloadedMovies = cachedData.data;
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
          cacheAge: Date.now() - cachedData.metadata.timestamp
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
          simpleMovieApi.getNewMovies(page)
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
            simpleMovieApi.getNewMovies(currentPage)
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
      
      // Apply all filters using helper function
      results = applyFiltersToResults(results, keyword, options, 'Instant search');
      
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
          simpleMovieApi.getNewMovies(page)
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
      
      // Apply search and filters using helper function
      let results = uniqueMovies;
      results = applyFiltersToResults(results, keyword, options, 'Extended search');
      
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
      
      // Apply category filter
      if (options.category && options.category.trim()) {
        const categoryTerm = options.category.toLowerCase().trim();
        results = results.filter(movie => 
          movie.category?.some(cat => {
            const catName = (cat.name || cat || '').toLowerCase();
            return catName.includes(categoryTerm);
          })
        );
        console.log(`Full database - After category filter "${options.category}": ${results.length} movies`);
      }
      
      // Apply country filter
      if (options.country && options.country.trim()) {
        const countryTerm = options.country.toLowerCase().trim();
        results = results.filter(movie => 
          movie.country?.some(country => {
            const countryName = (country.name || country || '').toLowerCase();
            return countryName.includes(countryTerm);
          })
        );
        console.log(`Full database - After country filter "${options.country}": ${results.length} movies`);
      }
      
      // Apply year filter
      if (options.year && options.year.toString().trim()) {
        const yearValue = parseInt(options.year);
        if (!isNaN(yearValue)) {
          results = results.filter(movie => {
            const movieYear = parseInt(movie.year);
            return !isNaN(movieYear) && movieYear === yearValue;
          });
          console.log(`Full database - After year filter "${options.year}": ${results.length} movies`);
        }
      }
      
      // Apply type filter
      if (options.type && options.type.trim()) {
        results = results.filter(movie => {
          const episodeTotal = parseInt(movie.episode_total || 0);
          const episodeCurrent = parseInt(movie.episode_current || 0);
          const movieName = (movie.name || '').toLowerCase();
          
          // Check for series indicators in name
          const hasSeriesKeywords = movieName.includes('tập') || 
                                   movieName.includes('season') || 
                                   movieName.includes('phần') ||
                                   movieName.includes('hoàn tất');
          
          if (options.type === 'Phim Bộ') {
            return episodeTotal > 1 || episodeCurrent > 1 || hasSeriesKeywords;
          } else if (options.type === 'Phim Lẻ') {
            return episodeTotal <= 1 && episodeCurrent <= 1 && !hasSeriesKeywords;
          } else if (options.type === 'TV Shows') {
            return movieName.includes('show') || movieName.includes('series') || episodeTotal > 1;
          } else if (options.type === 'Hoạt Hình') {
            const categories = (movie.category || []).map(cat => (cat.name || cat || '').toLowerCase());
            return categories.some(cat => 
              cat.includes('hoạt hình') || 
              cat.includes('animation') || 
              cat.includes('anime') ||
              cat.includes('cartoon')
            );
          }
          return true;
        });
        console.log(`Full database - After type filter "${options.type}": ${results.length} movies`);
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
      
      if (cachedData && cachedData.data && cachedData.data.length > 0) {
        return {
          hasCache: true,
          cacheAge: Date.now() - cachedData.metadata.timestamp,
          fromCache: true,
          movieCount: cachedData.data.length
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
