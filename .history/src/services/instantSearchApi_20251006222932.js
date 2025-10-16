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
          fetch(`${BASE_URL}/items?page=${page}`)
            .then(response => response.json())
            .catch(error => {
              console.warn(`Failed to load page ${page}:`, error);
              return null;
            })
        );
      }
      
      const preloadResults = await Promise.all(preloadPromises);
      const validResults = preloadResults.filter(result => result && result.items && result.items.length > 0);
      
      if (validResults.length > 0) {
        let quickMovies = [];
        for (const result of validResults) {
          if (result.items) {
            quickMovies = quickMovies.concat(result.items);
          }
        }
        
        // Deduplicate
        const uniqueMovies = [];
        const seenSlugs = new Set();
        for (const movie of quickMovies) {
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
        
        console.log(`Quick preload: ${preloadedMovies.length} movies`);
      }
      
      return {
        movies: preloadedMovies.length,
        categories: preloadedCategories.length,
        countries: preloadedCountries.length,
        years: preloadedYears.length,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Error initializing instant search:', error);
      return { movies: 0, categories: 0, countries: 0, years: 0, error: error.message };
    }
  },

  // Tìm kiếm tức thì (từ dữ liệu đã load)
  instantSearch: async (keyword = '', options = {}) => {
    try {
      const startTime = Date.now();
      
      if (!keyword.trim()) {
        // Không có keyword, trả về danh sách phim theo filter
        return await instantSearchApi.getAllMovies(options);
      }
      
      const cacheKey = `instant_${keyword}_${JSON.stringify(options)}`;
      const cached = instantCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < INSTANT_CACHE_DURATION) {
        console.log('Using cached instant search result');
        return cached.data;
      }
      
      let searchResults = [];
      
      if (preloadedMovies.length > 0) {
        console.log(`Instant search in ${preloadedMovies.length} preloaded movies`);
        
        // Tìm kiếm thông minh
        searchResults = instantSearchApi.smartSearch(preloadedMovies, keyword, options);
        
        console.log(`Instant search found ${searchResults.length} results in ${Date.now() - startTime}ms`);
      } else {
        console.log('No preloaded movies, using API fallback');
        return await instantSearchApi.extendedSearch(keyword, options);
      }
      
      const result = {
        items: searchResults.slice(0, options.limit || 20),
        totalItems: searchResults.length,
        totalPages: Math.ceil(searchResults.length / (options.limit || 20)),
        currentPage: options.page || 1,
        instant: true,
        searchTime: Date.now() - startTime
      };
      
      // Cache kết quả
      instantCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Instant search error:', error);
      return { items: [], totalItems: 0, totalPages: 1, currentPage: 1, error: error.message };
    }
  },

  // Tìm kiếm mở rộng (API + cache)
  extendedSearch: async (keyword = '', options = {}) => {
    try {
      const startTime = Date.now();
      const cacheKey = `extended_${keyword}_${JSON.stringify(options)}`;
      const cached = instantCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < FULL_CACHE_DURATION) {
        console.log('Using cached extended search result');
        return cached.data;
      }
      
      console.log(`Extended search: "${keyword}"`);
      
      let allMovies = [];
      const { page = 1, limit = 20, category = '', country = '', year = '', type = '' } = options;
      
      // Search multiple pages
      const searchPages = 20; // Search in 20 pages (400 movies)
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const response = await fetch(`${BASE_URL}/items?page=${currentPage}`);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            // Filter movies by keyword and other criteria
            const filteredMovies = data.items.filter(movie => {
              // Keyword search
              const matchesKeyword = !keyword.trim() || instantSearchApi.matchKeyword(movie, keyword);
              
              // Other filters
              const matchesCategory = !category || instantSearchApi.matchCategory(movie, category);
              const matchesCountry = !country || instantSearchApi.matchCountry(movie, country);
              const matchesYear = !year || instantSearchApi.matchYear(movie, year);
              const matchesType = !type || instantSearchApi.matchType(movie, type);
              
              return matchesKeyword && matchesCategory && matchesCountry && matchesYear && matchesType;
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching page ${currentPage}:`, pageError);
        }
      }
      
      // Deduplicate
      const uniqueMovies = [];
      const seenSlugs = new Set();
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      // Sort by relevance
      const sortedMovies = instantSearchApi.sortByRelevance(uniqueMovies, keyword);
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = sortedMovies.slice(startIndex, endIndex);
      
      const result = {
        items: paginatedMovies,
        totalItems: sortedMovies.length,
        totalPages: Math.ceil(sortedMovies.length / limit),
        currentPage: page,
        extended: true,
        searchTime: Date.now() - startTime
      };
      
      // Cache result
      instantCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      console.log(`Extended search found ${sortedMovies.length} results in ${Date.now() - startTime}ms`);
      return result;
      
    } catch (error) {
      console.error('Extended search error:', error);
      return { items: [], totalItems: 0, totalPages: 1, currentPage: 1, error: error.message };
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
      
      console.log(`Full database ready: ${preloadedMovies.length} movies, ${preloadedCategories.length} categories, ${preloadedCountries.length} countries`);
      
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

  // Lấy tất cả phim (tức thì nếu đã load)
  getAllMovies: async (options = {}) => {
    const {
      limit = 50,
      page = 1,
      category = '',
      country = '',
      year = '',
      type = ''
    } = options;

    if (fullDatabaseLoaded) {
      // Tức thì từ dữ liệu đã load
      let filteredMovies = preloadedMovies;

      // Apply filters
      if (category || country || year || type) {
        filteredMovies = preloadedMovies.filter(movie => {
          return instantSearchApi.matchFilters(movie, { category, country, year, type });
        });
      }

      // Sort by default
      filteredMovies = instantSearchApi.sortByDefault(filteredMovies);

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

      return {
        items: paginatedMovies,
        totalItems: filteredMovies.length,
        totalPages: Math.ceil(filteredMovies.length / limit),
        currentPage: page,
        instant: true,
        fullDatabase: true
      };
    } else {
      // Fallback to API
      console.log('Full database not loaded, using API fallback');
      return await instantSearchApi.extendedSearch('', options);
    }
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

  // Kiểm tra trạng thái load
  getLoadingStatus: () => {
    return {
      isLoaded: fullDatabaseLoaded,
      progress: loadingProgress,
      totalMovies: preloadedMovies.length
    };
  },

  // Load full database với progress callback
  loadFullDatabaseWithProgress: async (onProgress) => {
    return await instantSearchApi.loadFullDatabase(onProgress);
  },

  // Smart search algorithm
  smartSearch: (movies, keyword, options = {}) => {
    const searchTerm = keyword.toLowerCase();
    
    // Scoring system
    const scoreMovie = (movie) => {
      let score = 0;
      
      // Exact name match (highest priority)
      if (movie.name && movie.name.toLowerCase().includes(searchTerm)) {
        score += 100;
      }
      
      // Origin name match
      if (movie.origin_name && movie.origin_name.toLowerCase().includes(searchTerm)) {
        score += 80;
      }
      
      // Slug match
      if (movie.slug && movie.slug.toLowerCase().includes(searchTerm)) {
        score += 60;
      }
      
      // Category match
      if (movie.category) {
        const categoryNames = movie.category.map(cat => (cat.name || cat).toLowerCase()).join(' ');
        if (categoryNames.includes(searchTerm)) {
          score += 40;
        }
      }
      
      // Country match
      if (movie.country) {
        const countryNames = movie.country.map(country => (country.name || country).toLowerCase()).join(' ');
        if (countryNames.includes(searchTerm)) {
          score += 30;
        }
      }
      
      // Content match
      if (movie.content && movie.content.toLowerCase().includes(searchTerm)) {
        score += 20;
      }
      
      // Actor/Director match
      if (movie.actor) {
        const actors = movie.actor.map(actor => actor.toLowerCase()).join(' ');
        if (actors.includes(searchTerm)) {
          score += 15;
        }
      }
      
      if (movie.director) {
        const directors = movie.director.map(director => director.toLowerCase()).join(' ');
        if (directors.includes(searchTerm)) {
          score += 15;
        }
      }
      
      return score;
    };
    
    // Filter and score movies
    let filteredMovies = movies.filter(movie => {
      // Apply other filters first
      if (options.category && !instantSearchApi.matchCategory(movie, options.category)) return false;
      if (options.country && !instantSearchApi.matchCountry(movie, options.country)) return false;
      if (options.year && !instantSearchApi.matchYear(movie, options.year)) return false;
      if (options.type && !instantSearchApi.matchType(movie, options.type)) return false;
      
      return true;
    });
    
    // Score and sort
    const scoredMovies = filteredMovies.map(movie => ({
      ...movie,
      relevanceScore: scoreMovie(movie)
    }));
    
    // Sort by relevance score (highest first)
    scoredMovies.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Return only movies with positive scores
    return scoredMovies.filter(movie => movie.relevanceScore > 0);
  },

  // Helper functions for matching
  matchKeyword: (movie, keyword) => {
    const searchTerm = keyword.toLowerCase();
    const name = (movie.name || '').toLowerCase();
    const originName = (movie.origin_name || '').toLowerCase();
    const slug = (movie.slug || '').toLowerCase();
    
    return name.includes(searchTerm) || 
           originName.includes(searchTerm) || 
           slug.includes(searchTerm);
  },

  matchCategory: (movie, category) => {
    if (!movie.category || !category) return true;
    return movie.category.some(cat => 
      (cat.name || cat).toLowerCase().includes(category.toLowerCase())
    );
  },

  matchCountry: (movie, country) => {
    if (!movie.country || !country) return true;
    return movie.country.some(c => 
      (c.name || c).toLowerCase().includes(country.toLowerCase())
    );
  },

  matchYear: (movie, year) => {
    if (!year) return true;
    return movie.year == year;
  },

  matchType: (movie, type) => {
    if (!type) return true;
    return movie.type === type;
  },

  matchFilters: (movie, filters) => {
    return instantSearchApi.matchCategory(movie, filters.category) &&
           instantSearchApi.matchCountry(movie, filters.country) &&
           instantSearchApi.matchYear(movie, filters.year) &&
           instantSearchApi.matchType(movie, filters.type);
  },

  // Sorting functions
  sortByRelevance: (movies, keyword) => {
    const searchTerm = keyword.toLowerCase();
    
    return movies.sort((a, b) => {
      // Prioritize exact matches
      const aExact = (a.name || '').toLowerCase().includes(searchTerm);
      const bExact = (b.name || '').toLowerCase().includes(searchTerm);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by year (newer first)
      return (b.year || 0) - (a.year || 0);
    });
  },

  sortByDefault: (movies) => {
    return movies.sort((a, b) => {
      // Sort by year (newer first), then by name
      if (b.year !== a.year) {
        return (b.year || 0) - (a.year || 0);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  },

  // Clear cache
  clearCache: () => {
    instantCache.clear();
    console.log('Instant search cache cleared');
  },

  // Refresh dữ liệu
  refresh: async () => {
    instantSearchApi.clearCache();
    return await instantSearchApi.initialize();
  },

  // Lấy thông tin cache
  getCacheInfo: async () => {
    return await persistentCache.getCacheInfo();
  },

  // Xóa toàn bộ cache
  clearPersistentCache: async () => {
    try {
      await persistentCache.clearAllCache();
      fullDatabaseLoaded = false;
      preloadedMovies = [];
      preloadedCategories = [];
      preloadedCountries = [];
      preloadedYears = [];
      instantSearchApi.clearCache();
      console.log('All cache cleared');
      return true;
    } catch (error) {
      console.error('Error clearing persistent cache:', error);
      return false;
    }
  },

  // Kiểm tra cache status
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
  },

  // Load từ cache với progress callback
  loadFromCache: async (onProgress = null) => {
    try {
      const cacheKey = 'full_database';
      const cachedData = await persistentCache.loadDatabase(cacheKey);
      
      if (cachedData && cachedData.movies && cachedData.movies.length > 0) {
        if (onProgress) {
          onProgress({ current: 100, total: 100, percentage: 100 });
        }
        
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
          fromCache: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }
};

export default instantSearchApi;
