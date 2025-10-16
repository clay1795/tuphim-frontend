const MovieDataUpdater = require('./middleware/movieDataUpdater');

async function testMovieDataUpdater() {
  try {
    console.log('Testing MovieDataUpdater directly...');
    
    // Test with sample movie data
    const sampleMovieData = {
      movieId: 'test-movie-456',
      movieSlug: 'co-vo-nho-nha-ho-sai',
      movieName: 'Test Movie',
      originalName: 'Test Movie Original',
      poster_url: 'https://example.com/sample-poster.jpg',
      thumb_url: 'https://example.com/sample-thumb.jpg',
      banner_url: 'https://example.com/sample-banner.jpg',
      addedAt: new Date()
    };
    
    console.log('📋 Input movie data:', sampleMovieData);
    
    // Test updateMovieData
    const updatedData = await MovieDataUpdater.updateMovieData(sampleMovieData);
    
    console.log('📋 Updated movie data:', updatedData);
    console.log(`✅ English name: ${updatedData.originalName || 'Not set'}`);
    console.log(`✅ Has English name: ${updatedData.originalName ? '✅' : '❌'}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMovieDataUpdater();




