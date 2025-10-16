const MovieDataUpdater = require('./middleware/movieDataUpdater');

async function testMovieDataUpdaterReal() {
  try {
    console.log('Testing MovieDataUpdater with real movie data...');
    
    // Test with the exact movie data that's failing
    const movieData = {
      movieId: 'test-english-001',
      movieSlug: 'nguoi-lai-khinh-khi-cau',
      movieName: 'Test Movie',
      originalName: 'Test Original',
      poster_url: 'https://example.com/sample-poster.jpg',
      thumb_url: 'https://example.com/sample-thumb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg',
      addedAt: new Date()
    };
    
    console.log('📋 Input movie data:', movieData);
    
    // Test updateMovieData
    const updatedData = await MovieDataUpdater.updateMovieData(movieData);
    
    console.log('📋 Updated movie data:', updatedData);
    console.log(`✅ Vietnamese name: ${updatedData.movieName}`);
    console.log(`✅ English name: ${updatedData.originalName || 'Not set'}`);
    console.log(`✅ Has English name: ${updatedData.originalName ? '✅' : '❌'}`);
    console.log(`✅ Expected English: The Balloonist`);
    console.log(`✅ Got correct English: ${updatedData.originalName === 'The Balloonist' ? '✅' : '❌'}`);
    
    if (updatedData.originalName === 'The Balloonist') {
      console.log('\n🎉 SUCCESS! MovieDataUpdater is working correctly!');
    } else {
      console.log('\n❌ ISSUE: MovieDataUpdater is not working correctly');
      console.log(`   Got: "${updatedData.originalName}"`);
      console.log(`   Expected: "The Balloonist"`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMovieDataUpdaterReal();
