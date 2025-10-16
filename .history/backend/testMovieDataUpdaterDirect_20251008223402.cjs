const MovieDataUpdater = require('./middleware/movieDataUpdater');

async function testMovieDataUpdaterDirect() {
  try {
    console.log('Testing MovieDataUpdater directly...');
    
    // Test with the exact movie data that's failing
    const movieData = {
      movieId: 'test-direct-001',
      movieSlug: 'bi-mat-cua-tinh-yeu',
      movieName: 'Bí Mật Của Tình Yêu',
      originalName: 'Bí Mật Của Tình Yêu',  // Frontend sends Vietnamese name
      poster_url: 'https://phimimg.com/upload/vod/20251008-1/a131665751d08c0fbe7f5d02ebb39b03.jpg',
      thumb_url: 'https://phimimg.com/upload/vod/20251008-1/6bcb583fb368c5a6c19e39d4b9d302b3.jpg',
      addedAt: new Date()
    };
    
    console.log('📋 Input movie data:', movieData);
    
    // Test updateMovieData
    console.log('\n📋 Calling MovieDataUpdater.updateMovieData...');
    const updatedData = await MovieDataUpdater.updateMovieData(movieData);
    
    console.log('\n📋 Updated movie data:', updatedData);
    console.log(`✅ Vietnamese name: ${updatedData.movieName}`);
    console.log(`✅ English name: ${updatedData.originalName || 'Not set'}`);
    console.log(`✅ Has English name: ${updatedData.originalName ? '✅' : '❌'}`);
    console.log(`✅ Expected English: The Mysteries of Love`);
    console.log(`✅ Got correct English: ${updatedData.originalName === 'The Mysteries of Love' ? '✅' : '❌'}`);
    
    if (updatedData.originalName === 'The Mysteries of Love') {
      console.log('\n🎉 SUCCESS! MovieDataUpdater is working correctly!');
    } else {
      console.log('\n❌ ISSUE: MovieDataUpdater is not working correctly');
      console.log(`   Got: "${updatedData.originalName}"`);
      console.log(`   Expected: "The Mysteries of Love"`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testMovieDataUpdaterDirect();
