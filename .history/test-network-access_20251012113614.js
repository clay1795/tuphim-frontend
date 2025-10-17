#!/usr/bin/env node

const http = require('http');
const https = require('https');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';

  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
      }
    });
  });

  return localIP;
}

// Test HTTP request
function testRequest(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`🔍 Testing ${description}...`);
    console.log(`   URL: ${url}`);
    
    const req = client.get(url, (res) => {
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
              console.log(`   📊 Data received: ${Object.keys(json.data || json).length} items`);
            }
          } catch (e) {
            console.log(`   📄 Response received: ${data.length} characters`);
          }
          resolve(true);
        } else {
          console.log(`❌ ${description} - FAILED (${res.statusCode})`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description} - ERROR: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${description} - TIMEOUT`);
      req.destroy();
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('🧪 Testing TupPhim Network Access...\n');
  
  const localIP = getLocalIP();
  console.log(`🌐 Local IP Address: ${localIP}\n`);
  
  const tests = [
    {
      url: `http://localhost:3001/api/health`,
      description: 'Backend Health Check (localhost)'
    },
    {
      url: `http://localhost:3001/api/mongo-movies/stats`,
      description: 'MongoDB Stats API (localhost)'
    },
    {
      url: `http://localhost:5173`,
      description: 'Frontend Server (localhost)'
    },
    {
      url: `http://${localIP}:3001/api/health`,
      description: 'Backend Health Check (network)'
    },
    {
      url: `http://${localIP}:3001/api/mongo-movies/stats`,
      description: 'MongoDB Stats API (network)'
    },
    {
      url: `http://${localIP}:5173`,
      description: 'Frontend Server (network)'
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const passed = await testRequest(test.url, test.description);
    if (passed) passedTests++;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your setup is working correctly.');
    console.log('\n📱 Mobile Access Instructions:');
    console.log(`   1. Connect your mobile to the same WiFi network`);
    console.log(`   2. Open browser and go to: http://${localIP}:5173`);
    console.log(`   3. The app should load and display movies from MongoDB`);
    console.log('\n💡 VS Code Port Forwarding:');
    console.log('   1. Open Command Palette (Ctrl+Shift+P)');
    console.log('   2. Type "Ports: Forward a Port"');
    console.log('   3. Forward port 5173 for frontend');
    console.log('   4. Forward port 3001 for backend');
    console.log('   5. Use the generated URL to access from anywhere');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('   1. Make sure both frontend and backend servers are running');
    console.log('   2. Check firewall settings');
    console.log('   3. Verify network connectivity');
    console.log('   4. Check server configurations');
  }
  
  console.log('\n🔧 Troubleshooting Commands:');
  console.log('   npm run start:dev    # Start both servers');
  console.log('   npm run start:backend # Start backend only');
  console.log('   npm run start:frontend # Start frontend only');
}

// Run tests
runTests().catch(console.error);
