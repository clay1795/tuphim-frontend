const axios = require('axios');

async function testEnglishNameFix() {
  try {
    console.log('Testing English name fix...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      identifier: 'luongchienhieplch@gmail.com',
      password: 'luongHiep2k5'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Clear existing favorites
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test with movie that has English name
    console.log('\n2. Adding movie with English name...');
    const movieData = {
      movieId: 'test-english-fix-001',
      movieSlug: 'nguoi-lai-khinh-khi-cau' // This should have English name "The Balloonist"
    };
    
    console.log('📋 Sending movie data:', movieData);
    
    const addResponse = await axios.post('http://localhost:3001/api/users/favorites', movieData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Add response:', addResponse.data.success ? 'SUCCESS' : 'FAILED');
    
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
          console.log('\n🎉 SUCCESS! English name fix is working!');
        } else {
          console.log('\n❌ ISSUE: English name fix is not working');
          console.log(`   Got: "${favorites[0]?.originalName || 'Not set'}"`);
          console.log(`   Expected: "The Balloonist"`);
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

testEnglishNameFix();
