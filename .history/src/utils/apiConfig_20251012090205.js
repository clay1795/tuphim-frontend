// API Configuration for different environments
const API_CONFIG = {
  // Development environment - use dev tunnels for mobile access
  development: {
    baseUrl: 'https://33ss6xpk-3001.asse.devtunnels.ms/api',
    timeout: 10000,
    retries: 3
  },
  
  // Production environment
  production: {
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 15000,
    retries: 5
  },
  
  // Local development
  local: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 10000,
    retries: 3
  }
};

// Get current environment
const getEnvironment = () => {
  // Check if we're running on dev tunnels
  if (window.location.hostname.includes('devtunnels.ms')) {
    return 'development';
  }
  
  // Check if we're on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'local';
  }
  
  // Default to production
  return 'production';
};

// Get API base URL based on environment
export const getApiUrl = () => {
  const env = getEnvironment();
  const config = API_CONFIG[env];
  
  console.log(`🌐 API Environment: ${env}`);
  console.log(`🔗 API Base URL: ${config.baseUrl}`);
  
  return config.baseUrl;
};

// Build full API URL with endpoint
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Get API configuration
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

// Check if API is accessible
export const checkApiHealth = async () => {
  try {
    const healthUrl = buildApiUrl('health');
    console.log(`🏥 Checking API health: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Health Check:', data);
      return { success: true, data };
    } else {
      console.error('❌ API Health Check Failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API Health Check Error:', error);
    return { success: false, error: error.message };
  }
};

// Make API request with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const config = getApiConfig();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.timeout,
    ...options
  };
  
  console.log(`🚀 API Request: ${defaultOptions.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return { success: true, data };
    
  } catch (error) {
    console.error(`❌ API Request Failed:`, error);
    return { success: false, error: error.message };
  }
};

export default {
  getApiUrl,
  buildApiUrl,
  getApiConfig,
  checkApiHealth,
  apiRequest
};
