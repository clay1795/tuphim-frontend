// Vite Environment Configuration
// This file helps configure API endpoints for different environments

export const getApiTarget = () => {
  // Check if Dev Tunnel URL is provided
  const devTunnelUrl = 'https://33ss6xpk-3001.asse.devtunnels.ms';
  const localhostUrl = 'http://localhost:3001';
  
  // You can change this to switch between environments
  const useDevTunnel = true; // Set to false to use localhost only
  
  if (useDevTunnel) {
    console.log('🚀 Using Dev Tunnel:', devTunnelUrl);
    return devTunnelUrl;
  } else {
    console.log('🏠 Using localhost:', localhostUrl);
    return localhostUrl;
  }
};

// Export for use in vite.config.js
export default {
  apiTarget: getApiTarget()
};
