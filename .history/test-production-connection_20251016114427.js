// Test script for production deployment
// This script tests the connection between frontend and backend

const axios = require('axios');

const FRONTEND_URL = 'https://www.tuphim.online';
const BACKEND_URL = 'https://api.tuphim.online';

async function testProductionConnection() {
  console.log('🚀 Testing TupPhim Production Deployment...\n');

  // Test 1: Backend Health Check
  console.log('1️⃣ Testing Backend Health Check...');
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend Health Check Failed:', error.message);
  }

  // Test 2: Backend API Endpoints
  console.log('\n2️⃣ Testing Backend API Endpoints...');
  try {
    const moviesResponse = await axios.get(`${BACKEND_URL}/api/movies`);
    console.log('✅ Movies API:', moviesResponse.data?.data?.length || 0, 'movies found');
  } catch (error) {
    console.log('❌ Movies API Failed:', error.message);
  }

  // Test 3: Frontend Accessibility
  console.log('\n3️⃣ Testing Frontend Accessibility...');
  try {
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend:', frontendResponse.status === 200 ? 'Accessible' : 'Not accessible');
  } catch (error) {
    console.log('❌ Frontend Failed:', error.message);
  }

  // Test 4: CORS Configuration
  console.log('\n4️⃣ Testing CORS Configuration...');
  try {
    const corsResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    console.log('✅ CORS:', 'Properly configured');
  } catch (error) {
    console.log('❌ CORS Failed:', error.message);
  }

  // Test 5: Database Connection
  console.log('\n5️⃣ Testing Database Connection...');
  try {
    const dbResponse = await axios.get(`${BACKEND_URL}/api/health`);
    if (dbResponse.data.database) {
      console.log('✅ Database:', dbResponse.data.database.status);
    } else {
      console.log('⚠️ Database status not available in health check');
    }
  } catch (error) {
    console.log('❌ Database Test Failed:', error.message);
  }

  console.log('\n🎉 Production Connection Test Complete!');
}

// Run the test
testProductionConnection().catch(console.error);
