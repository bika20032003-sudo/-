const fs = require('fs');
const path = require('path');

const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext', 'useId', 'useReducer'];
const engineeringFuncs = ['calculateStationLength', 'calculateAsphaltMetersByTons', 'calculateBaseCourseMetersByCrusher', 'calculateRemainingItems'];

function scanDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && !f.includes('منظومة')) {
        scanDir(p);
      }
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const code = fs.readFileSync(p, 'utf8');
      
      // Check hooks
      const reactMatch = code.match(/import\s+(?:React\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*['"]react['"]/);
      const reactImports = new Set();
      if (reactMatch && reactMatch[1]) {
        reactMatch[1].split(',').forEach(i => reactImports.add(i.trim()));
      }
      for (const h of hooks) {
        const rx = new RegExp('\\b' + h + '\\b');
        if (rx.test(code)) {
          if (!reactImports.has(h) && !code.includes('React.' + h) && !code.includes('export const ' + h) && !code.includes('function ' + h)) {
            console.error(`[CRITICAL] ${h} used in ${p} but NOT imported from 'react'!`);
          }
        }
      }

      // Check engineeringFuncs
      for (const ef of engineeringFuncs) {
        const rx = new RegExp('\\b' + ef + '\\b');
        if (rx.test(code) && !p.includes('engineeringFormulas.js')) {
          const hasDef = new RegExp('(?:function|const|let|var|import.*)\\s+' + ef + '\\b').test(code);
          if (!hasDef) {
            console.error(`[CRITICAL] ${ef} used in ${p} but NOT defined/imported!`);
          }
        }
      }
    }
  }
}

scanDir('./src');
console.log('Complete codebase scope check finished.');
