// Instant Search API - Tìm kiếm tức thì với đầy đủ kết quả
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
      
      if (loadFullDatabase && !fullDatabaseLoaded) {
        console.log('Loading full database for instant access...');
        return await instantSearchApi.loadFullDatabase();
      }
      
      // Quick preload 10 trang đầu tiên (200 phim)
      const preloadPromises = [];
      for (let page = 1; page <= 10; page++) {
        preloadPromises.push(
          fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?page=${page}`)
            .then(res => res.json())
            .then(data => data.items || [])
            .catch(err => {
              console.error(`Error preloading page ${page}:`, err);
              return [];
            })
        );
      }
      
      const allPages = await Promise.all(preloadPromises);
      preloadedMovies = allPages.flat();
      
      // Loại bỏ trùng lặp
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of preloadedMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      preloadedMovies = uniqueMovies;
      
      // Preload categories và countries từ dữ liệu có sẵn
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
      
      console.log(`Initialized with ${preloadedMovies.length} movies, ${preloadedCategories.length} categories, ${preloadedCountries.length} countries`);
      
      return {
        movies: preloadedMovies.length,
        categories: preloadedCategories.length,
        countries: preloadedCountries.length,
        years: preloadedYears.length
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
        try {
          // Create batch of pages to load
          const batchPages = [];
          for (let i = 0; i < batchSize && currentPage <= estimatedPages; i++) {
            batchPages.push(currentPage++);
          }
          
          console.log(`Loading batch: pages ${batchPages.join(', ')}...`);
          
          // Load batch in parallel
          const batchPromises = batchPages.map(page => 
            fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?page=${page}`)
              .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
              })
              .then(data => data.items || [])
              .catch(err => {
                console.error(`Error loading page ${page}:`, err);
                return [];
              })
          );
          
          const batchResults = await Promise.all(batchPromises);
          
          // Check if we got empty results (end of database)
          const totalMoviesInBatch = batchResults.reduce((sum, movies) => sum + movies.length, 0);
          if (totalMoviesInBatch === 0) {
            console.log('Reached end of database');
            break;
          }
          
          // Add movies to collection
          for (const movies of batchResults) {
            allMovies = [...allMovies, ...movies];
          }
          
          // Update progress
          loadingProgress.current = currentPage - 1;
          loadingProgress.percentage = Math.min((loadingProgress.current / loadingProgress.total) * 100, 100);
          
          if (onProgress) {
            onProgress(loadingProgress);
          }
          
          console.log(`Loaded ${allMovies.length} movies so far (${loadingProgress.percentage.toFixed(1)}%)`);
          
          consecutiveErrors = 0; // Reset error counter
          
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (batchError) {
          console.error('Batch loading error:', batchError);
          consecutiveErrors++;
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.log('Too many consecutive errors, stopping load');
            break;
          }
          
          // Wait longer on error
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`Full database load completed: ${allMovies.length} movies`);
      
      // Remove duplicates
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
      loadingProgress.percentage = 100;
      
      console.log(`Full database ready: ${preloadedMovies.length} movies, ${preloadedCategories.length} categories, ${preloadedCountries.length} countries`);
      
      return {
        movies: preloadedMovies.length,
        categories: preloadedCategories.length,
        countries: preloadedCountries.length,
        years: preloadedYears.length,
        fullDatabase: true
      };
      
    } catch (error) {
      console.error('Error loading full database:', error);
      fullDatabaseLoaded = false;
      return { movies: 0, categories: 0, countries: 0, years: 0, error: error.message };
    }
  },

  // Tìm kiếm tức thì từ dữ liệu đã preload
  instantSearch: async (keyword, options = {}) => {
    try {
      const {
        category = '',
        country = '',
        year = '',
        type = '',
        limit = 20,
        page = 1
      } = options;

      const cacheKey = getCacheKey('search', { keyword, category, country, year, type });
      const cachedResult = getFromCache(cacheKey);
      
      if (cachedResult) {
        // Trả về kết quả từ cache với phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = cachedResult.slice(startIndex, endIndex);
        
        return {
          items: paginatedMovies,
          totalItems: cachedResult.length,
          totalPages: Math.ceil(cachedResult.length / limit),
          currentPage: page,
          keyword: keyword,
          instant: true,
          fromCache: true
        };
      }

      console.log(`Instant search for: "${keyword}"`);
      
      let results = [];
      
      if (keyword.trim()) {
        // Tìm kiếm với từ khóa
        results = preloadedMovies.filter(movie => {
          return instantSearchApi.matchMovie(keyword, movie, { category, country, year, type });
        });
      } else {
        // Không có từ khóa, lọc theo filters
        results = preloadedMovies.filter(movie => {
          return instantSearchApi.matchFilters(movie, { category, country, year, type });
        });
      }
      
      // Sắp xếp kết quả theo độ liên quan
      if (keyword.trim()) {
        results = instantSearchApi.sortByRelevance(results, keyword);
      } else {
        results = instantSearchApi.sortByDefault(results);
      }
      
      console.log(`Found ${results.length} instant results`);
      
      // Lưu vào cache
      setToCache(cacheKey, results);
      
      // Phân trang
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = results.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: results.length,
        totalPages: Math.ceil(results.length / limit),
        currentPage: page,
        keyword: keyword,
        instant: true,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Instant search error:', error);
      return {
        items: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        keyword: keyword,
        instant: true,
        error: error.message
      };
    }
  },

  // Tìm kiếm mở rộng (khi cần thêm kết quả)
  extendedSearch: async (keyword, options = {}) => {
    try {
      const {
        category = '',
        country = '',
        year = '',
        type = '',
        limit = 20,
        page = 1
      } = options;

      const cacheKey = getCacheKey('extended', { keyword, category, country, year, type });
      const cachedResult = getFromCache(cacheKey, FULL_CACHE_DURATION);
      
      if (cachedResult) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = cachedResult.slice(startIndex, endIndex);
        
        return {
          items: paginatedMovies,
          totalItems: cachedResult.length,
          totalPages: Math.ceil(cachedResult.length / limit),
          currentPage: page,
          keyword: keyword,
          extended: true,
          fromCache: true
        };
      }

      console.log(`Extended search for: "${keyword}"`);
      
      // Tìm kiếm thêm từ API (20 trang)
      let allMovies = [...preloadedMovies];
      const searchPages = 20;
      
      for (let currentPage = 11; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?page=${currentPage}`)
            .then(res => res.json());
          
          if (pageData.items && Array.isArray(pageData.items)) {
            allMovies = [...allMovies, ...pageData.items];
          }
        } catch (pageError) {
          console.error(`Error fetching extended page ${currentPage}:`, pageError);
        }
      }
      
      // Loại bỏ trùng lặp
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      // Lọc kết quả
      let results = [];
      if (keyword.trim()) {
        results = uniqueMovies.filter(movie => {
          return instantSearchApi.matchMovie(keyword, movie, { category, country, year, type });
        });
      } else {
        results = uniqueMovies.filter(movie => {
          return instantSearchApi.matchFilters(movie, { category, country, year, type });
        });
      }
      
      // Sắp xếp
      if (keyword.trim()) {
        results = instantSearchApi.sortByRelevance(results, keyword);
      } else {
        results = instantSearchApi.sortByDefault(results);
      }
      
      console.log(`Found ${results.length} extended results`);
      
      // Lưu vào cache
      setToCache(cacheKey, results, FULL_CACHE_DURATION);
      
      // Phân trang
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = results.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: results.length,
        totalPages: Math.ceil(results.length / limit),
        currentPage: page,
        keyword: keyword,
        extended: true,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Extended search error:', error);
      return {
        items: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        keyword: keyword,
        extended: true,
        error: error.message
      };
    }
  },

  // Kiểm tra khớp phim với từ khóa
  matchMovie: (keyword, movie, filters) => {
    const keywordLower = keyword.toLowerCase().trim();
    
    // Kiểm tra filters trước
    if (!instantSearchApi.matchFilters(movie, filters)) {
      return false;
    }
    
    // Tìm kiếm trong các trường chính
    const movieName = (movie.name || '').toLowerCase();
    const originName = (movie.origin_name || '').toLowerCase();
    const slug = (movie.slug || '').toLowerCase();
    
    // 1. Khớp chính xác
    if (movieName.includes(keywordLower) || originName.includes(keywordLower)) {
      return true;
    }
    
    // 2. Khớp slug
    if (slug.includes(keywordLower)) {
      return true;
    }
    
    // 3. Khớp từng từ
    const keywordWords = keywordLower.split(/\s+/);
    let wordMatches = 0;
    
    for (const word of keywordWords) {
      if (word.length > 1 && (movieName.includes(word) || originName.includes(word))) {
        wordMatches++;
      }
    }
    
    if (wordMatches >= Math.ceil(keywordWords.length / 2)) {
      return true;
    }
    
    // 4. Smart search
    return instantSearchApi.smartMatch(keywordLower, movie);
  },

  // Kiểm tra khớp filters
  matchFilters: (movie, filters) => {
    const { category = '', country = '', year = '', type = '' } = filters;
    
    // Category filter
    if (category) {
      const movieCategories = movie.category || [];
      const categoryNames = movieCategories.map(cat => (cat.name || cat).toLowerCase()).join(' ');
      if (!categoryNames.includes(category.toLowerCase())) {
        return false;
      }
    }
    
    // Country filter
    if (country) {
      const movieCountries = movie.country || [];
      const countryNames = movieCountries.map(country => (country.name || country).toLowerCase()).join(' ');
      if (!countryNames.includes(country.toLowerCase())) {
        return false;
      }
    }
    
    // Year filter
    if (year) {
      const movieYear = movie.year || '';
      if (movieYear.toString() !== year.toString()) {
        return false;
      }
    }
    
    // Type filter
    if (type) {
      if (type === 'Phim Lẻ') {
        return movie.episode_total === 1 || movie.episode_total === '1';
      } else if (type === 'Phim Bộ') {
        return movie.episode_total > 1 || parseInt(movie.episode_total) > 1;
      }
    }
    
    return true;
  },

  // Smart matching cho các từ khóa đặc biệt
  smartMatch: (keyword, movie) => {
    const movieName = (movie.name || '').toLowerCase();
    const originName = (movie.origin_name || '').toLowerCase();
    const movieCountries = movie.country || [];
    const countryNames = movieCountries.map(country => (country.name || country).toLowerCase()).join(' ');
    const movieCategories = movie.category || [];
    const categoryNames = movieCategories.map(cat => (cat.name || cat).toLowerCase()).join(' ');
    
    // Mapping thông minh
    const smartMappings = {
      'vietnam': ['việt nam', 'vietnam', 'vn', 'vietnamese'],
      'viet': ['việt nam', 'viet', 'vn', 'vietnam'],
      'korea': ['hàn quốc', 'korea', 'korean', 'kr', 'han'],
      'han': ['hàn quốc', 'han', 'kr', 'korea'],
      'china': ['trung quốc', 'china', 'chinese', 'cn', 'trung'],
      'trung': ['trung quốc', 'trung', 'cn', 'china'],
      'japan': ['nhật bản', 'japan', 'japanese', 'jp', 'nhat'],
      'nhat': ['nhật bản', 'nhat', 'jp', 'japan'],
      'action': ['hành động', 'action'],
      'romance': ['tình cảm', 'romance'],
      'comedy': ['hài', 'comedy'],
      'horror': ['kinh dị', 'horror'],
      'drama': ['chính kịch', 'drama']
    };
    
    // Kiểm tra mapping
    for (const [key, variations] of Object.entries(smartMappings)) {
      if (keyword.includes(key)) {
        for (const variation of variations) {
          const searchText = `${movieName} ${originName} ${countryNames} ${categoryNames}`;
          if (searchText.includes(variation)) {
            return true;
          }
        }
      }
    }
    
    return false;
  },

  // Sắp xếp theo độ liên quan
  sortByRelevance: (movies, keyword) => {
    const keywordLower = keyword.toLowerCase();
    
    return movies.sort((a, b) => {
      const scoreA = instantSearchApi.calculateRelevanceScore(a, keywordLower);
      const scoreB = instantSearchApi.calculateRelevanceScore(b, keywordLower);
      
      return scoreB - scoreA;
    });
  },

  // Tính điểm liên quan
  calculateRelevanceScore: (movie, keyword) => {
    let score = 0;
    
    const movieName = (movie.name || '').toLowerCase();
    const originName = (movie.origin_name || '').toLowerCase();
    const slug = (movie.slug || '').toLowerCase();
    
    // Khớp chính xác tên phim (điểm cao nhất)
    if (movieName.includes(keyword)) {
      score += 100;
    }
    
    // Khớp chính xác tên gốc
    if (originName.includes(keyword)) {
      score += 80;
    }
    
    // Khớp slug
    if (slug.includes(keyword)) {
      score += 60;
    }
    
    // Khớp bắt đầu tên phim
    if (movieName.startsWith(keyword)) {
      score += 40;
    }
    
    // Khớp bắt đầu tên gốc
    if (originName.startsWith(keyword)) {
      score += 30;
    }
    
    // Bonus cho phim mới
    const currentYear = new Date().getFullYear();
    const movieYear = parseInt(movie.year) || 0;
    if (movieYear >= currentYear - 1) {
      score += 10;
    }
    
    return score;
  },

  // Sắp xếp mặc định
  sortByDefault: (movies) => {
    return movies.sort((a, b) => {
      // Sắp xếp theo năm mới nhất, sau đó theo tên
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      
      if (yearB !== yearA) {
        return yearB - yearA;
      }
      
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      
      return nameA.localeCompare(nameB);
    });
  },

  // Lấy danh sách categories
  getCategories: () => {
    return preloadedCategories.sort();
  },

  // Lấy danh sách countries
  getCountries: () => {
    return preloadedCountries.sort();
  },

  // Lấy danh sách years
  getYears: () => {
    return preloadedYears;
  },

  // Lấy thống kê
  getStats: () => {
    return {
      totalMovies: preloadedMovies.length,
      categories: preloadedCategories.length,
      countries: preloadedCountries.length,
      years: preloadedYears.length,
      cacheSize: instantCache.size
    };
  },

  // Xóa cache
  clearCache: () => {
    instantCache.clear();
    console.log('Instant search cache cleared');
  },

  // Refresh dữ liệu
  refresh: async () => {
    instantSearchApi.clearCache();
    return await instantSearchApi.initialize();
  }
};

export default instantSearchApi;
