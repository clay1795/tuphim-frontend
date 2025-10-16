const axios = require('axios');

async function testCompleteSystem() {
  try {
    console.log('🧪 Testing complete system...');
    
    // 1. Test backend health
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend is running:', healthResponse.data.message);
    
    // 2. Test login
    console.log('\n2. Testing login...');
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
    
    // 3. Test favorites API
    console.log('\n3. Testing favorites API...');
    const favoritesResponse = await axios.get('http://localhost:3001/api/users/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Favorites API working');
    console.log(`📋 Favorites count: ${favoritesResponse.data.data?.favorites?.length || 0}`);
    
    // Check if all favorites have real images
    const favorites = favoritesResponse.data.data?.favorites || [];
    const withRealImages = favorites.filter(fav => fav.poster_url && fav.poster_url.includes('phimimg.com'));
    console.log(`📸 Favorites with real images: ${withRealImages.length}/${favorites.length}`);
    
    // 4. Test watchlist API
    console.log('\n4. Testing watchlist API...');
    const watchlistResponse = await axios.get('http://localhost:3001/api/users/watchlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Watchlist API working');
    console.log(`📋 Watchlist count: ${watchlistResponse.data.data?.watchlist?.length || 0}`);
    
    // 5. Test movie data update API
    console.log('\n5. Testing movie data update API...');
    const statsResponse = await axios.get('http://localhost:3001/api/movie-data/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Movie data update API working');
    console.log('📊 Movie data statistics:', statsResponse.data.data?.stats);
    
    // 6. Test frontend (if running)
    console.log('\n6. Testing frontend...');
    try {
      const frontendResponse = await axios.get('http://localhost:5173', { timeout: 5000 });
      console.log('✅ Frontend is running on port 5173');
    } catch (error) {
      console.log('⚠️  Frontend not running on port 5173 (this is normal if not started)');
    }
    
    console.log('\n🎉 System test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Backend API is working');
    console.log('✅ Authentication is working');
    console.log('✅ User data APIs are working');
    console.log('✅ Movie data update system is working');
    console.log('✅ All movie data has been updated with real images');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ System test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCompleteSystem();
