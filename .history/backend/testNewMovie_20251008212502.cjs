const axios = require('axios');

async function testNewMovie() {
  try {
    console.log('Testing adding a completely new movie...');
    
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
    
    // Add movie with sample data (different movieId)
    console.log('\n2. Adding new movie with sample data...');
    const testMovieData = {
      movieId: 'test-movie-789',
      movieSlug: 'nguoi-lai-khinh-khi-cau', // Different slug
      movieName: 'Test Movie 2',
      originalName: 'Test Movie 2 Original',
      poster_url: 'https://example.com/sample-poster-2.jpg',
      thumb_url: 'https://example.com/sample-thumb-2.jpg',
      banner_url: 'https://example.com/sample-banner-2.jpg'
    };
    
    console.log('📋 Sending movie data:', testMovieData);
    
    const addResponse = await axios.post('http://localhost:3001/api/users/favorites', testMovieData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Add response:', addResponse.data);
    
    if (addResponse.data.success) {
      console.log('✅ Movie added successfully');
      
      // Check the added movie
      console.log('\n3. Checking added movie...');
      const favoritesResponse = await axios.get('http://localhost:3001/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (favoritesResponse.data.success) {
        const favorites = favoritesResponse.data.data.favorites || [];
        const addedMovie = favorites.find(fav => fav.movieId === 'test-movie-789');
        
        if (addedMovie) {
          console.log('📋 Added movie data:');
          console.log(`   Vietnamese name: ${addedMovie.movieName}`);
          console.log(`   English name: ${addedMovie.originalName || 'Not set'}`);
          console.log(`   Has English name: ${addedMovie.originalName ? '✅' : '❌'}`);
          console.log(`   Poster: ${addedMovie.poster_url}`);
          console.log(`   Expected English: The Balloonist`);
          console.log(`   Got correct English: ${addedMovie.originalName === 'The Balloonist' ? '✅' : '❌'}`);
        } else {
          console.log('❌ Added movie not found in favorites');
        }
      }
    } else {
      console.log('❌ Failed to add movie:', addResponse.data.message);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testNewMovie();
