const axios = require('axios');

async function testAddMovieWithEnglish() {
  try {
    console.log('Testing adding movie with English name...');
    
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
    
    // Clear existing favorites first
    console.log('\n1. Clearing existing favorites...');
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
    
    // Add movie with minimal data (only required fields)
    console.log('\n2. Adding movie with minimal data...');
    const movieData = {
      movieId: 'test-english-001',
      movieSlug: 'nguoi-lai-khinh-khi-cau' // This should have English name "The Balloonist"
    };
    
    console.log('📋 Sending movie data:', movieData);
    
    const addResponse = await axios.post('http://localhost:3001/api/users/favorites', movieData, {
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
      const checkResponse = await axios.get('http://localhost:3001/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkResponse.data.success) {
        const favorites = checkResponse.data.data.favorites || [];
        console.log(`📋 Total favorites: ${favorites.length}`);
        
        favorites.forEach((fav, index) => {
          console.log(`\n${index + 1}. ${fav.movieName}`);
          console.log(`   ID: ${fav.movieId}`);
          console.log(`   Slug: ${fav.movieSlug}`);
          console.log(`   English: ${fav.originalName || 'Not set'}`);
          console.log(`   Has English name: ${fav.originalName ? '✅' : '❌'}`);
          console.log(`   Expected English: The Balloonist`);
          console.log(`   Got correct English: ${fav.originalName === 'The Balloonist' ? '✅' : '❌'}`);
        });
        
        if (favorites.length > 0 && favorites[0].originalName === 'The Balloonist') {
          console.log('\n🎉 SUCCESS! English name is working correctly!');
        } else {
          console.log('\n❌ ISSUE: English name is not being updated correctly');
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

testAddMovieWithEnglish();
