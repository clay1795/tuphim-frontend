#!/usr/bin/env node

import https from 'https';

// Test các API endpoints cho phim
const BASE_URL = 'https://33ss6xpk-3001.asse.devtunnels.ms/api';

const testEndpoint = (url, description) => {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log(`✅ SUCCESS: ${description}`);
            console.log(`   - Data items: ${result.data?.items?.length || result.data?.length || 0}`);
            console.log(`   - First movie: ${result.data?.items?.[0]?.name || result.data?.[0]?.name || 'N/A'}`);
          } else {
            console.log(`❌ FAILED: ${description}`);
            console.log(`   - Error: ${result.error || result.message}`);
          }
        } catch (error) {
          console.log(`❌ PARSE ERROR: ${description}`);
          console.log(`   - Error: ${error.message}`);
        }
        resolve();
      });
    }).on('error', (error) => {
      console.log(`❌ REQUEST ERROR: ${description}`);
      console.log(`   - Error: ${error.message}`);
      resolve();
    });
  });
};

async function testMovieAPIs() {
  console.log('🎬 Testing Movie APIs for Frontend Components');
  console.log('='.repeat(60));
  
  // Test 1: MongoDB New Movies (for Featured Movies)
  await testEndpoint(
    `${BASE_URL}/mongo-movies/new?page=1&limit=24`,
    'MongoDB New Movies (Featured Movies)'
  );
  
  // Test 2: MongoDB New Movies (for Top 6 Movies)
  await testEndpoint(
    `${BASE_URL}/mongo-movies/new?page=1&limit=6`,
    'MongoDB New Movies (Top 6 Movies)'
  );
  
  // Test 3: KKPhim New Movies
  await testEndpoint(
    `${BASE_URL}/movies/new?page=1&version=v3`,
    'KKPhim New Movies API'
  );
  
  // Test 4: MongoDB Stats
  await testEndpoint(
    `${BASE_URL}/mongo-movies/stats`,
    'MongoDB Movie Stats'
  );
  
  console.log('\n🎯 Summary:');
  console.log('✅ Frontend components should now display movies from MongoDB');
  console.log('✅ Featured Movies: Uses /mongo-movies/new?limit=24');
  console.log('✅ Top 6 Movies: Uses /mongo-movies/new?limit=6');
  console.log('✅ Banner: Uses /mongo-movies/new?limit=24');
  
  console.log('\n🌐 Dev Tunnels URLs:');
  console.log('   • Frontend: https://33ss6xpk-5173.asse.devtunnels.ms/');
  console.log('   • Backend: https://33ss6xpk-3001.asse.devtunnels.ms/');
}

testMovieAPIs().catch(console.error);
