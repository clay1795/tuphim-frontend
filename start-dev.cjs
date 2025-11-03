#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting TupPhim Development Environment...\n');

// Get local IP address
const os = require('os');
const networkInterfaces = os.networkInterfaces();
let localIP = 'localhost';

Object.keys(networkInterfaces).forEach((interfaceName) => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach((iface) => {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address;
    }
  });
});

// Start Backend
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: '/bin/zsh',
  env: process.env
});

backend.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Server running on port')) {
    console.log('✅ Backend Server Started Successfully!');
    console.log(`   🌐 Backend URL: http://${localIP}:3001`);
    console.log(`   📚 API Docs: http://${localIP}:3001/api\n`);
  }
  process.stdout.write(`[BACKEND] ${output}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND ERROR] ${data}`);
});

// Start Frontend
console.log('🎨 Starting Frontend Server...');
const frontend = spawn('npm', ['run', 'dev:network'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: '/bin/zsh',
  env: process.env
});

frontend.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Local:')) {
    console.log('✅ Frontend Server Started Successfully!');
    console.log(`   🌐 Frontend URL: http://${localIP}:5173`);
    console.log(`   📱 Mobile Access: Use the network URL on your mobile device\n`);
    console.log('🎉 Development environment is ready!');
    console.log('📱 To access from mobile devices:');
    console.log(`   • Connect to the same WiFi network`);
    console.log(`   • Open browser and go to: http://${localIP}:5173`);
    console.log(`   • Or scan QR code (if available)\n`);
  }
  process.stdout.write(`[FRONTEND] ${output}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`[FRONTEND ERROR] ${data}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

// Handle backend exit
backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`);
  }
});

// Handle frontend exit
frontend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Frontend server exited with code ${code}`);
  }
});

