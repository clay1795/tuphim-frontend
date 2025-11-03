// API Configuration - Dynamic URL detection for localhost vs tunnel
// This ensures compatibility with both localhost and VS Code Port Forwarding

// Detect if we're running in a tunnel environment
const isTunnelEnvironment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('.devtunnels.ms') || 
         hostname.includes('.vscode.dev') || 
         hostname.includes('.ngrok.io') || 
         hostname.includes('.ngrok-free.dev') ||
         hostname.includes('.loca.lt') ||
         hostname.includes('.preview.app.github.dev') ||
         hostname.includes('.app.github.dev') ||
         hostname.includes('.githubpreview.dev') ||
         hostname.includes('.github.dev') ||
         hostname.includes('.tunnel') ||
         hostname.includes('.forwarded');
};

// Get the tunnel backend URL
const getTunnelBackendUrl = () => {
  const currentUrl = window.location.origin;
  // Replace frontend port with backend port
  return currentUrl.replace(':5173', ':3001').replace(':5174', ':3001').replace(':5175', ':3001').replace(':5176', ':3001');
};

// Dynamic API base URL
const getApiBaseUrl = () => {
  // Check environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in tunnel environment
  if (isTunnelEnvironment()) {
    const tunnelUrl = getTunnelBackendUrl();
    console.log('🌐 Tunnel environment detected, using backend URL:', tunnelUrl);
    return `${tunnelUrl}/api`;
  }
  
  // Default to localhost
  return 'http://localhost:3001/api';
};

// Export configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  IS_TUNNEL: isTunnelEnvironment(),
  TUNNEL_BACKEND_URL: isTunnelEnvironment() ? getTunnelBackendUrl() : null,
  
  // Helper function to get full API URL
  getApiUrl: (endpoint) => {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  },
  
  // Helper function to get backend URL without /api
  getBackendUrl: () => {
    if (isTunnelEnvironment()) {
      return getTunnelBackendUrl();
    }
    return 'http://localhost:3001';
  }
};

// Log configuration for debugging
console.log('🔧 API Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  isTunnel: API_CONFIG.IS_TUNNEL,
  tunnelBackendUrl: API_CONFIG.TUNNEL_BACKEND_URL,
  currentOrigin: window.location.origin
});

export default API_CONFIG;
