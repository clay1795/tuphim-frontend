#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting TupPhim Development Servers...\n');

// Start Backend Server
console.log('📡 Starting Backend Server...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..', 'backend'),
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3001'
  },
  stdio: ['inherit', 'pipe', 'pipe']
});

backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Start Frontend Server
console.log('🎨 Starting Frontend Server...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  env: { 
    ...process.env,
    NODE_ENV: 'development'
  },
  stdio: ['inherit', 'pipe', 'pipe']
});

frontend.stdout.on('data', (data) => {
  console.log(`[Frontend] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

// Handle backend exit
backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`);
    frontend.kill('SIGINT');
    process.exit(1);
  }
});

// Handle frontend exit
frontend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Frontend server exited with code ${code}`);
    backend.kill('SIGINT');
    process.exit(1);
  }
});

console.log('✅ Both servers started successfully!');
console.log('📱 Use VS Code Port Forwarding to access from mobile devices');
console.log('🔗 Backend API: http://localhost:3001');
console.log('🎬 Frontend: http://localhost:5173');
console.log('\nPress Ctrl+C to stop both servers');
