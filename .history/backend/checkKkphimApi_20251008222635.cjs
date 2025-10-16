const axios = require('axios');

async function checkKkphimApi() {
  try {
    console.log('Checking KKPhim API for movie data...');
    
    // Test with the movie slug
    const slug = 'nguoi-lai-khinh-khi-cau';
    const apiUrl = `https://kkphim1.com/phim/${slug}`;
    
    console.log(`📋 Checking: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    console.log(`📋 Response status: ${response.status}`);
    
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
      }
    } else {
      console.log('❌ No movie data found in response');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

checkKkphimApi();
