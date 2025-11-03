// API Configuration Utility
// Handles dynamic API URL detection for different environments

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
  
  // For other environments (production, staging, etc.)
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

// Cached API base URL to avoid repeated calculations
let cachedApiBaseUrl = null;

export const getApiUrl = (endpoint = '') => {
  if (!cachedApiBaseUrl) {
    cachedApiBaseUrl = getApiBaseUrl();
  }
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${cachedApiBaseUrl}${cleanEndpoint}`;
};

// Helper function to get full API URL with query parameters
export const buildApiUrl = (endpoint, params = {}) => {
  const baseUrl = getApiUrl(endpoint);
  
  if (Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const queryString = new URLSearchParams(params).toString();
  return `${baseUrl}?${queryString}`;
};

// Debug function to log current API configuration
export const logApiConfig = () => {
  const config = {
    hostname: window.location.hostname,
    origin: window.location.origin,
    apiBaseUrl: getApiUrl(),
    environment: import.meta.env.MODE,
    viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL
  };
  
  console.log('🔧 API Configuration:', config);
  return config;
};

// Force refresh API URL (useful for development)
export const refreshApiUrl = () => {
  cachedApiBaseUrl = null;
  return getApiUrl();
};

export default {
  getApiUrl,
  buildApiUrl,
  logApiConfig,
  refreshApiUrl
};
