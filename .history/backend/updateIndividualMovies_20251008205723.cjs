const mongoose = require('mongoose');
const User = require('./models/User');
const kkphimApi = require('./services/kkphimApi');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateIndividualMovies() {
  try {
    console.log('Updating individual movies with real data...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`Current favorites count: ${user.preferences.favorites.length}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Update each favorite individually
    for (let i = 0; i < user.preferences.favorites.length; i++) {
      const favorite = user.preferences.favorites[i];
      console.log(`\n${i + 1}. Processing: ${favorite.movieName}`);
      
      // Skip if already has real data (has poster_url from phimimg.com)
      if (favorite.poster_url && favorite.poster_url.includes('phimimg.com')) {
        console.log('   ✅ Already has real data, skipping...');
        skippedCount++;
        continue;
      }
      
      // Try to get real data from KKPhim API
      if (favorite.movieSlug) {
        try {
          console.log(`   🔍 Fetching real data for slug: ${favorite.movieSlug}`);
          const kkphimData = await kkphimApi.getMovieDetail(favorite.movieSlug);
          
          if (kkphimData && kkphimData.movie) {
            const movie = kkphimData.movie;
            
            // Update with real data
            user.preferences.favorites[i] = {
              ...favorite,
              movieId: movie._id || favorite.movieId,
              movieSlug: movie.slug || favorite.movieSlug,
              movieName: movie.name || favorite.movieName,
              originalName: movie.origin_name || favorite.originalName,
              poster_url: movie.poster_url || favorite.poster_url,
              thumb_url: movie.thumb_url || favorite.thumb_url,
              banner_url: movie.banner_url || favorite.banner_url,
              addedAt: favorite.addedAt
            };
            
            console.log(`   ✅ Updated with real data: ${movie.name}`);
            console.log(`   📸 Poster: ${movie.poster_url}`);
            updatedCount++;
          } else {
            console.log('   ⚠️  No movie data found in API response');
            errorCount++;
          }
        } catch (apiError) {
          console.log(`   ❌ API Error: ${apiError.message}`);
          errorCount++;
        }
      } else {
        console.log('   ⚠️  No movieSlug available');
        errorCount++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save updated user
    await user.save();
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updatedCount} movies`);
    console.log(`⏭️  Skipped: ${skippedCount} movies (already have real data)`);
    console.log(`❌ Errors: ${errorCount} movies`);
    console.log(`📋 Total: ${user.preferences.favorites.length} movies`);
    
    // Show final results
    console.log('\n📋 Final favorites data:');
    user.preferences.favorites.forEach((fav, index) => {
      const hasRealData = fav.poster_url && fav.poster_url.includes('phimimg.com');
      console.log(`${index + 1}. ${fav.movieName} ${hasRealData ? '✅' : '❌'}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateIndividualMovies();
