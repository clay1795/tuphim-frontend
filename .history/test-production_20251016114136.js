#!/usr/bin/env node

/**
 * Production Connection Test Script
 * Tests all connections before deployment
 */

const https = require('https');
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testUrl = (url, name) => {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        log(`✅ ${name}: ${res.statusCode} (${responseTime}ms)`, 'green');
        resolve({ success: true, status: res.statusCode, time: responseTime });
      } else {
        log(`❌ ${name}: ${res.statusCode} (${responseTime}ms)`, 'red');
        resolve({ success: false, status: res.statusCode, time: responseTime });
      }
    });
    
    req.on('error', (err) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      log(`❌ ${name}: ${err.message} (${responseTime}ms)`, 'red');
      resolve({ success: false, error: err.message, time: responseTime });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      log(`⏰ ${name}: Timeout after 10s`, 'yellow');
      resolve({ success: false, error: 'Timeout', time: 10000 });
    });
  });
};

const testApiEndpoint = async (baseUrl, endpoint, name) => {
  const url = `${baseUrl}/${endpoint}`;
  return await testUrl(url, name);
};

const main = async () => {
  log('\n🚀 TupPhim Production Connection Test\n', 'bold');
  
  const tests = [
    // Frontend tests
    { url: 'https://www.tuphim.online', name: 'Frontend (tuphim.online)' },
    { url: 'https://tuphim-frontend.vercel.app', name: 'Frontend (Vercel)' },
    
    // Backend tests
    { url: 'https://tuphim-backend.onrender.com', name: 'Backend (Render)' },
    { url: 'https://tuphim-backend.onrender.com/api/health', name: 'Backend Health Check' },
    
    // API endpoints
    { url: 'https://tuphim-backend.onrender.com/api/movies', name: 'Movies API' },
    { url: 'https://tuphim-backend.onrender.com/api/auth/health', name: 'Auth API' },
    
    // External APIs
    { url: 'https://phimapi.com', name: 'KKPhim API' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testUrl(test.url, test.name);
    results.push({ ...test, ...result });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
  
  // Summary
  log('\n📊 Test Summary\n', 'bold');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  log(`Total Tests: ${total}`, 'blue');
  log(`Successful: ${successful}`, 'green');
  log(`Failed: ${total - successful}`, 'red');
  
  if (successful === total) {
    log('\n🎉 All tests passed! Ready for production deployment.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the issues above.', 'yellow');
  }
  
  // Detailed results
  log('\n📋 Detailed Results\n', 'bold');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const time = result.time ? `(${result.time}ms)` : '';
    const error = result.error ? ` - ${result.error}` : '';
    log(`${status} ${result.name}: ${result.status || 'N/A'} ${time}${error}`);
  });
  
  log('\n');
};

main().catch(console.error);
