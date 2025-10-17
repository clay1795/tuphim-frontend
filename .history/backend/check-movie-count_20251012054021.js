const mongoose = require('mongoose');
require('dotenv').config({ path: '../env.production' });

const movieSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  last_sync: Date
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

async function checkMovieCount() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const count = await Movie.countDocuments();
    console.log('📊 Total movies in database:', count);
    
    const recentMovies = await Movie.find({})
      .sort({ last_sync: -1 })
      .limit(5)
      .select('name slug last_sync');
    
    console.log('\n🎬 Recent movies:');
    recentMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.name} (${movie.slug}) - ${movie.last_sync}`);
    });
    
    const oldestMovies = await Movie.find({})
      .sort({ last_sync: 1 })
      .limit(3)
      .select('name slug last_sync');
    
    console.log('\n📅 Oldest movies:');
    oldestMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.name} (${movie.slug}) - ${movie.last_sync}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMovieCount();
