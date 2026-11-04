const fs = require('fs');
const path = require('path');

const filesToSync = [
  'src/components/ExecutiveProgressForm.jsx',
  'src/components/OfficialPrintModal.jsx',
  'src/components/CreateFuelReportModal.jsx',
  'src/components/Sidebar.jsx',
  'src/views/DashboardView.jsx',
  'src/views/UsersView.jsx',
  'src/views/EquipmentView.jsx',
  'src/views/CreateReportView.jsx',
  'src/views/MainSystem.jsx',
  'src/index.css',
  'src/premium-ui.css'
];

console.log('Syncing modified files to منظومة جهاز الاشراف/ ...');

filesToSync.forEach(relPath => {
  const srcPath = path.join(__dirname, '..', relPath);
  const destPath = path.join(__dirname, '..', 'منظومة جهاز الاشراف', relPath);
  
  if (fs.existsSync(srcPath)) {
    const content = fs.readFileSync(srcPath);
    // Ensure destination directory exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
    console.log(`✓ Mirrored ${relPath}`);
  } else {
    console.warn(`[WARN] Source not found: ${srcPath}`);
  }
});

console.log('=== Mirroring to منظومة جهاز الاشراف Completed Successfully ===');
