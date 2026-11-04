const fs = require('fs');
const path = require('path');

console.log('=== Starting Implementation of All 5 Requirements + Print Fixes ===');

// Helper to replace once safely
function replaceOnce(str, find, replace, filename) {
  if (!str.includes(find)) {
    console.warn(`[WARN] Target string not found in ${filename}`);
    return str;
  }
  return str.replace(find, replace);
}

// -------------------------------------------------------------
// 1. UPDATE src/components/ExecutiveProgressForm.jsx
// -------------------------------------------------------------
console.log('1. Updating ExecutiveProgressForm.jsx with complete auto-calculations...');
let execFormPath = path.join(__dirname, '../src/components/ExecutiveProgressForm.jsx');
let execForm = fs.readFileSync(execFormPath, 'utf8');

// Ensure handleBasicItemChange recalculates executedValue, remainingQuantity, remainingValue, and percentage
const targetBasicChange = `      // Auto compute remaining & percentage when contractQuantity or executedQuantity changes
      if (field === 'contractQuantity' || field === 'executedQuantity') {
        const cQ = field === 'contractQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.contractQuantity));
        const eQ = field === 'executedQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.executedQuantity));
        if (!isNaN(cQ) && !isNaN(eQ)) {
          item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(2)));
          if (cQ > 0) {
            item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
          }
        }
      }`;

const replacementBasicChange = `      // Dynamic Excel Formula Auto-Calculations (Active & Dynamic)
      // remainingQuantity = contractQuantity - executedQuantity
      // executedValue = executedQuantity * unitRate
      // remainingValue = remainingQuantity * unitRate
      // percentage = (executedQuantity / contractQuantity) * 100
      const cQ = parseFloat(field === 'contractQuantity' ? cleanVal : toCleanLatin(item.contractQuantity)) || 0;
      const eQ = parseFloat(field === 'executedQuantity' ? cleanVal : toCleanLatin(item.executedQuantity)) || 0;
      const uRate = parseFloat(field === 'unitRate' ? cleanVal : toCleanLatin(item.unitRate)) || 0;

      if (!isNaN(cQ) && !isNaN(eQ)) {
        item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(2)));
        if (cQ > 0) {
          item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
        } else {
          item.percentage = '0.00';
        }
      }
      if (uRate > 0) {
        item.executedValue = String(parseFloat((eQ * uRate).toFixed(2)));
        item.remainingValue = String(parseFloat((Math.max(0, cQ - eQ) * uRate).toFixed(2)));
      }`;

if (execForm.includes(targetBasicChange)) {
  execForm = execForm.replace(targetBasicChange, replacementBasicChange);
  console.log('✓ Updated handleBasicItemChange auto-formulas');
}

// Also update handleAdditionalItemChange
const targetAddChange = `  // Handle Additional Item change
  const handleAdditionalItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.additionalItems];
      updated[idx] = { ...updated[idx], [field]: cleanVal };
      return { ...prev, additionalItems: updated };
    });
  };`;

const replacementAddChange = `  // Handle Additional Item change with active Excel formulas
  const handleAdditionalItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.additionalItems];
      const item = { ...updated[idx], [field]: cleanVal };

      const cQ = parseFloat(field === 'contractQuantity' ? cleanVal : toCleanLatin(item.contractQuantity)) || 0;
      const eQ = parseFloat(field === 'executedQuantity' ? cleanVal : toCleanLatin(item.executedQuantity)) || 0;
      const uRate = parseFloat(field === 'unitRate' ? cleanVal : toCleanLatin(item.unitRate)) || 0;

      if (!isNaN(cQ) && !isNaN(eQ)) {
        item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(2)));
        if (cQ > 0) {
          item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
        } else {
          item.percentage = '0.00';
        }
      }
      if (uRate > 0) {
        item.executedValue = String(parseFloat((eQ * uRate).toFixed(2)));
        item.remainingValue = String(parseFloat((Math.max(0, cQ - eQ) * uRate).toFixed(2)));
      }

      updated[idx] = item;
      return { ...prev, additionalItems: updated };
    });
  };`;

