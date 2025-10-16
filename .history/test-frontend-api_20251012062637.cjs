// Test script to verify frontend API calls
const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API calls...\n');
  
  try {
    // Test MongoDB Stats API
    console.log('1. Testing MongoDB Stats API...');
    const statsResponse = await axios.get('http://localhost:3001/api/mongo-movies/stats');
    console.log('✅ Stats API:', statsResponse.data.data.totalMovies, 'movies');
    
    // Test MongoDB Search API (no filters)
    console.log('\n2. Testing MongoDB Search API (no filters)...');
    const searchResponse = await axios.get('http://localhost:3001/api/mongo-movies/search?keyword=&page=1&limit=5');
    console.log('✅ Search API:', searchResponse.data.data.items.length, 'movies found');
    console.log('   Total pages:', searchResponse.data.data.pagination.totalPages);
    console.log('   Sample movie:', searchResponse.data.data.items[0]?.name);
    
    // Test MongoDB New Movies API
    console.log('\n3. Testing MongoDB New Movies API...');
    const newMoviesResponse = await axios.get('http://localhost:3001/api/mongo-movies/new?page=1&limit=3');
    console.log('✅ New Movies API:', newMoviesResponse.data.data.items.length, 'movies');
    console.log('   Sample movie:', newMoviesResponse.data.data.items[0]?.name);
    
    console.log('\n🎉 All MongoDB APIs are working correctly!');
    console.log('📊 Total movies available:', statsResponse.data.data.totalMovies);
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testFrontendAPI();
