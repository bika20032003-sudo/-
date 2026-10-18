const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'scripts') continue;
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (/\.(jsx?|tsx?|html|json)$/.test(full)) files.push(full);
  }
  return files;
}

const files = walk(path.join(rootDir, 'src'));
files.push(path.join(rootDir, 'index.html'));

let updatedFiles = 0;
let totalReplacements = 0;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  
  // Replace standard isolated yeh in أوباري and اوباري with explicit dotted form U+FEF1
  // We match أوباري (with \u064A)
  const regex1 = /أوبار\u064A/g;
  const regex2 = /اوبار\u064A/g;
  
  let newContent = content;
  let count1 = (content.match(regex1) || []).length;
  let count2 = (content.match(regex2) || []).length;
  
  if (count1 > 0 || count2 > 0) {
    newContent = newContent.replace(regex1, 'أوبار\uFEF1');
    newContent = newContent.replace(regex2, 'اوبار\uFEF1');
    fs.writeFileSync(f, newContent, 'utf8');
    updatedFiles++;
    totalReplacements += (count1 + count2);
    console.log(`Updated: ${path.relative(rootDir, f)} (${count1 + count2} replacements)`);
  }
}

console.log(`\n✔ Completed: ${updatedFiles} files updated with ${totalReplacements} dotted Yaa (U+FEF1) glyphs.`);
