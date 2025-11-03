// KKPhim API Service
const BASE_URL = '/api';

export const movieApi = {
  // Lấy danh sách phim mới cập nhật (với các phiên bản v2, v3)
  getNewMovies: async (page = 1, version = '') => {
    try {
      // Fallback về v3 nếu không có version
      const versionPath = version || 'v3';
      console.log(`Fetching new movies - page: ${page}, version: ${versionPath}`);
      const response = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-${versionPath}?page=${page}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('New movies API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching new movies:', error);
      throw error;
    }
  },

  // Lấy danh sách phim mới cập nhật v2
  getNewMoviesV2: async (page = 1) => {
    return movieApi.getNewMovies(page, 'v2');
  },

  // Lấy danh sách phim mới cập nhật v3
  getNewMoviesV3: async (page = 1) => {
    return movieApi.getNewMovies(page, 'v3');
  },

  // Lấy danh sách phim với bộ lọc nâng cao
  getMoviesList: async (typeList, options = {}) => {
    try {
      const {
        page = 1,
        sortField = 'modified_time',
        sortType = 'desc',
        sortLang = '',
        category = '',
        country = '',
        year = '',
        limit = 20
      } = options;

      let url = `${BASE_URL}/v1/api/danh-sach/${typeList}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;
      
      if (sortLang) url += `&sort_lang=${sortLang}`;
      if (category) url += `&category=${category}`;
      if (country) url += `&country=${country}`;
      if (year) url += `&year=${year}`;
      
      console.log('Fetching movies list from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movies list API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching movies list:', error);
      throw error;
    }
  },

  // Lấy danh sách phim theo thể loại (backward compatibility)
  getMoviesByCategory: async (type, page = 1, category = '', country = '', year = '', limit = 20) => {
    return movieApi.getMoviesList(type, { page, category, country, year, limit });
  },

  // Cache để tránh gọi API nhiều lần
  _movieCache: null,
  _cacheTimestamp: null,
  _cacheExpiry: 5 * 60 * 1000, // 5 phút

  // Lấy tất cả phim từ database với caching và tìm kiếm song song
  getAllMovies: async (onProgress = null) => {
    try {
      // Kiểm tra cache
      const now = Date.now();
      if (movieApi._movieCache && movieApi._cacheTimestamp && 
          (now - movieApi._cacheTimestamp) < movieApi._cacheExpiry) {
        console.log('Using cached movies:', movieApi._movieCache.length, 'items');
        if (onProgress) onProgress(movieApi._movieCache.length, movieApi._movieCache.length);
        return movieApi._movieCache;
      }

      console.log('Fetching ALL movies from database with parallel requests...');
      let allMovies = [];
      
      // Tạo các batch requests song song
      const batchSize = 5; // 5 requests cùng lúc
      const maxPages = 100; // Lấy 100 trang đầu (khoảng 2000 phim)
      const totalBatches = Math.ceil(maxPages / batchSize);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const startPage = batch * batchSize + 1;
        const endPage = Math.min((batch + 1) * batchSize, maxPages);
        
        console.log(`Fetching batch ${batch + 1}/${totalBatches}: pages ${startPage}-${endPage}`);
        
        // Tạo promises cho batch hiện tại
        const batchPromises = [];
        for (let page = startPage; page <= endPage; page++) {
          batchPromises.push(movieApi.getNewMovies(page));
        }
        
        try {
          // Thực hiện batch requests song song
          const batchResults = await Promise.allSettled(batchPromises);
          
          // Xử lý kết quả
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.items) {
              allMovies = allMovies.concat(result.value.items);
            }
          });
          
          console.log(`Batch ${batch + 1} completed, total movies so far: ${allMovies.length}`);
          
          // Gọi callback progress nếu có
          if (onProgress) {
            onProgress(allMovies.length, maxPages * 20); // Ước tính tổng số phim
          }
          
          // Nếu đã có đủ phim, dừng lại
          if (allMovies.length >= 1000) {
            console.log(`Reached ${allMovies.length} movies, stopping early`);
            break;
          }
          
        } catch (error) {
          console.warn(`Error in batch ${batch + 1}:`, error);
        }
      }
      
      // Cache kết quả
      movieApi._movieCache = allMovies;
      movieApi._cacheTimestamp = now;
      
      console.log(`Fetched ALL movies: ${allMovies.length} total (cached for 5 minutes)`);
      return allMovies;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim với bộ lọc nâng cao (progressive search - hiển thị ngay 64 phim, tìm ngầm toàn bộ)
  searchMovies: async (keyword, options = {}) => {
    try {
      const {
        page = 1,
        category = '',
        country = '',
        year = '',
        limit = 20,
        onBackgroundComplete = null
      } = options;

      console.log(`Searching movies with keyword "${keyword}" - progressive search`);
      
      // Bước 1: Tìm kiếm từng trang cho đến khi có đủ 64 phim KHỚP với từ khóa
      console.log('Step 1: Searching page by page until we find 64 matching movies...');
      let quickFiltered = [];
      let currentPage = 1;
      const maxQuickPages = 50; // Tăng lên 50 trang để tìm đủ 64 phim khớp
      
      while (quickFiltered.length < 64 && currentPage <= maxQuickPages) {
        try {
          console.log(`Searching page ${currentPage} for "${keyword}" movies...`);
          const pageData = await movieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            // Lọc chỉ những phim KHỚP với từ khóa
            const pageFiltered = pageData.items.filter(movie => {
              // Search by keyword in name - CHỈ LẤY PHIM KHỚP
              const movieName = (movie.name || '').toLowerCase();
              const keywordLower = keyword.toLowerCase();
              
              // QUAN TRỌNG: Chỉ lấy phim có chứa từ khóa
              if (!movieName.includes(keywordLower)) {
                return false;
              }
              
              // Additional filters
              if (category) {
                const movieCategories = movie.category || [];
                const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
                if (!categoryNames.includes(category.toLowerCase())) {
                  return false;
                }
              }
              
              if (country) {
                const movieCountries = movie.country || [];
                const countryNames = movieCountries.map(c => c.name || c).join(' ').toLowerCase();
                if (!countryNames.includes(country.toLowerCase())) {
                  return false;
                }
              }
              
              if (year) {
                const movieYear = movie.year || '';
                if (movieYear.toString() !== year.toString()) {
                  return false;
                }
              }
              
              return true;
            });
            
            // CHỈ THÊM NHỮNG PHIM KHỚP VÀO KẾT QUẢ
            quickFiltered = quickFiltered.concat(pageFiltered);
            console.log(`Page ${currentPage}: found ${pageFiltered.length} matching "${keyword}" movies, total so far: ${quickFiltered.length}`);
            
            // Nếu đã có đủ 64 phim KHỚP, dừng lại
            if (quickFiltered.length >= 64) {
              console.log(`Found enough matching "${keyword}" movies (${quickFiltered.length}), stopping search`);
              break;
            }
          }
          
          currentPage++;
        } catch (error) {
          console.warn(`Error searching page ${currentPage}:`, error);
          break;
        }
      }
      
      console.log(`Quick search completed: found ${quickFiltered.length} "${keyword}" movies in ${currentPage - 1} pages`);
      
      // Bước 2: Trả về kết quả ngay lập tức (64 phim đầu)
      const instantResults = {
        items: quickFiltered.slice(0, 64), // Chỉ lấy 64 phim đầu
        pagination: {
          totalItems: quickFiltered.length, // Tạm thời dùng số lượng từ batch đầu
          totalPages: Math.ceil(quickFiltered.length / limit),
          currentPage: page,
          isPartial: true // Đánh dấu đây là kết quả tạm thời
        }
      };
      
      // Bước 3: Tìm kiếm ngầm trong toàn bộ database
      if (onBackgroundComplete) {
        console.log('Step 2: Starting background search in full database...');
        
        // Chạy ngầm không block UI
        setTimeout(async () => {
          try {
            console.log('Background: Fetching ALL movies from database...');
            const allMovies = await movieApi.getAllMoviesFull();
            console.log(`Background: Searching in ${allMovies.length} movies`);
            
            const fullFiltered = allMovies.filter(movie => {
              // Search by keyword in name
              const movieName = (movie.name || '').toLowerCase();
              const keywordLower = keyword.toLowerCase();
              
              if (!movieName.includes(keywordLower)) {
                return false;
              }
              
              // Additional filters
              if (category) {
                const movieCategories = movie.category || [];
                const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
                if (!categoryNames.includes(category.toLowerCase())) {
                  return false;
                }
              }
              
              if (country) {
                const movieCountries = movie.country || [];
                const countryNames = movieCountries.map(c => c.name || c).join(' ').toLowerCase();
                if (!countryNames.includes(country.toLowerCase())) {
                  return false;
                }
              }
              
              if (year) {
                const movieYear = movie.year || '';
                if (movieYear.toString() !== year.toString()) {
                  return false;
                }
              }
              
              return true;
            });
            
            console.log(`Background: Found ${fullFiltered.length} total "${keyword}" movies`);
            
            // Gọi callback với kết quả đầy đủ
            onBackgroundComplete({
              items: fullFiltered,
              totalItems: fullFiltered.length,
              totalPages: Math.ceil(fullFiltered.length / limit)
            });
            
          } catch (error) {
            console.error('Background search error:', error);
          }
        }, 100); // Delay nhỏ để không block UI
      }
      
      return instantResults;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim theo loại
  getMoviesByType: async (type, options = {}) => {
    try {
      const {
        page = 1,
        sortField = 'modified_time',
        sortType = 'desc',
        category = '',
        country = '',
        year = '',
        limit = 20
      } = options;

      // Map type to API endpoint theo tài liệu chính thức KKPhim
      const typeMap = {
        'Phim Bộ': 'phim-bo',
        'Phim Lẻ': 'phim-le', 
        'TV Shows': 'tv-shows',
        'Hoạt Hình': 'hoat-hinh'
      };

      const apiType = typeMap[type] || type;
      // Sử dụng API endpoint chính thức từ tài liệu KKPhim
      let url = `${BASE_URL}/v1/api/danh-sach/${apiType}?page=${page}`;
      
      // Fallback: nếu v1 không hoạt động, thử endpoint cũ
      console.log('Trying primary API endpoint:', url);
      
      // Add sorting parameters if provided
      if (sortField && sortType) {
        url += `&sort_field=${sortField}&sort_type=${sortType}`;
      }
      
      // Add limit if provided
      if (limit) {
        url += `&limit=${limit}`;
      }
      
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (country) url += `&country=${encodeURIComponent(country)}`;
      if (year) url += `&year=${year}`;
      
      console.log(`Fetching ${type} movies from:`, url);
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Nếu v1 API không hoạt động, thử endpoint cũ
      if (!response.ok && response.status === 404) {
        console.log('Primary API failed, trying fallback endpoint...');
        const fallbackUrl = `${BASE_URL}/danh-sach/${apiType}?page=${page}`;
        console.log('Trying fallback URL:', fallbackUrl);
        
        response = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        console.log('Fallback response status:', response.status);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('=== API RESPONSE ANALYSIS ===');
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      console.log('Response keys:', Object.keys(data));
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Kiểm tra tất cả các property có thể chứa array
      Object.keys(data).forEach(key => {
        const value = data[key];
        console.log(`Key "${key}":`, typeof value, Array.isArray(value) ? `(array with ${value.length} items)` : '');
        if (Array.isArray(value) && value.length > 0) {
          console.log(`  First item in "${key}":`, Object.keys(value[0]));
        }
      });
      
      if (data.items) {
        console.log('Items found:', data.items.length);
        if (data.items.length > 0) {
          console.log('First item structure:', Object.keys(data.items[0]));
          console.log('First item:', data.items[0]);
        }
      }
      
      if (data.data) {
        console.log('Data found:', data.data.length);
        if (data.data.length > 0) {
          console.log('First data item structure:', Object.keys(data.data[0]));
          console.log('First data item:', data.data[0]);
        }
      }
      
      console.log('=== END API RESPONSE ANALYSIS ===');
      console.log(`${type} API response:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${type} movies:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo thể loại (progressive search - hiển thị ngay 500 phim, tìm ngầm toàn bộ)
  getMoviesByCategoryNew: async (category, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        onBackgroundComplete = null
      } = options;

      console.log(`Searching movies by category "${category}" - progressive search`);
      
      // Bước 1: Tìm kiếm từng trang cho đến khi có đủ 64 phim hành động
      console.log('Step 1: Searching page by page until we find 64 action movies...');
      let quickFiltered = [];
      let currentPage = 1;
      const maxQuickPages = 20; // Tối đa 20 trang để tìm 64 phim
      
      while (quickFiltered.length < 64 && currentPage <= maxQuickPages) {
        try {
          console.log(`Searching page ${currentPage} for action movies...`);
          const pageData = await movieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const pageFiltered = pageData.items.filter(movie => {
              const movieCategories = movie.category || [];
              const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
              return categoryNames.includes(category.toLowerCase());
            });
            
            quickFiltered = quickFiltered.concat(pageFiltered);
            console.log(`Page ${currentPage}: found ${pageFiltered.length} action movies, total so far: ${quickFiltered.length}`);
            
            // Nếu đã có đủ 64 phim, dừng lại
            if (quickFiltered.length >= 64) {
              console.log(`Found enough action movies (${quickFiltered.length}), stopping search`);
              break;
            }
          }
          
          currentPage++;
        } catch (error) {
          console.warn(`Error searching page ${currentPage}:`, error);
          break;
        }
      }
      
      console.log(`Quick search completed: found ${quickFiltered.length} action movies in ${currentPage - 1} pages`);
      
      // Bước 2: Trả về kết quả ngay lập tức (64 phim đầu)
      const instantResults = {
        items: quickFiltered.slice(0, 64), // Chỉ lấy 64 phim đầu
        pagination: {
          totalItems: quickFiltered.length, // Tạm thời dùng số lượng từ batch đầu
          totalPages: Math.ceil(quickFiltered.length / limit),
          currentPage: page,
          isPartial: true // Đánh dấu đây là kết quả tạm thời
        }
      };
      
      // Bước 3: Tìm kiếm ngầm trong toàn bộ database
      if (onBackgroundComplete) {
        console.log('Step 2: Starting background search in full database...');
        
        // Chạy ngầm không block UI
        setTimeout(async () => {
          try {
            console.log('Background: Fetching ALL movies from database...');
            const allMovies = await movieApi.getAllMoviesFull();
            console.log(`Background: Searching in ${allMovies.length} movies`);
            
            const fullFiltered = allMovies.filter(movie => {
              const movieCategories = movie.category || [];
              const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
              return categoryNames.includes(category.toLowerCase());
            });
            
            console.log(`Background: Found ${fullFiltered.length} total movies for category "${category}"`);
            
            // Gọi callback với kết quả đầy đủ
            onBackgroundComplete({
              items: fullFiltered,
              totalItems: fullFiltered.length,
              totalPages: Math.ceil(fullFiltered.length / limit)
            });
            
          } catch (error) {
            console.error('Background search error:', error);
          }
        }, 100); // Delay nhỏ để không block UI
      }
      
      return instantResults;
    } catch (error) {
      console.error(`Error fetching movies by category ${category}:`, error);
      throw error;
    }
  },

  // Lấy toàn bộ phim từ database (không giới hạn)
  getAllMoviesFull: async (onProgress = null) => {
    try {
      console.log('Fetching ALL movies from database (no limit)...');
      let allMovies = [];
      
      // Tạo các batch requests song song
      const batchSize = 5; // 5 requests cùng lúc
      const maxPages = 500; // Lấy 500 trang (khoảng 10,000 phim)
      const totalBatches = Math.ceil(maxPages / batchSize);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const startPage = batch * batchSize + 1;
        const endPage = Math.min((batch + 1) * batchSize, maxPages);
        
        console.log(`Background batch ${batch + 1}/${totalBatches}: pages ${startPage}-${endPage}`);
        
        // Tạo promises cho batch hiện tại
        const batchPromises = [];
        for (let page = startPage; page <= endPage; page++) {
          batchPromises.push(movieApi.getNewMovies(page));
        }
        
        try {
          // Thực hiện batch requests song song
          const batchResults = await Promise.allSettled(batchPromises);
          
          // Xử lý kết quả
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.items) {
              allMovies = allMovies.concat(result.value.items);
            }
          });
          
          console.log(`Background batch ${batch + 1} completed, total: ${allMovies.length}`);
          
          // Gọi callback progress nếu có
          if (onProgress) {
            onProgress(allMovies.length, maxPages * 20);
          }
          
        } catch (error) {
          console.warn(`Error in background batch ${batch + 1}:`, error);
        }
      }
      
      console.log(`Background: Fetched ALL movies: ${allMovies.length} total`);
      return allMovies;
    } catch (error) {
      console.error('Error fetching all movies (background):', error);
      throw error;
    }
  },

  // Tìm kiếm phim theo quốc gia (progressive search - hiển thị ngay 64 phim, tìm ngầm toàn bộ)
  getMoviesByCountry: async (country, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        onBackgroundComplete = null
      } = options;

      console.log(`Searching movies by country "${country}" - progressive search`);
      
      // Bước 1: Tìm kiếm từng trang cho đến khi có đủ 64 phim
      console.log('Step 1: Searching page by page until we find 64 movies...');
      let quickFiltered = [];
      let currentPage = 1;
      const maxQuickPages = 20; // Tối đa 20 trang để tìm 64 phim
      
      while (quickFiltered.length < 64 && currentPage <= maxQuickPages) {
        try {
          console.log(`Searching page ${currentPage} for ${country} movies...`);
          const pageData = await movieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const pageFiltered = pageData.items.filter(movie => {
              const movieCountries = movie.country || [];
              const countryNames = movieCountries.map(c => c.name || c).join(' ').toLowerCase();
              return countryNames.includes(country.toLowerCase());
            });
            
            quickFiltered = quickFiltered.concat(pageFiltered);
            console.log(`Page ${currentPage}: found ${pageFiltered.length} ${country} movies, total so far: ${quickFiltered.length}`);
            
            // Nếu đã có đủ 64 phim, dừng lại
            if (quickFiltered.length >= 64) {
              console.log(`Found enough ${country} movies (${quickFiltered.length}), stopping search`);
              break;
            }
          }
          
          currentPage++;
        } catch (error) {
          console.warn(`Error searching page ${currentPage}:`, error);
          break;
        }
      }
      
      console.log(`Quick search completed: found ${quickFiltered.length} ${country} movies in ${currentPage - 1} pages`);
      
      // Bước 2: Trả về kết quả ngay lập tức (64 phim đầu)
      const instantResults = {
        items: quickFiltered.slice(0, 64), // Chỉ lấy 64 phim đầu
        pagination: {
          totalItems: quickFiltered.length, // Tạm thời dùng số lượng từ batch đầu
          totalPages: Math.ceil(quickFiltered.length / limit),
          currentPage: page,
          isPartial: true // Đánh dấu đây là kết quả tạm thời
        }
      };
      
      // Bước 3: Tìm kiếm ngầm trong toàn bộ database
      if (onBackgroundComplete) {
        console.log('Step 2: Starting background search in full database...');
        
        // Chạy ngầm không block UI
        setTimeout(async () => {
          try {
            console.log('Background: Fetching ALL movies from database...');
            const allMovies = await movieApi.getAllMoviesFull();
            console.log(`Background: Searching in ${allMovies.length} movies`);
            
            const fullFiltered = allMovies.filter(movie => {
              const movieCountries = movie.country || [];
              const countryNames = movieCountries.map(c => c.name || c).join(' ').toLowerCase();
              return countryNames.includes(country.toLowerCase());
            });
            
            console.log(`Background: Found ${fullFiltered.length} total ${country} movies`);
            
            // Gọi callback với kết quả đầy đủ
            onBackgroundComplete({
              items: fullFiltered,
              totalItems: fullFiltered.length,
              totalPages: Math.ceil(fullFiltered.length / limit)
            });
            
          } catch (error) {
            console.error('Background search error:', error);
          }
        }, 100); // Delay nhỏ để không block UI
      }
      
      return instantResults;
    } catch (error) {
      console.error(`Error fetching movies by country ${country}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo năm (progressive search - hiển thị ngay 64 phim, tìm ngầm toàn bộ)
  getMoviesByYearNew: async (year, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        onBackgroundComplete = null
      } = options;

      console.log(`Searching movies by year "${year}" - progressive search`);
      
      // Bước 1: Tìm kiếm từng trang cho đến khi có đủ 64 phim
      console.log('Step 1: Searching page by page until we find 64 movies...');
      let quickFiltered = [];
      let currentPage = 1;
      const maxQuickPages = 20; // Tối đa 20 trang để tìm 64 phim
      
      while (quickFiltered.length < 64 && currentPage <= maxQuickPages) {
        try {
          console.log(`Searching page ${currentPage} for ${year} movies...`);
          const pageData = await movieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const pageFiltered = pageData.items.filter(movie => {
              const movieYear = movie.year || '';
              return movieYear.toString() === year.toString();
            });
            
            quickFiltered = quickFiltered.concat(pageFiltered);
            console.log(`Page ${currentPage}: found ${pageFiltered.length} ${year} movies, total so far: ${quickFiltered.length}`);
            
            // Nếu đã có đủ 64 phim, dừng lại
            if (quickFiltered.length >= 64) {
              console.log(`Found enough ${year} movies (${quickFiltered.length}), stopping search`);
              break;
            }
          }
          
          currentPage++;
        } catch (error) {
          console.warn(`Error searching page ${currentPage}:`, error);
          break;
        }
      }
      
      console.log(`Quick search completed: found ${quickFiltered.length} ${year} movies in ${currentPage - 1} pages`);
      
      // Bước 2: Trả về kết quả ngay lập tức (64 phim đầu)
      const instantResults = {
        items: quickFiltered.slice(0, 64), // Chỉ lấy 64 phim đầu
        pagination: {
          totalItems: quickFiltered.length, // Tạm thời dùng số lượng từ batch đầu
          totalPages: Math.ceil(quickFiltered.length / limit),
          currentPage: page,
          isPartial: true // Đánh dấu đây là kết quả tạm thời
        }
      };
      
      // Bước 3: Tìm kiếm ngầm trong toàn bộ database
      if (onBackgroundComplete) {
        console.log('Step 2: Starting background search in full database...');
        
        // Chạy ngầm không block UI
        setTimeout(async () => {
          try {
            console.log('Background: Fetching ALL movies from database...');
            const allMovies = await movieApi.getAllMoviesFull();
            console.log(`Background: Searching in ${allMovies.length} movies`);
            
            const fullFiltered = allMovies.filter(movie => {
              const movieYear = movie.year || '';
              return movieYear.toString() === year.toString();
            });
            
            console.log(`Background: Found ${fullFiltered.length} total ${year} movies`);
            
            // Gọi callback với kết quả đầy đủ
            onBackgroundComplete({
              items: fullFiltered,
              totalItems: fullFiltered.length,
              totalPages: Math.ceil(fullFiltered.length / limit)
            });
            
          } catch (error) {
            console.error('Background search error:', error);
          }
        }, 100); // Delay nhỏ để không block UI
      }
      
      return instantResults;
    } catch (error) {
      console.error(`Error fetching movies by year ${year}:`, error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết phim
  getMovieDetail: async (slug) => {
    try {
      console.log('Fetching movie detail from:', `${BASE_URL}/phim/${slug}`);
      const response = await fetch(`${BASE_URL}/phim/${slug}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movie detail API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      throw error;
    }
  },

  // Lấy thông tin từ TMDB
  getTMDBInfo: async (type, id) => {
    try {
      console.log(`Fetching TMDB info for ${type}/${id}`);
      const response = await fetch(`${BASE_URL}/tmdb/${type}/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('TMDB API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching TMDB info:', error);
      throw error;
    }
  },

  // Lấy danh sách thể loại
  getCategories: async () => {
    try {
      console.log('Fetching categories from:', `${BASE_URL}/the-loai`);
      const response = await fetch(`${BASE_URL}/the-loai`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Categories API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy chi tiết thể loại
  getCategoryDetail: async (slug, options = {}) => {
    try {
      const {
        page = 1,
        sortField = 'modified_time',
        sortType = 'desc',
        sortLang = '',
        country = '',
        year = '',
        limit = 20
      } = options;

      let url = `${BASE_URL}/v1/api/the-loai/${slug}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;
      
      if (sortLang) url += `&sort_lang=${sortLang}`;
      if (country) url += `&country=${country}`;
      if (year) url += `&year=${year}`;
      
      console.log('Fetching category detail from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Category detail API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching category detail:', error);
      throw error;
    }
  },

  // Lấy danh sách quốc gia
  getCountries: async () => {
    try {
      console.log('Fetching countries from:', `${BASE_URL}/quoc-gia`);
      const response = await fetch(`${BASE_URL}/quoc-gia`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Countries API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  // Lấy chi tiết quốc gia
  getCountryDetail: async (slug, options = {}) => {
    try {
      const {
        page = 1,
        sortField = 'modified_time',
        sortType = 'desc',
        sortLang = '',
        category = '',
        year = '',
        limit = 20
      } = options;

      let url = `${BASE_URL}/v1/api/quoc-gia/${slug}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;
      
      if (sortLang) url += `&sort_lang=${sortLang}`;
      if (category) url += `&category=${category}`;
      if (year) url += `&year=${year}`;
      
      console.log('Fetching country detail from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Country detail API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching country detail:', error);
      throw error;
    }
  },

  // Lấy phim theo năm
  getMoviesByYear: async (year, options = {}) => {
    try {
      const {
        page = 1,
        sortField = 'modified_time',
        sortType = 'desc',
        sortLang = '',
        category = '',
        country = '',
        limit = 20
      } = options;

      let url = `${BASE_URL}/v1/api/nam/${year}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;
      
      if (sortLang) url += `&sort_lang=${sortLang}`;
      if (category) url += `&category=${category}`;
      if (country) url += `&country=${country}`;
      
      console.log('Fetching movies by year from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movies by year API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching movies by year:', error);
      throw error;
    }
  },

  // Chuyển đổi ảnh sang WEBP
  getWebpImage: (imageUrl) => {
    if (!imageUrl) return '';
    return `${BASE_URL}/image.php?url=${encodeURIComponent(imageUrl)}`;
  },

  // Utility functions
  utils: {
    // Lấy danh sách type_list có sẵn
    getAvailableTypeLists: () => [
      'phim-bo',
      'phim-le', 
      'tv-shows',
      'hoat-hinh',
      'phim-vietsub',
      'phim-thuyet-minh',
      'phim-long-tieng'
    ],

    // Lấy danh sách sort_field có sẵn
    getAvailableSortFields: () => [
      'modified_time',
      'id',
      'year',
      'last_episode_time'
    ],

    // Lấy danh sách sort_lang có sẵn
    getAvailableSortLangs: () => [
      'viesub',
      'thuyet-minh',
      'long-tieng'
    ],

    // Lấy danh sách năm từ 1970 đến hiện tại
    getAvailableYears: () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear; year >= 1970; year--) {
        years.push(year);
      }
      return years;
    }
  }
};

export default movieApi;
