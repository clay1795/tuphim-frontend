#!/usr/bin/env node

/**
 * Test script for VS Code Port Forwarding setup
 * This script tests if the configuration is correct
 */

const http = require('http');
const https = require('https');

console.log('🧪 Testing VS Code Port Forwarding Setup...\n');

// Test configuration
const tests = [
  {
    name: 'Backend Server (Port 3001)',
    url: 'http://localhost:3001/api/health',
    expectedStatus: 200
  },
  {
    name: 'Frontend Server (Port 5173)', 
    url: 'http://localhost:5173',
    expectedStatus: 200
  },
  {
    name: 'Backend API Root',
    url: 'http://localhost:3001',
    expectedStatus: 200
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === test.expectedStatus;
        console.log(`${success ? '✅' : '❌'} ${test.name}`);
        console.log(`   Status: ${res.statusCode} (Expected: ${test.expectedStatus})`);
        if (data && data.length < 200) {
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
        console.log('');
        resolve({ success, status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: Request timeout`);
      console.log('');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Running endpoint tests...\n');
  
  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push({ ...test, ...result });
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log('');
  
  if (passed === total) {
    console.log('🎉 All tests passed! VS Code Port Forwarding setup is ready.');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Open VS Code Command Palette (Ctrl+Shift+P)');
    console.log('   2. Type: Ports: Focus on Ports View');
    console.log('   3. Add ports: 3001 (Backend) and 5173 (Frontend)');
    console.log('   4. Set port visibility to "Public" for mobile access');
    console.log('   5. Copy the forwarded URLs to access from mobile devices');
  } else {
    console.log('⚠️  Some tests failed. Please check:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error || 'Unexpected status'}`);
    });
    console.log('');
    console.log('💡 Make sure both servers are running:');
    console.log('   Backend: npm run dev (in backend folder)');
    console.log('   Frontend: npm run dev (in root folder)');
  }
}

// Run tests
runTests().catch(console.error);
