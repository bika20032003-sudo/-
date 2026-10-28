// Unified synchronization utility linking Two-Phase Achievement Report (تقرير إنجاز المرحلتين)
// directly with the Dashboard (الداشبورد) and the 360 Road Progress View (متابعة إنجاز الطريق 360 كم).

export const initialPhase1ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '226218', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#eab308', shortName: 'طريق خدمي' },
];

export const initialPhase2ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '1220', totalMeters: '16240', dailyTarget: '800', varianceMeters: '420.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '460', totalMeters: '10410', dailyTarget: '800', varianceMeters: '-340.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '1140', totalMeters: '8140', dailyTarget: '800', varianceMeters: '340.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '500', totalMeters: '16210', dailyTarget: '800', varianceMeters: '-300.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '500', totalMeters: '10410', dailyTarget: '800', varianceMeters: '-300.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '15230', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#eab308', shortName: 'طريق خدمي' },
];

export const initialCombinedCustomFields = [
  { id: 1, readyToWorkMeters: '', notes: 'الجاهز للعمل بالبند (طبقة التشريب وقيد موافقة استشاري)' },
  { id: 2, readyToWorkMeters: '', notes: 'الجاهز للعمل بالبند (طبقة الأساس وقيد موافقة استشاري)' },
  { id: 3, readyToWorkMeters: '2253.00', notes: '' },
  { id: 4, readyToWorkMeters: '', notes: '' },
  { id: 5, readyToWorkMeters: '5717.00', notes: 'الجاهز للعمل بالبند (فرم أولى وقيد موافقة استشاري)' },
  { id: 6, readyToWorkMeters: '', notes: '' },
];

export const initialRemainingReportItems = [
  { id: 1, group: 'A', name: 'المتبقي من الفرمة الأولى', phase1: '150.00', phase2: '117677.00', total: '117677.00', notes: 'من احتياج الصيانة' },
  { id: 2, group: 'A', name: 'المتبقي من الفرمة الثانية', phase1: '183.00', phase2: '117777.00', total: '117777.00', notes: 'جزء السنارة المنهارة' },
  { id: 3, group: 'A', name: 'المتبقي من الأساس', phase1: '183.00', phase2: '123507.00', total: '123507.00', notes: '' },
  { id: 4, group: 'B', name: 'المتبقي من طبقة التشريب', phase1: '150.00', phase2: '123507.00', total: '123507.00', notes: '' },
  { id: 5, group: 'B', name: 'المتبقي من الاسفلت', phase1: '150.00', phase2: '125625.00', total: '125775.00', notes: '' },
  { id: 6, group: 'B', name: 'طول الطريق الخدمي العامل', phase1: '', phase2: '', total: '8080.00', notes: 'كيلومتر' },
];

export function getCertifiedBaselineTwoPhaseReport() {
  return {
    id: 'two-phase-certified-2026-10-24',
    reportNumber: '082024_24.10.2026',
    date: '2026-10-24T00:00:00.000Z',
    dateFormatted: '2026-10-24',
    dayName: 'السبت',
    title: 'بيان أعمال إنجاز المرحلتين يوم السبت 2026-10-24',
    projectName: 'مشروع صيانة وتطوير طريق أوباري - غات (360 كم)',
    reportType: 'تقرير إنجاز المرحلتين',
    shiftType: 'دوام كامل',
    sector: 'المسار الكلي الموحد (360 كم)',
    companyName: 'ائتلاف الشركات المنفذة لطريق أوباري غات',
    uploadedBy: 'م. صلاح العربي',
    sectorDirector: 'م. صلاح العربي',
    ownerRepresentative: 'م. عبدالرحمن الأنصاري',
    status: 'approved',
    approvedBy: 'مدير عام المشروع',
    notes: 'تقرير الأعمال المنجزة للمرحلتين - إنجاز اليوم: 3,820 م.ط - الإجمالي التراكمي: 237,390 م.ط',
    roadMeters: 3820,
    totalLength: 3820,
    isTwoPhaseProgressReport: true,
    phase1Items: initialPhase1ReportItems.map(i => ({ ...i })),
    phase2Items: initialPhase2ReportItems.map(i => ({ ...i })),
    combinedItems: initialPhase1ReportItems.map((p1, idx) => {
      const p2 = initialPhase2ReportItems[idx] || {};
      const custom = initialCombinedCustomFields[idx] || {};
      const todayP1 = parseFloat(p1.todayMeters) || 0;
      const todayP2 = parseFloat(p2.todayMeters) || 0;
      const totalP1 = parseFloat(p1.totalMeters) || 0;
      const totalP2 = parseFloat(p2.totalMeters) || 0;
      return {
        id: p1.id,
        category: p1.category,
        name: p1.name,
        shortName: p1.shortName,
        color: p1.color,
        todayMeters: String(todayP1 + todayP2),
        totalMeters: String(totalP1 + totalP2),
        readyToWorkMeters: custom.readyToWorkMeters || '',
        notes: custom.notes || ''
      };
    }),
    remainingItems: initialRemainingReportItems.map(i => ({ ...i })),
    twoPhaseTotals: {
      todayMeters: 3820,
      totalCumulativeMeters: 237390
    }
  };
}

