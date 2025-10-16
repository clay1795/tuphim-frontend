// API Configuration for TupPhim
// Auto-detect Dev Tunnels or use environment variable
const getApiBaseUrl = () => {
  // Check if we're using Dev Tunnels
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if current origin contains devtunnels
  if (window.location.origin.includes('devtunnels.ms')) {
    // Extract the tunnel ID from current origin and construct backend URL
    const tunnelId = window.location.origin.split('-')[0].split('//')[1];
    return `https://${tunnelId}-3001.asse.devtunnels.ms/api`;
  }
  
  // Default to localhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Get the base API URL
 * @returns {string} The base API URL
 */
export const getApiUrl = () => {
  return API_BASE_URL;
};

/**
 * Build a complete API URL with endpoint
 * @param {string} endpoint - The API endpoint
 * @param {Object} params - Query parameters (optional)
 * @returns {string} Complete API URL
 */
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

/**
 * Get default headers for API requests
 * @param {string} token - Authentication token (optional)
 * @returns {Object} Default headers
 */
export const getDefaultHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Make an API request with error handling
 * @param {string} url - The API URL
 * @param {Object} options - Fetch options
 * @returns {Promise} API response
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: getDefaultHeaders(),
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Export default configuration
export default {
  getApiUrl,
  buildApiUrl,
  getDefaultHeaders,
  apiRequest,
  API_BASE_URL,
};
