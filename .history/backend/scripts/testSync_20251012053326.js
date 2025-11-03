const kkphimSyncService = require('../services/kkphimSyncService');
const syncScheduler = require('../services/syncScheduler');
const logger = require('../services/logger');

async function testSyncSystem() {
  try {
    console.log('🧪 Testing KKPhim Sync System...\n');

    // Test 1: Check sync status
    console.log('1️⃣ Checking sync status...');
    const status = await kkphimSyncService.getSyncStatus();
    console.log('📊 Current Status:', {
      totalMovies: status.totalMovies,
      lastSync: status.lastSyncTime,
      isRunning: status.isInitialSync || status.isIncrementalSync
    });

    // Test 2: Run incremental sync
    console.log('\n2️⃣ Running incremental sync...');
    const incrementalStats = await kkphimSyncService.incrementalSync();
    console.log('✅ Incremental sync completed:', incrementalStats);

    // Test 3: Check sync stats
    console.log('\n3️⃣ Checking sync statistics...');
    const stats = kkphimSyncService.getSyncStats();
    console.log('📈 Sync Stats:', stats);

    // Test 4: Test scheduler
    console.log('\n4️⃣ Testing scheduler...');
    const schedulerStatus = syncScheduler.getStatus();
    console.log('⏰ Scheduler Status:', schedulerStatus);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if called directly
if (require.main === module) {
  testSyncSystem()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testSyncSystem;
