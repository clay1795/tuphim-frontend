const mongoose = require('mongoose');
const User = require('./models/User');
const kkphimApi = require('./services/kkphimApi');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testSpecificMovie() {
  try {
    console.log('Testing specific movie: Tiến Lên! Chiến Đội Thất Sủng!...');
    
    // Test getting movie detail for "Tiến Lên! Chiến Đội Thất Sủng! (Sentai Daishikkaku) (Phần 1)"
    const movieSlug = 'tien-len-chien-doi-that-sung-sentai-daishikkaku-phan-1';
    console.log(`\n1. Testing getMovieDetail for slug: ${movieSlug}`);
    
    const movieDetail = await kkphimApi.getMovieDetail(movieSlug);
    console.log('Movie detail response:', JSON.stringify(movieDetail, null, 2));
    
    if (movieDetail && movieDetail.movie) {
      const movie = movieDetail.movie;
      console.log(`\n✅ Movie found: ${movie.name}`);
      console.log(`- ID: ${movie._id}`);
      console.log(`- Slug: ${movie.slug}`);
      console.log(`- Original Name: ${movie.origin_name}`);
      console.log(`- Poster: ${movie.poster_url}`);
      console.log(`- Thumb: ${movie.thumb_url}`);
      console.log(`- Banner: ${movie.banner_url}`);
      
      // Test adding to user favorites
      console.log('\n2. Testing add to user favorites...');
      const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
      
      if (user) {
        console.log(`Found user: ${user.email}`);
        
        // Create movie data
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
        
        // Check if already in favorites
        const existingItem = user.preferences.favorites.find(
          item => item.movieId === movie._id
        );
        
        if (existingItem) {
          console.log('Movie already in favorites');
        } else {
          // Add to favorites
          user.preferences.favorites.push(movieData);
          await user.save();
          console.log('✅ Movie added to favorites successfully!');
          console.log(`Favorites count: ${user.preferences.favorites.length}`);
        }
      } else {
        console.log('❌ User not found');
      }
    } else {
      console.log('❌ Failed to get movie detail');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSpecificMovie();
