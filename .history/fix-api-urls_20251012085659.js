const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
  'src/components/AdvancedSearch.jsx',
  'src/components/MovieFeatured.jsx',
  'src/components/MovieBrowse.jsx',
  'src/utils/movieFilters.js',
  'src/components/MovieDetailRoPhim.jsx',
  'src/components/MovieDetailSimple.jsx',
  'src/components/Banner.jsx',
  'src/components/SyncManager.jsx',
  'src/components/BackendTestSimple.jsx',
  'src/components/MovieDetailDebug.jsx'
];

// Patterns to replace
const replacements = [
  {
    pattern: /import\s+.*from\s+['"]react['"];?\s*\n/,
    replacement: (match) => {
      if (!match.includes('apiConfig')) {
        return match + "import { getApiUrl, buildApiUrl } from '../utils/apiConfig.js';\n";
      }
      return match;
    }
  },
  {
    pattern: /http:\/\/localhost:3001\/api/g,
    replacement: 'getApiUrl()'
  },
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/([^`]+)`\)/g,
    replacement: 'fetch(getApiUrl(\'$1\'))'
  },
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/([^`]+)\?([^`]+)`\)/g,
    replacement: 'fetch(buildApiUrl(\'$1\', { $2 }))'
  }
];

function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    // Check if already has apiConfig import
    const hasApiConfigImport = content.includes('apiConfig');
    
    // Add import if not present
    if (!hasApiConfigImport && content.includes('localhost:3001')) {
      const importMatch = content.match(/import\s+.*from\s+['"]react['"];?\s*\n/);
      if (importMatch) {
        content = content.replace(
          importMatch[0], 
          importMatch[0] + "import { getApiUrl, buildApiUrl } from '../utils/apiConfig.js';\n"
        );
        hasChanges = true;
      }
    }
    
    // Replace hardcoded URLs
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🔧 Updating API URLs in frontend files...\n');

filesToUpdate.forEach(updateFile);

console.log('\n✅ API URL update completed!');
console.log('\n📋 Next steps:');
console.log('1. Check if all imports are correct');
console.log('2. Test the application');
console.log('3. Verify mobile access works');
