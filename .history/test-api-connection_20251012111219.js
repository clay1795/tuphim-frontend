#!/usr/bin/env node

/**
 * Test script for API connection in tunnel environment
 * This script tests if the API configuration works correctly
 */

const http = require('http');
const https = require('https');

console.log('🧪 Testing API Connection for Tunnel Environment...\n');

// Test URLs
const testUrls = [
  {
    name: 'Backend Health Check (Tunnel)',
    url: 'https://33ss6xpk-3001.asse.devtunnels.ms/api/health',
    expectedStatus: 200
  },
  {
    name: 'Backend Root (Tunnel)', 
    url: 'https://33ss6xpk-3001.asse.devtunnels.ms/',
    expectedStatus: 200
  },
  {
    name: 'Movies API (Tunnel)',
    url: 'https://33ss6xpk-3001.asse.devtunnels.ms/api/movies/new?page=1&version=v3',
    expectedStatus: 200
  },
  {
    name: 'MongoDB Movies API (Tunnel)',
    url: 'https://33ss6xpk-3001.asse.devtunnels.ms/api/mongo-movies/new?page=1&limit=24',
    expectedStatus: 200
  }
];

async function testUrl(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'TupPhim-Test-Client/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === test.expectedStatus;
        console.log(`${success ? '✅' : '❌'} ${test.name}`);
        console.log(`   Status: ${res.statusCode} (Expected: ${test.expectedStatus})`);
        console.log(`   URL: ${test.url}`);
        
        if (data && data.length < 500) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(jsonData).substring(0, 200)}...`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}...`);
          }
        } else if (data) {
          console.log(`   Response length: ${data.length} characters`);
        }
        console.log('');
        resolve({ success, status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${err.message}`);
      console.log(`   URL: ${test.url}`);
      console.log('');
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: Request timeout (10s)`);
      console.log(`   URL: ${test.url}`);
      console.log('');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing tunnel API endpoints...\n');
  
  const results = [];
  for (const test of testUrls) {
    const result = await testUrl(test);
    results.push({ ...test, ...result });
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log('');
  
  if (passed === total) {
    console.log('🎉 All API tests passed! Tunnel configuration is working correctly.');
    console.log('');
    console.log('✅ Frontend should now be able to:');
    console.log('   - Load movies from MongoDB');
    console.log('   - Display "phim đề xuất chính"');
    console.log('   - Show "top6 phim"');
    console.log('   - All features working on mobile via tunnel URLs');
  } else {
    console.log('⚠️  Some API tests failed. Issues to check:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error || 'Unexpected status'}`);
    });
    console.log('');
    console.log('💡 Troubleshooting steps:');
    console.log('   1. Ensure backend server is running');
    console.log('   2. Check VS Code Port Forwarding is active');
    console.log('   3. Verify tunnel URLs are accessible');
    console.log('   4. Check CORS configuration in backend');
  }
  
  console.log('');
  console.log('🔗 Frontend URL: https://33ss6xpk-5173.asse.devtunnels.ms/');
  console.log('🔗 Backend URL: https://33ss6xpk-3001.asse.devtunnels.ms/');
}

// Run tests
runTests().catch(console.error);
