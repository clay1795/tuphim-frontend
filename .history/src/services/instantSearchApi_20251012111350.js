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

// Helper function to apply sorting to movie results
const applySorting = (results, sortField, sortType, searchType = '') => {
  if (!sortField || !sortField.trim()) {
    return results;
  }
  
  console.log(`Applying sort: ${sortField} (${sortType}) to ${results.length} movies`);
  
  const sortedResults = [...results].sort((a, b) => {
    let aValue, bValue;
    
    // Chỉ xử lý 3 sort options như kkphim.com
    switch (sortField) {
      case 'modified_time':
        // Sắp xếp theo thời gian cập nhật (giống kkphim.com)
        aValue = new Date(a.modified_time || a.updatedAt || a.createdAt || '1970-01-01');
        bValue = new Date(b.modified_time || b.updatedAt || b.createdAt || '1970-01-01');
        aValue = aValue.getTime();
        bValue = bValue.getTime();
        break;
      case 'created_time':
        // Sắp xếp theo thời gian đăng (giống kkphim.com)
        aValue = new Date(a.created_time || a.createdAt || a.modified_time || '1970-01-01');
        bValue = new Date(b.created_time || b.createdAt || b.modified_time || '1970-01-01');
        aValue = aValue.getTime();
        bValue = bValue.getTime();
        break;
      case 'year':
        // Sắp xếp theo năm sản xuất (giống kkphim.com)
        aValue = parseInt(a.year) || 1900;
        bValue = parseInt(b.year) || 1900;
        break;
      default:
        // Fallback to modified_time nếu không có sort
        aValue = new Date(a.modified_time || a.updatedAt || a.createdAt || '1970-01-01').getTime();
        bValue = new Date(b.modified_time || b.updatedAt || b.createdAt || '1970-01-01').getTime();
    }
    
    // Numeric/Date comparison cho tất cả 3 sort options
    let result = 0;
    if (aValue > bValue) result = 1;
    else if (aValue < bValue) result = -1;
    else result = 0;
    
    // Apply sort direction (giống kkphim.com)
    if (sortType === 'desc') {
      return -result; // Reverse for descending (mới nhất/cao nhất trước)
    } else {
      return result; // Keep as is for ascending (cũ nhất/thấp nhất trước)
    }
  });
  
  // Debug: Show sample after sorting with actual values
  if (sortedResults.length > 0) {
    const sample = sortedResults.slice(0, 5);
    console.log(`Sample after sorting by ${sortField} (${sortType}):`, sample.map((movie, index) => {
      let sortValue;
      switch (sortField) {
        case 'modified_time':
          sortValue = new Date(movie.modified_time || movie.updatedAt || movie.createdAt || '1970-01-01').getTime();
          break;
        case 'created_time':
          sortValue = new Date(movie.created_time || movie.createdAt || movie.modified_time || '1970-01-01').getTime();
          break;
        case 'year':
          sortValue = parseInt(movie.year) || 1900;
          break;
        default:
          sortValue = new Date(movie.modified_time || movie.updatedAt || movie.createdAt || '1970-01-01').getTime();
      }
      
      return {
        index: index + 1,
        name: movie.name,
        year: movie.year,
        modified_time: movie.modified_time,
        created_time: movie.created_time,
        view: movie.view || movie.views,
        sortValue: sortValue
      };
    }));
  }
  
  console.log(`${searchType} - After sorting by "${sortField}" (${sortType}): ${sortedResults.length} movies`);
  return sortedResults;
};

