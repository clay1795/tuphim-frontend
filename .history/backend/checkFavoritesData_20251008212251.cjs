const axios = require('axios');

async function checkFavoritesData() {
  try {
    console.log('Checking favorites data...');
    
    // First, login to get token
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
    
    // Get favorites
    const favoritesResponse = await axios.get('http://localhost:3001/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (favoritesResponse.data.success) {
      const favorites = favoritesResponse.data.data.favorites || [];
      console.log(`📋 Total favorites: ${favorites.length}`);
      
      favorites.forEach((fav, index) => {
        console.log(`\n${index + 1}. ${fav.movieName}`);
        console.log(`   ID: ${fav.movieId}`);
        console.log(`   Slug: ${fav.movieSlug}`);
        console.log(`   English: ${fav.originalName || 'Not set'}`);
        console.log(`   Has English name: ${fav.originalName ? '✅' : '❌'}`);
        console.log(`   Poster: ${fav.poster_url}`);
      });
    } else {
      console.log('❌ Failed to get favorites:', favoritesResponse.data.message);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

checkFavoritesData();