export function getStoredTwoPhaseReport() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getCertifiedBaselineTwoPhaseReport();
  }
  try {
    const raw = localStorage.getItem('two_phase_report_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.phase1Items) && parsed.phase1Items.length > 0) {
        return parsed;
      }
    }
    const localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
    const tpRep = localReports.find(r => r && (r.isTwoPhaseProgressReport || r.reportType === 'تقرير إنجاز المرحلتين') && Array.isArray(r.phase1Items));
    if (tpRep) {
      return tpRep;
    }
  } catch (e) {
    console.warn('Error reading stored two phase report:', e);
  }
  return getCertifiedBaselineTwoPhaseReport();
}

export function saveStoredTwoPhaseReport(report) {
  if (!report || typeof report !== 'object') return;
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const enriched = {
      ...report,
      isTwoPhaseProgressReport: true,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('two_phase_report_data', JSON.stringify(enriched));

    // Also unshift or update in local_reports
    const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
    const filtered = local.filter(r => String(r.id) !== String(enriched.id) && String(r.reportNumber) !== String(enriched.reportNumber));
    filtered.unshift(enriched);
    localStorage.setItem('local_reports', JSON.stringify(filtered));

    // Dispatch custom events for real-time reactive sync across all open views
    window.dispatchEvent(new CustomEvent('report-saved', { detail: enriched }));
    window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: enriched }));
    return enriched;
  } catch (e) {
    console.error('Error saving two phase report to storage:', e);
  }
}

