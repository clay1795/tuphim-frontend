const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/AdvancedSearch.jsx', 'utf8');

// Remove all console.log statements (but keep console.error)
content = content.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');
content = content.replace(/\s*console\.log\([^)]*\);\s*/g, '');

// Remove empty lines that might be left
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Write back to file
fs.writeFileSync('src/components/AdvancedSearch.jsx', content);

console.log('✅ Cleaned all debug console.log statements from AdvancedSearch.jsx');
