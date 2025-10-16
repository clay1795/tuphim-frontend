import React, { useState, useEffect } from 'react';

const SyncManager = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sync/status');
      const data = await response.json();
      if (data.success) {
        setSyncStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  // Run full sync
  const runFullSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/sync/full', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('🚀 Full sync started in background!');
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('Error starting full sync:', error);
      alert('❌ Failed to start full sync');
    } finally {
      setLoading(false);
    }
  };

  // Run incremental sync
  const runIncrementalSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/sync/incremental', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('🔄 Incremental sync started in background!');
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('Error starting incremental sync:', error);
      alert('❌ Failed to start incremental sync');
    } finally {
      setLoading(false);
    }
  };

  // Force hourly sync
  const forceHourlySync = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/sync/force-hourly', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Hourly sync completed!\nNew: ${data.data.newMovies}\nUpdated: ${data.data.updatedMovies}`);
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('Error running hourly sync:', error);
      alert('❌ Failed to run hourly sync');
    } finally {
      setLoading(false);
    }
  };

  // Start/Stop scheduler
  const toggleScheduler = async (action) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/sync/${action}-scheduler`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Scheduler ${action}ed!`);
        fetchSyncStatus();
      }
    } catch (error) {
      console.error(`Error ${action}ing scheduler:`, error);
      alert(`❌ Failed to ${action} scheduler`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (isRunning) => {
    return isRunning ? 'text-green-500' : 'text-gray-500';
  };

  const getStatusText = (isRunning) => {
    return isRunning ? '🟢 Running' : '🔴 Stopped';
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">🔄 KKPhim Sync Manager</h2>

      {/* Sync Status */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📊 Sync Status</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Movies:</span> {syncStatus.sync.totalMovies.toLocaleString()}</p>
              <p><span className="font-medium">Last Sync:</span> {formatDate(syncStatus.sync.lastSyncTime)}</p>
              <p><span className="font-medium">Initial Sync:</span> <span className={getStatusColor(syncStatus.sync.isInitialSync)}>{getStatusText(syncStatus.sync.isInitialSync)}</span></p>
              <p><span className="font-medium">Incremental Sync:</span> <span className={getStatusColor(syncStatus.sync.isIncrementalSync)}>{getStatusText(syncStatus.sync.isIncrementalSync)}</span></p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">⏰ Scheduler Status</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Status:</span> <span className={getStatusColor(syncStatus.scheduler.isRunning)}>{getStatusText(syncStatus.scheduler.isRunning)}</span></p>
              <p><span className="font-medium">Hourly Job:</span> <span className={getStatusColor(syncStatus.scheduler.jobs.hourly?.running)}>{getStatusText(syncStatus.scheduler.jobs.hourly?.running)}</span></p>
              <p><span className="font-medium">Health Check:</span> <span className={getStatusColor(syncStatus.scheduler.jobs.health?.running)}>{getStatusText(syncStatus.scheduler.jobs.health?.running)}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Schedule */}
      {syncStatus && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">📅 Sync Schedule</h3>
          <div className="space-y-1">
            <p><span className="font-medium">🕐 Hourly Sync:</span> {syncStatus.nextSchedules.hourly}</p>
            <p><span className="font-medium">🌅 Daily Full Sync:</span> {syncStatus.nextSchedules.daily}</p>
            <p><span className="font-medium">💚 Health Check:</span> {syncStatus.nextSchedules.health}</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={runFullSync}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '⏳ Loading...' : '🚀 Full Sync'}
        </button>

        <button
          onClick={runIncrementalSync}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '⏳ Loading...' : '🔄 Incremental Sync'}
        </button>

        <button
          onClick={forceHourlySync}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '⏳ Loading...' : '⏰ Force Hourly Sync'}
        </button>

        <button
          onClick={() => toggleScheduler(syncStatus?.scheduler.isRunning ? 'stop' : 'start')}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '⏳ Loading...' : (syncStatus?.scheduler.isRunning ? '🛑 Stop Scheduler' : '▶️ Start Scheduler')}
        </button>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchSyncStatus}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold mb-2">ℹ️ How it works:</h4>
        <ul className="text-sm space-y-1">
          <li>• <strong>Full Sync:</strong> Load toàn bộ phim từ KKPhim (chạy lần đầu)</li>
          <li>• <strong>Incremental Sync:</strong> Chỉ fetch phim mới/đã update</li>
          <li>• <strong>Hourly Sync:</strong> Tự động chạy mỗi giờ để sync phim mới</li>
          <li>• <strong>Scheduler:</strong> Quản lý việc tự động sync</li>
        </ul>
      </div>
    </div>
  );
};

export default SyncManager;
