// Vite Environment Configuration
// This file helps configure API endpoints for different environments

export const getApiTarget = () => {
  // Check if Dev Tunnel URL is provided
  const devTunnelUrl = 'https://33ss6xpk-3001.asse.devtunnels.ms';
  const localhostUrl = 'http://localhost:3001';
  
  // Auto-detect: use Dev Tunnel if available, otherwise localhost
  // This allows both to work simultaneously
  const useDevTunnel = process.env.VITE_USE_DEV_TUNNEL === 'true' || 
                       process.env.NODE_ENV === 'production' ||
                       (typeof window !== 'undefined' && window?.location?.origin?.includes('devtunnels.ms'));
  
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

