const axios = require('axios');

async function checkBackendLogs() {
  try {
    console.log('Adding movie and checking backend logs...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      identifier: 'luongchienhieplch@gmail.com',
      password: 'luongHiep2k5'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Add movie
    console.log('\nAdding movie with slug: nguoi-lai-khinh-khi-cau');
    const movieData = {
      movieId: 'test-logs-001',
      movieSlug: 'nguoi-lai-khinh-khi-cau'
    };
    
    const addResponse = await axios.post('http://localhost:3001/api/users/favorites', movieData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📋 Add response:', addResponse.data);
    console.log('\n⚠️  Please check the backend console logs for:');
    console.log('   - "Updating movie data for:"');
    console.log('   - "MovieDataUpdater available:"');
    console.log('   - "Updated movie data - Name:"');
    console.log('   - "Original name:" (from MovieDataUpdater)');
    console.log('   - "Updated originalName:" (from MovieDataUpdater)');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

checkBackendLogs();
