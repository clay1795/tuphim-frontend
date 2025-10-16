const MovieDataUpdater = require('./middleware/movieDataUpdater');

async function testMovieDataUpdaterDirect() {
  try {
    console.log('Testing MovieDataUpdater directly with real data...');
    
    // Test with real movie data
    const realMovieData = {
      movieId: 'test-direct-001',
      movieSlug: 'hai-cot-tham-thi',
      movieName: 'Test Direct Movie',
      originalName: 'Test Direct Original',
      poster_url: 'https://example.com/sample-poster.jpg',
      thumb_url: 'https://example.com/sample-thumb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg',
      addedAt: new Date()
    };
    
    console.log('📋 Input movie data:', realMovieData);
    
    // Test updateMovieData
    const updatedData = await MovieDataUpdater.updateMovieData(realMovieData);
    
    console.log('📋 Updated movie data:', updatedData);
    console.log(`✅ Vietnamese name: ${updatedData.movieName}`);
    console.log(`✅ English name: ${updatedData.originalName || 'Not set'}`);
    console.log(`✅ Has English name: ${updatedData.originalName ? '✅' : '❌'}`);
    console.log(`✅ Expected English: Queen Of Bones`);
    console.log(`✅ Got correct English: ${updatedData.originalName === 'Queen Of Bones' ? '✅' : '❌'}`);
    
    if (updatedData.originalName === 'Queen Of Bones') {
      console.log('\n🎉 SUCCESS! MovieDataUpdater is working correctly!');
    } else {
      console.log('\n❌ ISSUE: MovieDataUpdater is not working correctly');
      console.log(`   Got: "${updatedData.originalName}"`);
      console.log(`   Expected: "Queen Of Bones"`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMovieDataUpdaterDirect();
