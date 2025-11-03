#!/usr/bin/env node

// Script to switch between Dev Tunnel and localhost environments

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'vite.env.js');

const environments = {
  'devtunnel': {
    useDevTunnel: true,
    description: 'Dev Tunnel (external access)'
  },
  'localhost': {
    useDevTunnel: false,
    description: 'Localhost (local only)'
  }
};

const targetEnv = process.argv[2];

if (!targetEnv || !environments[targetEnv]) {
  console.log('🔧 Environment Switcher for TupPhim');
  console.log('');
  console.log('Usage: node switch-env.js <environment>');
  console.log('');
  console.log('Available environments:');
  Object.entries(environments).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(12)} - ${config.description}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node switch-env.js devtunnel   # Use Dev Tunnel');
  console.log('  node switch-env.js localhost   # Use localhost');
  process.exit(1);
}

const config = environments[targetEnv];

// Read current config
let content = fs.readFileSync(envFile, 'utf8');

// Update the useDevTunnel value
content = content.replace(
  /const useDevTunnel = (true|false);/,
  `const useDevTunnel = ${config.useDevTunnel};`
);

// Write back to file
fs.writeFileSync(envFile, content);

console.log(`✅ Switched to ${config.description}`);
console.log(`   useDevTunnel = ${config.useDevTunnel}`);
console.log('');
console.log('🔄 Please restart your Vite dev server to apply changes:');
console.log('   npm run dev');