if (execForm.includes(targetAddChange)) {
  execForm = execForm.replace(targetAddChange, replacementAddChange);
  console.log('✓ Updated handleAdditionalItemChange auto-formulas');
}

// When saving executive progress, dispatch an event to notify DashboardView instantly
if (!execForm.includes("window.dispatchEvent(new CustomEvent('executive-progress-updated'")) {
  execForm = execForm.replace(
    "localStorage.setItem('executive_progress_data', JSON.stringify(data));",
    "localStorage.setItem('executive_progress_data', JSON.stringify(data));\n      try { window.dispatchEvent(new CustomEvent('executive-progress-updated', { detail: data })); } catch (e) {}"
  );
  console.log('✓ Added executive-progress-updated custom event dispatch');
}

fs.writeFileSync(execFormPath, execForm, 'utf8');

// -------------------------------------------------------------
// 2. UPDATE src/views/DashboardView.jsx
// -------------------------------------------------------------
console.log('2. Updating DashboardView.jsx with Executive Progress percentage (81.62%)...');
let dashPath = path.join(__dirname, '../src/views/DashboardView.jsx');
let dash = fs.readFileSync(dashPath, 'utf8');

// Add executiveProgress metrics state if not present
if (!dash.includes('executiveProgress:')) {
  dash = dash.replace(
    'roadProgress: {',
    `executiveProgress: {
            overallPercentage: 81.62,
            contractValue: 897665675.03,
            totalExecutedValue: 732648221.31,
            basicExecutedValue: 638329685.46,
            additionalExecutedValue: 94318535.86,
            remainingValue: 165017453.72,
            basicPercentage: 71.11
        },
        roadProgress: {`
  );
  console.log('✓ Added executiveProgress initial state to DashboardView');
}

// Ensure fetchDashboardData calculates executive progress accurately
const targetFetchRoad = `                const overallVal = roadRes?.overallPercentage !== undefined ? parseFloat(roadRes.overallPercentage) : parseFloat(((fdrP + asphP + aggP + mcoP) / 4).toFixed(1));`;

const replacementFetchRoad = `                // Certified Executive Progress calculations (الموقف التنفيذي المعتمد: 81.62%)
                let execOverallP = 81.62;
                let execContractVal = 897665675.03;
                let execTotalExecuted = 732648221.31;
                let execBasicExecuted = 638329685.46;
                let execAdditionalExecuted = 94318535.86;
                let execRemainingVal = 165017453.72;
                let execBasicP = 71.11;

                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        const rawExec = localStorage.getItem('executive_progress_data');
                        if (rawExec) {
                            const parsedExec = JSON.parse(rawExec);
                            const cVal = Number(parsedExec.contractValue) || 897665675.03;
                            const bSum = (parsedExec.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
                            const aSum = (parsedExec.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
                            const totalExec = bSum + aSum;
                            if (cVal > 0) {
                                execOverallP = parseFloat(((totalExec / cVal) * 100).toFixed(2));
                                execBasicP = parseFloat(((bSum / cVal) * 100).toFixed(2));
                                execContractVal = cVal;
                                execTotalExecuted = totalExec;
                                execBasicExecuted = bSum;
                                execAdditionalExecuted = aSum;
                                execRemainingVal = Math.max(0, cVal - totalExec);
                            }
                        }
                    } catch (e) {}
                }

                const overallVal = execOverallP;`;

if (dash.includes(targetFetchRoad)) {
  dash = dash.replace(targetFetchRoad, replacementFetchRoad);
  console.log('✓ Linked DashboardView overallPercentage to Executive Progress (81.62%)');
}

// In setMetrics inside fetchDashboardData:
if (!dash.includes('executiveProgress: {')) {
  dash = dash.replace(
    'roadProgress: {',
    `executiveProgress: {
                        overallPercentage: execOverallP,
                        contractValue: execContractVal,
                        totalExecutedValue: execTotalExecuted,
                        basicExecutedValue: execBasicExecuted,
                        additionalExecutedValue: execAdditionalExecuted,
                        remainingValue: execRemainingVal,
                        basicPercentage: execBasicP
                    },
                    roadProgress: {`
  );
}

