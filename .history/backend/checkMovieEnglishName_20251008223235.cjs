const axios = require('axios');

async function checkMovieEnglishName() {
  try {
    console.log('Checking English names for movies...');
    
    const movies = [
      { slug: 'bi-mat-cua-tinh-yeu', name: 'Bí Mật Của Tình Yêu' },
      { slug: 'nguoi-lai-khinh-khi-cau', name: 'Người Lái Khinh Khí Cầu' }
    ];
    
    for (const movie of movies) {
      console.log(`\n📋 Checking: ${movie.name} (${movie.slug})`);
      
      const apiUrl = `https://phimapi.com/phim/${movie.slug}`;
      
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        if (response.data && response.data.movie) {
          const movieData = response.data.movie;
          console.log(`   Vietnamese name: ${movieData.name}`);
          console.log(`   Origin name: ${movieData.origin_name || 'NOT SET'}`);
          console.log(`   Has origin_name: ${movieData.origin_name ? '✅' : '❌'}`);
          console.log(`   Origin name is different: ${movieData.origin_name && movieData.origin_name !== movieData.name ? '✅' : '❌'}`);
          
          if (movieData.origin_name && movieData.origin_name !== movieData.name) {
            console.log(`   🎉 English name: "${movieData.origin_name}"`);
          } else {
            console.log(`   ❌ No English name available`);
          }
        } else {
          console.log('   ❌ No movie data found');
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMovieEnglishName();
