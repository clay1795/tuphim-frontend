const kkphimApi = require('./services/kkphimApi');
require('dotenv').config({ path: './env_new' });

async function debugKKPhimAPI() {
  try {
    console.log('🔍 Testing KKPhim API...');
    
    // Test 1: Get new movies
    console.log('\n📡 Testing getNewMovies...');
    const result1 = await kkphimApi.getNewMovies(1, 20);
    console.log('Result:', JSON.stringify(result1, null, 2));
    
    // Test 2: Check if API base URL is correct
    console.log('\n🌐 API Base URL:', process.env.KKPHIM_API_BASE || 'https://phimapi.com');
    
    // Test 3: Direct API call
    console.log('\n🔗 Making direct API call...');
    const fetch = require('node-fetch');
    const apiUrl = `${process.env.KKPHIM_API_BASE || 'https://phimapi.com'}/danh-sach/phim-moi-cap-nhat-v3?page=1&limit=20`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log('Direct API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugKKPhimAPI();
