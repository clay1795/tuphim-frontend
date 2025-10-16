const mongoose = require('mongoose');
const kkphimApi = require('./kkphimApi');
const logger = require('../utils/logger');

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

// Indexes for efficient querying
movieSchema.index({ slug: 1 });
movieSchema.index({ kkphim_id: 1 });
movieSchema.index({ last_sync: 1 });
movieSchema.index({ kkphim_modified: 1 });

const Movie = mongoose.model('Movie', movieSchema);

class KKPhimSyncService {
  constructor() {
    this.isInitialSync = false;
    this.isIncrementalSync = false;
    this.lastSyncTime = null;
    this.syncStats = {
      totalMovies: 0,
      newMovies: 0,
      updatedMovies: 0,
      errors: 0
    };
  }

  async connect() {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI not found in environment variables');
      }
      await mongoose.connect(mongoUri);
      logger.info('✅ Connected to MongoDB for KKPhim Sync Service');
    }
  }

  /**
   * Thực hiện full sync - load toàn bộ phim từ KKPhim
   */
  async fullSync() {
    try {
      logger.info('🚀 Starting full sync from KKPhim...');
      this.isInitialSync = true;
      this.syncStats = { totalMovies: 0, newMovies: 0, updatedMovies: 0, errors: 0 };

      await this.connect();

      // Fetch tất cả phim từ KKPhim với batch processing
      const allMovies = await this.fetchAllMoviesFromKKPhim();
      
      logger.info(`📊 Fetched ${allMovies.length} movies from KKPhim`);

      // Clear existing data và insert mới
      await Movie.deleteMany({});
      logger.info('🗑️ Cleared existing movie data');

      // Insert tất cả phim mới
      const insertedMovies = await this.insertMoviesInBatches(allMovies);
      
      this.syncStats.totalMovies = insertedMovies.length;
      this.syncStats.newMovies = insertedMovies.length;
      this.lastSyncTime = new Date();

      logger.info(`🎉 Full sync completed: ${insertedMovies.length} movies synced`);
      return this.syncStats;

    } catch (error) {
      logger.error('❌ Full sync failed:', error);
      throw error;
    } finally {
      this.isInitialSync = false;
    }
  }

  /**
   * Thực hiện incremental sync - chỉ fetch phim mới/đã update
   */
  async incrementalSync() {
    try {
      logger.info('🔄 Starting incremental sync...');
      this.isIncrementalSync = true;
      this.syncStats = { totalMovies: 0, newMovies: 0, updatedMovies: 0, errors: 0 };

      await this.connect();

      // Lấy thời gian sync cuối cùng
      const lastSync = await this.getLastSyncTime();
      
      // Fetch phim mới từ KKPhim (chỉ những phim được update sau thời gian sync cuối)
      const newMovies = await this.fetchNewMoviesFromKKPhim(lastSync);
      
      logger.info(`📊 Found ${newMovies.length} new/updated movies since last sync`);

      if (newMovies.length > 0) {
        // Process và update database
        await this.processNewMovies(newMovies);
      }

      // Update last sync time
      this.lastSyncTime = new Date();
      await this.updateLastSyncTime(this.lastSyncTime);

      logger.info(`✅ Incremental sync completed: ${this.syncStats.newMovies} new, ${this.syncStats.updatedMovies} updated`);
      return this.syncStats;

    } catch (error) {
      logger.error('❌ Incremental sync failed:', error);
      throw error;
    } finally {
      this.isIncrementalSync = false;
    }
  }

  /**
   * Fetch toàn bộ phim từ KKPhim với pagination
   */
  async fetchAllMoviesFromKKPhim() {
    const allMovies = [];
    let page = 1;
    const batchSize = 50;
    let hasMore = true;

    logger.info('📡 Fetching all movies from KKPhim...');

    while (hasMore && page <= 10000) { // Safety limit
      try {
        const batchPromises = [];
        
        // Fetch multiple pages in parallel
        for (let i = 0; i < batchSize && page <= 10000; i++) {
          batchPromises.push(
            kkphimApi.getNewMovies(page + i, 20).catch(err => {
              logger.warn(`Failed to fetch page ${page + i}:`, err.message);
              return null;
            })
          );
        }

        const batchResults = await Promise.all(batchPromises);
        
        let batchMovies = [];
        for (const result of batchResults) {
          if (result && result.success && result.data && result.data.items) {
            batchMovies = batchMovies.concat(result.data.items);
          }
        }

        if (batchMovies.length === 0) {
          hasMore = false;
          break;
        }

        // Add metadata cho mỗi movie
        const moviesWithMetadata = batchMovies.map(movie => ({
          ...movie,
          kkphim_id: movie._id || movie.slug,
          kkphim_modified: movie.modified ? new Date(movie.modified.time) : new Date(),
          last_sync: new Date()
        }));

        allMovies.push(...moviesWithMetadata);
        
        logger.info(`📊 Fetched pages ${page}-${page + batchSize - 1}: ${batchMovies.length} movies (Total: ${allMovies.length})`);
        
        page += batchSize;

        // Small delay để tránh rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Safety limit để tránh crash
        if (allMovies.length >= 25000) {
          logger.info(`🛑 Safety limit reached: ${allMovies.length} movies`);
          break;
        }

      } catch (error) {
        logger.error(`❌ Error fetching batch at page ${page}:`, error);
        page += batchSize; // Skip this batch
      }
    }

    logger.info(`✅ Total movies fetched: ${allMovies.length}`);
    return allMovies;
  }

  /**
   * Fetch phim mới từ KKPhim (incremental)
   */
  async fetchNewMoviesFromKKPhim(lastSyncTime) {
    const newMovies = [];
    let page = 1;
    const batchSize = 10; // Smaller batch for incremental sync
    let hasMore = true;

    logger.info(`📡 Fetching new movies since ${lastSyncTime}...`);

    while (hasMore && page <= 1000) { // Limit for incremental sync
      try {
        const result = await kkphimApi.getNewMovies(page, 20);
        
        if (!result.success || !result.data || !result.data.items) {
          hasMore = false;
          break;
        }

        const movies = result.data.items;
        let foundNewMovies = false;

        for (const movie of movies) {
          const movieModifiedTime = movie.modified ? new Date(movie.modified.time) : new Date();
          
          // Chỉ lấy phim được modify sau thời gian sync cuối
          if (movieModifiedTime > lastSyncTime) {
            newMovies.push({
              ...movie,
              kkphim_id: movie._id || movie.slug,
              kkphim_modified: movieModifiedTime,
              last_sync: new Date()
            });
            foundNewMovies = true;
          }
        }

        if (!foundNewMovies) {
          // Không có phim mới trong batch này, có thể dừng
          hasMore = false;
        } else {
          page++;
        }

        logger.info(`📊 Page ${page}: ${movies.length} movies checked, ${newMovies.length} new found`);

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        logger.error(`❌ Error fetching page ${page}:`, error);
        page++;
      }
    }

    logger.info(`✅ Found ${newMovies.length} new/updated movies`);
    return newMovies;
  }

  /**
   * Insert movies vào database theo batches
   */
  async insertMoviesInBatches(movies) {
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < movies.length; i += batchSize) {
      batches.push(movies.slice(i, i + batchSize));
    }

    logger.info(`📦 Processing ${batches.length} batches...`);

    const insertedMovies = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        // Insert batch
        const result = await Movie.insertMany(batch, { ordered: false });
        insertedMovies.push(...result);
        
        logger.info(`✅ Batch ${i + 1}/${batches.length}: ${result.length} movies inserted`);
        
      } catch (error) {
        logger.error(`❌ Batch ${i + 1} failed:`, error.message);
        this.syncStats.errors += batch.length;
      }
    }

    return insertedMovies;
  }

  /**
   * Process phim mới (upsert)
   */
  async processNewMovies(movies) {
    for (const movie of movies) {
      try {
        const result = await Movie.updateOne(
          { slug: movie.slug },
          { $set: movie },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          this.syncStats.newMovies++;
        } else if (result.modifiedCount > 0) {
          this.syncStats.updatedMovies++;
        }

      } catch (error) {
        logger.error(`❌ Error processing movie ${movie.name}:`, error);
        this.syncStats.errors++;
      }
    }
  }

  /**
   * Lấy thời gian sync cuối cùng
   */
  async getLastSyncTime() {
    try {
      const lastMovie = await Movie.findOne({}, { last_sync: 1 })
        .sort({ last_sync: -1 });
      
      return lastMovie ? lastMovie.last_sync : new Date(0); // Unix epoch nếu chưa có data
    } catch (error) {
      logger.error('❌ Error getting last sync time:', error);
      return new Date(0);
    }
  }

  /**
   * Update thời gian sync cuối cùng
   */
  async updateLastSyncTime(syncTime) {
    // Thời gian sync được lưu trong mỗi movie record
    // Không cần lưu riêng
    logger.info(`📅 Last sync time updated: ${syncTime}`);
  }

  /**
   * Lấy sync statistics
   */
  getSyncStats() {
    return {
      ...this.syncStats,
      lastSyncTime: this.lastSyncTime,
      isInitialSync: this.isInitialSync,
      isIncrementalSync: this.isIncrementalSync
    };
  }

  /**
   * Kiểm tra trạng thái sync
   */
  async getSyncStatus() {
    await this.connect();
    
    const totalMovies = await Movie.countDocuments();
    const lastSync = await this.getLastSyncTime();
    
    return {
      totalMovies,
      lastSyncTime: lastSync,
      isInitialSync: this.isInitialSync,
      isIncrementalSync: this.isIncrementalSync,
      syncStats: this.syncStats
    };
  }
}

module.exports = new KKPhimSyncService();
