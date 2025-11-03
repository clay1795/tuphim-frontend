const axios = require('axios');

async function testCorrectRemoveAndAdd() {
  try {
    console.log('Testing correct remove and add...');
    
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
    
    // Remove existing movie with correct ID
    console.log('\n1. Removing existing movie with correct ID...');
    try {
      await axios.delete('http://localhost:3001/api/users/favorites/ef7376488f5cf2a998740274c1ea1f29', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Removed existing movie');
    } catch (error) {
      console.log('⚠️  Error removing movie:', error.response?.data?.message);
    }
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add movie with minimal data (only required fields)
    console.log('\n2. Adding movie with minimal data...');
    const minimalMovieData = {
      movieId: 'test-minimal-001',
      movieSlug: 'hai-cot-tham-thi'
    };
    
    console.log('📋 Sending minimal movie data:', minimalMovieData);
    
    const addResponse = await axios.post('http://localhost:3001/api/users/favorites', minimalMovieData, {
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
        const addedMovie = favorites.find(fav => fav.movieId === 'test-minimal-001');
        
        if (addedMovie) {
          console.log('📋 Added movie data:');
          console.log(`   Vietnamese name: ${addedMovie.movieName}`);
          console.log(`   English name: ${addedMovie.originalName || 'Not set'}`);
          console.log(`   Has English name: ${addedMovie.originalName ? '✅' : '❌'}`);
          console.log(`   Expected English: Queen Of Bones`);
          console.log(`   Got correct English: ${addedMovie.originalName === 'Queen Of Bones' ? '✅' : '❌'}`);
          
          if (addedMovie.originalName === 'Queen Of Bones') {
            console.log('\n🎉 SUCCESS! English name is working correctly!');
          } else {
            console.log('\n❌ ISSUE: English name is not being updated correctly');
            console.log(`   Got: "${addedMovie.originalName}"`);
            console.log(`   Expected: "Queen Of Bones"`);
          }
        } else {
          console.log('❌ Added movie not found in favorites');
          console.log('📋 All favorites:', favorites.map(fav => ({ id: fav.movieId, name: fav.movieName })));
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

testCorrectRemoveAndAdd();
