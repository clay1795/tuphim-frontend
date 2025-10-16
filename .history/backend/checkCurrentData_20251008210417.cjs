const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkCurrentData() {
  try {
    console.log('Checking current user data...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`Favorites count: ${user.preferences.favorites.length}`);
    console.log(`Watchlist count: ${user.preferences.watchlist.length}`);
    console.log(`History count: ${user.preferences.watchHistory.length}`);
    
    console.log('\n📋 Favorites data:');
    user.preferences.favorites.forEach((fav, index) => {
      console.log(`${index + 1}. ${fav.movieName}`);
      console.log(`   ID: ${fav.movieId}`);
      console.log(`   Slug: ${fav.movieSlug}`);
      console.log(`   Poster: ${fav.poster_url}`);
      console.log(`   Thumb: ${fav.thumb_url}`);
      console.log(`   Banner: ${fav.banner_url}`);
      console.log(`   Original: ${fav.originalName}`);
      console.log(`   Added: ${fav.addedAt}`);
      console.log('   ---');
    });
    
    console.log('\n📋 Watchlist data:');
    user.preferences.watchlist.forEach((item, index) => {
      console.log(`${index + 1}. ${item.movieName}`);
      console.log(`   ID: ${item.movieId}`);
      console.log(`   Slug: ${item.movieSlug}`);
      console.log(`   Poster: ${item.poster_url}`);
      console.log(`   Thumb: ${item.thumb_url}`);
      console.log(`   Banner: ${item.banner_url}`);
      console.log(`   Original: ${item.originalName}`);
      console.log(`   Added: ${item.addedAt}`);
      console.log('   ---');
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentData();
