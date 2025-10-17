// Simple Movie API Service - Improved Search and Display
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Dynamic API URL detection for Dev Tunnels
const getApiBaseUrl = () => {
  // If running on localhost, use the environment variable
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }
  
  // If running on Dev Tunnels, construct the backend URL
  if (window.location.hostname.includes('devtunnels.ms')) {
    const frontendUrl = window.location.origin;
    const backendUrl = frontendUrl.replace('-5173.', '-3001.');
    return `${backendUrl}/api`;
  }
  
  // Default fallback
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

export const simpleMovieApi = {
  // Lấy danh sách phim mới cập nhật
  getNewMovies: async (page = 1, version = 'v3', sortOptions = {}) => {
    try {
      console.log(`Fetching new movies - page: ${page}, version: ${version}`, sortOptions);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      // Add sort parameters if provided
      if (sortOptions.sort) {
        params.append('sort', sortOptions.sort);
      }
      if (sortOptions.sortType) {
        params.append('sortType', sortOptions.sortType);
      }
      
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/movies/new?page=${page}&version=${version}`, {
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

  // Tìm kiếm phim đơn giản và hiệu quả
  searchMovies: async (keyword, options = {}) => {
    try {
      const {
        page = 1,
        category = '',
        country = '',
        year = '',
        limit = 24
      } = options;

      console.log(`Searching movies with keyword: "${keyword}"`);
      
      // Tìm kiếm trong 10 trang đầu tiên
      let allMovies = [];
      const searchPages = 10;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          console.log(`Searching page ${currentPage}...`);
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            // Lọc phim theo từ khóa
            const filteredMovies = pageData.items.filter(movie => {
              const movieName = (movie.name || '').toLowerCase();
              const keywordLower = keyword.toLowerCase();
              
              // Tìm trong tên phim
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
                const countryNames = movieCountries.map(country => country.name || country).join(' ').toLowerCase();
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
            
            allMovies = [...allMovies, ...filteredMovies];
            console.log(`Page ${currentPage}: Found ${filteredMovies.length} matching movies`);
          }
        } catch (pageError) {
          console.error(`Error searching page ${currentPage}:`, pageError);
        }
      }
      
      console.log(`Total search results: ${allMovies.length} movies`);
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        keyword: keyword
      };
      
    } catch (error) {
      console.error('Search movies error:', error);
      throw error;
    }
  },

  // Lấy phim theo thể loại
  getMoviesByCategory: async (category, options = {}) => {
    try {
      const { page = 1, limit = 24 } = options;
      
      console.log(`Fetching movies by category: ${category}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              const movieCategories = movie.category || [];
              const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
              return categoryNames.includes(category.toLowerCase());
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching category page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        category: category
      };
      
    } catch (error) {
      console.error('Get movies by category error:', error);
      throw error;
    }
  },

  // Lấy phim theo năm
  getMoviesByYear: async (year, options = {}) => {
    try {
      const { page = 1, limit = 24 } = options;
      
      console.log(`Fetching movies by year: ${year}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              const movieYear = movie.year || '';
              return movieYear.toString() === year.toString();
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching year page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        year: year
      };
      
    } catch (error) {
      console.error('Get movies by year error:', error);
      throw error;
    }
  },

  // Lấy phim theo quốc gia
  getMoviesByCountry: async (country, options = {}) => {
    try {
      const { page = 1, limit = 24 } = options;
      
      console.log(`Fetching movies by country: ${country}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              const movieCountries = movie.country || [];
              const countryNames = movieCountries.map(country => country.name || country).join(' ').toLowerCase();
              return countryNames.includes(country.toLowerCase());
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching country page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        country: country
      };
      
    } catch (error) {
      console.error('Get movies by country error:', error);
      throw error;
    }
  },

  // Lấy phim theo loại (Phim Lẻ, Phim Bộ)
  getMoviesByType: async (type, options = {}) => {
    try {
      const { page = 1, limit = 24 } = options;
      
      console.log(`Fetching movies by type: ${type}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              // Logic phân loại phim lẻ/phim bộ dựa trên episode
              if (type === 'Phim Lẻ') {
                return movie.episode_total === 1 || movie.episode_total === '1';
              } else if (type === 'Phim Bộ') {
                return movie.episode_total > 1 || parseInt(movie.episode_total) > 1;
              }
              return true;
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching type page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        type: type
      };
      
    } catch (error) {
      console.error('Get movies by type error:', error);
      throw error;
    }
  },

  // Lấy chi tiết phim
  getMovieDetail: async (slug) => {
    try {
      console.log(`Fetching movie detail for slug: ${slug}`);
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/movies/detail/${slug}`, {
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

  // Chuyển đổi ảnh sang WebP
  getWebpImage: (imageUrl) => {
    if (!imageUrl) return '';
    
    // Nếu đã là WebP hoặc từ TMDB, trả về nguyên
    if (imageUrl.includes('.webp') || imageUrl.includes('tmdb.org')) {
      return imageUrl;
    }
    
    // Chuyển đổi sang WebP cho các ảnh khác
    return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
};

export default simpleMovieApi;
