// Script to restart development server cleanly
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting development server...');

// Kill any existing Node processes
const killNode = spawn('taskkill', ['/f', '/im', 'node.exe'], { shell: true });
killNode.on('close', () => {
  console.log('✅ Killed existing Node processes');
  
  // Wait a moment then start dev server
  setTimeout(() => {
    console.log('🚀 Starting development server...');
    const devServer = spawn('npm', ['run', 'dev'], { 
      shell: true,
      stdio: 'inherit'
    });
    
    devServer.on('close', (code) => {
      console.log(`Development server exited with code ${code}`);
    });
  }, 2000);
});
