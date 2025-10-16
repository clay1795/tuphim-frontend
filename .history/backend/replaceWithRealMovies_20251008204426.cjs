const mongoose = require('mongoose');
const User = require('./models/User');
const kkphimApi = require('./services/kkphimApi');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function replaceWithRealMovies() {
  try {
    console.log('Replacing favorites with real movies from KKPhim API...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Get real movies from KKPhim API
    console.log('\n🔍 Fetching real movies from KKPhim API...');
    const newMovies = await kkphimApi.getNewMovies(1, 'v3');
    
    if (!newMovies.data?.items?.length) {
      console.log('❌ No movies found from API');
      return;
    }
    
    console.log(`✅ Found ${newMovies.data.items.length} real movies`);
    
    // Create new favorites list with real movies
    const realMovies = newMovies.data.items.slice(0, 12); // Take first 12 movies
    const newFavorites = [];
    
    for (let i = 0; i < realMovies.length; i++) {
      const movie = realMovies[i];
      
      const movieData = {
        movieId: movie._id,
        movieSlug: movie.slug,
        movieName: movie.name,
        originalName: movie.origin_name,
        poster_url: movie.poster_url,
        thumb_url: movie.thumb_url,
        banner_url: movie.banner_url,
        addedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Different dates
      };
      
      newFavorites.push(movieData);
      console.log(`${i + 1}. Added: ${movie.name}`);
    }
    
    // Replace user's favorites with real movies
    user.preferences.favorites = newFavorites;
    await user.save();
    
    console.log('\n✅ Successfully replaced all favorites with real movies!');
    console.log(`New favorites count: ${user.preferences.favorites.length}`);
    
    // Show final results
    console.log('\n📋 New favorites list:');
    user.preferences.favorites.forEach((fav, index) => {
      console.log(`${index + 1}. ${fav.movieName}`);
      console.log(`   - Poster: ${fav.poster_url ? '✅ Real' : '❌ Missing'}`);
      console.log(`   - Thumb: ${fav.thumb_url ? '✅ Real' : '❌ Missing'}`);
      console.log(`   - Banner: ${fav.banner_url ? '✅ Real' : '❌ Missing'}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

replaceWithRealMovies();