// Listen to executive-progress-updated event
if (!dash.includes("addEventListener('executive-progress-updated'")) {
  dash = dash.replace(
    "window.addEventListener('report-saved', handleReportSaved);",
    `window.addEventListener('report-saved', handleReportSaved);
        const handleExecUpdated = () => fetchDashboardData();
        window.addEventListener('executive-progress-updated', handleExecUpdated);`
  );
  dash = dash.replace(
    "window.removeEventListener('report-saved', handleReportSaved);",
    `window.removeEventListener('report-saved', handleReportSaved);
            window.removeEventListener('executive-progress-updated', handleExecUpdated);`
  );
  console.log('✓ Added listener for executive-progress-updated in DashboardView');
}

// Update the Top Banner to clearly state that the percentage is from the Executive Progress
const targetBanner = `<h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                مشروع صيانة طريق أوباري - غات (نسبة الإنجاز التنفيذي العام)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                المشروع العام للمرحلتين بطول إجمالي: <strong>360.00 كم</strong> (المرحلة الأولى: 226.08 كم • المرحلة الثانية: 133.92 كم) • معدل الإنجاز اليومي: <strong>+{metrics.roadProgress.totalTodayMeters.toLocaleString()} م.ط</strong>
              </p>`;

const replacementBanner = `<h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                مشروع صيانة وتطوير طريق أوباري - غات (نسبة الإنجاز من الموقف التنفيذي)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                نسبة الإنجاز المالي العام المعتمدة: <strong>%{metrics.executiveProgress?.overallPercentage || metrics.roadProgress.overallPercentage}</strong> • إجمالي المنفذ: <strong>{(metrics.executiveProgress?.totalExecutedValue || 732648221.31).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ل</strong> من <strong>897,665,675.03 د.ل</strong>
              </p>`;

if (dash.includes(targetBanner)) {
  dash = dash.replace(targetBanner, replacementBanner);
  console.log('✓ Updated DashboardView banner heading with executive progress');
}

// Update the Main Radial Gauge card subtext
const targetRadialSub = `<span style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: 700 }}>نسبة الإنجاز الإجمالي للمشروع</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0.35rem 0' }}>
                {metrics.roadProgress.overallPercentage}%
              </div>
              <span style={{ fontSize: '0.78rem', color: '#bfdbfe' }}>مكتمل من إجمالي 360.00 كم</span>`;

const replacementRadialSub = `<span style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: 700 }}>نسبة الإنجاز الإجمالي (الموقف التنفيذي)</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0.35rem 0' }}>
                %{metrics.executiveProgress?.overallPercentage || metrics.roadProgress.overallPercentage}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#bfdbfe' }}>منفذ 732.65 مليون من 897.67 مليون د.ل</span>`;

if (dash.includes(targetRadialSub)) {
  dash = dash.replace(targetRadialSub, replacementRadialSub);
  console.log('✓ Updated radial gauge subtext with executive progress values');
}

// Update KPI card 1 subtext
const targetKpiCard1 = `<span className="kpi-green-text" style={{ fontSize: '0.78rem' }}>نسبة الإنجاز العام {metrics.roadProgress.overallPercentage}%</span>`;
const replacementKpiCard1 = `<span className="kpi-green-text" style={{ fontSize: '0.78rem' }}>نسبة الإنجاز المالي العام (الموقف التنفيذي) %{metrics.executiveProgress?.overallPercentage || metrics.roadProgress.overallPercentage}</span>`;

if (dash.includes(targetKpiCard1)) {
  dash = dash.replace(targetKpiCard1, replacementKpiCard1);
  console.log('✓ Updated KPI card 1 subtext');
}

fs.writeFileSync(dashPath, dash, 'utf8');

console.log('=== Step 1 & 2 Completed Successfully ===');

