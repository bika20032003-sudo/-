const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(getFiles(full));
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.php')) {
      results.push(full);
    }
  });
  return results;
}

const keys = new Set();
const files = getFiles('./src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /localStorage\s*\.\s*(?:getItem|setItem|removeItem)\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
});
console.log('Found LocalStorage keys:');
Array.from(keys).sort().forEach(k => console.log(' - ' + k));
