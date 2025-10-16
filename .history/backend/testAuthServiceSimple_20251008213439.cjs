const authService = require('./services/authService');

async function testAuthServiceSimple() {
  try {
    console.log('Testing AuthService simple...');
    
    // Test with a simple movie data
    const movieData = {
      movieId: 'test-simple-001',
      movieSlug: 'hai-cot-tham-thi',
      movieName: 'Test Simple Movie',
      originalName: 'Test Simple Original',
      poster_url: 'https://example.com/sample-poster.jpg',
      thumb_url: 'https://example.com/sample-thumb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg'
    };
    
    console.log('📋 Testing with movie data:', movieData);
    
    // Test with a dummy user ID
    const userId = '68e5307f006a59857ebb2ca8';
    
    try {
      const result = await authService.addToFavorites(userId, movieData);
      console.log('📋 addToFavorites result:', result);
    } catch (error) {
      console.log('❌ addToFavorites error:', error.message);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAuthServiceSimple();
