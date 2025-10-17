const kkphimApi = require('./services/kkphimApi');

async function checkApiEnglishNames() {
  try {
    console.log('Checking English names from KKPhim API...');
    
    // Test with a few movie slugs
    const testSlugs = [
      'co-vo-nho-nha-ho-sai',
      'nguoi-lai-khinh-khi-cau',
      'hai-cot-tham-thi',
      'ong-trum-giang-ho-phan-3'
    ];
    
    for (const slug of testSlugs) {
      console.log(`\n🔍 Checking: ${slug}`);
      
      try {
        const kkphimData = await kkphimApi.getMovieDetail(slug);
        
        if (kkphimData && kkphimData.movie) {
          const movie = kkphimData.movie;
          console.log(`   Vietnamese name: ${movie.name}`);
          console.log(`   Original name: ${movie.origin_name || 'Không có'}`);
          console.log(`   Has English name: ${movie.origin_name && movie.origin_name !== movie.name ? '✅' : '❌'}`);
          
          // Check if origin_name is actually English
          if (movie.origin_name) {
            const isEnglish = /^[a-zA-Z\s\-'.,!?()]+$/.test(movie.origin_name);
            console.log(`   Is English: ${isEnglish ? '✅' : '❌'}`);
          }
        } else {
          console.log('   ❌ No movie data found');
        }
      } catch (error) {
        console.log(`   ❌ API Error: ${error.message}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkApiEnglishNames();
