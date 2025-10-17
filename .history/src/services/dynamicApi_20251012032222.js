// Dynamic API Service - Tự động chọn API URL dựa trên environment
const getApiBaseUrl = () => {
  // Nếu đang chạy trên VS Code Port Forwarding domain
  if (window.location.hostname.includes('app.github.dev') || 
      window.location.hostname.includes('githubpreview.dev') ||
      window.location.hostname.includes('github.dev')) {
    
    // Sử dụng Backend URL từ VS Code Port Forwarding
    // TODO: Thay đổi URL này thành Backend URL thực tế từ VS Code
    return 'https://YOUR_BACKEND_VSCODE_URL.app.github.dev';
  }
  
  // Nếu đang chạy trên ngrok domain
  if (window.location.hostname.includes('ngrok.io') || 
      window.location.hostname.includes('ngrok-free.dev') ||
      window.location.hostname.includes('loca.lt')) {
    
    // Sử dụng Backend URL từ ngrok
    return 'https://YOUR_BACKEND_NGROK_URL.ngrok.io';
  }
  
  // Nếu chạy local, sử dụng proxy
  return '/api';
};

export const dynamicApi = {
  baseURL: getApiBaseUrl(),
  
  // Helper function để update API URL khi có Backend URL mới
  updateBackendUrl: (newBackendUrl) => {
    if (newBackendUrl) {
      dynamicApi.baseURL = newBackendUrl;
      console.log('🔄 Updated API URL to:', newBackendUrl);
    }
  },
  
  // Helper function để lấy current API URL
  getCurrentUrl: () => {
    return dynamicApi.baseURL;
  }
};

// Log current API configuration
console.log('🌐 Current API Base URL:', dynamicApi.baseURL);
console.log('📍 Current hostname:', window.location.hostname);

export default dynamicApi;
