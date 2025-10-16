const mongoose = require('mongoose');
const kkphimApi = require('./services/kkphimApi');
require('dotenv').config({ path: './env_new' });

// Simple movie schema
const movieSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  origin_name: String,
  type: String,
  year: Number,
  poster_url: String,
  thumb_url: String,
  episode_current: String,
  quality: String,
  lang: String,
  category: [Object],
  country: [Object],
  tmdb: Object,
  imdb: Object,
  modified: Object,
  kkphim_id: String,
  kkphim_modified: Date,
  last_sync: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false
});

const Movie = mongoose.model('Movie', movieSchema);

async function testSimpleSync() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing movie data...');
    await Movie.deleteMany({});
    console.log('✅ Data cleared');

    // Test API call
    console.log('📡 Testing API call...');
    const result = await kkphimApi.getNewMovies(1, 24);
    
    if (!result.status) {
      console.log('❌ API call failed:', result);
      return;
    }
    
    console.log('✅ API call successful');
    console.log(`📊 Received ${result.items.length} movies from API`);
    
    if (result.pagination) {
      console.log(`📄 Pagination: ${result.pagination.currentPage}/${result.pagination.totalPages} (${result.pagination.totalItems} total)`);
    }
    
    // Process first 10 movies
    const moviesToInsert = result.items.slice(0, 10).map(movie => ({
      ...movie,
      kkphim_id: movie._id || movie.slug,
      kkphim_modified: movie.modified ? new Date(movie.modified.time) : new Date(),
      last_sync: new Date()
    }));
    
    console.log('💾 Inserting first 10 movies...');
    const insertedMovies = await Movie.insertMany(moviesToInsert);
    console.log(`✅ Successfully inserted ${insertedMovies.length} movies`);
    
    // Verify
    const count = await Movie.countDocuments();
    console.log(`📊 Total movies in database: ${count}`);
    
    // Show sample
    const sampleMovie = await Movie.findOne();
    if (sampleMovie) {
      console.log('🎬 Sample movie:', {
        name: sampleMovie.name,
        slug: sampleMovie.slug,
        type: sampleMovie.type,
        year: sampleMovie.year
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSimpleSync();



