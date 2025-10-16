// Debug script để kiểm tra components
console.log('🔍 Debug Components Script');

// Test API configuration
console.log('📍 Current origin:', window.location.origin);
console.log('📍 Current hostname:', window.location.hostname);

// Test getApiUrl function
try {
  // Import getApiUrl function
  const { getApiUrl } = await import('/src/utils/apiConfig.js');
  const apiUrl = getApiUrl();
  console.log('✅ getApiUrl():', apiUrl);
  
  // Test API call
  const response = await fetch(`${apiUrl}/mongo-movies/new?page=1&limit=6`);
  const data = await response.json();
  console.log('✅ API Response:', data);
  
  if (data.success && data.data.items) {
    console.log('✅ Movies loaded:', data.data.items.length);
    console.log('First movie:', data.data.items[0]);
  } else {
    console.log('❌ No movies found');
  }
  
} catch (error) {
  console.error('❌ Error:', error);
}

// Test if components exist
console.log('🔍 Checking components...');
const topMoviesSection = document.querySelector('[data-testid="top-movies-section"]');
const movieFeatured = document.querySelector('[data-testid="movie-featured"]');

console.log('TopMoviesSection element:', topMoviesSection);
console.log('MovieFeatured element:', movieFeatured);

// Check if React components are mounted
const reactRoot = document.querySelector('#root');
console.log('React root:', reactRoot);

// Export functions for manual testing
window.debugAPI = async () => {
  try {
    const { getApiUrl } = await import('/src/utils/apiConfig.js');
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/mongo-movies/new?page=1&limit=6`);
    const data = await response.json();
    console.log('Manual API test:', data);
    return data;
  } catch (error) {
    console.error('Manual API test error:', error);
    return null;
  }
};

window.debugComponents = () => {
  console.log('🔍 Debug Components:');
  console.log('- TopMoviesSection:', document.querySelector('[data-testid="top-movies-section"]'));
  console.log('- MovieFeatured:', document.querySelector('[data-testid="movie-featured"]'));
  console.log('- React root:', document.querySelector('#root'));
};

console.log('✅ Debug script loaded. Use window.debugAPI() and window.debugComponents() for manual testing.');
