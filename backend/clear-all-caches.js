const kkphimApi = require('./services/kkphimApi');
const fs = require('fs').promises;
const path = require('path');

async function clearAllCaches() {
  try {
    console.log('🧹 Clearing KKPhim API cache...');
    kkphimApi.clearCache();
    console.log('✅ KKPhim API cache cleared');
    
    console.log('🧹 Clearing MovieCache...');
    // Clear cache file
    const cacheFile = path.join(__dirname, 'data/movieCache.json');
    try {
      await fs.unlink(cacheFile);
      console.log('✅ MovieCache file deleted');
    } catch (error) {
      console.log('ℹ️ MovieCache file not found or already deleted');
    }
    
    console.log('🎉 All caches cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

clearAllCaches();



