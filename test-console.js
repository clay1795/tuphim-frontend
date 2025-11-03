// Test script để chạy trong browser console
console.log('🎬 Testing TupPhim API...');

// Test 1: Check API URL detection
console.log('📍 Current origin:', window.location.origin);
console.log('📍 Current hostname:', window.location.hostname);

// Test 2: Test API connection
async function testAPIConnection() {
  try {
    console.log('🔄 Testing API connection...');
    
    // Test different API URLs
    const urls = [
      'https://33ss6xpk-3001.asse.devtunnels.ms/api/mongo-movies/stats',
      'http://localhost:3001/api/mongo-movies/stats'
    ];
    
    for (const url of urls) {
      try {
        console.log(`Testing: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`✅ Success: ${url}`, data);
        break;
      } catch (error) {
        console.log(`❌ Failed: ${url}`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Test 3: Test Movies API
async function testMoviesAPI() {
  try {
    console.log('🔄 Testing Movies API...');
    
    const url = 'https://33ss6xpk-3001.asse.devtunnels.ms/api/mongo-movies/new?page=1&limit=6';
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data.items) {
      console.log('✅ Movies loaded:', data.data.items.length);
      console.log('First movie:', data.data.items[0]);
    } else {
      console.log('❌ No movies found:', data);
    }
  } catch (error) {
    console.error('❌ Movies API test failed:', error);
  }
}

// Test 4: Check if getApiUrl function exists
function testApiConfig() {
  try {
    console.log('🔄 Testing API config...');
    
    // Check if we can access the API config
    if (typeof window !== 'undefined') {
      console.log('Window object exists');
      
      // Try to simulate the getApiUrl function
      const getApiUrl = () => {
        if (window.location.origin.includes('devtunnels.ms')) {
          const tunnelId = window.location.origin.split('-')[0].split('//')[1];
          return `https://${tunnelId}-3001.asse.devtunnels.ms/api`;
        }
        return 'http://localhost:3001/api';
      };
      
      const apiUrl = getApiUrl();
      console.log('✅ API URL detected:', apiUrl);
      
      return apiUrl;
    } else {
      console.log('❌ Window object not available');
    }
  } catch (error) {
    console.error('❌ API config test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting all API tests...');
  
  testApiConfig();
  await testAPIConnection();
  await testMoviesAPI();
  
  console.log('✅ All tests completed!');
}

// Auto-run tests
runAllTests();

// Export functions for manual testing
window.testAPIConnection = testAPIConnection;
window.testMoviesAPI = testMoviesAPI;
window.testApiConfig = testApiConfig;
window.runAllTests = runAllTests;

