const fs = require('fs');
const path = require('path');

const filesToSync = [
  'src/components/ExecutiveProgressForm.jsx',
  'src/components/RoadDailyReportForm.jsx',
  'src/components/FuelDailyReportForm.jsx',
  'src/components/OfficialPrintModal.jsx',
  'src/components/CreateFuelReportModal.jsx',
  'src/components/CreateTargetedWorksReportModal.jsx',
  'src/components/TwoPhaseDailyReportForm.jsx',
  'src/components/UserProfileModal.jsx',
  'src/components/LoginPage.jsx',
  'src/components/ErrorBoundary.jsx',
  'src/components/Sidebar.jsx',
  'src/components/AIAgentWidget.jsx',
  'src/views/DashboardView.jsx',
  'src/views/UsersView.jsx',
  'src/views/ReportsView.jsx',
  'src/views/EquipmentView.jsx',
  'src/views/CreateReportView.jsx',
  'src/views/MainSystem.jsx',
  'src/views/AIAgentView.jsx',
  'src/views/ReportsArchiveView.jsx',
  'src/views/FuelView.jsx',
  'src/views/TargetedWorksView.jsx',
  'src/views/CorrespondenceView.jsx',
  'src/utils/aiAgentEngine.js',
  'src/utils/engineeringFormulas.js',
  'src/utils/twoPhaseSync.js',
  'src/utils/secureDatabase.js',
  'src/utils/apiCache.js',
  'src/index.css',
  'src/premium-ui.css'
];

console.log('Syncing all modified files to منظومة جهاز الاشراف/ ...');

filesToSync.forEach(relPath => {
  const srcPath = path.join(__dirname, '..', relPath);
  const destPath = path.join(__dirname, '..', 'منظومة جهاز الاشراف', relPath);
  
  if (fs.existsSync(srcPath)) {
    const content = fs.readFileSync(srcPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
    console.log(`✓ Mirrored ${relPath}`);
  } else {
    console.warn(`[WARN] Source not found: ${srcPath}`);
  }
});

console.log('=== All files synced to mirror successfully ===');
