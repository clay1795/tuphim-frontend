const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// MongoDB Schema for Movies
const movieSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  originalName: { type: String, index: true },
  year: { type: Number, index: true },
  country: { type: String, index: true },
  category: { type: String, index: true },
  type: { type: String, index: true },
  status: { type: String, index: true },
  poster_url: String,
  thumb_url: String,
  banner_url: String,
  episodeCurrent: String,
  episodeTotal: String,
  quality: String,
  duration: String,
  description: String,
  director: String,
  actors: [String],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
movieSchema.index({ name: 'text', originalName: 'text' });
movieSchema.index({ category: 1, country: 1, year: 1 });
movieSchema.index({ type: 1, status: 1 });

const Movie = mongoose.model('Movie', movieSchema);

// Migration function
async function migrateToMongoDB() {
  try {
    console.log('🚀 Starting migration to MongoDB...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://luong:luongHiep2k5@cluster0.itpluqe.mongodb.net/tuphim';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Read cache file
    const cacheFile = path.join(__dirname, '../data/movieCache.json');
    const cacheData = await fs.readFile(cacheFile, 'utf8');
    const cache = JSON.parse(cacheData);
    
    console.log(`📊 Found ${cache.movies.length} movies in cache`);
    
    // Clear existing movies
    await Movie.deleteMany({});
    console.log('🗑️ Cleared existing movies');
    
    // Insert movies in batches
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < cache.movies.length; i += batchSize) {
      batches.push(cache.movies.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches...`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        await Movie.insertMany(batch, { ordered: false });
        console.log(`✅ Batch ${i + 1}/${batches.length}: ${batch.length} movies inserted`);
      } catch (error) {
        console.error(`❌ Batch ${i + 1} error:`, error.message);
      }
    }
    
    // Get final count
    const totalMovies = await Movie.countDocuments();
    console.log(`🎉 Migration completed: ${totalMovies} movies in MongoDB`);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await Movie.createIndexes();
    console.log('✅ Indexes created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  migrateToMongoDB();
}

module.exports = { migrateToMongoDB, Movie };