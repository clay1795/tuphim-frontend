const axios = require('axios');

async function testCorrectApi() {
  try {
    console.log('Testing correct KKPhim API endpoint...');
    
    // Test with the correct API endpoint that backend uses
    const slug = 'nguoi-lai-khinh-khi-cau';
    const apiUrl = `https://phimapi.com/phim/${slug}`;
    
    console.log(`📋 Checking: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`📋 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, response.headers);
    console.log(`📋 Response data type:`, typeof response.data);
    
    if (response.data && response.data.movie) {
      const movie = response.data.movie;
      console.log('\n📋 Movie data from KKPhim API:');
      console.log(`   ID: ${movie._id}`);
      console.log(`   Name: ${movie.name}`);
      console.log(`   Origin Name: ${movie.origin_name || 'NOT SET'}`);
      console.log(`   Slug: ${movie.slug}`);
      console.log(`   Has origin_name: ${movie.origin_name ? '✅' : '❌'}`);
      console.log(`   Origin name is different from name: ${movie.origin_name && movie.origin_name !== movie.name ? '✅' : '❌'}`);
      
      if (movie.origin_name && movie.origin_name !== movie.name) {
        console.log(`\n🎉 SUCCESS! Movie has English name: "${movie.origin_name}"`);
      } else {
        console.log(`\n❌ ISSUE: Movie does not have English name or it's the same as Vietnamese name`);
        console.log(`   Vietnamese name: "${movie.name}"`);
        console.log(`   Origin name: "${movie.origin_name || 'Not set'}"`);
      }
    } else {
      console.log('❌ No movie data found in response');
      console.log('📋 Response data keys:', Object.keys(response.data || {}));
      if (response.data) {
        console.log('📋 Sample response data:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      if (error.response.data) {
        console.error('Data (first 500 chars):', JSON.stringify(error.response.data, null, 2).substring(0, 500) + '...');
      }
    }
    process.exit(1);
  }
}

testCorrectApi();