// Helper function to apply filters to movie results
const applyFiltersToResults = (results, keyword, options, searchType = '') => {
  let filteredResults = [...results];
  
  // Apply keyword search first
  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase().trim();
    console.log(`${searchType} - Searching for "${keyword}" in ${filteredResults.length} movies`);
    
    // Debug: Show sample movie names before filtering
    if (filteredResults.length > 0) {
      const sampleNames = filteredResults.slice(0, 5).map(movie => movie.name || 'No name');
      console.log(`${searchType} - Sample movie names:`, sampleNames);
    }
    
    filteredResults = filteredResults.filter(movie => {
      const name = (movie.name || '').toLowerCase();
      const originName = (movie.origin_name || '').toLowerCase();
      const slug = (movie.slug || '').toLowerCase();
      const content = (movie.content || '');
      const actor = (movie.actor || '').toLowerCase();
      const director = (movie.director || '').toLowerCase();
      
      // Exact match
      const exactMatch = name.includes(searchTerm) || 
                        originName.includes(searchTerm) || 
                        slug.includes(searchTerm) ||
                        content.toLowerCase().includes(searchTerm) ||
                        actor.includes(searchTerm) ||
                        director.includes(searchTerm);
      
      // Fuzzy match (loose search)
      const fuzzyMatch = !exactMatch && (
        name.split(' ').some(word => word.startsWith(searchTerm)) ||
        originName.split(' ').some(word => word.startsWith(searchTerm)) ||
        slug.split('-').some(word => word.startsWith(searchTerm)) ||
        actor.split(' ').some(word => word.startsWith(searchTerm)) ||
        director.split(' ').some(word => word.startsWith(searchTerm))
      );
      
      const matches = exactMatch || fuzzyMatch;
      
      // Debug: Log matching movies
      if (matches) {
        console.log(`${searchType} - Found match: "${movie.name}" (${movie.slug})`);
      }
      
      return matches;
    });
    console.log(`${searchType} - After keyword filter "${keyword}": ${filteredResults.length} movies`);
    
    // Debug: Show sample results
    if (filteredResults.length > 0) {
      const sampleResults = filteredResults.slice(0, 3).map(movie => ({
        name: movie.name,
        slug: movie.slug,
        year: movie.year
      }));
      console.log(`${searchType} - Sample search results:`, sampleResults);
    }
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
      const movieSlug = (movie.slug || '').toLowerCase();
      const movieContent = (movie.content || '').toLowerCase();
      const movieOriginName = (movie.origin_name || '').toLowerCase();
      
      // Enhanced series detection with more patterns
      const hasSeriesKeywords = movieName.includes('tập') || 
                               movieName.includes('season') || 
                               movieName.includes('phần') ||
                               movieName.includes('hoàn tất') ||
                               movieName.includes('series') ||
                               movieName.includes('bộ phim') ||
                               movieName.includes('dài tập') ||
                               movieName.includes('phim truyền hình') ||
                               movieSlug.includes('tap-') ||
                               movieSlug.includes('season') ||
                               movieSlug.includes('series') ||
                               movieSlug.includes('bo-phim') ||
                               movieContent.includes('tập') ||
                               movieContent.includes('season') ||
                               movieOriginName.includes('season') ||
                               movieOriginName.includes('series') ||
                               movieOriginName.includes('tập');
      
      // Check for episode patterns in name (e.g., "Phim ABC Tập 1", "Movie XYZ - Episode 5")
      const hasEpisodePattern = /\b(tập|episode|ep|part|phần)\s*\d+/i.test(movieName) ||
                               /\b(tập|episode|ep|part|phần)\s*\d+/i.test(movieOriginName);
      
      // Enhanced movie type detection with fallbacks
      const isSeries = episodeTotal > 1 || 
                      episodeCurrent > 1 || 
                      hasSeriesKeywords || 
                      hasEpisodePattern ||
                      movieName.includes('dài tập') ||
                      movieName.includes('multi-episode') ||
                      movieName.includes('bộ phim') ||
                      movieName.includes('series');
      
      const isSingle = episodeTotal <= 1 && 
                      episodeCurrent <= 1 && 
                      !hasSeriesKeywords && 
                      !hasEpisodePattern &&
                      !movieName.includes('tập') &&
                      !movieName.includes('season') &&
                      !movieName.includes('series') &&
                      !movieName.includes('bộ phim');
      
      // Fallback: If no episode data, use name patterns
      const hasNoEpisodeData = !episodeTotal && !episodeCurrent;
      const isLikelySeries = hasNoEpisodeData && (
        movieName.includes('tập') ||
        movieName.includes('season') ||
        movieName.includes('phần') ||
        movieName.includes('hoàn tất') ||
        movieName.includes('series') ||
        movieName.includes('bộ phim')
      );
      
      const isLikelySingle = hasNoEpisodeData && !isLikelySeries;
      
      // Category-based detection
      const categories = (movie.category || []).map(cat => (cat.name || cat || '').toLowerCase());
      const hasAnimationCategory = categories.some(cat => 
        cat.includes('hoạt hình') || 
        cat.includes('animation') || 
        cat.includes('anime') ||
        cat.includes('cartoon') ||
        cat.includes('hoạt họa')
      );
      
      // Apply filters based on selected type with API fields and fallbacks
      if (options.type === 'Phim Bộ') {
        // Check API type fields first
        const apiType = movie.type || movie.movie_type || movie.kind;
        const isApiSeries = apiType && (
          apiType.toLowerCase().includes('series') ||
          apiType.toLowerCase().includes('bộ') ||
          apiType.toLowerCase().includes('tập') ||
          apiType.toLowerCase().includes('tv') ||
          apiType === 'series' ||
          apiType === 'phim bộ'
        );
        
        return isApiSeries || isSeries || isLikelySeries;
      } else if (options.type === 'Phim Lẻ') {
        // Check API type fields first
        const apiType = movie.type || movie.movie_type || movie.kind;
        const isApiSingle = apiType && (
          apiType.toLowerCase().includes('single') ||
          apiType.toLowerCase().includes('movie') ||
          apiType.toLowerCase().includes('phim lẻ') ||
          apiType.toLowerCase().includes('lẻ') ||
          apiType === 'single' ||
          apiType === 'movie' ||
          apiType === 'phim lẻ'
        );
        
        // Exclude series if API says it's single
        const isNotApiSeries = !apiType || !(
          apiType.toLowerCase().includes('series') ||
          apiType.toLowerCase().includes('bộ') ||
          apiType.toLowerCase().includes('tập') ||
          apiType.toLowerCase().includes('tv')
        );
        
        return (isApiSingle || (isSingle && isNotApiSeries)) && isLikelySingle;
      } else if (options.type === 'TV Shows') {
        // Check API type fields first
        const apiType = movie.type || movie.movie_type || movie.kind;
        const isApiTVShow = apiType && (
          apiType.toLowerCase().includes('tv') ||
          apiType.toLowerCase().includes('show') ||
          apiType.toLowerCase().includes('series') ||
          apiType === 'tv show' ||
          apiType === 'tv'
        );
        
        return isApiTVShow ||
               movieName.includes('show') || 
               movieName.includes('series') || 
               movieName.includes('tv') ||
               movieSlug.includes('tv-show') ||
               isSeries ||
               isLikelySeries;
      } else if (options.type === 'Hoạt Hình') {
        // Check API type fields first
        const apiType = movie.type || movie.movie_type || movie.kind;
        const isApiAnimation = apiType && (
          apiType.toLowerCase().includes('animation') ||
          apiType.toLowerCase().includes('anime') ||
          apiType.toLowerCase().includes('cartoon') ||
          apiType.toLowerCase().includes('hoạt hình') ||
          apiType === 'animation' ||
          apiType === 'anime'
        );
        
        return isApiAnimation ||
               hasAnimationCategory ||
               movieName.includes('anime') ||
               movieName.includes('cartoon') ||
               movieName.includes('hoạt hình') ||
               movieSlug.includes('anime') ||
               movieSlug.includes('cartoon') ||
               movieName.includes('animation');
      }
      return true;
    });
    console.log(`${searchType} - After type filter "${options.type}": ${filteredResults.length} movies`);
    
    // Debug: Log sample movie data to understand structure
    if (filteredResults.length > 0 && filteredResults.length < 5) {
      console.log('Sample filtered movies:', filteredResults.map(movie => ({
        name: movie.name,
        slug: movie.slug,
        episode_total: movie.episode_total,
        episode_current: movie.episode_current,
        type: movie.type,
        movie_type: movie.movie_type,
        kind: movie.kind,
        category: movie.category?.map(c => c.name || c)
      })));
    }
    
    // Debug: Log type field analysis
    if (filteredResults.length > 0) {
      const typeAnalysis = {
        withType: filteredResults.filter(m => m.type).length,
        withMovieType: filteredResults.filter(m => m.movie_type).length,
        withKind: filteredResults.filter(m => m.kind).length,
        typeValues: [...new Set(filteredResults.filter(m => m.type).map(m => m.type))],
        movieTypeValues: [...new Set(filteredResults.filter(m => m.movie_type).map(m => m.movie_type))],
        kindValues: [...new Set(filteredResults.filter(m => m.kind).map(m => m.kind))]
      };
      console.log('Type field analysis for filtered results:', typeAnalysis);
    }
  }
  
  // Apply sorting using helper function
  filteredResults = applySorting(filteredResults, options.sort, options.sortType, searchType);
  
  return filteredResults;
};

