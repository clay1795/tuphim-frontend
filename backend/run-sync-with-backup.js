#!/usr/bin/env node

const kkphimSyncService = require('./services/kkphimSyncService');
const backupService = require('./services/backupService');
const syncScheduler = require('./services/syncScheduler');
const logger = require('./services/logger');

async function runSyncWithBackup() {
  try {
    console.log('🚀 Starting sync with backup process...');
    console.log('⏰ Time:', new Date().toLocaleString());
    
    // Bước 1: Chạy full sync
    console.log('\n📡 Step 1: Running full sync...');
    const syncStats = await kkphimSyncService.fullSync();
    console.log('✅ Sync completed:', syncStats);
    
    // Bước 2: Tạo backup
    console.log('\n💾 Step 2: Creating backup...');
    const backupResults = await backupService.createFullBackup();
    console.log('✅ Backup completed:', backupResults);
    
    // Bước 3: Khởi động scheduler
    console.log('\n🕐 Step 3: Starting scheduler...');
    syncScheduler.start();
    console.log('✅ Scheduler started - will sync and backup automatically');
    
    console.log('\n🎉 All processes completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Movies synced: ${syncStats.totalMovies || 0}`);
    console.log(`   • New movies: ${syncStats.newMovies || 0}`);
    console.log(`   • Updated movies: ${syncStats.updatedMovies || 0}`);
    console.log(`   • Backup created: ${backupResults.jsonBackup || 'N/A'}`);
    console.log(`   • Scheduler: Running (hourly sync + backup)`);
    
    console.log('\n🌐 Dev Tunnels URLs:');
    console.log('   • Frontend: https://33ss6xpk-5173.asse.devtunnels.ms/');
    console.log('   • Backend: https://33ss6xpk-3001.asse.devtunnels.ms/');
    
    // Giữ process chạy để scheduler hoạt động
    console.log('\n⏳ Scheduler is running... Press Ctrl+C to stop');
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping scheduler...');
      syncScheduler.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
}

// Chạy nếu được gọi trực tiếp
if (require.main === module) {
  runSyncWithBackup();
}

module.exports = runSyncWithBackup;

