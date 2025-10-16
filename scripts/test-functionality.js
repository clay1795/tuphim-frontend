#!/usr/bin/env node

/**
 * Comprehensive Functionality Test Script
 * Kiểm tra tất cả tính năng chính của TupPhim
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Bắt đầu kiểm tra toàn diện các tính năng TupPhim...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, searchText) {
  if (!checkFileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchText);
}

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function addTest(name, status, message = '') {
  testResults.tests.push({ name, status, message });
  if (status === 'pass') {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else if (status === 'fail') {
    testResults.failed++;
    log(`❌ ${name}: ${message}`, 'red');
  } else if (status === 'warning') {
    testResults.warnings++;
    log(`⚠️ ${name}: ${message}`, 'yellow');
  }
}

try {
  log('🔍 KIỂM TRA CẤU TRÚC DỰ ÁN', 'cyan');
  log('=' .repeat(50), 'cyan');

  // 1. Kiểm tra package.json
  log('\n📦 Kiểm tra package.json...', 'blue');
  if (checkFileExists('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.name === 'tuphim-app') {
      addTest('Package name updated to tuphim-app', 'pass');
    } else {
      addTest('Package name', 'fail', `Expected 'tuphim-app', got '${packageJson.name}'`);
    }

    // Kiểm tra scripts
    const requiredScripts = ['dev', 'build', 'lint', 'test:build'];
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        addTest(`Script '${script}' exists`, 'pass');
      } else {
        addTest(`Script '${script}'`, 'fail', 'Missing required script');
      }
    });
  } else {
    addTest('package.json exists', 'fail', 'package.json not found');
  }

  // 2. Kiểm tra index.html
  log('\n🌐 Kiểm tra index.html...', 'blue');
  if (checkFileExists('index.html')) {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    if (htmlContent.includes('TupPhim - Xem Phim Online HD')) {
      addTest('Title updated to TupPhim', 'pass');
    } else {
      addTest('Title branding', 'fail', 'Title not updated to TupPhim');
    }

    if (htmlContent.includes('tuphim.com')) {
      addTest('URL consistency (tuphim.com)', 'pass');
    } else {
      addTest('URL consistency', 'fail', 'URL not updated to tuphim.com');
    }

    if (htmlContent.includes('/src/assets/logos/logo.jpg')) {
      addTest('Favicon using local logo', 'pass');
    } else {
      addTest('Favicon configuration', 'warning', 'Not using local logo');
    }
  } else {
    addTest('index.html exists', 'fail', 'index.html not found');
  }

  // 3. Kiểm tra environment files
  log('\n🔧 Kiểm tra environment files...', 'blue');
  const envFiles = ['env.development', 'env.production'];
  envFiles.forEach(envFile => {
    if (checkFileExists(envFile)) {
      if (checkFileContent(envFile, 'TupPhim')) {
        addTest(`${envFile} updated`, 'pass');
      } else {
        addTest(`${envFile} branding`, 'fail', 'Not updated to TupPhim');
      }
    } else {
      addTest(`${envFile} exists`, 'fail', 'Environment file missing');
    }
  });

  // 4. Kiểm tra source files
  log('\n📁 Kiểm tra source files...', 'blue');
  const requiredFiles = [
    'src/App.jsx',
    'src/main.jsx',
    'src/services/movieApi.js',
    'src/context/AuthContext.jsx',
    'src/components/Header.jsx',
    'src/components/Banner.jsx',
    'src/components/ErrorBoundary.jsx'
  ];

  requiredFiles.forEach(file => {
    if (checkFileExists(file)) {
      addTest(`${file} exists`, 'pass');
    } else {
      addTest(`${file} exists`, 'fail', 'Required file missing');
    }
  });

  // 5. Kiểm tra admin components
  log('\n👤 Kiểm tra admin components...', 'blue');
  const adminFiles = [
    'src/components/admin/AdminLayout.jsx',
    'src/components/admin/Dashboard.jsx',
    'src/components/admin/MovieManagement.jsx',
    'src/components/admin/UserManagement.jsx'
  ];

  adminFiles.forEach(file => {
    if (checkFileExists(file)) {
      addTest(`Admin component ${path.basename(file)}`, 'pass');
    } else {
      addTest(`Admin component ${path.basename(file)}`, 'fail', 'Admin component missing');
    }
  });

  // 6. Kiểm tra API configuration
  log('\n🔌 Kiểm tra API configuration...', 'blue');
  if (checkFileExists('src/services/movieApi.js')) {
    const apiContent = fs.readFileSync('src/services/movieApi.js', 'utf8');
    
    if (apiContent.includes('import.meta.env.VITE_API_BASE_URL')) {
      addTest('API uses environment variables', 'pass');
    } else {
      addTest('API environment configuration', 'fail', 'Not using environment variables');
    }

    if (apiContent.includes('BASE_URL')) {
      addTest('API base URL configured', 'pass');
    } else {
      addTest('API base URL', 'fail', 'Base URL not configured');
    }
  }

  // 7. Kiểm tra Error Handling
  log('\n🛡️ Kiểm tra Error Handling...', 'blue');
  if (checkFileExists('src/components/ErrorBoundary.jsx')) {
    const errorContent = fs.readFileSync('src/components/ErrorBoundary.jsx', 'utf8');
    
    if (errorContent.includes('componentDidCatch')) {
      addTest('Error Boundary implemented', 'pass');
    } else {
      addTest('Error Boundary', 'fail', 'Error handling not implemented');
    }
  }

  if (checkFileExists('src/App.jsx')) {
    const appContent = fs.readFileSync('src/App.jsx', 'utf8');
    
    if (appContent.includes('ErrorBoundary')) {
      addTest('ErrorBoundary integrated in App', 'pass');
    } else {
      addTest('ErrorBoundary integration', 'fail', 'Not integrated in App');
    }
  }

  // 8. Kiểm tra Authentication
  log('\n🔐 Kiểm tra Authentication...', 'blue');
  if (checkFileExists('src/context/AuthContext.jsx')) {
    const authContent = fs.readFileSync('src/context/AuthContext.jsx', 'utf8');
    
    if (authContent.includes('emailRegex')) {
      addTest('Email validation implemented', 'pass');
    } else {
      addTest('Email validation', 'fail', 'Input validation missing');
    }

    if (authContent.includes('admin@example.com')) {
      addTest('Admin credentials configured', 'pass');
    } else {
      addTest('Admin credentials', 'fail', 'Admin login not configured');
    }
  }

  // 9. Kiểm tra Vite configuration
  log('\n⚙️ Kiểm tra Vite configuration...', 'blue');
  if (checkFileExists('vite.config.js')) {
    const viteContent = fs.readFileSync('vite.config.js', 'utf8');
    
    if (viteContent.includes('manualChunks')) {
      addTest('Code splitting configured', 'pass');
    } else {
      addTest('Code splitting', 'warning', 'Bundle optimization not configured');
    }

    if (viteContent.includes('proxy')) {
      addTest('Development proxy configured', 'pass');
    } else {
      addTest('Development proxy', 'warning', 'API proxy not configured');
    }
  }

  // 10. Kiểm tra deployment files
  log('\n🚀 Kiểm tra deployment files...', 'blue');
  const deployFiles = ['DEPLOYMENT.md', 'TESTING_CHECKLIST.md'];
  deployFiles.forEach(file => {
    if (checkFileExists(file)) {
      addTest(`Deployment guide ${file}`, 'pass');
    } else {
      addTest(`Deployment guide ${file}`, 'warning', 'Deployment documentation missing');
    }
  });

  // Summary
  log('\n📊 TỔNG KẾT KIỂM TRA', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⚠️ Warnings: ${testResults.warnings}`, 'yellow');
  
  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = ((testResults.passed / totalTests) * 100).toFixed(1);
  
  log(`\n📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');

  // Recommendations
  log('\n💡 KHUYẾN NGHỊ', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  if (testResults.failed === 0) {
    log('🎉 Tất cả kiểm tra đã PASS! Web sẵn sàng deploy.', 'green');
  } else {
    log('🔧 Cần khắc phục các lỗi trước khi deploy:', 'yellow');
    testResults.tests
      .filter(test => test.status === 'fail')
      .forEach(test => {
        log(`   - ${test.name}: ${test.message}`, 'red');
      });
  }

  if (testResults.warnings > 0) {
    log('\n⚠️ Các cảnh báo (không ảnh hưởng hoạt động):', 'yellow');
    testResults.tests
      .filter(test => test.status === 'warning')
      .forEach(test => {
        log(`   - ${test.name}: ${test.message}`, 'yellow');
      });
  }

  // Next steps
  log('\n🚀 BƯỚC TIẾP THEO', 'cyan');
  log('=' .repeat(50), 'cyan');
  log('1. Chạy: npm run dev (kiểm tra development)', 'reset');
  log('2. Chạy: npm run build (kiểm tra production build)', 'reset');
  log('3. Chạy: npm run test:all (test toàn diện)', 'reset');
  log('4. Deploy theo hướng dẫn trong DEPLOYMENT.md', 'reset');

  // Exit with appropriate code
  if (testResults.failed > 0) {
    process.exit(1);
  } else {
    log('\n🎉 Kiểm tra hoàn thành thành công!', 'green');
    process.exit(0);
  }

} catch (error) {
  log('\n❌ Lỗi trong quá trình kiểm tra:', 'red');
  console.error(error.message);
  process.exit(1);
}

