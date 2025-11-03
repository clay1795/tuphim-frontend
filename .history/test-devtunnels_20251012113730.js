#!/usr/bin/env node

const https = require('https');

// Your Dev Tunnels URLs
const FRONTEND_URL = 'https://33ss6xpk-5173.asse.devtunnels.ms';
const BACKEND_URL = 'https://33ss6xpk-3001.asse.devtunnels.ms';

console.log('🧪 Testing Dev Tunnels Configuration...\n');

// Test function for HTTPS requests
function testDevTunnels(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing ${description}...`);
    console.log(`   URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description} - SUCCESS (${res.statusCode})`);
          try {
            const json = JSON.parse(data);
            if (json.success || json.data) {
              console.log(`   📊 API Response: ${Object.keys(json.data || json).length} items`);
            } else if (json.message) {
              console.log(`   📄 Message: ${json.message}`);
            }
          } catch (e) {
            console.log(`   📄 HTML Response: ${data.length} characters`);
          }
          resolve(true);
        } else {
          console.log(`❌ ${description} - FAILED (${res.statusCode})`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description} - ERROR: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${description} - TIMEOUT`);
      req.destroy();
      resolve(false);
    });
  });
}

// Main test function
async function runDevTunnelsTests() {
  console.log('🌐 Dev Tunnels URLs:');
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   Backend: ${BACKEND_URL}\n`);
  
  const tests = [
    {
      url: `${BACKEND_URL}/api/health`,
      description: 'Backend Health Check'
    },
    {
      url: `${BACKEND_URL}/api/mongo-movies/stats`,
      description: 'MongoDB Stats API'
    },
    {
      url: `${FRONTEND_URL}`,
      description: 'Frontend Server'
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const passed = await testDevTunnels(test.url, test.description);
    if (passed) passedTests++;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Dev Tunnels Test Results:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All Dev Tunnels tests passed!');
    console.log('\n📱 Mobile Access Instructions:');
    console.log(`   1. Open browser on your mobile device`);
    console.log(`   2. Go to: ${FRONTEND_URL}`);
    console.log(`   3. The app should load and display movies from MongoDB`);
    console.log('\n💡 Features Available:');
    console.log('   • ✅ Responsive design for mobile and desktop');
    console.log('   • ✅ MongoDB movie data loading');
    console.log('   • ✅ Network access from anywhere');
    console.log('   • ✅ HTTPS secure connection');
    console.log('   • ✅ VS Code Dev Tunnels integration');
    
    console.log('\n🔧 Configuration Notes:');
    console.log('   • Frontend automatically detects Dev Tunnels URL');
    console.log('   • API calls are routed through Dev Tunnels');
    console.log('   • CORS is configured for Dev Tunnels domains');
    console.log('   • Responsive grid layout adapts to screen size');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('   1. Make sure Dev Tunnels are active in VS Code');
    console.log('   2. Check that both frontend and backend servers are running');
    console.log('   3. Verify the tunnel URLs are correct');
    console.log('   4. Check network connectivity');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Test the frontend URL on your mobile device');
  console.log('   2. Verify movie data loads correctly');
  console.log('   3. Test responsive design on different screen sizes');
  console.log('   4. Check that all interactive features work');
}

// Run tests
runDevTunnelsTests().catch(console.error);
