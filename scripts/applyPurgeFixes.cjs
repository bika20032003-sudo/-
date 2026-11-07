const fs = require('fs');
const path = require('path');

const roots = ['./src', './منظومة جهاز الاشراف/src'];

roots.forEach(root => {
  // 1. UploadReportsView.jsx
  const urPath = path.join(root, 'views/UploadReportsView.jsx');
  if (fs.existsSync(urPath)) {
    let c = fs.readFileSync(urPath, 'utf8');
    c = c.replace(
      '✨ إجمالي الأطوال المنجزة اليوم بالتقرير: {((parseFloat(twoPhaseFdr)||0) + (parseFloat(twoPhaseMco)||0) + (parseFloat(twoPhaseAsphalt)||0) + (parseFloat(twoPhaseFdrNoCement)||0) + (parseFloat(twoPhaseAggBase)||0)).toLocaleString()} م.ط',
      '✨ قياس منفصل لكل بند (FDR، MCO، أسفلت) طبقاً للمواصفات الهندسية المعتمدة'
    );
    c = c.replace(
      'تضاف تراكمياً لإنجاز الطريق العام وتحدث لوحة التحكم فورياً دون إنقاص النسبة',
      'تُسجل كميات كل طبقة على حدة وتحدث لوحة التحكم فورياً'
    );
    fs.writeFileSync(urPath, c, 'utf8');
    console.log('Updated ' + urPath);
  }

  // 2. CreateReportModal.jsx
  const crmPath = path.join(root, 'components/CreateReportModal.jsx');
  if (fs.existsSync(crmPath)) {
    let c = fs.readFileSync(crmPath, 'utf8');
    c = c.replace(
      'notes: notes || `تقرير أعمال الطريق اليومي المعتمد - إجمالي الأطوال: ${totalRoadLength.toLocaleString()} م.ط - المساحة: ${totalRoadArea.toLocaleString()} م²`,',
      'notes: notes || `تقرير أعمال الطريق اليومي المعتمد - عدد البنود: ${roadItems.length} بنود منفذة`,'
    );
    c = c.replace(
      'أطوال العمل، المعدات والكوادر المطلوبة',
      'بنود العمل، المعدات والكوادر المطلوبة'
    );
    c = c.replace(
      'إنجاز اليوم: {twoPhaseTodayTotal.toLocaleString()} م.ط • التراكمي الكلي: {twoPhaseCumulativeTotal.toLocaleString()} م.ط',
      'كل طبقة تُقاس وتُتابع بصورة مستقلة طبقاً للمواصفات'
    );
    fs.writeFileSync(crmPath, c, 'utf8');
    console.log('Updated ' + crmPath);
  }

  // 3. RoadDailyReportForm.jsx
  const rdrPath = path.join(root, 'components/RoadDailyReportForm.jsx');
  if (fs.existsSync(rdrPath)) {
    let c = fs.readFileSync(rdrPath, 'utf8');
    c = c.replace(
      "content: forwardNote.trim() || ('نحيل إليكم التقرير اليومي المعتمد لأعمال الطريق المنفذة بمشروع صيانة طريق أوباري - غات. إجمالي الأطوال: ' + fmtNum(calculatedTotals.totalLength) + ' م.ط.'),",
      "content: forwardNote.trim() || ('نحيل إليكم التقرير اليومي المعتمد لأعمال الطريق المنفذة بمشروع صيانة طريق أوباري - غات. عدد البنود: ' + (reportData.items?.length || 0) + ' بنود منفذة.'),"
    );
    c = c.replace(
      'notes: `تقرير أعمال الطريق اليومي المعتمد ليوم ${reportData.dayName} ${reportData.reportDate} - إجمالي الأطوال: ${fmtNum(calculatedTotals.totalLength)} م.ط `,',
      'notes: `تقرير أعمال الطريق اليومي المعتمد ليوم ${reportData.dayName} ${reportData.reportDate} - عدد البنود: ${reportData.items?.length || 0} بنود منفذة`,'
    );
    fs.writeFileSync(rdrPath, c, 'utf8');
    console.log('Updated ' + rdrPath);
  }

  // 4. CreateReportView.jsx
  const crvPath = path.join(root, 'views/CreateReportView.jsx');
  if (fs.existsSync(crvPath)) {
    let c = fs.readFileSync(crvPath, 'utf8');
    c = c.replace(
      'notes: `تقرير أعمال يومي معتمد - إجمالي الأطوال: ${totalRoadLength} م.ط - إجمالي المساحة: ${totalRoadArea} م²`,',
      'notes: `تقرير أعمال يومي معتمد - عدد البنود: ${roadItems.length} بنود منفذة`,'
    );
    fs.writeFileSync(crvPath, c, 'utf8');
    console.log('Updated ' + crvPath);
  }

  // 5. PeriodicReportsView.jsx
  const prvPath = path.join(root, 'views/PeriodicReportsView.jsx');
  if (fs.existsSync(prvPath)) {
    let c = fs.readFileSync(prvPath, 'utf8');
    c = c.replace(
      'content: forwardNote.trim() || (`نحيل إليكم التقرير الدوري المعتمد لأعمال مسار الطريق للفترة من ${startDate} إلى ${endDate}. إجمالي الطول المنجز: ${fmtInt(aggregatedReport.totalPeriodMeters)} م.ط، والقيمة التعاقدية المنفذة: ${fmtNum(aggregatedReport.totalFinancialValue)} د.ل.`),',
      'content: forwardNote.trim() || (`نحيل إليكم التقرير الدوري المعتمد لأعمال مسار الطريق للفترة من ${startDate} إلى ${endDate}. القيمة التعاقدية المنفذة: ${fmtNum(aggregatedReport.totalFinancialValue)} د.ل.`),'
    );
    fs.writeFileSync(prvPath, c, 'utf8');
    console.log('Updated ' + prvPath);
  }

  // 6. TargetedWorksView.jsx
  const twvPath = path.join(root, 'views/TargetedWorksView.jsx');
  if (fs.existsSync(twvPath)) {
    let c = fs.readFileSync(twvPath, 'utf8');
    c = c.replace(
      'const totalLengthMeters = filteredReports.reduce((sum, r) => sum + (Number(r.totalTargetLength) || Number(r.roadMeters) || 0), 0);',
      '// تم إلغاء حساب إجمالي الأطوال لتعارض الجمع الهندسي بين الطبقات المستهدفة'
    );
    fs.writeFileSync(twvPath, c, 'utf8');
    console.log('Updated ' + twvPath);
  }

  // 7. CreateTargetedWorksReportModal.jsx
  const ctwPath = path.join(root, 'components/CreateTargetedWorksReportModal.jsx');
  if (fs.existsSync(ctwPath)) {
    let c = fs.readFileSync(ctwPath, 'utf8');
    c = c.replace('totalTargetLength: 23250,\n', '');
    c = c.replace('roadMeters: 23250,\n', '');
    fs.writeFileSync(ctwPath, c, 'utf8');
    console.log('Updated ' + ctwPath);
  }
});

