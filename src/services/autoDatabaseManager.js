import instantSearchApi from './instantSearchApi';
import { persistentCache } from './persistentCache';

class AutoDatabaseManager {
  constructor() {
    this.isLoading = false;
    this.lastUpdateTime = null;
    this.updateInterval = null;
    this.listeners = [];
    this.stats = {
      movies: 0,
      categories: 0,
      countries: 0,
      years: 0
    };
  }

  // Initialize auto database manager
  async initialize() {
    try {
      console.log('🚀 Initializing Auto Database Manager...');
      
      // Load cached database info
      const cacheInfo = await persistentCache.getCacheInfo('full_database');
      if (cacheInfo) {
        this.lastUpdateTime = cacheInfo.timestamp;
        console.log('📅 Last update time:', new Date(this.lastUpdateTime).toLocaleString());
      }
      
      // Get current stats
      this.stats = instantSearchApi.getStats();
      this.notifyListeners('statsUpdated', this.stats);
      
      // Check if database needs update (older than 24 hours)
      const needsUpdate = this.shouldUpdateDatabase();
      
      if (needsUpdate) {
        console.log('🔄 Database needs update, starting automatic download...');
        await this.downloadFullDatabase();
      } else {
        console.log('✅ Database is up to date');
      }
      
      // Setup automatic daily updates
      this.setupDailyUpdates();
      
      return {
        success: true,
        needsUpdate,
        lastUpdateTime: this.lastUpdateTime,
        stats: this.stats,
        message: needsUpdate ? 'Database updated automatically' : 'Database is current'
      };
      
    } catch (error) {
      console.error('❌ Error initializing auto database manager:', error);
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
      this.notifyListeners('downloadStarted');

      // Download with progress callback
      const result = await instantSearchApi.loadFullDatabase((progress) => {
        console.log(`📊 Download progress: ${progress.percentage.toFixed(1)}% (${progress.current}/${progress.total} pages)`);
        
        // Call external progress callback
        if (onProgress) {
          onProgress(progress);
        }
        
        // Notify listeners
        this.notifyListeners('downloadProgress', progress);
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Update last update time
      this.lastUpdateTime = Date.now();
      
      // Save update time to cache
      await persistentCache.saveToLocalStorage('database_update_time', this.lastUpdateTime);
      
      // Update stats
      this.stats = instantSearchApi.getStats();
      this.notifyListeners('statsUpdated', this.stats);
      
      console.log('✅ Full database download completed:', result);
      this.notifyListeners('downloadCompleted', result);

      return result;

    } catch (error) {
      console.error('❌ Error downloading full database:', error);
      this.notifyListeners('downloadError', error);
      throw error;
    } finally {
      this.isLoading = false;
      this.notifyListeners('downloadFinished');
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
        this.notifyListeners('updateCheckStarted');
        
        if (this.shouldUpdateDatabase()) {
          console.log('🔄 Database update needed, starting background update...');
          this.notifyListeners('backgroundUpdateStarted');
          await this.downloadFullDatabase();
          this.notifyListeners('backgroundUpdateCompleted');
        } else {
          console.log('✅ Database is up to date');
          this.notifyListeners('updateCheckCompleted', { needsUpdate: false });
        }
      } catch (error) {
        console.error('❌ Error in background update:', error);
        this.notifyListeners('backgroundUpdateError', error);
      }
    }, 60 * 60 * 1000); // Check every hour

    console.log('⏰ Daily update check scheduled (every hour)');
    this.notifyListeners('dailyUpdatesEnabled');
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
      
      const result = {
        ...stats,
        lastUpdateTime: this.lastUpdateTime,
        cacheInfo: cacheInfo,
        isLoading: this.isLoading,
        needsUpdate: this.shouldUpdateDatabase()
      };
      
      this.stats = stats;
      return result;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { error: error.message };
    }
  }

  // Event listener system
  addListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  removeListener(event, callback) {
    this.listeners = this.listeners.filter(listener => 
      !(listener.event === event && listener.callback === callback)
    );
  }

  notifyListeners(event, data = null) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`❌ Error in listener for ${event}:`, error);
        }
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
    console.log('🧹 Auto database manager cleaned up');
  }
}

// Create singleton instance
const autoDatabaseManager = new AutoDatabaseManager();

export default autoDatabaseManager;
