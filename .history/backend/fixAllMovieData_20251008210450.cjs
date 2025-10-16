const mongoose = require('mongoose');
const User = require('./models/User');
const kkphimApi = require('./services/kkphimApi');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixAllMovieData() {
  try {
    console.log('Fixing all movie data with real data from KKPhim API...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    let totalUpdated = 0;
    let totalErrors = 0;
    
    // Fix favorites
    console.log('\n🎬 Fixing favorites...');
    for (let i = 0; i < user.preferences.favorites.length; i++) {
      const favorite = user.preferences.favorites[i];
      console.log(`\n${i + 1}. Processing: ${favorite.movieName}`);
      
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
            
            console.log(`   ✅ Updated: ${movie.name}`);
            console.log(`   📸 Poster: ${movie.poster_url}`);
            totalUpdated++;
          } else {
            console.log('   ⚠️  No movie data found in API response');
            totalErrors++;
          }
        } catch (apiError) {
          console.log(`   ❌ API Error: ${apiError.message}`);
          totalErrors++;
        }
      } else {
        console.log('   ⚠️  No movieSlug available');
        totalErrors++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Fix watchlist
    console.log('\n📋 Fixing watchlist...');
    for (let i = 0; i < user.preferences.watchlist.length; i++) {
      const item = user.preferences.watchlist[i];
      console.log(`\n${i + 1}. Processing: ${item.movieName}`);
      
      if (item.movieSlug) {
        try {
          console.log(`   🔍 Fetching real data for slug: ${item.movieSlug}`);
          const kkphimData = await kkphimApi.getMovieDetail(item.movieSlug);
          
          if (kkphimData && kkphimData.movie) {
            const movie = kkphimData.movie;
            
            // Update with real data
            user.preferences.watchlist[i] = {
              ...item,
              movieId: movie._id || item.movieId,
              movieSlug: movie.slug || item.movieSlug,
              movieName: movie.name || item.movieName,
              originalName: movie.origin_name || item.originalName,
              poster_url: movie.poster_url || item.poster_url,
              thumb_url: movie.thumb_url || item.thumb_url,
              banner_url: movie.banner_url || item.banner_url,
              addedAt: item.addedAt
            };
            
            console.log(`   ✅ Updated: ${movie.name}`);
            console.log(`   📸 Poster: ${movie.poster_url}`);
            totalUpdated++;
          } else {
            console.log('   ⚠️  No movie data found in API response');
            totalErrors++;
          }
        } catch (apiError) {
          console.log(`   ❌ API Error: ${apiError.message}`);
          totalErrors++;
        }
      } else {
        console.log('   ⚠️  No movieSlug available');
        totalErrors++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save updated user
    await user.save();
    
    console.log('\n📊 Fix Summary:');
    console.log(`✅ Updated: ${totalUpdated} movies`);
    console.log(`❌ Errors: ${totalErrors} movies`);
    console.log(`📋 Total favorites: ${user.preferences.favorites.length}`);
    console.log(`📋 Total watchlist: ${user.preferences.watchlist.length}`);
    
    // Show final results
    console.log('\n📋 Final favorites data:');
    user.preferences.favorites.forEach((fav, index) => {
      const hasRealData = fav.poster_url && fav.poster_url.includes('phimimg.com');
      console.log(`${index + 1}. ${fav.movieName} ${hasRealData ? '✅' : '❌'}`);
      if (hasRealData) {
        console.log(`   📸 ${fav.poster_url}`);
      }
    });
    
    console.log('\n📋 Final watchlist data:');
    user.preferences.watchlist.forEach((item, index) => {
      const hasRealData = item.poster_url && item.poster_url.includes('phimimg.com');
      console.log(`${index + 1}. ${item.movieName} ${hasRealData ? '✅' : '❌'}`);
      if (hasRealData) {
        console.log(`   📸 ${item.poster_url}`);
      }
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllMovieData();
