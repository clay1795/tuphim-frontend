const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testDirectSave() {
  try {
    console.log('Testing direct save to database...');
    
    // Find user
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Clear existing favorites
    user.preferences.favorites = [];
    
    // Add movie with English name directly
    const movieData = {
      movieId: 'test-direct-save-001',
      movieSlug: 'hai-cot-tham-thi',
      movieName: 'Hài Cốt Thầm Thì',
      originalName: 'Queen Of Bones',
      poster_url: 'https://phimimg.com/upload/vod/20251008-1/5ba8eb6ddfcb2ac5d10e515bfdda151c.jpg',
      thumb_url: 'https://phimimg.com/upload/vod/20251008-1/69b3b0ae4fbeeee1e8b043b7a4f497fb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg',
      addedAt: new Date()
    };
    
    console.log('📋 Adding movie data:', movieData);
    
    user.preferences.favorites.push(movieData);
    
    await user.save();
    
    console.log('✅ Movie saved successfully');
    
    // Check saved data
    const savedUser = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    const savedMovie = savedUser.preferences.favorites.find(fav => fav.movieId === 'test-direct-save-001');
    
    if (savedMovie) {
      console.log('📋 Saved movie data:');
      console.log(`   Vietnamese name: ${savedMovie.movieName}`);
      console.log(`   English name: ${savedMovie.originalName || 'Not set'}`);
      console.log(`   Has English name: ${savedMovie.originalName ? '✅' : '❌'}`);
      console.log(`   Expected English: Queen Of Bones`);
      console.log(`   Got correct English: ${savedMovie.originalName === 'Queen Of Bones' ? '✅' : '❌'}`);
      
      if (savedMovie.originalName === 'Queen Of Bones') {
        console.log('\n🎉 SUCCESS! Direct save is working correctly!');
      } else {
        console.log('\n❌ ISSUE: Direct save is not working correctly');
        console.log(`   Got: "${savedMovie.originalName}"`);
        console.log(`   Expected: "Queen Of Bones"`);
      }
    } else {
      console.log('❌ Saved movie not found');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDirectSave();
