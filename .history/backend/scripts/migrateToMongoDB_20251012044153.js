const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// MongoDB Schema for Movies - Simple schema to avoid parallel array issues
const movieSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  origin_name: String,
  type: String,
  year: Number,
  poster_url: String,
  thumb_url: String,
  banner_url: String,
  episode_current: String,
  episode_total: String,
  time: String,
  quality: String,
  lang: String,
  category: [Object],
  country: [Object],
  sub_docquyen: Boolean,
  tmdb: Object,
  imdb: Object,
  modified: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false // Allow any fields
});

// Simple indexes to avoid parallel array issues
movieSchema.index({ name: 1 });
movieSchema.index({ slug: 1 });
movieSchema.index({ type: 1 });
movieSchema.index({ year: 1 });

const Movie = mongoose.model('Movie', movieSchema);

// Migration function
async function migrateToMongoDB() {
  try {
    console.log('🚀 Starting migration to MongoDB...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Read cache file
    const cacheFile = path.join(__dirname, '../data/movieCache.json');
    const cacheData = await fs.readFile(cacheFile, 'utf8');
    const cache = JSON.parse(cacheData);
    
    console.log(`📊 Found ${cache.movies.length} movies in cache`);
    console.log(`📋 Sample movie structure:`, JSON.stringify(cache.movies[0], null, 2));
    
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
    
    let insertedCount = 0;
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      for (const movie of batch) {
        try {
          await Movie.create(movie, { validateBeforeSave: false });
          insertedCount++;
        } catch (error) {
          console.error(`❌ Error inserting movie ${movie.name}:`, error.message);
        }
      }
      console.log(`✅ Batch ${i + 1}/${batches.length}: ${batch.length} movies processed (${insertedCount} total inserted)`);
    }
    
    // Get final count
    const totalMovies = await Movie.countDocuments();
    console.log(`🎉 Migration completed: ${totalMovies} movies in MongoDB`);
    
    // Debug: Check first few movies
    const sampleMovies = await Movie.find().limit(3);
    console.log(`📋 Sample movies:`, sampleMovies.map(m => ({ name: m.name, slug: m.slug })));
    
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