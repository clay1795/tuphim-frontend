const mongoose = require('mongoose');
const kkphimApi = require('./services/kkphimApi');
require('dotenv').config({ path: './env_new' });

// Movie schema
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
  kkphim_id: String,
  kkphim_modified: Date,
  last_sync: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false
});

const Movie = mongoose.model('Movie', movieSchema);

async function syncAllMovies() {
  const startTime = Date.now();
  let totalMovies = 0;
  let totalPages = 0;
  let currentPage = 1;
  
  try {
    console.log('🚀 Starting complete movie sync...');
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing movie data...');
    await Movie.deleteMany({});
    console.log('✅ Data cleared');

    // Get first page to determine total pages
    console.log('📡 Getting initial page to determine total count...');
    const firstResult = await kkphimApi.getNewMovies(1, 24);
    
    if (!firstResult.status || !firstResult.items) {
      throw new Error('Failed to get initial data from API');
    }
    
    totalPages = firstResult.pagination.totalPages;
    console.log(`📊 Total pages to fetch: ${totalPages}`);
    console.log(`📊 Total movies available: ${firstResult.pagination.totalItems}`);
    
    // Process first page
    await processMoviesBatch(firstResult.items);
    totalMovies += firstResult.items.length;
    console.log(`✅ Page 1/${totalPages} processed (${firstResult.items.length} movies)`);
    
    // Process remaining pages
    const batchSize = 5; // Process 5 pages at a time
    let page = 2;
    
    while (page <= totalPages) {
      const batchPromises = [];
      const batchPages = [];
      
      // Create batch of pages to fetch
      for (let i = 0; i < batchSize && page <= totalPages; i++) {
        batchPromises.push(
          kkphimApi.getNewMovies(page, 24).catch(err => {
            console.warn(`⚠️ Failed to fetch page ${page}:`, err.message);
            return null;
          })
        );
        batchPages.push(page);
        page++;
      }
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Process each result
      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        const pageNum = batchPages[i];
        
        if (result && result.status && result.items) {
          await processMoviesBatch(result.items);
          totalMovies += result.items.length;
          console.log(`✅ Page ${pageNum}/${totalPages} processed (${result.items.length} movies) - Total: ${totalMovies}`);
        } else {
          console.warn(`⚠️ Skipped page ${pageNum} due to error`);
        }
      }
      
      // Progress update
      const progress = ((page - 1) / totalPages * 100).toFixed(1);
      console.log(`📈 Progress: ${progress}% (${page - 1}/${totalPages} pages, ${totalMovies} movies)`);
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Final verification
    const finalCount = await Movie.countDocuments();
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n🎉 Sync completed successfully!');
    console.log(`📊 Final movie count: ${finalCount}`);
    console.log(`⏱️ Total time: ${duration} minutes`);
    console.log(`📈 Average: ${(finalCount / (Date.now() - startTime) * 1000).toFixed(1)} movies/second`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

async function processMoviesBatch(movies) {
  if (!movies || movies.length === 0) return;
  
  const moviesWithMetadata = movies.map(movie => ({
    ...movie,
    kkphim_id: movie._id || movie.slug,
    kkphim_modified: movie.modified ? new Date(movie.modified.time) : new Date(),
    last_sync: new Date()
  }));
  
  try {
    await Movie.insertMany(moviesWithMetadata, { ordered: false });
  } catch (error) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      console.warn(`⚠️ Some duplicate movies skipped`);
    } else {
      console.error('❌ Batch insert error:', error.message);
      throw error;
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});

syncAllMovies();



