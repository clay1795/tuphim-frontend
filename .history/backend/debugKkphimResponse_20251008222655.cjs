const axios = require('axios');

async function debugKkphimResponse() {
  try {
    console.log('Debugging KKPhim API response...');
    
    const slug = 'nguoi-lai-khinh-khi-cau';
    const apiUrl = `https://kkphim1.com/phim/${slug}`;
    
    console.log(`📋 Checking: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    console.log(`📋 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, response.headers);
    console.log(`📋 Response data type:`, typeof response.data);
    console.log(`📋 Response data keys:`, Object.keys(response.data || {}));
    
    if (response.data) {
      console.log('\n📋 Full response data:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

debugKkphimResponse();
