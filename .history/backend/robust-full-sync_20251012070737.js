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

async function robustFullSync() {
  const startTime = Date.now();
  let totalProcessed = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let errorPages = 0;
  let totalPages = 0;
  
  try {
    console.log('🚀 Starting robust full sync...');
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get initial page to determine total
    console.log('📡 Getting initial page to determine total pages...');
    const firstResult = await kkphimApi.getNewMovies(1, 24);
    
    if (!firstResult.status || !firstResult.items) {
      throw new Error('Failed to get initial data from API');
    }
    
    totalPages = firstResult.pagination.totalPages;
    console.log(`📊 Total pages to process: ${totalPages}`);
    console.log(`📊 Total movies available: ${firstResult.pagination.totalItems}`);
    
    // Process all pages with robust error handling
    const batchSize = 3; // Smaller batch size for reliability
    let page = 1;
    
    while (page <= totalPages) {
      const batchPromises = [];
      const batchPages = [];
      
      // Create smaller batches for better reliability
      for (let i = 0; i < batchSize && page <= totalPages; i++) {
        batchPromises.push(
          fetchPageWithRetry(page, 5) // 5 retries per page
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
        
        if (result && result.success && result.movies) {
          const { inserted, updated } = await processMoviesBatch(result.movies);
          totalProcessed += result.movies.length;
          totalInserted += inserted;
          totalUpdated += updated;
          
          console.log(`✅ Page ${pageNum}/${totalPages}: ${result.movies.length} movies processed (I:${inserted}, U:${updated}) - Total: ${totalProcessed}`);
        } else {
          console.warn(`⚠️ Skipped page ${pageNum} due to persistent errors`);
          errorPages++;
        }
      }
      
      // Progress update
      const progress = ((page - 1) / totalPages * 100).toFixed(1);
      console.log(`📈 Progress: ${progress}% (${page - 1}/${totalPages} pages, ${totalProcessed} movies processed)`);
      
      // Longer delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Final verification
    const finalCount = await Movie.countDocuments();
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n🎉 Robust sync completed!');
    console.log(`📊 Final movie count: ${finalCount}`);
    console.log(`📈 Total processed: ${totalProcessed}`);
    console.log(`➕ Total inserted: ${totalInserted}`);
    console.log(`🔄 Total updated: ${totalUpdated}`);
    console.log(`❌ Error pages: ${errorPages}`);
    console.log(`⏱️ Total time: ${duration} minutes`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Robust sync failed:', error);
    process.exit(1);
  }
}

async function fetchPageWithRetry(page, maxRetries) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📄 Fetching page ${page}... (attempt ${attempt})`);
      
      const result = await kkphimApi.getNewMovies(page, 24);
      
      if (!result.status || !result.items) {
        throw new Error(`Invalid response for page ${page}`);
      }
      
      return {
        success: true,
        movies: result.items,
        pagination: result.pagination
      };
      
    } catch (error) {
      console.warn(`⚠️ Page ${page} attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`❌ Page ${page} failed after ${maxRetries} attempts`);
        return { success: false, error: error.message };
      }
    }
  }
}

async function processMoviesBatch(movies) {
  let inserted = 0;
  let updated = 0;
  
  for (const movie of movies) {
    try {
      const movieWithMetadata = {
        ...movie,
        kkphim_id: movie._id || movie.slug,
        kkphim_modified: movie.modified ? new Date(movie.modified.time) : new Date(),
        last_sync: new Date()
      };
      
      const result = await Movie.updateOne(
        { slug: movie.slug },
        { $set: movieWithMetadata },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
      
    } catch (error) {
      console.warn(`⚠️ Failed to process movie ${movie.name}:`, error.message);
    }
  }
  
  return { inserted, updated };
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});

robustFullSync();
