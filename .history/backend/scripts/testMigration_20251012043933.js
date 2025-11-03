const mongoose = require('mongoose');

// Simple schema for testing
const movieSchema = new mongoose.Schema({
  name: String,
  slug: String,
  origin_name: String,
  type: String,
  year: Number,
  poster_url: String,
  thumb_url: String,
  category: [Object],
  country: [Object],
  tmdb: Object,
  imdb: Object,
  modified: Object,
  _id: String
}, {
  strict: false // Allow any fields
});

// Remove indexes that cause parallel array issues
movieSchema.index({ name: 1 });
movieSchema.index({ slug: 1 });

const Movie = mongoose.model('Movie', movieSchema);

async function testMigration() {
  try {
    console.log('🚀 Testing migration...');
    
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Test movie
    const testMovie = {
      _id: "test-123",
      name: "Test Movie",
      slug: "test-movie",
      origin_name: "Test Movie Original",
      type: "movie",
      year: 2024,
      poster_url: "https://example.com/poster.jpg",
      thumb_url: "https://example.com/thumb.jpg",
      category: [{ name: "Action", slug: "action" }],
      country: [{ name: "USA", slug: "usa" }],
      tmdb: { type: "movie", id: "123" },
      imdb: { id: "tt123" },
      modified: { time: new Date() }
    };
    
    // Clear existing
    await Movie.deleteMany({});
    console.log('🗑️ Cleared existing movies');
    
    // Insert test movie
    const result = await Movie.create(testMovie);
    console.log('✅ Test movie inserted:', result.name);
    
    // Check count
    const count = await Movie.countDocuments();
    console.log(`📊 Total movies: ${count}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

testMigration();
