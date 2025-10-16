// MongoDB Movie API Service - Direct access to database
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const mongoMovieApi = {
  // Lấy danh sách phim mới từ MongoDB
  getNewMovies: async (page = 1, limit = 24) => {
    try {
      console.log(`Fetching new movies from MongoDB - page: ${page}, limit: ${limit}`);
      
      const response = await fetch(`${BASE_URL}/mongo-movies/new?page=${page}&limit=${limit}`, {
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
      console.log('MongoDB movies API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching movies from MongoDB:', error);
      throw error;
    }
  },

  // Tìm kiếm phim trong MongoDB
  searchMovies: async (keyword = '', options = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        type = '',
        category = '',
        country = '',
        year = '',
        sort = 'last_sync',
        sortType = 'desc'
      } = options;

      const params = new URLSearchParams();
      params.append('keyword', keyword);
      params.append('page', page);
      params.append('limit', limit);
      params.append('sort', sort);
      params.append('sortType', sortType);
      
      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (country) params.append('country', country);
      if (year) params.append('year', year);
      
      console.log(`Searching MongoDB - keyword: "${keyword}", page: ${page}`);
      
      const response = await fetch(`${BASE_URL}/mongo-movies/search?${params}`, {
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
      console.log('MongoDB search response:', data);
      return data;
    } catch (error) {
      console.error('Error searching movies in MongoDB:', error);
      throw error;
    }
  },

  // Lấy thống kê MongoDB
  getStats: async () => {
    try {
      console.log('Fetching MongoDB stats...');
      
      const response = await fetch(`${BASE_URL}/mongo-movies/stats`, {
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
      console.log('MongoDB stats response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching MongoDB stats:', error);
      throw error;
    }
  },

  // Xóa tất cả cache
  clearAllCaches: async () => {
    try {
      console.log('Clearing all caches...');
      
      const response = await fetch(`${BASE_URL}/mongo-movies/clear-cache`, {
        method: 'POST',
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
      console.log('Clear cache response:', data);
      return data;
    } catch (error) {
      console.error('Error clearing caches:', error);
      throw error;
    }
  }
};

export default mongoMovieApi;
