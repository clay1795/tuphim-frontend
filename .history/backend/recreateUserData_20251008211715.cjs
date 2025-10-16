const mongoose = require('mongoose');
const User = require('./models/User');
const kkphimApi = require('./services/kkphimApi');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function recreateUserData() {
  try {
    console.log('Recreating user data with real movie data...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Clear existing data
    user.preferences.favorites = [];
    user.preferences.watchlist = [];
    user.preferences.watchHistory = [];
    
    // Sample movie slugs to recreate
    const sampleMovies = [
      { slug: 'co-vo-nho-nha-ho-sai', type: 'watchlist' },
      { slug: 'nguoi-lai-khinh-khi-cau', type: 'favorites' },
      { slug: 'hai-cot-tham-thi', type: 'favorites' },
      { slug: 'ong-trum-giang-ho-phan-3', type: 'watchlist' },
      { slug: 'da-den-con-lam-long', type: 'favorites' },
      { slug: 'dinh-thu-downton-hoi-ket-huy-hoang', type: 'favorites' },
      { slug: 'tham-phan-sinh-tu', type: 'favorites' },
      { slug: 'tu-xuyen-phan-2', type: 'favorites' },
      { slug: 'song-sinh-vo-hon', type: 'favorites' },
      { slug: 'quan-huu-van-phan-2', type: 'favorites' },
      { slug: 'ncis-tony-ziva', type: 'favorites' },
      { slug: 'ke-tao-mua', type: 'favorites' },
      { slug: 'tien-len-chien-doi-that-sung-sentai-daishikkaku-phan-2', type: 'favorites' }
    ];
    
    let addedCount = 0;
    let errorCount = 0;
    
    for (const movieInfo of sampleMovies) {
      console.log(`\n🎬 Processing: ${movieInfo.slug}`);
      
      try {
        const kkphimData = await kkphimApi.getMovieDetail(movieInfo.slug);
        
        if (kkphimData && kkphimData.movie) {
          const movie = kkphimData.movie;
          
          const movieData = {
            movieId: movie._id,
            movieSlug: movie.slug,
            movieName: movie.name,
            originalName: movie.origin_name,
            poster_url: movie.poster_url,
            thumb_url: movie.thumb_url,
            banner_url: movie.banner_url,
            addedAt: new Date()
          };
          
          if (movieInfo.type === 'favorites') {
            user.preferences.favorites.push(movieData);
          } else if (movieInfo.type === 'watchlist') {
            user.preferences.watchlist.push(movieData);
          }
          
          console.log(`   ✅ Added to ${movieInfo.type}: ${movie.name}`);
          console.log(`   🇺🇸 English: ${movie.origin_name}`);
          addedCount++;
        } else {
          console.log('   ⚠️  No movie data found');
          errorCount++;
        }
      } catch (apiError) {
        console.log(`   ❌ API Error: ${apiError.message}`);
        errorCount++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save updated user
    await user.save();
    
    console.log('\n📊 Recreation Summary:');
    console.log(`✅ Added: ${addedCount} movies`);
    console.log(`❌ Errors: ${errorCount} movies`);
    console.log(`📋 Favorites: ${user.preferences.favorites.length}`);
    console.log(`📋 Watchlist: ${user.preferences.watchlist.length}`);
    
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

recreateUserData();
