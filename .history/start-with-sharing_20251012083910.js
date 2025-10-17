const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting TupPhim with Port Sharing...\n');

// Port configurations
const PORTS = {
  frontend: 5173,
  backend: 3001
};

let backendProcess;
let frontendProcess;

function startBackend() {
  console.log('📡 Starting Backend Server...');
  backendProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Backend Error:', err.message);
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 3000); // Wait 3 seconds for backend to start
  });
}

function startFrontend() {
  console.log('🎬 Starting Frontend Server...');
  frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  frontendProcess.on('error', (err) => {
    console.error('❌ Frontend Error:', err.message);
  });
}

async function startWithSharing() {
  try {
    // Start backend first
    await startBackend();
    
    // Start frontend
    startFrontend();
    
    console.log('\n✅ Both servers are starting...');
    console.log(`🌐 Frontend: http://localhost:${PORTS.frontend}`);
    console.log(`🔗 Backend API: http://localhost:${PORTS.backend}/api`);
    console.log('\n📋 To share ports via VS Code:');
    console.log('1. Press Ctrl+Shift+P');
    console.log('2. Type "Ports: Focus on Ports View"');
    console.log('3. Add ports: 5173 (frontend) and 3001 (backend)');
    console.log('4. Right-click on each port and select "Port Visibility: Public"');
    console.log('\n🎯 Or use the existing share-port.js script:');
    console.log('   node share-port.js both');
    
  } catch (error) {
    console.error('❌ Error starting servers:', error);
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping servers...');
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  process.exit(0);
});

startWithSharing();