// Debug function to analyze movie data structure
const debugMovieData = (movies, sampleSize = 5) => {
  console.log('=== MOVIE DATA DEBUG ===');
  console.log(`Total movies: ${movies.length}`);
  
  const sample = movies.slice(0, sampleSize);
  sample.forEach((movie, index) => {
    console.log(`Movie ${index + 1}:`, {
      name: movie.name,
      slug: movie.slug,
      episode_total: movie.episode_total,
      episode_current: movie.episode_current,
      type: movie.type,
      movie_type: movie.movie_type,
      kind: movie.kind,
      category: movie.category?.map(c => c.name || c),
      year: movie.year,
      country: movie.country?.map(c => c.name || c),
      // Log all available fields
      allFields: Object.keys(movie).slice(0, 15)
    });
  });
  
  // Analyze episode data
  const withEpisodes = movies.filter(m => m.episode_total || m.episode_current);
  console.log(`Movies with episode data: ${withEpisodes.length}/${movies.length}`);
  
  // Check for type fields
  const withType = movies.filter(m => m.type);
  const withMovieType = movies.filter(m => m.movie_type);
  const withKind = movies.filter(m => m.kind);
  console.log(`Movies with 'type' field: ${withType.length}/${movies.length}`);
  console.log(`Movies with 'movie_type' field: ${withMovieType.length}/${movies.length}`);
  console.log(`Movies with 'kind' field: ${withKind.length}/${movies.length}`);
  
  // Analyze type values
  if (withType.length > 0) {
    const typeValues = [...new Set(withType.map(m => m.type))];
    console.log('Type values:', typeValues);
  }
  if (withMovieType.length > 0) {
    const movieTypeValues = [...new Set(withMovieType.map(m => m.movie_type))];
    console.log('Movie_type values:', movieTypeValues);
  }
  if (withKind.length > 0) {
    const kindValues = [...new Set(withKind.map(m => m.kind))];
    console.log('Kind values:', kindValues);
  }
  
  // Analyze categories
  const categories = [...new Set(movies.flatMap(m => 
    (m.category || []).map(c => c.name || c).filter(Boolean)
  ))];
  console.log('Available categories:', categories.slice(0, 10));
  
  console.log('=== END DEBUG ===');
};

