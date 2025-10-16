const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkUser() {
  try {
    console.log('Checking user data...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Full name: ${user.fullName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`Updated: ${user.updatedAt}`);
    
    // Test password comparison
    const testPassword = 'luongHiep2k5';
    const isPasswordValid = await user.comparePassword(testPassword);
    console.log(`Password '${testPassword}' is valid: ${isPasswordValid}`);
    
    // Show user preferences
    console.log('\n📋 User preferences:');
    console.log(`Favorites count: ${user.preferences.favorites.length}`);
    console.log(`Watchlist count: ${user.preferences.watchlist.length}`);
    console.log(`History count: ${user.preferences.watchHistory.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