export function calculateTwoPhaseRoadMetrics(report) {
  const rep = report || getStoredTwoPhaseReport();
  const p1 = rep.phase1Items || [];
  const p2 = rep.phase2Items || [];

  const getP1Total = (idx, def) => (p1[idx] && p1[idx].totalMeters !== undefined) ? Number(p1[idx].totalMeters) || 0 : def;
  const getP2Total = (idx, def) => (p2[idx] && p2[idx].totalMeters !== undefined) ? Number(p2[idx].totalMeters) || 0 : def;
  const getP1Today = (idx) => (p1[idx] && p1[idx].todayMeters !== undefined) ? Number(p1[idx].todayMeters) || 0 : 0;
  const getP2Today = (idx) => (p2[idx] && p2[idx].todayMeters !== undefined) ? Number(p2[idx].todayMeters) || 0 : 0;

  // 1. FDR (index 0: طبقة إعادة التدوير)
  const fdrP1 = getP1Total(0, 226083);
  const fdrP2 = getP2Total(0, 16240);
  const fdrTotal = fdrP1 + fdrP2;
  const fdrPct = parseFloat(((fdrTotal / 360000) * 100).toFixed(1));
  const fdrSecA = Math.min(100, parseFloat(((fdrP1 / 226083) * 100).toFixed(1)));
  const fdrSecB = parseFloat(((fdrP2 / 133917) * 100).toFixed(1));

  // 2. Aggregate Base (index 4: طبقة أساس حبيبي والشرشور)
  const aggP1 = getP1Total(4, 226083);
  const aggP2 = getP2Total(4, 10410);
  const aggTotal = aggP1 + aggP2;
  const aggPct = parseFloat(((aggTotal / 360000) * 100).toFixed(1));
  const aggSecA = Math.min(100, parseFloat(((aggP1 / 226083) * 100).toFixed(1)));
  const aggSecB = parseFloat(((aggP2 / 133917) * 100).toFixed(1));

  // 3. MCO (index 1: رش طبقة التشريب)
  const mcoP1 = getP1Total(1, 226083);
  const mcoP2 = getP2Total(1, 10410);
  const mcoTotal = mcoP1 + mcoP2;
  const mcoPct = parseFloat(((mcoTotal / 360000) * 100).toFixed(1));
  const mcoSecA = Math.min(100, parseFloat(((mcoP1 / 226083) * 100).toFixed(1)));
  const mcoSecB = parseFloat(((mcoP2 / 133917) * 100).toFixed(1));

  // 4. Asphalt (index 2: طبقة الاسفلت المحسن)
  const asphP1 = getP1Total(2, 226083);
  const asphP2 = getP2Total(2, 8140);
  const asphTotal = asphP1 + asphP2;
  const asphPct = parseFloat(((asphTotal / 360000) * 100).toFixed(1));
  const asphSecA = Math.min(100, parseFloat(((asphP1 / 226083) * 100).toFixed(1)));
  const asphSecB = parseFloat(((asphP2 / 133917) * 100).toFixed(1));

  // Total Today meters: sum across both phases
  let todaySum = 0;
  p1.forEach((_, idx) => { todaySum += getP1Today(idx); });
  p2.forEach((_, idx) => { todaySum += getP2Today(idx); });
  if (todaySum === 0 && rep.twoPhaseTotals?.todayMeters) {
    todaySum = Number(rep.twoPhaseTotals.todayMeters) || 0;
  }

  // Executed km (average meters of the 4 core layers divided by 1000)
  const avgCoreMeters = (fdrTotal + aggTotal + mcoTotal + asphTotal) / 4;
  const totalExecutedKm = parseFloat((avgCoreMeters / 1000).toFixed(2));
  const remainingKm = Math.max(0, parseFloat((360.00 - totalExecutedKm).toFixed(2)));
  const overallPercentage = parseFloat(((totalExecutedKm / 360.00) * 100).toFixed(1));

  // Sector A percentage: 100%
  const sectorAPercentage = 100.0;
  // Sector B percentage: average of Sector B progress
  const avgSecB = (fdrSecB + aggSecB + mcoSecB + asphSecB) / 4;
  const sectorBPercentage = parseFloat(avgSecB.toFixed(1));

  return {
    totalRoadLengthKm: 360.00,
    overallPercentage,
    sectorAPercentage,
    sectorBPercentage,
    totalExecutedKm,
    remainingKm,
    totalTodayMeters: todaySum,
    layers: [
      { name: 'إعادة التدوير (FDR)', meters: fdrTotal, percentage: fdrPct, color: '#2563eb', sectorA: fdrSecA, sectorB: fdrSecB },
      { name: 'الأساس الحبيبي (الشرشور)', meters: aggTotal, percentage: aggPct, color: '#16a34a', sectorA: aggSecA, sectorB: aggSecB },
      { name: 'رش التشريب (MCO)', meters: mcoTotal, percentage: mcoPct, color: '#ea580c', sectorA: mcoSecA, sectorB: mcoSecB },
      { name: 'الاسفلت المحسن', meters: asphTotal, percentage: asphPct, color: '#7c3aed', sectorA: asphSecA, sectorB: asphSecB }
    ],
    kpis: {
      fdr: { meters: fdrTotal, percentage: fdrPct },
      asphalt: { meters: asphTotal, percentage: asphPct },
      aggregateBase: { meters: aggTotal, percentage: aggPct },
      mco: { meters: mcoTotal, percentage: mcoPct },
      totalTodayMeters: todaySum
    },
    latestTwoPhaseReport: rep
  };
}

