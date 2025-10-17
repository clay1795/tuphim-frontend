#!/usr/bin/env node

/**
 * Build Test Script
 * Kiểm tra build process và các tính năng cơ bản
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Bắt đầu kiểm tra build...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileSize(filePath, maxSizeKB) {
  if (!checkFileExists(filePath)) return false;
  const stats = fs.statSync(filePath);
  const sizeKB = stats.size / 1024;
  return sizeKB <= maxSizeKB;
}

try {
  // 1. Kiểm tra dependencies
  log('📦 Kiểm tra dependencies...', 'blue');
  execSync('npm install --silent', { stdio: 'inherit' });
  log('✅ Dependencies installed successfully', 'green');

  // 2. Lint check
  log('\n🔍 Kiểm tra linting...', 'blue');
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    log('✅ Linting passed', 'green');
  } catch (error) {
    log('⚠️ Linting issues found:', 'yellow');
    console.log(error.stdout.toString());
  }

  // 3. Build test
  log('\n🔨 Kiểm tra build process...', 'blue');
  execSync('npm run build', { stdio: 'inherit' });
  log('✅ Build completed successfully', 'green');

  // 4. Kiểm tra output files
  log('\n📁 Kiểm tra output files...', 'blue');
  
  const requiredFiles = [
    'dist/index.html',
    'dist/assets'
  ];

  for (const file of requiredFiles) {
    if (checkFileExists(file)) {
      log(`✅ ${file} exists`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
    }
  }

  // 5. Kiểm tra bundle size
  log('\n📊 Kiểm tra bundle size...', 'blue');
  
  const assetsDir = 'dist/assets';
  if (checkFileExists(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      totalSize += sizeKB;
      
      if (file.endsWith('.js')) {
        if (sizeKB > 1000) {
          log(`⚠️ ${file}: ${sizeKB.toFixed(1)}KB (large)`, 'yellow');
        } else {
          log(`✅ ${file}: ${sizeKB.toFixed(1)}KB`, 'green');
        }
      }
      
      if (file.endsWith('.css')) {
        if (sizeKB > 200) {
          log(`⚠️ ${file}: ${sizeKB.toFixed(1)}KB (large)`, 'yellow');
        } else {
          log(`✅ ${file}: ${sizeKB.toFixed(1)}KB`, 'green');
        }
      }
    });
    
    log(`📊 Total assets size: ${totalSize.toFixed(1)}KB`, 'blue');
    
    if (totalSize > 2000) {
      log('⚠️ Total bundle size is large (>2MB)', 'yellow');
    } else {
      log('✅ Bundle size is acceptable', 'green');
    }
  }

  // 6. Kiểm tra environment files
  log('\n🔧 Kiểm tra environment files...', 'blue');
  
  const envFiles = [
    'env.development',
    'env.production'
  ];

  for (const envFile of envFiles) {
    if (checkFileExists(envFile)) {
      log(`✅ ${envFile} exists`, 'green');
      
      // Kiểm tra nội dung cơ bản
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('VITE_API_BASE_URL')) {
        log(`✅ ${envFile} has API configuration`, 'green');
      } else {
        log(`⚠️ ${envFile} missing API configuration`, 'yellow');
      }
    } else {
      log(`❌ ${envFile} missing`, 'red');
    }
  }

  // 7. Kiểm tra deployment files
  log('\n🚀 Kiểm tra deployment files...', 'blue');
  
  const deployFiles = [
    'DEPLOYMENT.md',
    'TESTING_CHECKLIST.md'
  ];

  for (const file of deployFiles) {
    if (checkFileExists(file)) {
      log(`✅ ${file} exists`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
    }
  }

  log('\n🎉 Build test completed!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Run: npm run preview (to test production build)', 'reset');
  log('2. Follow TESTING_CHECKLIST.md for manual testing', 'reset');
  log('3. Deploy using DEPLOYMENT.md guide', 'reset');

} catch (error) {
  log('\n❌ Build test failed:', 'red');
  console.error(error.message);
  process.exit(1);
}

