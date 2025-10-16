import axios from 'axios';

// Backend API base URL
const BACKEND_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const backendApi = axios.create({
  baseURL: BACKEND_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
backendApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authApi = {
  // Register user
  register: async (userData) => {
    return await backendApi.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return await backendApi.post('/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: async () => {
    return await backendApi.get('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return await backendApi.post('/auth/refresh');
  },

  // Change password
  changePassword: async (passwordData) => {
    return await backendApi.post('/auth/change-password', passwordData);
  },

  // Logout
  logout: async () => {
    return await backendApi.post('/auth/logout');
  },
};

// User APIs
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return await backendApi.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await backendApi.put('/users/profile', profileData);
  },

  // Get watchlist
  getWatchlist: async () => {
    return await backendApi.get('/users/watchlist');
  },

  // Add to watchlist
  addToWatchlist: async (movieData) => {
    return await backendApi.post('/users/watchlist', movieData);
  },

  // Remove from watchlist
  removeFromWatchlist: async (movieId) => {
    return await backendApi.delete(`/users/watchlist/${movieId}`);
  },

  // Get favorites
  getFavorites: async () => {
    return await backendApi.get('/users/favorites');
  },

  // Add to favorites
  addToFavorites: async (movieData) => {
    return await backendApi.post('/users/favorites', movieData);
  },

  // Remove from favorites
  removeFromFavorites: async (movieId) => {
    return await backendApi.delete(`/users/favorites/${movieId}`);
  },

  // Get watch history
  getWatchHistory: async () => {
    return await backendApi.get('/users/history');
  },

  // Add to watch history
  addToWatchHistory: async (movieData) => {
    return await backendApi.post('/users/history', movieData);
  },

  // Get user stats
  getUserStats: async () => {
    return await backendApi.get('/users/stats');
  },
};

// Movie APIs (KKPhim API Proxy)
export const movieApi = {
  // Get new movies
  getNewMovies: async (page = 1, version = 'v3') => {
    return await backendApi.get('/movies/new', {
      params: { page, version }
    });
  },

  // Get movie detail
  getMovieDetail: async (slug) => {
    return await backendApi.get(`/movies/detail/${slug}`);
  },

  // Search movies
  searchMovies: async (keyword, options = {}) => {
    return await backendApi.get('/movies/search', {
      params: { keyword, ...options }
    });
  },

  // Get categories
  getCategories: async () => {
    return await backendApi.get('/movies/categories');
  },

  // Get movies by category
  getMoviesByCategory: async (slug, options = {}) => {
    return await backendApi.get(`/movies/category/${slug}`, {
      params: options
    });
  },

  // Get countries
  getCountries: async () => {
    return await backendApi.get('/movies/countries');
  },

  // Get movies by country
  getMoviesByCountry: async (slug, options = {}) => {
    return await backendApi.get(`/movies/country/${slug}`, {
      params: options
    });
  },

  // Get movies by year
  getMoviesByYear: async (year, options = {}) => {
    return await backendApi.get(`/movies/year/${year}`, {
      params: options
    });
  },

  // Get TMDB info
  getTMDBInfo: async (type, id) => {
    return await backendApi.get(`/movies/tmdb/${type}/${id}`);
  },

  // Get optimized image URL
  getOptimizedImageUrl: async (imageUrl) => {
    return await backendApi.get('/movies/optimize-image', {
      params: { url: imageUrl }
    });
  },

  // Get player URL
  getPlayerUrl: async (videoUrl) => {
    return await backendApi.get('/movies/player-url', {
      params: { url: videoUrl }
    });
  },
};

// Health check APIs
export const healthApi = {
  // Basic health check
  getHealth: async () => {
    return await backendApi.get('/health');
  },

  // Detailed health check
  getDetailedHealth: async () => {
    return await backendApi.get('/health/detailed');
  },

  // Database health
  getDatabaseHealth: async () => {
    return await backendApi.get('/health/database');
  },

  // KKPhim API health
  getKKPhimApiHealth: async () => {
    return await backendApi.get('/health/kkphim-api');
  },
};

export default backendApi;
