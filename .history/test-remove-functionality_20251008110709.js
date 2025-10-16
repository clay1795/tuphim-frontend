// Test script to check remove functionality
const fetch = require('node-fetch');

async function testRemoveFunctionality() {
  try {
    console.log('Testing remove functionality...');
    
    // Test backend health
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);
    
    // Test login to get token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'sp.doitheauto5s@gmail.com',
        password: 'luongHiep2k5'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginData.success ? '✅ Success' : '❌ Failed');
    
    if (loginData.success) {
      const token = loginData.data.token;
      
      // Test get favorites
      const favoritesResponse = await fetch('http://localhost:3001/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const favoritesData = await favoritesResponse.json();
      console.log('✅ Favorites API working:', favoritesData.success);
      console.log('Favorites count:', favoritesData.data?.count || 0);
      
      // Test get watchlist
      const watchlistResponse = await fetch('http://localhost:3001/api/users/watchlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const watchlistData = await watchlistResponse.json();
      console.log('✅ Watchlist API working:', watchlistData.success);
      console.log('Watchlist count:', watchlistData.data?.count || 0);
      
      // Test get history
      const historyResponse = await fetch('http://localhost:3001/api/users/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const historyData = await historyResponse.json();
      console.log('✅ History API working:', historyData.success);
      console.log('History count:', historyData.data?.count || 0);
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRemoveFunctionality();
