import { instantSearchApi } from './instantSearchApi';
import { persistentCache } from './persistentCache';

class DatabaseManager {
  constructor() {
    this.isLoading = false;
    this.lastUpdateTime = null;
    this.updateInterval = null;
    this.listeners = [];
  }

  // Initialize database manager
  async initialize() {
    try {
      console.log('🚀 Initializing Database Manager...');
      
      // Load cached database info
      const cacheInfo = await persistentCache.getCacheInfo('full_database');
      if (cacheInfo) {
        this.lastUpdateTime = cacheInfo.timestamp;
        console.log('📅 Last update time:', new Date(this.lastUpdateTime).toLocaleString());
      }
      
      // Check if database needs update (older than 24 hours)
      const needsUpdate = this.shouldUpdateDatabase();
      
      if (needsUpdate) {
        console.log('🔄 Database needs update, starting full download...');
        await this.downloadFullDatabase();
      } else {
        console.log('✅ Database is up to date');
      // Load existing database from cache
      const cacheResult = await instantSearchApi.loadFullDatabaseFromCache();
      if (!cacheResult.success) {
        console.log('⚠️ Failed to load from cache, will need to download');
      }
      }
      
      // Setup automatic daily updates
      this.setupDailyUpdates();
      
      return {
        success: true,
        needsUpdate,
        lastUpdateTime: this.lastUpdateTime,
        message: needsUpdate ? 'Database updated' : 'Database is current'
      };
      
    } catch (error) {
      console.error('❌ Error initializing database manager:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if database should be updated
  shouldUpdateDatabase() {
    if (!this.lastUpdateTime) {
      return true; // No previous update, need to download
    }
    
    const now = Date.now();
    const hoursSinceUpdate = (now - this.lastUpdateTime) / (1000 * 60 * 60);
    
    console.log(`⏰ Hours since last update: ${hoursSinceUpdate.toFixed(2)}`);
    
    return hoursSinceUpdate >= 24; // Update if older than 24 hours
  }

  // Download full database with progress tracking
  async downloadFullDatabase(onProgress = null) {
    try {
      if (this.isLoading) {
        console.log('⏳ Database download already in progress...');
        return;
      }

      this.isLoading = true;
      console.log('📥 Starting full database download...');
      
      // Notify listeners
      this.notifyListeners({ type: 'download_started', progress: 0 });

      // Download with progress callback
      const result = await instantSearchApi.loadFullDatabase((progress) => {
        console.log(`📊 Download progress: ${progress.percentage.toFixed(1)}% (${progress.current}/${progress.total} pages)`);
        
        // Notify listeners
        this.notifyListeners({ 
          type: 'download_progress', 
          progress: progress.percentage,
          current: progress.current,
          total: progress.total
        });
        
        // Call external progress callback
        if (onProgress) {
          onProgress(progress);
        }
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Update last update time
      this.lastUpdateTime = Date.now();
      
      // Save update time to cache
      await persistentCache.saveToLocalStorage('database_update_time', this.lastUpdateTime);
      
      console.log('✅ Full database download completed:', result);
      
      // Notify listeners
      this.notifyListeners({ 
        type: 'download_completed', 
        result: result,
        lastUpdateTime: this.lastUpdateTime
      });

      return result;

    } catch (error) {
      console.error('❌ Error downloading full database:', error);
      
      // Notify listeners
      this.notifyListeners({ 
        type: 'download_error', 
        error: error.message
      });
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Load database from cache
  async loadFromCache() {
    try {
      console.log('📂 Loading database from cache...');
      
      const result = await instantSearchApi.loadFromCache();
      
      if (result.success) {
        console.log('✅ Database loaded from cache:', result.stats);
        return result;
      } else {
        console.log('⚠️ No cached database found, will need to download');
        return { success: false, message: 'No cached database' };
      }
      
    } catch (error) {
      console.error('❌ Error loading from cache:', error);
      return { success: false, error: error.message };
    }
  }

  // Setup automatic daily updates
  setupDailyUpdates() {
    // Clear existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Check for updates every hour
    this.updateInterval = setInterval(async () => {
      try {
        console.log('🕐 Checking for database updates...');
        
        if (this.shouldUpdateDatabase()) {
          console.log('🔄 Database update needed, starting background update...');
          await this.downloadFullDatabase();
        } else {
          console.log('✅ Database is up to date');
        }
      } catch (error) {
        console.error('❌ Error in background update:', error);
      }
    }, 60 * 60 * 1000); // Check every hour

    console.log('⏰ Daily update check scheduled (every hour)');
  }

  // Manual update trigger
  async triggerUpdate(onProgress = null) {
    console.log('🔄 Manual database update triggered');
    return await this.downloadFullDatabase(onProgress);
  }

  // Get database statistics
  async getStats() {
    try {
      const stats = instantSearchApi.getStats();
      const cacheInfo = await persistentCache.getCacheInfo('full_database');
      
      return {
        ...stats,
        lastUpdateTime: this.lastUpdateTime,
        cacheInfo: cacheInfo,
        isLoading: this.isLoading,
        needsUpdate: this.shouldUpdateDatabase()
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { error: error.message };
    }
  }

  // Add listener for database events
  addListener(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Error in listener callback:', error);
      }
    });
  }

  // Cleanup
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.listeners = [];
    console.log('🧹 Database manager cleaned up');
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

export default databaseManager;
