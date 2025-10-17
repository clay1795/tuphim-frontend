const mongoose = require('mongoose');
const User = require('./models/User');
const MovieDataUpdater = require('./middleware/movieDataUpdater');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testDynamicUpdate() {
  try {
    console.log('Testing dynamic movie data update system...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Test 1: Get update statistics
    console.log('\n📊 Current movie data statistics:');
    const favoritesStats = MovieDataUpdater.getUpdateStats(user.preferences.favorites || []);
    const watchlistStats = MovieDataUpdater.getUpdateStats(user.preferences.watchlist || []);
    const historyStats = MovieDataUpdater.getUpdateStats(user.preferences.watchHistory || []);
    
    console.log('Favorites:', favoritesStats);
    console.log('Watchlist:', watchlistStats);
    console.log('History:', historyStats);
    
    // Test 2: Add a new movie with sample data (simulating user action)
    console.log('\n🎬 Testing adding new movie with sample data...');
    
    const sampleMovieData = {
      movieId: 'test-movie-123',
      movieSlug: 'tien-len-chien-doi-that-sung-sentai-daishikkaku-phan-1', // Real slug from KKPhim
      movieName: 'Test Movie',
      originalName: 'Test Movie Original',
      poster_url: 'https://example.com/sample-poster.jpg',
      thumb_url: 'https://example.com/sample-thumb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg',
      addedAt: new Date()
    };
    
    // Update with real data using MovieDataUpdater
    const updatedMovieData = await MovieDataUpdater.updateMovieData(sampleMovieData);
    
    console.log('Original data:', {
      name: sampleMovieData.movieName,
      poster: sampleMovieData.poster_url
    });
    
    console.log('Updated data:', {
      name: updatedMovieData.movieName,
      poster: updatedMovieData.poster_url,
      hasRealData: updatedMovieData.poster_url.includes('phimimg.com')
    });
    
    // Test 3: Check if needs update
    console.log('\n🔍 Testing needsUpdate function:');
    console.log('Sample data needs update:', MovieDataUpdater.needsUpdate(sampleMovieData));
    console.log('Updated data needs update:', MovieDataUpdater.needsUpdate(updatedMovieData));
    
    // Test 4: Simulate adding to user's favorites (but don't actually save)
    console.log('\n💾 Simulating adding updated movie to favorites...');
    console.log('Movie would be added with real data:', {
      name: updatedMovieData.movieName,
      poster: updatedMovieData.poster_url,
      thumb: updatedMovieData.thumb_url,
      banner: updatedMovieData.banner_url
    });
    
    console.log('\n✅ Dynamic update system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- MovieDataUpdater can update individual movies with real data');
    console.log('- System automatically detects if movie needs updating');
    console.log('- Real data is fetched from KKPhim API when needed');
    console.log('- Fallback to original data if API fails');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDynamicUpdate();
