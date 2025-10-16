// KKPhim API Service
const BASE_URL = '/api';

export const movieApi = {
  // Lấy danh sách phim mới cập nhật
  getNewMovies: async (page = 1) => {
    try {
      console.log(`Fetching new movies - page: ${page}`);
      const response = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?page=${page}`, {
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
      console.log('KKPhim API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching new movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim với từ khóa
  searchMovies: async (keyword, options = {}) => {
    try {
      const {
        page = 1,
        category = '',
        country = '',
        year = '',
        limit = 20
      } = options;

      // Use working API and filter client-side
      console.log(`Searching movies with keyword "${keyword}" - using client-side filtering`);
      const data = await movieApi.getNewMovies(page);
      
      // Filter movies by keyword and other filters on client side
      if (data.items && Array.isArray(data.items)) {
        let filteredMovies = data.items.filter(movie => {
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
        
        return {
          ...data,
          items: filteredMovies,
          pagination: {
            ...data.pagination,
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit)
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim theo thể loại
  getMoviesByCategoryNew: async (category, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      // Use working API and filter client-side
      console.log(`Fetching movies by category ${category} - using client-side filtering`);
      const data = await movieApi.getNewMovies(page);
      
      // Filter movies by category on client side
      if (data.items && Array.isArray(data.items)) {
        const filteredMovies = data.items.filter(movie => {
          const movieCategories = movie.category || [];
          const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
          return categoryNames.includes(category.toLowerCase());
        });
        
        return {
          ...data,
          items: filteredMovies,
          pagination: {
            ...data.pagination,
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit)
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching movies by category ${category}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo quốc gia
  getMoviesByCountry: async (country, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      // Use working API and filter client-side
      console.log(`Fetching movies by country ${country} - using client-side filtering`);
      const data = await movieApi.getNewMovies(page);
      
      // Filter movies by country on client side
      if (data.items && Array.isArray(data.items)) {
        const filteredMovies = data.items.filter(movie => {
          const movieCountries = movie.country || [];
          const countryNames = movieCountries.map(c => c.name || c).join(' ').toLowerCase();
          return countryNames.includes(country.toLowerCase());
        });
        
        return {
          ...data,
          items: filteredMovies,
          pagination: {
            ...data.pagination,
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit)
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching movies by country ${country}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo năm
  getMoviesByYearNew: async (year, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      // Use working API and filter client-side
      console.log(`Fetching movies by year ${year} - using client-side filtering`);
      const data = await movieApi.getNewMovies(page);
      
      // Filter movies by year on client side
      if (data.items && Array.isArray(data.items)) {
        const filteredMovies = data.items.filter(movie => {
          const movieYear = movie.year || '';
          return movieYear.toString() === year.toString();
        });
        
        return {
          ...data,
          items: filteredMovies,
          pagination: {
            ...data.pagination,
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit)
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching movies by year ${year}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo loại
  getMoviesByType: async (type, options = {}) => {
    try {
      const {
        page = 1,
        limit = 20
      } = options;

      // Use working API and filter client-side
      console.log(`Fetching ${type} movies - using client-side filtering`);
      const data = await movieApi.getNewMovies(page);
      
      // Filter movies by type on client side
      if (data.items && Array.isArray(data.items)) {
        const filteredMovies = data.items.filter(movie => {
          // Check if movie matches the type
          const movieType = movie.type || '';
          const episodeTotal = movie.episode_total || 1;
          
          if (type === 'Phim Bộ') {
            return parseInt(episodeTotal) > 1 || movieType.toLowerCase().includes('phim bộ');
          } else if (type === 'Phim Lẻ') {
            return parseInt(episodeTotal) === 1 && !movieType.toLowerCase().includes('phim bộ');
          } else if (type === 'TV Shows') {
            return movieType.toLowerCase().includes('tv shows') || movieType.toLowerCase().includes('tv');
          } else if (type === 'Hoạt Hình') {
            return movieType.toLowerCase().includes('hoạt hình') || movieType.toLowerCase().includes('anime');
          }
          
          return true;
        });
        
        return {
          ...data,
          items: filteredMovies,
          pagination: {
            ...data.pagination,
            totalItems: filteredMovies.length,
            totalPages: Math.ceil(filteredMovies.length / limit)
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${type} movies:`, error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết phim
  getMovieDetail: async (slug) => {
    try {
      console.log('Fetching movie detail from NguonC API:', `${BASE_URL}/phim/${slug}`);
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
      console.log('NguonC Movie detail API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      throw error;
    }
  },

  // Backward compatibility methods
  getMoviesByCategory: async (type, page = 1, category = '', country = '', year = '', limit = 20) => {
    return movieApi.getMoviesByType(type, { page, category, country, year, limit });
  },

  getNewMoviesV2: async (page = 1) => {
    return movieApi.getNewMovies(page);
  },

  getNewMoviesV3: async (page = 1) => {
    return movieApi.getNewMovies(page);
  },

  getMoviesList: async (typeList, options = {}) => {
    return movieApi.getMoviesByType(typeList, options);
  }
};

export default movieApi;