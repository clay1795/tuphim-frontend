import { useState, useEffect } from 'react';
import instantSearchApi from '../services/instantSearchApi';

const BasicDatabaseManager = () => {
  const [stats, setStats] = useState({
    movies: 0,
    categories: 0,
    countries: 0,
    years: 0,
    lastUpdateTime: null,
    isLoading: false
  });
  const [downloadProgress, setDownloadProgress] = useState({ percentage: 0, current: 0, total: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize basic stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('📊 Loading basic database stats...');
        const stats = instantSearchApi.getStats();
        setStats(prev => ({
          ...prev,
          ...stats,
          lastUpdateTime: Date.now()
        }));
        console.log('✅ Basic stats loaded:', stats);
      } catch (error) {
        console.error('❌ Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  // Manual download trigger
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('🔄 Manual download triggered...');
      
      const result = await instantSearchApi.loadFullDatabase((progress) => {
        setDownloadProgress(progress);
      });
      
      if (result.error) {
        console.error('❌ Download failed:', result.error);
      } else {
        console.log('✅ Download completed:', result);
        // Refresh stats
        const newStats = instantSearchApi.getStats();
        setStats(prev => ({
          ...prev,
          ...newStats,
          lastUpdateTime: Date.now()
        }));
      }
      
    } catch (error) {
      console.error('❌ Error triggering download:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Format last update time
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    try {
      console.log('🧹 Clearing cache...');
      await instantSearchApi.clearCache();
      setStats(prev => ({ 
        ...prev, 
        movies: 0, 
        categories: 0, 
        countries: 0, 
        years: 0 
      }));
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        🗄️ Basic Database Manager
        {isDownloading && <span className="ml-2 text-blue-400">⏳</span>}
      </h3>

      {/* Database Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{stats.movies.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Movies</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.categories}</div>
          <div className="text-sm text-gray-400">Categories</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{stats.countries}</div>
          <div className="text-sm text-gray-400">Countries</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">{stats.years}</div>
          <div className="text-sm text-gray-400">Years</div>
        </div>
      </div>

      {/* Update Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Last Update:</span>
          <span className="text-sm text-green-400">
            {formatLastUpdate(stats.lastUpdateTime)}
          </span>
        </div>
        
        {isDownloading && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.percentage}%` }}
            ></div>
          </div>
        )}
        
        {isDownloading && (
          <div className="text-xs text-gray-400 text-center">
            {downloadProgress.percentage.toFixed(1)}% ({downloadProgress.current}/{downloadProgress.total} pages)
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
        >
          {isDownloading ? '⏳ Downloading...' : '🔄 Download Full Database'}
        </button>
        
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
        >
          🧹 Clear Cache
        </button>
        
        <button
          onClick={() => {
            const newStats = instantSearchApi.getStats();
            setStats(prev => ({
              ...prev,
              ...newStats,
              lastUpdateTime: Date.now()
            }));
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center"
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Database Info */}
      <div className="text-xs text-gray-400">
        <div>📊 Search mode: {stats.movies > 1000 ? 'Full Database' : 'Limited'}</div>
        <div>⚡ Performance: {stats.movies > 10000 ? 'Ultra Fast' : stats.movies > 1000 ? 'Fast' : 'Normal'}</div>
        <div>🔄 Manual updates: Click "Download Full Database" to update</div>
      </div>
    </div>
  );
};

export default BasicDatabaseManager;
