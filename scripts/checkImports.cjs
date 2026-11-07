const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && !f.includes('منظومة')) {
        checkDir(p);
      }
    } else if (f.endsWith('.jsx')) {
      const code = fs.readFileSync(p, 'utf8');
      
      // All imported identifiers in file
      const imported = new Set();
      const importMatches = code.matchAll(/import\s+(?:([\w\d_]+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from/g);
      for (const m of importMatches) {
        if (m[1]) imported.add(m[1].trim());
        if (m[2]) {
          m[2].split(',').forEach(item => {
            const parts = item.trim().split(/\s+as\s+/);
            imported.add((parts[1] || parts[0]).trim());
          });
        }
      }

      // Check all Lucide-like icons used in JSX: <RefreshCw, <RotateCcw, <Loader, <Loader2, etc.
      const spinnerIcons = ['RefreshCw', 'RotateCcw', 'Loader', 'Loader2'];
      for (const icon of spinnerIcons) {
        const regex = new RegExp('<' + icon + '(\\s|/|>)');
        if (regex.test(code) && !imported.has(icon)) {
          console.log(`[MISSING IMPORT] ${icon} used in ${p}`);
        }
      }
    }
  }
}

checkDir('./src');
console.log('Spinner & import scan completed.');
