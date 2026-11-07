const fs = require('fs');

// 1. Update CreateTargetedWorksReportModal.jsx
let code = fs.readFileSync('src/components/CreateTargetedWorksReportModal.jsx', 'utf8');
code = code.replace(
  /import React,\s*\{\s*useState,\s*useEffect\s*\}\s*from\s*['"]react['"];/,
  "import React, { useState, useEffect, useMemo } from 'react';"
);
code = code.replace(
  /import\s*\{\s*saveReportToIndexedDB\s*\}\s*from\s*['"]\.\.\/utils\/secureDatabase\.js['"];/,
  "import { saveReportToIndexedDB } from '../utils/secureDatabase.js';\nimport { calculateStationLength } from '../utils/engineeringFormulas.js';"
);
code = code.replace(
  /const handleDateChange = \(newDate\) => \{\s*setReportDate\(newDate\);\s*setDayName\(getDayName\(newDate\)\);\s*\};/,
  `const handleDateChange = (newDate) => {
    setReportDate(newDate);
    setDayName(getDayName(newDate));
    if (!reportToEdit) {
      const parts = (newDate || '').split('-');
      if (parts.length === 3) {
        setReportNumber('TARGET-' + parts[2] + '.' + parts[1] + '.' + parts[0]);
      }
    }
  };`
);
fs.writeFileSync('src/components/CreateTargetedWorksReportModal.jsx', code, 'utf8');
console.log('Updated CreateTargetedWorksReportModal.jsx');

// 2. Update CreateReportModal.jsx
let crm = fs.readFileSync('src/components/CreateReportModal.jsx', 'utf8');
crm = crm.replace(
  /import\s*\{\s*canAccessTwoPhaseReport\s*\}\s*from\s*['"]\.\.\/utils\/permissionUtils\.js['"];/,
  "import { canAccessTwoPhaseReport } from '../utils/permissionUtils.js';\nimport { calculateStationLength } from '../utils/engineeringFormulas.js';"
);
fs.writeFileSync('src/components/CreateReportModal.jsx', crm, 'utf8');
console.log('Updated CreateReportModal.jsx');
