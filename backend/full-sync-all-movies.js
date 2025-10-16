const mongoose = require('mongoose');
const kkphimApi = require('./services/kkphimApi');
const logger = require('./services/logger');
require('dotenv').config({ path: './env_new' });

// MongoDB Schema for Movies
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
  // Sync metadata
  kkphim_id: String,
  kkphim_modified: Date,
  last_sync: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false
});

const Movie = mongoose.model('Movie', movieSchema);

async function fetchAllMovies() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🚀 Starting comprehensive movie sync...');
    
    // Clear existing data
    console.log('🗑️ Clearing existing movie data...');
    await Movie.deleteMany({});
    
    const allMovies = [];
    let page = 1;
    let hasMore = true;
    const maxPages = 1100; // Based on 24,667 movies with 24 per page
    
    console.log('📡 Fetching all movies from KKPhim API...');
    
    while (hasMore && page <= maxPages) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        const result = await kkphimApi.getNewMovies(page, 24);
        
        if (!result.status || !result.items || result.items.length === 0) {
          console.log(`❌ No more movies found at page ${page}`);
          hasMore = false;
          break;
        }
        
        const movies = result.items;
        
        // Add metadata to each movie
        const moviesWithMetadata = movies.map(movie => ({
          ...movie,
          kkphim_id: movie._id || movie.slug,
          kkphim_modified: movie.modified ? new Date(movie.modified.time) : new Date(),
          last_sync: new Date()
        }));
        
        allMovies.push(...moviesWithMetadata);
        
        console.log(`✅ Page ${page}: ${movies.length} movies fetched (Total: ${allMovies.length})`);
        
        // Check pagination info
        if (result.pagination) {
          console.log(`📊 Pagination: ${result.pagination.currentPage}/${result.pagination.totalPages} (${result.pagination.totalItems} total movies)`);
          
          if (result.pagination.currentPage >= result.pagination.totalPages) {
            hasMore = false;
          }
        }
        
        page++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error fetching page ${page}:`, error.message);
        page++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay on error
      }
    }
    
    console.log(`\n📊 Total movies fetched: ${allMovies.length}`);
    
    if (allMovies.length > 0) {
      console.log('💾 Inserting movies into database...');
      
      // Insert in batches
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < allMovies.length; i += batchSize) {
        batches.push(allMovies.slice(i, i + batchSize));
      }
      
      console.log(`📦 Processing ${batches.length} batches...`);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        try {
          await Movie.insertMany(batch, { ordered: false });
          console.log(`✅ Batch ${i + 1}/${batches.length}: ${batch.length} movies inserted`);
        } catch (error) {
          console.error(`❌ Batch ${i + 1} failed:`, error.message);
        }
      }
      
      // Verify final count
      const finalCount = await Movie.countDocuments();
      console.log(`\n🎉 Sync completed successfully!`);
      console.log(`📊 Final movie count in database: ${finalCount}`);
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

fetchAllMovies();



