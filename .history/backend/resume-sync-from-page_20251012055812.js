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

async function resumeSyncFromPage(startPage = 1007) {
  const startTime = Date.now();
  let totalMovies = 0;
  let successPages = 0;
  let errorPages = 0;
  
  try {
    console.log(`🚀 Resuming sync from page ${startPage}...`);
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check current count
    const currentCount = await Movie.countDocuments();
    console.log(`📊 Current movie count: ${currentCount}`);

    // Get total pages from first successful API call
    let totalPages = 1028;
    
    // Process pages with retry logic
    for (let page = startPage; page <= totalPages; page++) {
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      
      while (retryCount < maxRetries && !success) {
        try {
          console.log(`📄 Fetching page ${page}... (attempt ${retryCount + 1})`);
          
          const result = await kkphimApi.getNewMovies(page, 24);
          
          if (!result.status || !result.items) {
            throw new Error(`Invalid response for page ${page}`);
          }
          
          // Update total pages if we get updated info
          if (result.pagination && result.pagination.totalPages) {
            totalPages = result.pagination.totalPages;
          }
          
          // Process movies
          const movies = result.items;
          const moviesWithMetadata = movies.map(movie => ({
            ...movie,
            kkphim_id: movie._id || movie.slug,
            kkphim_modified: movie.modified ? new Date(movie.modified.time) : new Date(),
            last_sync: new Date()
          }));
          
          // Insert with upsert to avoid duplicates
          for (const movie of moviesWithMetadata) {
            try {
              await Movie.updateOne(
                { slug: movie.slug },
                { $set: movie },
                { upsert: true }
              );
            } catch (insertError) {
              console.warn(`⚠️ Skipped duplicate movie: ${movie.name}`);
            }
          }
          
          totalMovies += movies.length;
          successPages++;
          success = true;
          
          console.log(`✅ Page ${page}/${totalPages}: ${movies.length} movies processed (Total: ${totalMovies})`);
          
          // Progress update every 50 pages
          if (page % 50 === 0) {
            const progress = ((page - startPage + 1) / (totalPages - startPage + 1) * 100).toFixed(1);
            console.log(`📈 Progress: ${progress}% (${page - startPage + 1}/${totalPages - startPage + 1} pages from start)`);
          }
          
          // Longer delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          retryCount++;
          console.warn(`⚠️ Page ${page} failed (attempt ${retryCount}):`, error.message);
          
          if (retryCount < maxRetries) {
            // Exponential backoff
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error(`❌ Page ${page} failed after ${maxRetries} attempts, skipping...`);
            errorPages++;
          }
        }
      }
    }
    
    // Final verification
    const finalCount = await Movie.countDocuments();
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n🎉 Resume sync completed!');
    console.log(`📊 Final movie count: ${finalCount}`);
    console.log(`✅ Successful pages: ${successPages}`);
    console.log(`❌ Failed pages: ${errorPages}`);
    console.log(`⏱️ Total time: ${duration} minutes`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Resume sync failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});

// Get start page from command line argument or default to 1007
const startPage = process.argv[2] ? parseInt(process.argv[2]) : 1007;
resumeSyncFromPage(startPage);
