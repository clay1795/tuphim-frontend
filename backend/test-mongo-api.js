const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: './env_new' });

// Import our new route
const mongoMovieRoutes = require('./routes/mongoMovies');

async function testMongoAPI() {
  try {
    console.log('🧪 Testing MongoDB API endpoints...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create a test app
    const app = express();
    app.use(express.json());
    app.use('/api/mongo-movies', mongoMovieRoutes);
    
    // Test the stats endpoint
    console.log('\n📊 Testing stats endpoint...');
    const statsResponse = await fetch('http://localhost:3001/api/mongo-movies/stats');
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Stats endpoint working:', stats.data.totalMovies, 'movies');
    } else {
      console.log('❌ Stats endpoint failed:', statsResponse.status);
    }
    
    // Test the new movies endpoint
    console.log('\n🎬 Testing new movies endpoint...');
    const newMoviesResponse = await fetch('http://localhost:3001/api/mongo-movies/new?page=1&limit=5');
    if (newMoviesResponse.ok) {
      const movies = await newMoviesResponse.json();
      console.log('✅ New movies endpoint working:', movies.data.items.length, 'movies');
      console.log('📄 Sample movies:');
      movies.data.items.slice(0, 3).forEach((movie, index) => {
        console.log(`  ${index + 1}. ${movie.name} (${movie.type}) - ${movie.year}`);
      });
    } else {
      console.log('❌ New movies endpoint failed:', newMoviesResponse.status);
    }
    
    // Test the search endpoint
    console.log('\n🔍 Testing search endpoint...');
    const searchResponse = await fetch('http://localhost:3001/api/mongo-movies/search?keyword=avengers&page=1&limit=5');
    if (searchResponse.ok) {
      const search = await searchResponse.json();
      console.log('✅ Search endpoint working:', search.data.items.length, 'results');
    } else {
      console.log('❌ Search endpoint failed:', searchResponse.status);
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 All MongoDB API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testMongoAPI();
}

module.exports = testMongoAPI;



