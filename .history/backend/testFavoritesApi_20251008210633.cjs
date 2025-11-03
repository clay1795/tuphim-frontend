const axios = require('axios');

async function testFavoritesApi() {
  try {
    console.log('Testing favorites API...');
    
    // First, login to get token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      identifier: 'luongchienhieplch@gmail.com',
      password: 'luongHiep2k5'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test favorites API
    console.log('\n2. Testing favorites API...');
    const favoritesResponse = await axios.get('http://localhost:3001/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Favorites API response:');
    console.log('Success:', favoritesResponse.data.success);
    console.log('Message:', favoritesResponse.data.message);
    console.log('Favorites count:', favoritesResponse.data.data?.favorites?.length || 0);
    
    if (favoritesResponse.data.data?.favorites) {
      console.log('\n📋 First 3 favorites:');
      favoritesResponse.data.data.favorites.slice(0, 3).forEach((fav, index) => {
        console.log(`${index + 1}. ${fav.movieName}`);
        console.log(`   ID: ${fav.movieId}`);
        console.log(`   Slug: ${fav.movieSlug}`);
        console.log(`   Poster: ${fav.poster_url}`);
        console.log(`   Thumb: ${fav.thumb_url}`);
        console.log(`   Banner: ${fav.banner_url}`);
        console.log(`   Original: ${fav.originalName}`);
        console.log('   ---');
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testFavoritesApi();
