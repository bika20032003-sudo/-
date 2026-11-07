const fs = require('fs');
const path = require('path');

const roots = ['./src', './منظومة جهاز الاشراف/src'];

roots.forEach(root => {
  // 1. engineeringFormulas.js
  const efPath = path.join(root, 'utils/engineeringFormulas.js');
  if (fs.existsSync(efPath)) {
    let c = fs.readFileSync(efPath, 'utf8');
    c = c.replace(
      /const grandExecutedSum = basicExecutedSum \+ additionalExecutedSum;[\s\S]*?const overallFinancialPercentage = contractVal > 0 \? \(grandExecutedSum \/ contractVal\) \* 100 : 0;/,
      `// البنود الأساسية فقط هي التي تُجمع طبقاً لتوجيهات جهاز الإشراف
  const grandExecutedSum = basicExecutedSum;
  const grandRemainingVal = Math.max(0, contractVal - grandExecutedSum);

  const basicPercentage = contractVal > 0 ? (basicExecutedSum / contractVal) * 100 : 0;
  const overallFinancialPercentage = basicPercentage;`
    );
    c = c.replace(
      'additionalExecutedSum: parseFloat(additionalExecutedSum.toFixed(2)),',
      'additionalExecutedSum: 0,'
    );
    fs.writeFileSync(efPath, c, 'utf8');
    console.log('Updated ' + efPath);
  }

  // 2. ExecutiveProgressView.jsx
  const epvPath = path.join(root, 'views/ExecutiveProgressView.jsx');
  if (fs.existsSync(epvPath)) {
    let c = fs.readFileSync(epvPath, 'utf8');
    // Financial summary replacement
    c = c.replace(
      /const basicExecutedSum = \(executiveData\.basicItems \|\| \[\]\)\.reduce[\s\S]*?const basicFinancialPercent = contractVal > 0 \? \(\(basicExecutedSum \/ contractVal\) \* 100\)\.toFixed\(2\) : 0;/,
      `// البنود الأساسية فقط هي التي تُجمع وتُحسب طبقاً لتوجيهات جهاز الإشراف
  const basicExecutedSum = (executiveData.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
  const totalExecutedVal = basicExecutedSum;
  const totalRemainingVal = Math.max(0, contractVal - basicExecutedSum);
  const basicFinancialPercent = contractVal > 0 ? ((basicExecutedSum / contractVal) * 100).toFixed(2) : 0;
  const overallFinancialPercent = basicFinancialPercent;`
    );

    // Card 2 label replacement
    c = c.replace('إجمالي المنفذ (أساسية + إضافية)', 'إجمالي المنفذ الفعلي التعاقدي (البنود الأساسية)');
    c = c.replace('نسبة الإنجاز المالي الإجمالي', 'نسبة الإنجاز المالي العام');

    // Remove the additional items card from the 4 stages overview
    c = c.replace(
      /\{\/\* Additional Items \*\/\}[\s\S]*?قيمة المنفذ: 93,573,854\.26 د\.ل \(207,597 م3 أساس حبيبي \+ 225\.6 كم خدمي\)[\s\S]*?<\/div>[\s\S]*?<\/div>/,
      `{/* تم إلغاء البنود الإضافية من التجميع والعرض طبقاً لتعليمات جهاز الإشراف */}\n              </div>`
    );

    fs.writeFileSync(epvPath, c, 'utf8');
    console.log('Updated ' + epvPath);
  }

  // 3. ExecutiveProgressForm.jsx
  const epfPath = path.join(root, 'components/ExecutiveProgressForm.jsx');
  if (fs.existsSync(epfPath)) {
    let c = fs.readFileSync(epfPath, 'utf8');

    // Calculation logic
    c = c.replace(
      /const basicExecutedSum = basicItems\.reduce[\s\S]*?const overallFinancialPercentage = contractVal > 0 \? parseFloat\(\(\(grandExecutedSum \/ contractVal\) \* 100\)\.toFixed\(2\)\) : 0;/,
      `// البنود الأساسية فقط هي التي تُجمع وتُحسب طبقاً لتعليمات جهاز الإشراف
    const basicExecutedSum = basicItems.reduce((acc, curr) => acc + (parseFloat(toCleanLatin(curr.executedValue)) || 0), 0);
    const additionalExecutedSum = 0;
    const grandExecutedSum = basicExecutedSum;
    const grandRemainingVal = Math.max(0, contractVal - grandExecutedSum);
    const basicPercentage = contractVal > 0 ? parseFloat(((basicExecutedSum / contractVal) * 100).toFixed(2)) : 0;
    const overallFinancialPercentage = basicPercentage;`
    );

    // Grand totals structure
    c = c.replace(
      /grandTotals: \{[\s\S]*?basicItemsPercentage: calculations\.basicPercentage[\s\S]*?\}/,
      `grandTotals: {
        contractValue: calculations.contractVal,
        totalExecutedValue: calculations.grandExecutedSum,
        totalRemainingValue: calculations.grandRemainingVal,
        overallFinancialPercentage: calculations.basicPercentage,
        basicItemsPercentage: calculations.basicPercentage
      }`
    );

    // Grand summary box header
    c = c.replace(
      '📊 الإجمالي العام للموقف التنفيذي (البنود الأساسية + الإضافية)',
      '📊 الإجمالي العام للموقف التنفيذي التعاقدي (البنود الأساسية المعتمدة)'
    );

    // Card 1 label in form
    c = c.replace('إجمالي المنفذ (أساسية + إضافية)', 'إجمالي المنفذ التعاقدي (الأساسية)');
    c = c.replace('منجز البنود الأساسية التعاقدية', 'قيمة المنفذ من البنود الأساسية');

    // Hide or remove additional items table from the form
    c = c.replace(
      /\{\/\* Secondary Table: Additional Items \(بنود إضافية\) \*\/\}[\s\S]*?\{\/\* Grand Total Summary Box/,
      `{/* تم إلغاء جدول البنود الإضافية لعدم شمولها في التجميع التعاقدي */}\n      {/* Grand Total Summary Box`
    );

    fs.writeFileSync(epfPath, c, 'utf8');
    console.log('Updated ' + epfPath);
  }

  // 4. OfficialPrintModal.jsx
  const opmPath = path.join(root, 'components/OfficialPrintModal.jsx');
  if (fs.existsSync(opmPath)) {
    let c = fs.readFileSync(opmPath, 'utf8');

    // Excel export in OfficialPrintModal
    c = c.replace(
      /dataRows\.push\(\[\], \['', 'بنود إضافية', ''[\s\S]*?const grandSum = basicSum \+ addSum;[\s\S]*?const grandRem = Math\.max\(0, contractVal - grandSum\);[\s\S]*?const grandPct = contractVal > 0 \? \(\(grandSum \/ contractVal\) \* 100\)\.toFixed\(2\) : 0;/,
      `// البنود الأساسية فقط هي التي تُجمع وتُعتمد في الإجمالي العام
        const grandSum = basicSum;
        const grandRem = Math.max(0, contractVal - grandSum);
        const grandPct = basicPct;`
    );

    c = c.replace('الإجمالي العام للموقف التنفيذي:', 'الإجمالي العام للموقف التنفيذي التعاقدي (البنود الأساسية):');

    // Remove additional items rows from official printable document
    c = c.replace(
      /\{\/\* شريط الأقسام الأصفر: بنود إضافية \*\/\}[\s\S]*?\{\/\* Grand Summary 4-Box Row \*\/\}/,
      `{/* تم إلغاء البنود الإضافية: التجميع والاعتماد للبنود الأساسية فقط */}\n              {/* Grand Summary 4-Box Row */}`
    );

    // Update the 4-box row calculations in OfficialPrintModal
    c = c.replace(
      /\{fmtNum\(report\.calculations\?\.grandExecutedSum \|\| \(\(report\.basicItems \|\| \[\]\)\.reduce[\s\S]*?\(report\.additionalItems \|\| \[\]\)\.reduce[\s\S]*?\)\)\} د\.ل/,
      `{fmtNum(report.calculations?.basicExecutedSum || (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل`
    );

    c = c.replace(
      /\{fmtNum\(report\.calculations\?\.grandRemainingVal \|\| Math\.max\(0, \(report\.contractValue \|\| 897665675\.03\) - \(\(report\.basicItems \|\| \[\]\)\.reduce[\s\S]*?\(report\.additionalItems \|\| \[\]\)\.reduce[\s\S]*?\)\)\)\} د\.ل/,
      `{fmtNum(report.calculations?.grandRemainingVal || Math.max(0, (report.contractValue || report.calculations?.contractVal || 897665675.03) - (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0)))} د.ل`
    );

    c = c.replace(
      /%\{report\.calculations\?\.overallFinancialPercentage \|\| fmtNum\(\(\(\(report\.basicItems \|\| \[\]\)\.reduce[\s\S]*?\(report\.additionalItems \|\| \[\]\)\.reduce[\s\S]*?\) \* 100, 2, 2\)\}/,
      `%{fmtNum(report.calculations?.basicPercentage || (((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) / (report.contractValue || report.calculations?.contractVal || 897665675.03)) * 100), 2, 2)}`
    );

    fs.writeFileSync(opmPath, c, 'utf8');
    console.log('Updated ' + opmPath);
  }

  // 5. DashboardView.jsx
  const dvPath = path.join(root, 'views/DashboardView.jsx');
  if (fs.existsSync(dvPath)) {
    let c = fs.readFileSync(dvPath, 'utf8');

    // Initial metrics
    c = c.replace(
      /contractValue: 897665675\.03,[\s\S]*?basicExecutedValue: 638329685\.46,[\s\S]*?additionalExecutedValue: 94318535\.86,[\s\S]*?basicPercentage: 71\.11/,
      `contractValue: 897665675.03,
                totalExecutedValue: 638329685.46,
                basicExecutedValue: 638329685.46,
                additionalExecutedValue: 0,
                remainingValue: 259335989.57,
                overallPercentage: 71.11,
                basicPercentage: 71.11`
    );

    // Sync calculation
    c = c.replace(
      /let execOverallP = 81\.62;[\s\S]*?let execTotalExecuted = 732648221\.31;[\s\S]*?let execBasicExecuted = 638329685\.46;[\s\S]*?let execAdditionalExecuted = 94318535\.86;[\s\S]*?let execRemainingVal = 165017453\.72;[\s\S]*?let execBasicP = 71\.11;/,
      `let execOverallP = 71.11;
            let execContractVal = 897665675.03;
            let execTotalExecuted = 638329685.46;
            let execBasicExecuted = 638329685.46;
            let execAdditionalExecuted = 0;
            let execRemainingVal = 259335989.57;
            let execBasicP = 71.11;`
    );

    c = c.replace(
      /const bSum = \(parsedExec\.basicItems \|\| \[\]\)\.reduce[\s\S]*?const aSum = \(parsedExec\.additionalItems \|\| \[\]\)\.reduce[\s\S]*?const totalExec = bSum \+ aSum;/,
      `const bSum = (parsedExec.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
                        const totalExec = bSum; // البنود الأساسية فقط`
    );

    c = c.replace(
      /execOverallP = parseFloat\(\(\(totalExec \/ cVal\) \* 100\)\.toFixed\(2\)\);[\s\S]*?execBasicP = parseFloat\(\(\(bSum \/ cVal\) \* 100\)\.toFixed\(2\)\);/,
      `execBasicP = parseFloat(((bSum / cVal) * 100).toFixed(2));
                            execOverallP = execBasicP;`
    );

    // Top strip default values
    c = c.replace(
      'metrics.executiveProgress?.totalExecutedValue || 732648221.31',
      'metrics.executiveProgress?.totalExecutedValue || 638329685.46'
    );
    c = c.replace('|| 81.62', '|| 71.11');
    c = c.replace('|| 81.62', '|| 71.11');

    fs.writeFileSync(dvPath, c, 'utf8');
    console.log('Updated ' + dvPath);
  }

  // 6. apiCache.js
  const acPath = path.join(root, 'utils/apiCache.js');
  if (fs.existsSync(acPath)) {
    let c = fs.readFileSync(acPath, 'utf8');
    c = c.replace('totalExecutedValue: 732648221.31,', 'totalExecutedValue: 638329685.46,');
    c = c.replace('totalRemainingValue: 165017453.72,', 'totalRemainingValue: 259335989.57,');
    c = c.replace('overallFinancialPercentage: 81.62,', 'overallFinancialPercentage: 71.11,');
    c = c.replace('basicItemsPercentage: 70.19', 'basicItemsPercentage: 71.11');
    c = c.replace('percentage: 70.19', 'percentage: 71.11');
    c = c.replace('executedValue: 631848792.36', 'executedValue: 638329685.46');
    fs.writeFileSync(acPath, c, 'utf8');
    console.log('Updated ' + acPath);
  }

  // 7. aiAgentEngine.js
  const aiPath = path.join(root, 'utils/aiAgentEngine.js');
  if (fs.existsSync(aiPath)) {
    let c = fs.readFileSync(aiPath, 'utf8');
    c = c.replace('الموقف المالي 81.62%', 'الموقف المالي 71.11%');
    c = c.replace('732,648,221.31 دينار ليبي (نسبة الإنجاز 81.62%)', '638,329,685.46 دينار ليبي (نسبة الإنجاز 71.11%)');
    c = c.replace('نسبة الإنجاز الكلية (81.62%)', 'نسبة الإنجاز الكلية (71.11%)');
    fs.writeFileSync(aiPath, c, 'utf8');
    console.log('Updated ' + aiPath);
  }
});

