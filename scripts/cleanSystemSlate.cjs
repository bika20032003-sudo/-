const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('[Clean Slate] Starting comprehensive system purge...');

// 1. Clean JSON databases
const dbFiles = [
  path.join(rootDir, 'public_html/api/data/db.json'),
  path.join(rootDir, 'server/data/db.json'),
  path.join(rootDir, 'منظومة جهاز الاشراف/public_html/api/data/db.json'),
  path.join(rootDir, 'منظومة جهاز الاشراف/server/data/db.json')
];

dbFiles.forEach(fp => {
  if (fs.existsSync(fp)) {
    try {
      const db = JSON.parse(fs.readFileSync(fp, 'utf8'));
      db.reports = [];
      db.messages = [];
      db.alerts = [];
      db.plans = [];
      db.issues = [];
      db.fuel = [];
      db.savedPeriodicReports = [];
      db.deletedReportIds = [];
      db.fuelDailyReport = null;
      db.roadDailyReport = null;
      db.latestTwoPhaseReport = null;
      db.lastUpdated = new Date().toISOString();
      fs.writeFileSync(fp, JSON.stringify(db, null, 2), 'utf8');
      console.log(`[Clean Slate] ✅ Cleaned database file: ${fp}`);
    } catch (e) {
      console.error(`[Clean Slate] ❌ Failed to clean ${fp}:`, e.message);
    }
  }
});

// 2. Clean mockData.js and mockData.ts
const mockJsPath = path.join(rootDir, 'src/data/mockData.js');
if (fs.existsSync(mockJsPath)) {
  let content = fs.readFileSync(mockJsPath, 'utf8');
  // Clean initialAlerts
  content = content.replace(/export const initialAlerts = \[[^\]]*\];/s, 'export const initialAlerts = [];');
  // Clean fuel baseline report values
  content = content.replace(/totalDispatchedLiters: 22738\.00/g, 'totalDispatchedLiters: 0.00');
  content = content.replace(/totalReceivedLiters: 14631\.00/g, 'totalReceivedLiters: 0.00');
  content = content.replace(/totalRemainingLiters: 210697\.00/g, 'totalRemainingLiters: 0.00');
  content = content.replace(/fuelAmount: 22738\.00/g, 'fuelAmount: 0.00');
  content = content.replace(/'FUEL-094834_24\.10\.2026'/g, "''");
  content = content.replace(/'570\.00'/g, "'0.00'");
  content = content.replace(/'17,530\.00'/g, "'0.00'");
  content = content.replace(/'4,638\.00'/g, "'0.00'");
  content = content.replace(/'14,631\.00'/g, "'0.00'");
  content = content.replace(/'49,829\.00'/g, "'0.00'");
  content = content.replace(/'141,795\.00'/g, "'0.00'");
  content = content.replace(/'19,073\.00'/g, "'0.00'");
  fs.writeFileSync(mockJsPath, content, 'utf8');
  console.log('[Clean Slate] ✅ Cleaned src/data/mockData.js');
}

const mockTsPath = path.join(rootDir, 'src/data/mockData.ts');
if (fs.existsSync(mockTsPath)) {
  let content = fs.readFileSync(mockTsPath, 'utf8');
  content = content.replace(/export const initialAlerts[^=]*= \[[^\]]*\];/s, 'export const initialAlerts: AlertItem[] = [];');
  content = content.replace(/export const initialRecentReports[^=]*= \[[^\]]*\];/s, 'export const initialRecentReports: ReportItem[] = [];');
  fs.writeFileSync(mockTsPath, content, 'utf8');
  console.log('[Clean Slate] ✅ Cleaned src/data/mockData.ts');
}

// 3. Update FuelDailyReportForm.jsx initial values
const fuelFormPath = path.join(rootDir, 'src/components/FuelDailyReportForm.jsx');
if (fs.existsSync(fuelFormPath)) {
  let content = fs.readFileSync(fuelFormPath, 'utf8');
  content = content.replace(/totalDispatchedLiters: 22738\.00/g, 'totalDispatchedLiters: 0.00');
  content = content.replace(/totalReceivedLiters: 14631\.00/g, 'totalReceivedLiters: 0.00');
  content = content.replace(/totalRemainingLiters: 210697\.00/g, 'totalRemainingLiters: 0.00');
  content = content.replace(/fuelAmount: 22738\.00/g, 'fuelAmount: 0.00');
  content = content.replace(/'FUEL-094834_24\.10\.2026'/g, "''");
  content = content.replace(/'570\.00'/g, "'0.00'");
  content = content.replace(/'17,530\.00'/g, "'0.00'");
  content = content.replace(/'4,638\.00'/g, "'0.00'");
  content = content.replace(/'14,631\.00'/g, "'0.00'");
  content = content.replace(/'49,829\.00'/g, "'0.00'");
  content = content.replace(/'141,795\.00'/g, "'0.00'");
  content = content.replace(/'19,073\.00'/g, "'0.00'");
  fs.writeFileSync(fuelFormPath, content, 'utf8');
  console.log('[Clean Slate] ✅ Cleaned src/components/FuelDailyReportForm.jsx');
}

// 4. Update FuelView.jsx so it never auto-injects fuel_daily_report_data into archive
const fuelViewPath = path.join(rootDir, 'src/views/FuelView.jsx');
if (fs.existsSync(fuelViewPath)) {
  let content = fs.readFileSync(fuelViewPath, 'utf8');
  const targetBlock = `        localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const sectionFuelRaw = localStorage.getItem('fuel_daily_report_data');
        if (sectionFuelRaw) {
          const secFuel = JSON.parse(sectionFuelRaw);
          if (secFuel && (secFuel.fuelItems || secFuel.reportNumber)) {
            localReports.push(secFuel);
          }
        }`;
  const replacementBlock = `        localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');`;
  if (content.includes(targetBlock)) {
    content = content.replace(targetBlock, replacementBlock);
    fs.writeFileSync(fuelViewPath, content, 'utf8');
    console.log('[Clean Slate] ✅ Prevented draft injection in src/views/FuelView.jsx');
  }
}

// 5. Update server/src/store.js to prevent unshifting into this.data.reports
const serverStorePath = path.join(rootDir, 'server/src/store.js');
if (fs.existsSync(serverStorePath)) {
  let content = fs.readFileSync(serverStorePath, 'utf8');
  content = content.replace(/this\.data\.reports\.unshift\(enriched\);/g, '// reports only added on explicit save');
  fs.writeFileSync(serverStorePath, content, 'utf8');
  console.log('[Clean Slate] ✅ Fixed server/src/store.js auto-unshift');
}

console.log('[Clean Slate] Finished successfully!');

