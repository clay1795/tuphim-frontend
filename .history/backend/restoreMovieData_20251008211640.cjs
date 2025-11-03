const mongoose = require('mongoose');
const User = require('./models/User');
const kkphimApi = require('./services/kkphimApi');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function restoreMovieData() {
  try {
    console.log('Restoring movie data with real data from KKPhim API...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Restore favorites
    console.log('\n🎬 Restoring favorites...');
    for (let i = 0; i < user.preferences.favorites.length; i++) {
      const favorite = user.preferences.favorites[i];
      console.log(`\n${i + 1}. Processing: ${favorite.movieName || 'Unknown'}`);
      
      if (favorite.movieSlug) {
        try {
          console.log(`   🔍 Fetching real data for slug: ${favorite.movieSlug}`);
          const kkphimData = await kkphimApi.getMovieDetail(favorite.movieSlug);
          
          if (kkphimData && kkphimData.movie) {
            const movie = kkphimData.movie;
            
            // Restore with real data
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
            
            console.log(`   ✅ Restored: ${movie.name}`);
            console.log(`   📸 Poster: ${movie.poster_url}`);
            console.log(`   🇺🇸 English: ${movie.origin_name}`);
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
    
    // Restore watchlist
    console.log('\n📋 Restoring watchlist...');
    for (let i = 0; i < user.preferences.watchlist.length; i++) {
      const item = user.preferences.watchlist[i];
      console.log(`\n${i + 1}. Processing: ${item.movieName || 'Unknown'}`);
      
      if (item.movieSlug) {
        try {
          console.log(`   🔍 Fetching real data for slug: ${item.movieSlug}`);
          const kkphimData = await kkphimApi.getMovieDetail(item.movieSlug);
          
          if (kkphimData && kkphimData.movie) {
            const movie = kkphimData.movie;
            
            // Restore with real data
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
            
            console.log(`   ✅ Restored: ${movie.name}`);
            console.log(`   📸 Poster: ${movie.poster_url}`);
            console.log(`   🇺🇸 English: ${movie.origin_name}`);
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
    
    console.log('\n📊 Restore Summary:');
    console.log(`✅ Updated: ${updatedCount} movies`);
    console.log(`❌ Errors: ${errorCount} movies`);
    
    // Show final results
    console.log('\n📋 Final favorites with English names:');
    user.preferences.favorites.forEach((fav, index) => {
      console.log(`${index + 1}. ${fav.movieName}`);
      console.log(`   English: ${fav.originalName || 'Không có'}`);
      console.log(`   Has English name: ${fav.originalName ? '✅' : '❌'}`);
    });
    
    console.log('\n📋 Final watchlist with English names:');
    user.preferences.watchlist.forEach((item, index) => {
      console.log(`${index + 1}. ${item.movieName}`);
      console.log(`   English: ${item.originalName || 'Không có'}`);
      console.log(`   Has English name: ${item.originalName ? '✅' : '❌'}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

restoreMovieData();
