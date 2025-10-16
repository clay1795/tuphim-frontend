const kkphimApi = require('./services/kkphimApi');

async function debugApi() {
  try {
    console.log('Debugging KKPhim API...');
    
    // Test getting new movies
    console.log('\n1. Testing getNewMovies...');
    const newMovies = await kkphimApi.getNewMovies(1, 'v3');
    console.log('Full response:', JSON.stringify(newMovies, null, 2));
    
    // Test different versions
    console.log('\n2. Testing v1...');
    const v1Movies = await kkphimApi.getNewMovies(1, 'v1');
    console.log('V1 response:', JSON.stringify(v1Movies, null, 2));
    
    console.log('\n3. Testing v2...');
    const v2Movies = await kkphimApi.getNewMovies(1, 'v2');
    console.log('V2 response:', JSON.stringify(v2Movies, null, 2));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugApi();
