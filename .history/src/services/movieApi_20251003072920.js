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
  searchMovies: async (keyword, page = 1, category = '', country = '', year = '', limit = 20) => {
    try {
      console.log(`Searching movies with keyword "${keyword}"`);
      
      // Build search URL with parameters
      let searchUrl = `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`;
      
      if (category) {
        searchUrl += `&category=${encodeURIComponent(category)}`;
      }
      if (country) {
        searchUrl += `&country=${encodeURIComponent(country)}`;
      }
      if (year) {
        searchUrl += `&year=${year}`;
      }
      
      const response = await fetch(searchUrl, {
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
      console.log('KKPhim search API response:', data);
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

      console.log(`Fetching movies by category ${category}`);
      const response = await fetch(`${BASE_URL}/v1/api/danh-sach/${encodeURIComponent(category)}?page=${page}&limit=${limit}`, {
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
      console.log('KKPhim category API response:', data);
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

      console.log(`Fetching movies by country ${country}`);
      const response = await fetch(`${BASE_URL}/v1/api/danh-sach/quoc-gia/${encodeURIComponent(country)}?page=${page}&limit=${limit}`, {
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
      console.log('KKPhim country API response:', data);
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

      console.log(`Fetching movies by year ${year}`);
      const response = await fetch(`${BASE_URL}/v1/api/danh-sach/nam/${year}?page=${page}&limit=${limit}`, {
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
      console.log('KKPhim year API response:', data);
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

      console.log(`Fetching ${type} movies`);
      const response = await fetch(`${BASE_URL}/v1/api/danh-sach/${encodeURIComponent(type)}?page=${page}&limit=${limit}`, {
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
      console.log('KKPhim type API response:', data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${type} movies:`, error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết phim
  getMovieDetail: async (slug) => {
    try {
      console.log('Fetching movie detail from KKPhim API:', `${BASE_URL}/phim/${slug}`);
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
      console.log('KKPhim Movie detail API response:', data);
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