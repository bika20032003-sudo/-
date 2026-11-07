const fs = require('fs');

function checkFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+(?:([\w\d_$]+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*['"]([^'"]+)['"]/g;
  const imported = new Set(['React']);
  let m;
  while ((m = importRegex.exec(code)) !== null) {
    if (m[1]) imported.add(m[1].trim());
    if (m[2]) {
      m[2].split(',').forEach(item => {
        const parts = item.trim().split(/\s+as\s+/);
        imported.add((parts[1] || parts[0]).trim());
      });
    }
  }

  const tags = code.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
  const missing = new Set();
  for (const t of tags) {
    const name = t.slice(1);
    if (!imported.has(name)) {
      const defRegex = new RegExp('(?:function|class|const|let|var)\\s+' + name + '\\b');
      if (!defRegex.test(code)) {
        missing.add(name);
      }
    }
  }
  console.log(`Missing in ${filePath}:`, Array.from(missing));
}

checkFile('src/components/CreateTargetedWorksReportModal.jsx');
checkFile('src/views/TargetedWorksView.jsx');