export function generateRoadProgressItems(report) {
  const rep = report || getStoredTwoPhaseReport();
  const p1 = rep.phase1Items || [];
  const p2 = rep.phase2Items || [];
  const custom = rep.combinedItems || [];

  const items = [];

  const itemConfigs = [
    { name: 'طبقة إعادة التدوير (FDR)', category: 'بنود أساسية', defTarget: 800, p1DefTotal: 226083, p2DefTotal: 16240, p2DefToday: 1220 },
    { name: 'رش طبقة التشريب (MCO)', category: 'بنود أساسية', defTarget: 800, p1DefTotal: 226083, p2DefTotal: 10410, p2DefToday: 460 },
    { name: 'طبقة الاسفلت المحسن', category: 'بنود أساسية', defTarget: 800, p1DefTotal: 226083, p2DefTotal: 8140, p2DefToday: 1140 },
    { name: 'فرمة اولي بدون اسمنت(FDR)', category: 'بنود إضافية', defTarget: 800, p1DefTotal: 226083, p2DefTotal: 16210, p2DefToday: 500 },
    { name: 'طبقة أساس حبيبي', category: 'بنود إضافية', defTarget: 800, p1DefTotal: 226083, p2DefTotal: 10410, p2DefToday: 500 },
    { name: 'الطريق الخدمي', category: 'بنود إضافية', defTarget: 800, p1DefTotal: 226218, p2DefTotal: 15230, p2DefToday: 0 }
  ];

  // Phase 1 (id: 1..6)
  itemConfigs.forEach((cfg, idx) => {
    const raw = p1[idx] || {};
    const c = custom[idx] || {};
    const total = Number(raw.totalMeters) || cfg.p1DefTotal;
    const today = Number(raw.todayMeters) || 0;
    const prev = Math.max(0, total - today);
    const target = Number(raw.dailyTarget) || cfg.defTarget;
    items.push({
      id: idx + 1,
      sector: 'المرحلة الأولى',
      itemName: raw.name || cfg.name,
      category: raw.category === 'additional' ? 'بنود إضافية' : 'بنود أساسية',
      todayMeters: today,
      previousMeters: prev,
      totalMeters: total,
      dailyTarget: target,
      varianceMeters: today > 0 ? (today - target) : 0,
      readyLength: Number(c.readyToWorkMeters) || 0,
      notes: raw.notes || 'مكتملة بالكامل بالمرحلة الأولى'
    });
  });

  // Phase 2 (id: 7..12)
  itemConfigs.forEach((cfg, idx) => {
    const raw = p2[idx] || {};
    const c = custom[idx] || {};
    const total = Number(raw.totalMeters) || cfg.p2DefTotal;
    const today = (raw.todayMeters !== undefined && raw.todayMeters !== '') ? Number(raw.todayMeters) : cfg.p2DefToday;
    const prev = Math.max(0, total - today);
    const target = Number(raw.dailyTarget) || cfg.defTarget;
    items.push({
      id: idx + 7,
      sector: 'المرحلة الثانية',
      itemName: raw.name || cfg.name,
      category: raw.category === 'additional' ? 'بنود إضافية' : 'بنود أساسية',
      todayMeters: today,
      previousMeters: prev,
      totalMeters: total,
      dailyTarget: target,
      varianceMeters: today - target,
      readyLength: Number(c.readyToWorkMeters) || 0,
      notes: raw.notes || 'منجز معتمد بالتقرير اليومي'
    });
  });

  return items;
}

export function updateRoadProgressItem(id, todayMeters, notes) {
  const rep = getStoredTwoPhaseReport();
  const numId = Number(id);
  const val = Number(todayMeters) || 0;

  if (numId <= 6) {
    const idx = numId - 1;
    if (rep.phase1Items && rep.phase1Items[idx]) {
      const prevTotal = Number(rep.phase1Items[idx].totalMeters) || 0;
      const oldToday = Number(rep.phase1Items[idx].todayMeters) || 0;
      rep.phase1Items[idx].todayMeters = String(val);
      rep.phase1Items[idx].totalMeters = String(prevTotal - oldToday + val);
      if (notes !== undefined) rep.phase1Items[idx].notes = notes;
    }
  } else {
    const idx = numId - 7;
    if (rep.phase2Items && rep.phase2Items[idx]) {
      const prevTotal = Number(rep.phase2Items[idx].totalMeters) || 0;
      const oldToday = Number(rep.phase2Items[idx].todayMeters) || 0;
      rep.phase2Items[idx].todayMeters = String(val);
      rep.phase2Items[idx].totalMeters = String(prevTotal - oldToday + val);
      const target = Number(rep.phase2Items[idx].dailyTarget) || 800;
      rep.phase2Items[idx].varianceMeters = String(val - target);
      if (notes !== undefined) rep.phase2Items[idx].notes = notes;
    }
  }

  // Recalculate combined items
  if (Array.isArray(rep.phase1Items) && Array.isArray(rep.phase2Items)) {
    rep.combinedItems = rep.phase1Items.map((p1, i) => {
      const p2 = rep.phase2Items[i] || {};
      const c = (rep.combinedItems && rep.combinedItems[i]) || {};
      const t1 = Number(p1.todayMeters) || 0;
      const t2 = Number(p2.todayMeters) || 0;
      const tot1 = Number(p1.totalMeters) || 0;
      const tot2 = Number(p2.totalMeters) || 0;
      return {
        ...c,
        id: p1.id,
        category: p1.category,
        name: p1.name,
        shortName: p1.shortName,
        color: p1.color,
        todayMeters: String(t1 + t2),
        totalMeters: String(tot1 + tot2)
      };
    });
  }

  saveStoredTwoPhaseReport(rep);
  return rep;
}

