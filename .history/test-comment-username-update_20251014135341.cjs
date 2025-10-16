// Test script to verify comment username updates
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
const DEV_TUNNELS_API = 'https://33ss6xpk-3001.asse.devtunnels.ms/api';

async function testCommentUsernameUpdate() {
  console.log('🧪 Testing Comment Username Update...\n');

  try {
    // 1. Test login
    console.log('1️⃣ Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'test@test.com',
        password: 'Test123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed');
    }

    const token = loginData.data.token;
    const userId = loginData.data.user.id;
    console.log(`✅ Login successful: ${loginData.data.user.email}`);

    // 2. Create a test comment
    console.log('\n2️⃣ Creating test comment...');
    const commentResponse = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movieSlug: 'test-movie-slug',
        content: 'This is a test comment to verify username updates work correctly.',
        username: 'Test User'
      })
    });

    const commentData = await commentResponse.json();
    if (!commentData.success) {
      throw new Error('Comment creation failed');
    }
    console.log(`✅ Comment created: ${commentData.data._id}`);

    // 3. Update user profile (change name)
    console.log('\n3️⃣ Updating user profile...');
    const newName = `Updated User ${Date.now()}`;
    const updateResponse = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: newName
      })
    });

    const updateData = await updateResponse.json();
    if (!updateData.success) {
      throw new Error('Profile update failed');
    }
    console.log(`✅ Profile updated: ${newName}`);

    // 4. Update username in comments
    console.log('\n4️⃣ Updating username in comments...');
    const updateCommentsResponse = await fetch(`${API_BASE}/comments/update-username/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        newUsername: newName
      })
    });

    const updateCommentsData = await updateCommentsResponse.json();
    if (!updateCommentsData.success) {
      throw new Error('Comment username update failed');
    }
    console.log(`✅ Comments updated: ${updateCommentsData.data.modifiedCount} comments`);

    // 5. Verify comment shows new name
    console.log('\n5️⃣ Verifying comment shows new name...');
    const getCommentsResponse = await fetch(`${API_BASE}/comments/test-movie-slug`);
    const getCommentsData = await getCommentsResponse.json();
    
    if (getCommentsData.success && getCommentsData.data.comments.length > 0) {
      const latestComment = getCommentsData.data.comments[0];
      console.log(`✅ Comment username: ${latestComment.username}`);
      
      if (latestComment.username === newName) {
        console.log('🎉 SUCCESS: Comment shows updated username!');
      } else {
        console.log('❌ FAILED: Comment still shows old username');
      }
    }

    // 6. Test Dev Tunnels
    console.log('\n6️⃣ Testing Dev Tunnels...');
    try {
      const devTunnelsResponse = await fetch(`${DEV_TUNNELS_API}/comments/test-movie-slug`);
      const devTunnelsData = await devTunnelsResponse.json();
      
      if (devTunnelsData.success && devTunnelsData.data.comments.length > 0) {
        const latestComment = devTunnelsData.data.comments[0];
        console.log(`✅ Dev Tunnels comment username: ${latestComment.username}`);
      }
    } catch (error) {
      console.log(`⚠️ Dev Tunnels test failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCommentUsernameUpdate();
