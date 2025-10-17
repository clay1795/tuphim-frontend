const axios = require('axios');

async function clearAndTestNewMovie() {
  try {
    console.log('Clearing old data and testing with new movie...');
    
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
    
    // Clear all favorites
    console.log('\n2. Clearing all favorites...');
    const favoritesResponse = await axios.get('http://localhost:3001/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (favoritesResponse.data.success) {
      const favorites = favoritesResponse.data.data.favorites || [];
      console.log(`📋 Found ${favorites.length} favorites to remove`);
      
      for (const fav of favorites) {
        console.log(`   Removing: ${fav.movieName} (${fav.movieId})`);
        try {
          await axios.delete(`http://localhost:3001/api/users/favorites/${fav.movieId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`   ✅ Removed: ${fav.movieName}`);
        } catch (error) {
          console.log(`   ❌ Failed to remove: ${fav.movieName}`, error.response?.data?.message);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add a new movie with real data
    console.log('\n3. Adding new movie with real data...');
    const testMovieData = {
      movieId: 'test-movie-new-001',
      movieSlug: 'hai-cot-tham-thi', // Real slug with English name
      movieName: 'Test Movie New',
      originalName: 'Test Movie New Original',
      poster_url: 'https://example.com/sample-poster-new.jpg',
      thumb_url: 'https://example.com/sample-thumb-new.jpg',
      banner_url: 'https://example.com/sample-banner-new.jpg'
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
      console.log('\n4. Checking added movie...');
      const checkResponse = await axios.get('http://localhost:3001/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkResponse.data.success) {
        const favorites = checkResponse.data.data.favorites || [];
        const addedMovie = favorites.find(fav => fav.movieId === 'test-movie-new-001');
        
        if (addedMovie) {
          console.log('📋 Added movie data:');
          console.log(`   Vietnamese name: ${addedMovie.movieName}`);
          console.log(`   English name: ${addedMovie.originalName || 'Not set'}`);
          console.log(`   Has English name: ${addedMovie.originalName ? '✅' : '❌'}`);
          console.log(`   Poster: ${addedMovie.poster_url}`);
          console.log(`   Expected English: Queen Of Bones`);
          console.log(`   Got correct English: ${addedMovie.originalName === 'Queen Of Bones' ? '✅' : '❌'}`);
          
          if (addedMovie.originalName === 'Queen Of Bones') {
            console.log('\n🎉 SUCCESS! English name is working correctly!');
          } else {
            console.log('\n❌ ISSUE: English name is not being updated correctly');
          }
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

clearAndTestNewMovie();
