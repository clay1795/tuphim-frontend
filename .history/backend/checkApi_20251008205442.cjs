const kkphimApi = require('./services/kkphimApi');

async function checkApi() {
  try {
    console.log('Checking KKPhim API...');
    
    // Test getting new movies
    const newMovies = await kkphimApi.getNewMovies(1, 'v3');
    console.log('API Response:', JSON.stringify(newMovies, null, 2));
    
    if (newMovies.data && newMovies.data.items) {
      console.log(`✅ Found ${newMovies.data.items.length} movies`);
      newMovies.data.items.slice(0, 5).forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.name} (${movie.slug})`);
        console.log(`   Poster: ${movie.poster_url}`);
      });
    } else {
      console.log('❌ No movies found in response');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkApi();
