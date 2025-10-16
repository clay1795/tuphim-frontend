const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development'
});

async function testDirectDatabaseSave() {
  try {
    console.log('Testing direct database save...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('📋 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get User model
    const User = require('./models/User');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log('✅ Found user:', user.email);
    
    // Clear existing favorites
    console.log('📋 Clearing existing favorites...');
    user.preferences.favorites = [];
    await user.save();
    console.log('✅ Cleared existing favorites');
    
    // Add movie with English name
    console.log('📋 Adding movie with English name...');
    const movieData = {
      movieId: '4dbbafbb5365ffd94a1062267967535f',
      movieSlug: 'nguoi-lai-khinh-khi-cau',
      movieName: 'Người Lái Khinh Khí Cầu',
      originalName: 'The Balloonist',  // ← IMPORTANT!
      poster_url: 'https://phimimg.com/upload/vod/20251008-1/f5ee25ca889fca16f2f1478d94a0b8eb.jpg',
      thumb_url: 'https://phimimg.com/upload/vod/20251008-1/0daef820b7292d1e782ab8c59a4875b9.jpg',
      banner_url: 'https://example.com/sample-banner.jpg',
      addedAt: new Date()
    };
    
    user.preferences.favorites.push(movieData);
    await user.save();
    console.log('✅ Added movie to favorites');
    
    // Check the saved movie
    console.log('📋 Checking saved movie...');
    const updatedUser = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    const savedMovie = updatedUser.preferences.favorites[0];
    
    console.log('\n📋 Saved movie data:');
    console.log(`   ID: ${savedMovie.movieId}`);
    console.log(`   Name: ${savedMovie.movieName}`);
    console.log(`   English: ${savedMovie.originalName || 'Not set'}`);
    console.log(`   Has English name: ${savedMovie.originalName ? '✅' : '❌'}`);
    console.log(`   Expected English: The Balloonist`);
    console.log(`   Got correct English: ${savedMovie.originalName === 'The Balloonist' ? '✅' : '❌'}`);
    
    if (savedMovie.originalName === 'The Balloonist') {
      console.log('\n🎉 SUCCESS! Direct database save is working correctly!');
    } else {
      console.log('\n❌ ISSUE: Direct database save is not working correctly');
      console.log(`   Got: "${savedMovie.originalName}"`);
      console.log(`   Expected: "The Balloonist"`);
    }
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

testDirectDatabaseSave();
