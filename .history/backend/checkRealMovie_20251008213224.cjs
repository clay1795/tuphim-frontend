const axios = require('axios');

async function checkRealMovie() {
  try {
    console.log('Checking real movie data...');
    
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
    
    // Check the movie with real ID
    const checkResponse = await axios.get('http://localhost:3001/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (checkResponse.data.success) {
      const favorites = checkResponse.data.data.favorites || [];
      const movie = favorites.find(fav => fav.movieId === 'ef7376488f5cf2a998740274c1ea1f29');
      
      if (movie) {
        console.log('📋 Movie data:');
        console.log(`   Vietnamese name: ${movie.movieName}`);
        console.log(`   English name: ${movie.originalName || 'Not set'}`);
        console.log(`   Has English name: ${movie.originalName ? '✅' : '❌'}`);
        console.log(`   Expected English: Queen Of Bones`);
        console.log(`   Got correct English: ${movie.originalName === 'Queen Of Bones' ? '✅' : '❌'}`);
        
        if (movie.originalName === 'Queen Of Bones') {
          console.log('\n🎉 SUCCESS! English name is working correctly!');
        } else {
          console.log('\n❌ ISSUE: English name is not being updated correctly');
          console.log(`   Got: "${movie.originalName}"`);
          console.log(`   Expected: "Queen Of Bones"`);
        }
      } else {
        console.log('❌ Movie not found');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

checkRealMovie();
