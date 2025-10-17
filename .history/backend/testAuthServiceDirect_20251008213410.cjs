const authService = require('./services/authService');

async function testAuthServiceDirect() {
  try {
    console.log('Testing AuthService directly...');
    
    // Find user ID
    const User = require('./models/User');
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (${user._id})`);
    
    // Test addToFavorites
    const movieData = {
      movieId: 'test-auth-service-001',
      movieSlug: 'hai-cot-tham-thi',
      movieName: 'Test Auth Service Movie',
      originalName: 'Test Auth Service Original',
      poster_url: 'https://example.com/sample-poster.jpg',
      thumb_url: 'https://example.com/sample-thumb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg'
    };
    
    console.log('📋 Testing addToFavorites with data:', movieData);
    
    const result = await authService.addToFavorites(user._id.toString(), movieData);
    
    console.log('📋 addToFavorites result:', result);
    
    // Check the result
    if (result && result.preferences && result.preferences.favorites) {
      const addedMovie = result.preferences.favorites.find(fav => fav.movieId === 'test-auth-service-001');
      
      if (addedMovie) {
        console.log('📋 Added movie data:');
        console.log(`   Vietnamese name: ${addedMovie.movieName}`);
        console.log(`   English name: ${addedMovie.originalName || 'Not set'}`);
        console.log(`   Has English name: ${addedMovie.originalName ? '✅' : '❌'}`);
        console.log(`   Expected English: Queen Of Bones`);
        console.log(`   Got correct English: ${addedMovie.originalName === 'Queen Of Bones' ? '✅' : '❌'}`);
        
        if (addedMovie.originalName === 'Queen Of Bones') {
          console.log('\n🎉 SUCCESS! AuthService is working correctly!');
        } else {
          console.log('\n❌ ISSUE: AuthService is not working correctly');
          console.log(`   Got: "${addedMovie.originalName}"`);
          console.log(`   Expected: "Queen Of Bones"`);
        }
      } else {
        console.log('❌ Added movie not found in result');
      }
    } else {
      console.log('❌ Invalid result structure');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAuthServiceDirect();
