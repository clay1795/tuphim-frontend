const mongoose = require('mongoose');
require('dotenv').config({ path: './env_new' });

const movieSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  last_sync: Date
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

async function testMongoEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');
    
    const count = await Movie.countDocuments();
    console.log('📊 Total movies in MongoDB:', count);
    
    // Test new endpoint logic
    const page = 1;
    const limit = 24;
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find({})
      .sort({ last_sync: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log('📄 First page movies:', movies.length);
    console.log('🎬 Sample movies:');
    movies.slice(0, 3).forEach((movie, index) => {
      console.log(`  ${index + 1}. ${movie.name} (${movie.type}) - ${movie.year}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMongoEndpoint();



