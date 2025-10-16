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

  // Lấy tất cả phim từ database (24,498 phim)
  getAllMovies: async () => {
    try {
      console.log('Fetching all movies from database...');
      let allMovies = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        try {
          const data = await movieApi.getNewMovies(currentPage);
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            allMovies = allMovies.concat(data.items);
            console.log(`Fetched page ${currentPage}, total movies so far: ${allMovies.length}`);
            currentPage++;
            
            // Check if we've reached the end
            if (data.items.length < 20) { // Assuming 20 items per page
              hasMorePages = false;
            }
          } else {
            hasMorePages = false;
          }
        } catch (error) {
          console.warn(`Error fetching page ${currentPage}:`, error);
          hasMorePages = false;
        }
      }
      
      console.log(`Fetched all movies: ${allMovies.length} total`);
      return allMovies;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim với bộ lọc nâng cao (tìm trong tất cả 24,498 phim)
  searchMovies: async (keyword, options = {}) => {
    try {
      const {
        page = 1,
        category = '',
        country = '',
        year = '',
        limit = 20
      } = options;

      console.log(`Searching movies with keyword "${keyword}" - searching in full database`);
      
      // Get all movies from database
      const allMovies = await movieApi.getAllMovies();
      
      // Filter movies by keyword and other filters on client side
      if (allMovies.length > 0) {
        let filteredMovies = allMovies.filter(movie => {
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
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
        
        return {
          items: paginatedMovies,
          pagination: {
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit),
            currentPage: page
          }
        };
      }
      
      return {
        items: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }
      };
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

  // Tìm kiếm phim theo thể loại (new version) - tìm trong tất cả 24,498 phim
  getMoviesByCategoryNew: async (category, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      console.log(`Searching movies by category "${category}" - searching in full database`);
      
      // Get all movies from database
      const allMovies = await movieApi.getAllMovies();
      console.log(`Total movies in database: ${allMovies.length}`);
      
      // Filter movies by category on client side
      if (allMovies.length > 0) {
        const filteredMovies = allMovies.filter(movie => {
          const movieCategories = movie.category || [];
          const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
          const matches = categoryNames.includes(category.toLowerCase());
          if (matches) {
            console.log(`Found matching movie: ${movie.name}, categories: ${categoryNames}`);
          }
          return matches;
        });
        
        console.log(`Filtered movies for category "${category}": ${filteredMovies.length} results`);
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
        
        return {
          items: paginatedMovies,
          pagination: {
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit),
            currentPage: page
          }
        };
      }
      
      return {
        items: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }
      };
    } catch (error) {
      console.error(`Error fetching movies by category ${category}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo quốc gia - tìm trong tất cả 24,498 phim
  getMoviesByCountry: async (country, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      console.log(`Searching movies by country "${country}" - searching in full database`);
      
      // Get all movies from database
      const allMovies = await movieApi.getAllMovies();
      
      // Filter movies by country on client side
      if (allMovies.length > 0) {
        const filteredMovies = allMovies.filter(movie => {
          const movieCountries = movie.country || [];
          const countryNames = movieCountries.map(c => c.name || c).join(' ').toLowerCase();
          return countryNames.includes(country.toLowerCase());
        });
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
        
        return {
          items: paginatedMovies,
          pagination: {
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit),
            currentPage: page
          }
        };
      }
      
      return {
        items: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }
      };
    } catch (error) {
      console.error(`Error fetching movies by country ${country}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo năm (new version) - tìm trong tất cả 24,498 phim
  getMoviesByYearNew: async (year, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      console.log(`Searching movies by year "${year}" - searching in full database`);
      
      // Get all movies from database
      const allMovies = await movieApi.getAllMovies();
      
      // Filter movies by year on client side
      if (allMovies.length > 0) {
        const filteredMovies = allMovies.filter(movie => {
          const movieYear = movie.year || '';
          return movieYear.toString() === year.toString();
        });
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
        
        return {
          items: paginatedMovies,
          pagination: {
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit),
            currentPage: page
          }
        };
      }
      
      return {
        items: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }
      };
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
