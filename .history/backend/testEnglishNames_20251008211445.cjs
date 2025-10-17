const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testEnglishNames() {
  try {
    console.log('Testing English names in user data...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Check favorites
    console.log('\n📋 Favorites with English names:');
    user.preferences.favorites.forEach((fav, index) => {
      console.log(`${index + 1}. ${fav.movieName}`);
      console.log(`   Vietnamese: ${fav.movieName}`);
      console.log(`   English: ${fav.originalName || 'Không có'}`);
      console.log(`   Has English name: ${fav.originalName ? '✅' : '❌'}`);
      console.log('   ---');
    });
    
    // Check watchlist
    console.log('\n📋 Watchlist with English names:');
    user.preferences.watchlist.forEach((item, index) => {
      console.log(`${index + 1}. ${item.movieName}`);
      console.log(`   Vietnamese: ${item.movieName}`);
      console.log(`   English: ${item.originalName || 'Không có'}`);
      console.log(`   Has English name: ${item.originalName ? '✅' : '❌'}`);
      console.log('   ---');
    });
    
    // Statistics
    const favoritesWithEnglish = user.preferences.favorites.filter(fav => fav.originalName).length;
    const watchlistWithEnglish = user.preferences.watchlist.filter(item => item.originalName).length;
    
    console.log('\n📊 Statistics:');
    console.log(`Favorites with English names: ${favoritesWithEnglish}/${user.preferences.favorites.length}`);
    console.log(`Watchlist with English names: ${watchlistWithEnglish}/${user.preferences.watchlist.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEnglishNames();
