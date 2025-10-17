const { spawn } = require('child_process');
const path = require('path');

// Port configurations
const PORTS = {
  frontend: 5173,
  backend: 3001
};

function sharePort(port, name) {
  console.log(`🚀 Sharing ${name} port ${port} with ngrok...`);
  
  const ngrok = spawn('ngrok', ['http', port.toString()], {
    stdio: 'inherit',
    shell: true
  });

  ngrok.on('error', (err) => {
    console.error(`❌ Error sharing ${name} port:`, err.message);
  });

  ngrok.on('close', (code) => {
    console.log(`✅ ${name} port sharing stopped with code ${code}`);
  });

  return ngrok;
}

// Get command line arguments
const args = process.argv.slice(2);
const portType = args[0] || 'frontend';

if (portType === 'frontend') {
  console.log('🌐 Starting Frontend Port Sharing (5173)');
  sharePort(PORTS.frontend, 'Frontend');
} else if (portType === 'backend') {
  console.log('🔧 Starting Backend Port Sharing (3001)');
  sharePort(PORTS.backend, 'Backend');
} else if (portType === 'both') {
  console.log('🚀 Starting Both Frontend and Backend Port Sharing');
  console.log('Frontend: http://localhost:5173');
  console.log('Backend: http://localhost:3001');
  
  const frontendNgrok = sharePort(PORTS.frontend, 'Frontend');
  const backendNgrok = sharePort(PORTS.backend, 'Backend');
  
  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping port sharing...');
    frontendNgrok.kill();
    backendNgrok.kill();
    process.exit(0);
  });
} else {
  console.log(`
📖 Usage: node share-port.js [frontend|backend|both]

Examples:
  node share-port.js frontend  # Share frontend port (5173)
  node share-port.js backend   # Share backend port (3001)  
  node share-port.js both      # Share both ports
  node share-port.js           # Default: share frontend port

🔗 After running, ngrok will provide public URLs that you can share.
📱 The URLs will work on any device with internet access.
  `);
}

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping port sharing...');
  process.exit(0);
});
