require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Kết nối MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  checkUsers();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function checkUsers() {
  try {
    // Tìm user lch795
    const user = await User.findOne({ username: 'lch795' });
    
    if (user) {
      console.log('✅ Found user lch795:');
      console.log('- Username:', user.username);
      console.log('- FullName:', user.fullName);
      console.log('- Email:', user.email);
    } else {
      console.log('❌ User lch795 not found in database');
      
      // List all users
      const allUsers = await User.find().select('username fullName email').limit(10);
      console.log('\n📝 All users in database:');
      allUsers.forEach(u => {
        console.log(`- ${u.username} (${u.fullName}) - ${u.email}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}

