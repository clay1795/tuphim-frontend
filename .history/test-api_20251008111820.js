// Test API script
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Testing API endpoints...');
    
    // Test backend health
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);
    
    // Test login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'luongchienhieplch@gmail.com',
        password: 'Lch1795'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login result:', loginData.success ? '✅ Success' : '❌ Failed');
    
    if (loginData.success) {
      const token = loginData.data.token;
      console.log('🎫 Token:', token.substring(0, 50) + '...');
      
      // Test get favorites
      const favoritesResponse = await fetch('http://localhost:3001/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const favoritesData = await favoritesResponse.json();
      console.log('❤️ Favorites API:', favoritesData.success ? '✅ Working' : '❌ Failed');
      console.log('📊 Favorites count:', favoritesData.data?.count || 0);
      
      if (favoritesData.data?.favorites?.length > 0) {
        const firstMovie = favoritesData.data.favorites[0];
        console.log('🎬 First movie ID:', firstMovie.movieId);
        
        // Test delete API
        const deleteResponse = await fetch(`http://localhost:3001/api/users/favorites/${firstMovie.movieId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const deleteData = await deleteResponse.json();
        console.log('🗑️ Delete test:', deleteResponse.status, deleteData);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAPI();