// Test function to check API response structure
const testApiResponse = async () => {
  try {
    console.log('=== TESTING API RESPONSE ===');
    
    // Test different sort options
    const sortOptions = ['modified_time', 'created_time', 'year'];
    
    for (const sort of sortOptions) {
      console.log(`Testing sort: ${sort}`);
      const response = await fetch(`https://phimapi.com/v1/api/danh-sach/phim-moi-cap-nhat-v3?page=1&sort=${sort}&sortType=desc`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const sample = data.items.slice(0, 3);
        console.log(`API Sample Response (${sort}):`, sample.map(movie => ({
          name: movie.name,
          slug: movie.slug,
          modified_time: movie.modified_time,
          created_time: movie.created_time,
          year: movie.year,
          type: movie.type,
          movie_type: movie.movie_type,
          kind: movie.kind,
          category: movie.category,
          allFields: Object.keys(movie)
        })));
        
        // Analyze all available fields
        const allFields = [...new Set(data.items.flatMap(movie => Object.keys(movie)))];
        console.log(`All available fields in API (${sort}):`, allFields);
      }
    }
    
    console.log('=== END API TEST ===');
    return data;
  } catch (error) {
    console.error('API test error:', error);
    return null;
  }
};

export const instantSearchApi = {
  // Khởi tạo dữ liệu sẵn có
  initialize: async (loadFullDatabase = true) => {
    try {
      console.log('Initializing instant search data...');
      
      // Test API response structure
      await testApiResponse();
      
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
          simpleMovieApi.getNewMovies(page, 'v3', {})
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
      
      // Estimate total pages (24k+ movies cần khoảng 3000-5000 pages)
      const estimatedPages = 5000;
      loadingProgress = { current: 0, total: estimatedPages, percentage: 0 };
      
      let allMovies = [];
      const batchSize = 20; // Load 20 pages at a time để tăng tốc
      let currentPage = 1;
      let consecutiveErrors = 0;
      let consecutiveEmptyPages = 0;
      const maxConsecutiveErrors = 10;
      const maxConsecutiveEmptyPages = 20; // Dừng nếu 20 trang liên tiếp trống
      
      while (currentPage <= estimatedPages && consecutiveErrors < maxConsecutiveErrors && consecutiveEmptyPages < maxConsecutiveEmptyPages) {
        const batchPromises = [];
        
        // Load batch of pages
        for (let i = 0; i < batchSize && currentPage <= estimatedPages; i++) {
        batchPromises.push(
          simpleMovieApi.getNewMovies(currentPage, 'v3', {})
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
        let emptyPagesInBatch = 0;
        
        for (const result of batchResults) {
          if (result.movies && result.movies.length > 0) {
            batchMovies = [...batchMovies, ...result.movies];
            hasValidData = true;
            consecutiveErrors = 0;
          } else {
            consecutiveErrors++;
            emptyPagesInBatch++;
          }
        }
        
        // Update consecutive empty pages counter
        if (hasValidData) {
          consecutiveEmptyPages = 0; // Reset counter if we found data
        } else {
          consecutiveEmptyPages += emptyPagesInBatch; // Add empty pages from this batch
        }
        
        allMovies = [...allMovies, ...batchMovies];
        
        console.log(`Batch ${Math.floor((currentPage - 1) / batchSize)}: ${batchMovies.length} movies, ${emptyPagesInBatch} empty pages, total: ${allMovies.length} movies`);
        
        // Update progress
        loadingProgress.current = Math.min(currentPage - 1, estimatedPages);
        loadingProgress.percentage = Math.min((loadingProgress.current / estimatedPages) * 100, 100);
        
        if (onProgress) {
          onProgress(loadingProgress);
        }
        
        // Check if we should stop loading
        if (consecutiveEmptyPages >= maxConsecutiveEmptyPages) {
          console.log(`Max consecutive empty pages (${maxConsecutiveEmptyPages}) reached. Database load complete.`);
          break;
        }
        
        // If no valid data in this batch and we have enough consecutive empty pages, stop
        if (!hasValidData && consecutiveEmptyPages >= 10) {
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
      
      // Nếu preloaded data ít hoặc không có kết quả, fallback sang API
      if (preloadedMovies.length < 1000 || (keyword && keyword.trim())) {
        console.log('Preloaded data insufficient or searching with keyword, using API fallback...');
        
        // Load từ API để có đủ data cho search
        const apiPromises = [];
        for (let i = 1; i <= 10; i++) {
          apiPromises.push(
            simpleMovieApi.getNewMovies(i, 'v3', {})
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
                console.error(`Error loading page ${i} for search:`, error);
                return [];
              })
          );
        }
        
        const apiResults = await Promise.all(apiPromises);
        let apiMovies = [];
        for (const movies of apiResults) {
          apiMovies = [...apiMovies, ...movies];
        }
        
        // Combine preloaded data with API data
        results = [...preloadedMovies, ...apiMovies];
        
        // Deduplicate
        const uniqueMovies = [];
        const seenSlugs = new Set();
        for (const movie of results) {
          if (movie.slug && !seenSlugs.has(movie.slug)) {
            seenSlugs.add(movie.slug);
            uniqueMovies.push(movie);
          }
        }
        results = uniqueMovies;
        
        console.log(`Combined search data: ${results.length} movies`);
      }
      
      // Debug: Show movie data structure
      if (results.length > 0 && results.length < 100) {
        debugMovieData(results, 3);
      }
      
      // Apply all filters using helper function
      results = applyFiltersToResults(results, keyword, options, 'Instant search');
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 24;
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
          simpleMovieApi.getNewMovies(page, 'v3', {
            sort: options.sort || 'modified_time',
            sortType: options.sortType || 'desc'
          })
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
      const limit = options.limit || 24;
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
      
      // Apply all filters using helper function (no keyword search for getAllMovies)
      results = applyFiltersToResults(results, '', options, 'Full database');
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 24;
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
  },

  // Load full database from cache with stats
  loadFullDatabaseFromCache: async () => {
    try {
      console.log('📂 Loading full database from cache...');
      const cacheKey = 'full_database';
      const cached = await persistentCache.loadDatabase(cacheKey);
      
      if (cached && cached.length > 0) {
        preloadedMovies = cached;
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
        console.log('✅ Loaded from cache:', preloadedMovies.length, 'movies');
        
        return {
          success: true,
          movies: preloadedMovies.length,
          categories: preloadedCategories.length,
          countries: preloadedCountries.length,
          years: preloadedYears.length,
          fromCache: true,
          stats: {
            movies: preloadedMovies.length,
            categories: preloadedCategories.length,
            countries: preloadedCountries.length,
            years: preloadedYears.length
          }
        };
      }
      
      console.log('⚠️ No cached database found');
      return { 
        success: false, 
        movies: 0, 
        categories: 0, 
        countries: 0, 
        years: 0, 
        fromCache: false,
        message: 'No cached database found'
      };
    } catch (error) {
      console.error('❌ Error loading from cache:', error);
      return { 
        success: false,
        movies: 0, 
        categories: 0, 
        countries: 0, 
        years: 0, 
        error: error.message 
      };
    }
  },

  // Test database size by checking multiple pages
  testDatabaseSize: async () => {
    try {
      console.log('=== TESTING DATABASE SIZE ===');
      
      let totalMovies = 0;
      let lastPageWithData = 0;
      const testPages = [1, 100, 500, 1000, 2000, 3000, 4000, 5000];
      
      for (const page of testPages) {
        try {
          const response = await fetch(`https://phimapi.com/v1/api/danh-sach/phim-moi-cap-nhat-v3?page=${page}`);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            totalMovies += data.items.length;
            lastPageWithData = page;
            console.log(`Page ${page}: ${data.items.length} movies (total so far: ${totalMovies})`);
          } else {
            console.log(`Page ${page}: No data`);
            break;
          }
        } catch (error) {
          console.log(`Page ${page}: Error - ${error.message}`);
          break;
        }
      }
      
      console.log(`Database test results:`);
      console.log(`- Last page with data: ${lastPageWithData}`);
      console.log(`- Total movies found: ${totalMovies}`);
      console.log(`- Estimated total pages: ${lastPageWithData * 1.5} (assuming 50% more pages)`);
      
      return {
        lastPageWithData,
        totalMovies,
        estimatedTotalPages: Math.floor(lastPageWithData * 1.5)
      };
    } catch (error) {
      console.error('Error testing database size:', error);
      return { lastPageWithData: 0, totalMovies: 0, estimatedTotalPages: 0 };
    }
  }
};

export default instantSearchApi;
