// Test comment API directly
import commentApi from './src/services/commentApi.js';

async function testCommentApi() {
  console.log('🧪 Testing Comment API...');
  
  try {
    // Test 1: Get top comments for a specific movie
    console.log('📝 Test 1: Getting top comments for tieu-diet-ca-map');
    const response1 = await commentApi.getTopComments('tieu-diet-ca-map', 5);
    console.log('Response 1:', response1);
    
    // Test 2: Get top comments for another movie
    console.log('📝 Test 2: Getting top comments for co-gai-ca-map');
    const response2 = await commentApi.getTopComments('co-gai-ca-map', 5);
    console.log('Response 2:', response2);
    
    // Test 3: Get all comments for a movie
    console.log('📝 Test 3: Getting all comments for tieu-diet-ca-map');
    const response3 = await commentApi.getComments('tieu-diet-ca-map', 1, 10, 'newest');
    console.log('Response 3:', response3);
    
    console.log('✅ All tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCommentApi();
