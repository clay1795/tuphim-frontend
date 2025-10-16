const mongoose = require('mongoose');
const User = require('./backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Find user with email luongchienhieplch@gmail.com
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`Favorites count: ${user.preferences.favorites?.length || 0}`);
    
    if (user.preferences.favorites && user.preferences.favorites.length > 0) {
      console.log('\n📋 Favorites data:');
      user.preferences.favorites.slice(0, 3).forEach((fav, index) => {
        console.log(`${index + 1}. ${fav.movieName}`);
        console.log(`   - movieId: ${fav.movieId}`);
        console.log(`   - movieSlug: ${fav.movieSlug}`);
        console.log(`   - poster_url: ${fav.poster_url}`);
        console.log(`   - thumb_url: ${fav.thumb_url}`);
        console.log(`   - banner_url: ${fav.banner_url}`);
        console.log(`   - addedAt: ${fav.addedAt}`);
        console.log('');
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();



