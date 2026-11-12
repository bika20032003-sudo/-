import { deepSanitizeLatinDigits, toCleanLatinDigits } from './forceLatinDigits.js';
import { saveReportToIndexedDB } from './secureDatabase.js';
import { calculateReadyToWorkPipeline, calculateRemainingItems, parseCleanNumber, formatTwoPhaseNumber } from './engineeringFormulas.js';
import { fastFetch } from './apiCache.js';

// Unified synchronization utility linking Two-Phase Achievement Report (تقرير إنجاز المرحلتين)
// directly with the Dashboard (الداشبورد) and the 360 Road Progress View (متابعة إنجاز الطريق 360 كم).

export const initialPhase1ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', previousMeters: '226,083', todayMeters: '0', totalMeters: '226,083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', previousMeters: '226,083', todayMeters: '0', totalMeters: '226,083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', previousMeters: '226,083', todayMeters: '0', totalMeters: '226,083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', previousMeters: '226,083', todayMeters: '0', totalMeters: '226,083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', previousMeters: '226,083', todayMeters: '0', totalMeters: '226,083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', previousMeters: '226,213', todayMeters: '0', totalMeters: '226,213', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#eab308', shortName: 'طريق خدمي' },
];

export const initialPhase2ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', previousMeters: '19,200', todayMeters: '100', totalMeters: '19,300', dailyTarget: '800', varianceMeters: '-700.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', previousMeters: '11,370', todayMeters: '1,150', totalMeters: '12,520', dailyTarget: '800', varianceMeters: '350.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', previousMeters: '10,290', todayMeters: '0', totalMeters: '10,290', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', previousMeters: '19,320', todayMeters: '0', totalMeters: '19,320', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', previousMeters: '12,030', todayMeters: '600', totalMeters: '12,630', dailyTarget: '800', varianceMeters: '-200.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', previousMeters: '19,320', todayMeters: '0', totalMeters: '19,320', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#eab308', shortName: 'طريق خدمي' },
];

export const initialCombinedCustomFields = [
  { id: 1, readyToWorkMeters: '20.00', notes: 'الجاهز للعمل بالبند (منفذ فرمة اولي وغير منفذ فرمة تانية)' },
  { id: 2, readyToWorkMeters: '110.00', notes: 'الجاهز للعمل بالبند (منفذ اساس وغير مرشوش mc)' },
  { id: 3, readyToWorkMeters: '2,230.00', notes: 'الجاهز للعمل بالبند (مرشوش mc وغير منفذ اسفلت)' },
  { id: 4, readyToWorkMeters: '', notes: '' },
  { id: 5, readyToWorkMeters: '6,670.00', notes: 'الجاهز للعمل بالبند (منفذ فرمة ثانية وغير منفذ اساس)' },
  { id: 6, readyToWorkMeters: '', notes: '' },
];

export const initialRemainingReportItems = [
  { id: 1, group: 'A', name: 'المتبقي من الفرمة الأولى', phase1: '130.00', phase2: '114,467.00', total: '114,597.00', notes: 'جزء العبارة المنهارة' },
  { id: 2, group: 'A', name: 'المتبقي من الفرمة الثانية', phase1: '130.00', phase2: '114,487.00', total: '114,617.00', notes: 'جزء العبارة المنهارة' },
  { id: 3, group: 'A', name: 'المتبقي من الأساس', phase1: '130.00', phase2: '121,157.00', total: '121,287.00', notes: '' },
  { id: 4, group: 'B', name: 'المتبقي من طبقة التشريب', phase1: '130.00', phase2: '121,267.00', total: '121,397.00', notes: '' },
  { id: 5, group: 'B', name: 'المتبقي من الاسفلت', phase1: '130.00', phase2: '123,497.00', total: '123,627.00', notes: '' },
  { id: 6, group: 'B', name: 'طول الطريق الخدمي العامل', phase1: '', phase2: '', total: '9,030.00', notes: 'كيلومتر' },
];

export function getCertifiedBaselineTwoPhaseReport() {
  return {
    id: 'two-phase-certified-2026-10-24',
    reportNumber: '082024_29.10.2026',
    date: '2026-10-29T00:00:00.000Z',
    dateFormatted: '2026-10-29',
    dayName: 'الخميس',
    title: 'بيان أعمال إنجاز المرحلتين يوم الخميس 2026-10-29',
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
    notes: 'تقرير الأعمال المنجزة للمرحلتين — حساب كل بند مستقلاً دون جمع تراكمي بين الطبقات',
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
    remainingItems: initialRemainingReportItems.map(i => ({ ...i }))
  };
}

export function getStoredTwoPhaseReport() {
  const baseline = getCertifiedBaselineTwoPhaseReport();
  if (typeof window === 'undefined' || !window.localStorage) {
    return deepSanitizeLatinDigits(baseline);
  }
  try {
    let rep = null;
    const raw = localStorage.getItem('two_phase_report_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.phase1Items) && parsed.phase1Items.length > 0) {
        rep = parsed;
      }
    }
    if (!rep) {
      const localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
      const tpRep = localReports.find(r => r && (r.isTwoPhaseProgressReport || r.reportType === 'تقرير إنجاز المرحلتين') && Array.isArray(r.phase1Items));
      if (tpRep) {
        rep = tpRep;
      }
    }
    if (rep) {
      // Normalize and backfill any missing items or categories
      const p1 = (Array.isArray(rep.phase1Items) && rep.phase1Items.length >= 6)
        ? rep.phase1Items
        : baseline.phase1Items.map((base, idx) => ({ ...base, ...(rep.phase1Items?.[idx] || {}) }));
      const p2 = (Array.isArray(rep.phase2Items) && rep.phase2Items.length >= 6)
        ? rep.phase2Items
        : baseline.phase2Items.map((base, idx) => ({ ...base, ...(rep.phase2Items?.[idx] || {}) }));
      const remaining = (Array.isArray(rep.remainingItems) && rep.remainingItems.length >= 6)
        ? rep.remainingItems
        : baseline.remainingItems.map((base, idx) => ({ ...base, ...(rep.remainingItems?.[idx] || {}) }));
      const combined = (Array.isArray(rep.combinedItems) && rep.combinedItems.length >= 6)
        ? rep.combinedItems
        : baseline.combinedItems.map((base, idx) => ({ ...base, ...(rep.combinedItems?.[idx] || {}) }));

      const merged = {
        ...baseline,
        ...rep,
        phase1Items: p1.map((item, idx) => ({
          ...baseline.phase1Items[idx],
          ...item,
          previousMeters: formatTwoPhaseNumber(item.previousMeters),
          todayMeters: item.todayMeters !== undefined && item.todayMeters !== null && item.todayMeters !== '' ? (item.todayMeters === '0' || item.todayMeters === 0 ? '0' : formatTwoPhaseNumber(item.todayMeters)) : '',
          totalMeters: formatTwoPhaseNumber(item.totalMeters),
          dailyTarget: formatTwoPhaseNumber(item.dailyTarget || 800),
          varianceMeters: formatTwoPhaseNumber(item.varianceMeters),
          category: item.category || (idx < 3 ? 'basic' : 'additional')
        })),
        phase2Items: p2.map((item, idx) => ({
          ...baseline.phase2Items[idx],
          ...item,
          previousMeters: formatTwoPhaseNumber(item.previousMeters),
          todayMeters: item.todayMeters !== undefined && item.todayMeters !== null && item.todayMeters !== '' ? (item.todayMeters === '0' || item.todayMeters === 0 ? '0' : formatTwoPhaseNumber(item.todayMeters)) : '',
          totalMeters: formatTwoPhaseNumber(item.totalMeters),
          dailyTarget: formatTwoPhaseNumber(item.dailyTarget || 800),
          varianceMeters: formatTwoPhaseNumber(item.varianceMeters),
          category: item.category || (idx < 3 ? 'basic' : 'additional')
        })),
        remainingItems: remaining.map((item, idx) => ({
          ...baseline.remainingItems[idx],
          ...item,
          phase1: item.phase1 !== undefined && item.phase1 !== null && item.phase1 !== '' ? formatTwoPhaseNumber(item.phase1) : '',
          phase2: item.phase2 !== undefined && item.phase2 !== null && item.phase2 !== '' ? formatTwoPhaseNumber(item.phase2) : '',
          total: item.total !== undefined && item.total !== null && item.total !== '' ? formatTwoPhaseNumber(item.total) : '',
          group: item.group || (idx < 3 ? 'A' : 'B')
        })),
        combinedItems: combined.map((item, idx) => ({
          ...baseline.combinedItems[idx],
          ...item,
          todayMeters: item.todayMeters !== undefined && item.todayMeters !== null && item.todayMeters !== '' ? (item.todayMeters === '0' || item.todayMeters === 0 ? '0' : formatTwoPhaseNumber(item.todayMeters)) : '',
          totalMeters: item.totalMeters !== undefined && item.totalMeters !== null && item.totalMeters !== '' ? formatTwoPhaseNumber(item.totalMeters) : '',
          readyToWorkMeters: item.readyToWorkMeters !== undefined && item.readyToWorkMeters !== null && item.readyToWorkMeters !== '' ? formatTwoPhaseNumber(item.readyToWorkMeters) : '',
          category: item.category || (idx < 3 ? 'basic' : 'additional')
        }))
      };
      return deepSanitizeLatinDigits(merged);
    }
  } catch (e) {
    console.warn('Error reading stored two phase report:', e);
  }
  return deepSanitizeLatinDigits(baseline);
}

export function saveStoredTwoPhaseReport(report) {
  if (!report || typeof report !== 'object') return;
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const sanitized = deepSanitizeLatinDigits(report);
    const enriched = {
      ...sanitized,
      id: sanitized.id || Date.now(),
      reportNumber: sanitized.reportNumber || `REP-TWO-PHASE-${Date.now().toString().slice(-4)}`,
      isTwoPhaseProgressReport: true,
      updatedAt: new Date().toISOString(),
      phase1Items: Array.isArray(sanitized.phase1Items) ? sanitized.phase1Items.map(it => ({
        ...it,
        previousMeters: formatTwoPhaseNumber(it.previousMeters),
        todayMeters: it.todayMeters !== undefined && it.todayMeters !== null && it.todayMeters !== '' ? (it.todayMeters === '0' || it.todayMeters === 0 ? '0' : formatTwoPhaseNumber(it.todayMeters)) : '',
        totalMeters: formatTwoPhaseNumber(it.totalMeters),
        dailyTarget: formatTwoPhaseNumber(it.dailyTarget || 800),
        varianceMeters: formatTwoPhaseNumber(it.varianceMeters)
      })) : sanitized.phase1Items,
      phase2Items: Array.isArray(sanitized.phase2Items) ? sanitized.phase2Items.map(it => ({
        ...it,
        previousMeters: formatTwoPhaseNumber(it.previousMeters),
        todayMeters: it.todayMeters !== undefined && it.todayMeters !== null && it.todayMeters !== '' ? (it.todayMeters === '0' || it.todayMeters === 0 ? '0' : formatTwoPhaseNumber(it.todayMeters)) : '',
        totalMeters: formatTwoPhaseNumber(it.totalMeters),
        dailyTarget: formatTwoPhaseNumber(it.dailyTarget || 800),
        varianceMeters: formatTwoPhaseNumber(it.varianceMeters)
      })) : sanitized.phase2Items,
      remainingItems: Array.isArray(sanitized.remainingItems) ? sanitized.remainingItems.map(it => ({
        ...it,
        phase1: it.phase1 !== undefined && it.phase1 !== null && it.phase1 !== '' ? formatTwoPhaseNumber(it.phase1) : '',
        phase2: it.phase2 !== undefined && it.phase2 !== null && it.phase2 !== '' ? formatTwoPhaseNumber(it.phase2) : '',
        total: it.total !== undefined && it.total !== null && it.total !== '' ? formatTwoPhaseNumber(it.total) : ''
      })) : sanitized.remainingItems,
      combinedItems: Array.isArray(sanitized.combinedItems) ? sanitized.combinedItems.map(it => ({
        ...it,
        todayMeters: it.todayMeters !== undefined && it.todayMeters !== null && it.todayMeters !== '' ? (it.todayMeters === '0' || it.todayMeters === 0 ? '0' : formatTwoPhaseNumber(it.todayMeters)) : '',
        totalMeters: it.totalMeters !== undefined && it.totalMeters !== null && it.totalMeters !== '' ? formatTwoPhaseNumber(it.totalMeters) : '',
        readyToWorkMeters: it.readyToWorkMeters !== undefined && it.readyToWorkMeters !== null && it.readyToWorkMeters !== '' ? formatTwoPhaseNumber(it.readyToWorkMeters) : ''
      })) : sanitized.combinedItems
    };
    localStorage.setItem('two_phase_report_data', JSON.stringify(enriched));

    // Also unshift or update in local_reports with strict deduplication
    const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
    const filtered = local.filter(r => 
      r &&
      String(r.id) !== String(enriched.id) && 
      String(r.reportNumber) !== String(enriched.reportNumber) &&
      !(r.isTwoPhaseProgressReport && (r.dateFormatted === enriched.dateFormatted || r.reportNumber === enriched.reportNumber)) &&
      !(r.reportType === 'تقرير إنجاز المرحلتين' && r.dateFormatted === enriched.dateFormatted)
    );
    filtered.unshift(enriched);
    localStorage.setItem('local_reports', JSON.stringify(filtered));

    try {
      saveReportToIndexedDB(enriched);
    } catch (_) {}

    // Unblock from deleted_report_ids
    try {
      const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
      const updatedDeleted = deleted.filter(id => String(id) !== String(enriched.id) && String(id) !== String(enriched.reportNumber));
      localStorage.setItem('deleted_report_ids', JSON.stringify(updatedDeleted));
    } catch (_) {}

    // Dispatch custom events for real-time reactive sync across all open views
    window.dispatchEvent(new CustomEvent('report-saved', { detail: enriched }));
    window.dispatchEvent(new CustomEvent('report-updated', { detail: enriched }));
    window.dispatchEvent(new CustomEvent('reports-updated', { detail: enriched }));
    window.dispatchEvent(new CustomEvent('two-phase-updated', { detail: enriched }));
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

  const getItemTotal = (items, id, fallback) => {
    const found = items.find(it => it.id === id || (
      id === 1 ? (it.name?.includes('إعادة التدوير') || it.name?.includes('FDR')) && !it.name?.includes('بدون') :
      id === 2 ? it.name?.includes('التشريب') || it.name?.includes('MCO') :
      id === 3 ? it.name?.includes('الاسفلت') || it.name?.includes('أسفلت') :
      id === 4 ? it.name?.includes('بدون اسمنت') || it.name?.includes('بدون أسمنت') :
      id === 5 ? it.name?.includes('أساس') || it.name?.includes('اساس') :
      it.name?.includes('خدمي')
    ));
    if (found && found.totalMeters !== undefined && found.totalMeters !== '') {
      const val = parseCleanNumber(found.totalMeters, NaN);
      if (!isNaN(val)) return val;
    }
    return fallback;
  };

  const getItemToday = (items, id) => {
    const found = items.find(it => it.id === id || (
      id === 1 ? (it.name?.includes('إعادة التدوير') || it.name?.includes('FDR')) && !it.name?.includes('بدون') :
      id === 2 ? it.name?.includes('التشريب') || it.name?.includes('MCO') :
      id === 3 ? it.name?.includes('الاسفلت') || it.name?.includes('أسفلت') :
      id === 4 ? it.name?.includes('بدون اسمنت') || it.name?.includes('بدون أسمنت') :
      id === 5 ? it.name?.includes('أساس') || it.name?.includes('اساس') :
      it.name?.includes('خدمي')
    ));
    if (found && found.todayMeters !== undefined && found.todayMeters !== '') {
      const val = parseCleanNumber(found.todayMeters, NaN);
      if (!isNaN(val)) return val;
    }
    return 0;
  };

  // 1. FDR (id 1: طبقة إعادة التدوير بالأسمنت)
  const fdrP1 = getItemTotal(p1, 1, 226083);
  const fdrP2 = getItemTotal(p2, 1, 19300);
  const fdrTotal = fdrP1 + fdrP2;
  const fdrPct = parseFloat(((fdrTotal / 360000) * 100).toFixed(1));
  const fdrSecA = Math.min(100, parseFloat(((fdrP1 / 226083) * 100).toFixed(1)));
  const fdrSecB = parseFloat(((fdrP2 / 133917) * 100).toFixed(1));

  // 2. Aggregate Base (id 5: طبقة أساس حبيبي)
  const aggP1 = getItemTotal(p1, 5, 226083);
  const aggP2 = getItemTotal(p2, 5, 12630);
  const aggTotal = aggP1 + aggP2;
  const aggPct = parseFloat(((aggTotal / 360000) * 100).toFixed(1));
  const aggSecA = Math.min(100, parseFloat(((aggP1 / 226083) * 100).toFixed(1)));
  const aggSecB = parseFloat(((aggP2 / 133917) * 100).toFixed(1));

  // 3. MCO (id 2: رش طبقة التشريب)
  const mcoP1 = getItemTotal(p1, 2, 226083);
  const mcoP2 = getItemTotal(p2, 2, 12520);
  const mcoTotal = mcoP1 + mcoP2;
  const mcoPct = parseFloat(((mcoTotal / 360000) * 100).toFixed(1));
  const mcoSecA = Math.min(100, parseFloat(((mcoP1 / 226083) * 100).toFixed(1)));
  const mcoSecB = parseFloat(((mcoP2 / 133917) * 100).toFixed(1));

  // 4. Asphalt (id 3: طبقة الاسفلت المحسن)
  const asphP1 = getItemTotal(p1, 3, 226083);
  const asphP2 = getItemTotal(p2, 3, 10290);
  const asphTotal = asphP1 + asphP2;
  const asphPct = parseFloat(((asphTotal / 360000) * 100).toFixed(1));
  const asphSecA = Math.min(100, parseFloat(((asphP1 / 226083) * 100).toFixed(1)));
  const asphSecB = parseFloat(((asphP2 / 133917) * 100).toFixed(1));

  // Today sums
  let p1TodaySum = 0;
  p1.forEach((_, idx) => { p1TodaySum += parseCleanNumber(p1[idx]?.todayMeters, 0); });
  let p2TodaySum = 0;
  p2.forEach((_, idx) => { p2TodaySum += parseCleanNumber(p2[idx]?.todayMeters, 0); });
  const todaySum = p1TodaySum + p2TodaySum;

  // Dedicated Phase 1 Metrics (226.08 KM)
  const phase1LengthKm = 226.08;
  const avgP1Meters = (fdrP1 + aggP1 + mcoP1 + asphP1) / 4;
  const phase1ExecutedKm = parseFloat((avgP1Meters / 1000).toFixed(2));
  const phase1RemainingKm = Math.max(0, parseFloat((phase1LengthKm - phase1ExecutedKm).toFixed(2)));
  const phase1Percentage = Math.min(100, parseFloat(((phase1ExecutedKm / phase1LengthKm) * 100).toFixed(1)));

  // Dedicated Phase 2 Metrics (133.92 KM)
  const phase2LengthKm = 133.92;
  const avgP2Meters = (fdrP2 + aggP2 + mcoP2 + asphP2) / 4;
  const phase2ExecutedKm = parseFloat((avgP2Meters / 1000).toFixed(2));
  const phase2RemainingKm = Math.max(0, parseFloat((phase2LengthKm - phase2ExecutedKm).toFixed(2)));
  const phase2Percentage = parseFloat(((phase2ExecutedKm / phase2LengthKm) * 100).toFixed(1));

  // Combined Executed km (226.08 + 13.69 = 239.77 KM)
  const totalRoadLengthKm = 360.00;
  const totalExecutedKm = parseFloat((phase1ExecutedKm + phase2ExecutedKm).toFixed(2));
  const remainingKm = Math.max(0, parseFloat((totalRoadLengthKm - totalExecutedKm).toFixed(2)));
  const overallPercentage = parseFloat(((totalExecutedKm / totalRoadLengthKm) * 100).toFixed(1));

  const sectorAPercentage = phase1Percentage;
  const sectorBPercentage = phase2Percentage;

  return {
    totalRoadLengthKm: 360.00,
    overallPercentage,
    sectorAPercentage,
    sectorBPercentage,
    totalExecutedKm,
    remainingKm,
    totalTodayMeters: todaySum,
    phase1: {
      name: 'المرحلة الأولى',
      lengthKm: phase1LengthKm,
      executedKm: phase1ExecutedKm,
      remainingKm: phase1RemainingKm,
      percentage: phase1Percentage,
      todayMeters: p1TodaySum,
      fdrMeters: fdrP1,
      aggMeters: aggP1,
      mcoMeters: mcoP1,
      asphMeters: asphP1,
      isCompleted: phase1RemainingKm === 0 || phase1Percentage >= 99.9
    },
    phase2: {
      name: 'المرحلة الثانية',
      lengthKm: phase2LengthKm,
      executedKm: phase2ExecutedKm,
      remainingKm: phase2RemainingKm,
      percentage: phase2Percentage,
      todayMeters: p2TodaySum,
      fdrMeters: fdrP2,
      aggMeters: aggP2,
      mcoMeters: mcoP2,
      asphMeters: asphP2,
      isCompleted: false
    },
    layers: [
      { name: 'إعادة التدوير (FDR)', meters: fdrTotal, percentage: fdrPct, color: '#2563eb', phase1: fdrSecA, phase2: fdrSecB, sectorA: fdrSecA, sectorB: fdrSecB },
      { name: 'طبقة الأساس الحبيبي', meters: aggTotal, percentage: aggPct, color: '#16a34a', phase1: aggSecA, phase2: aggSecB, sectorA: aggSecA, sectorB: aggSecB },
      { name: 'رش التشريب (MCO)', meters: mcoTotal, percentage: mcoPct, color: '#ea580c', phase1: mcoSecA, phase2: mcoSecB, sectorA: mcoSecA, sectorB: mcoSecB },
      { name: 'الاسفلت المحسن', meters: asphTotal, percentage: asphPct, color: '#7c3aed', phase1: asphSecA, phase2: asphSecB, sectorA: asphSecA, sectorB: asphSecB }
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
    const total = parseCleanNumber(raw.totalMeters, cfg.p1DefTotal);
    const today = parseCleanNumber(raw.todayMeters, 0);
    const prev = Math.max(0, total - today);
    const target = parseCleanNumber(raw.dailyTarget, cfg.defTarget);
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
      readyLength: parseCleanNumber(c.readyToWorkMeters, 0),
      notes: raw.notes || 'مكتملة بالكامل بالمرحلة الأولى'
    });
  });

  // Phase 2 (id: 7..12)
  itemConfigs.forEach((cfg, idx) => {
    const raw = p2[idx] || {};
    const c = custom[idx] || {};
    const total = parseCleanNumber(raw.totalMeters, cfg.p2DefTotal);
    const today = (raw.todayMeters !== undefined && raw.todayMeters !== '') ? parseCleanNumber(raw.todayMeters, cfg.p2DefToday) : cfg.p2DefToday;
    const prev = Math.max(0, total - today);
    const target = parseCleanNumber(raw.dailyTarget, cfg.defTarget);
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
      readyLength: parseCleanNumber(c.readyToWorkMeters, 0),
      notes: raw.notes || 'منجز معتمد بالتقرير اليومي'
    });
  });

  return items;
}

export function updateRoadProgressItem(id, todayMeters, notes) {
  const rep = getStoredTwoPhaseReport();
  const numId = Number(id);
  const val = parseCleanNumber(todayMeters, 0);

  if (numId <= 6) {
    const idx = numId - 1;
    if (rep.phase1Items && rep.phase1Items[idx]) {
      const prevTotal = parseCleanNumber(rep.phase1Items[idx].totalMeters, 0);
      const oldToday = parseCleanNumber(rep.phase1Items[idx].todayMeters, 0);
      rep.phase1Items[idx].todayMeters = val.toLocaleString('en-US');
      rep.phase1Items[idx].totalMeters = (prevTotal - oldToday + val).toLocaleString('en-US');
      if (notes !== undefined) rep.phase1Items[idx].notes = notes;
    }
  } else {
    const idx = numId - 7;
    if (rep.phase2Items && rep.phase2Items[idx]) {
      const prevTotal = parseCleanNumber(rep.phase2Items[idx].totalMeters, 0);
      const oldToday = parseCleanNumber(rep.phase2Items[idx].todayMeters, 0);
      rep.phase2Items[idx].todayMeters = val.toLocaleString('en-US');
      rep.phase2Items[idx].totalMeters = (prevTotal - oldToday + val).toLocaleString('en-US');
      const target = parseCleanNumber(rep.phase2Items[idx].dailyTarget, 800);
      rep.phase2Items[idx].varianceMeters = (val - target).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (notes !== undefined) rep.phase2Items[idx].notes = notes;
    }
  }

  // Recalculate combined items
  if (Array.isArray(rep.phase1Items) && Array.isArray(rep.phase2Items)) {
    rep.combinedItems = rep.phase1Items.map((p1, i) => {
      const p2 = rep.phase2Items[i] || {};
      const c = (rep.combinedItems && rep.combinedItems[i]) || {};
      const t1 = parseCleanNumber(p1.todayMeters, 0);
      const t2 = parseCleanNumber(p2.todayMeters, 0);
      const tot1 = parseCleanNumber(p1.totalMeters, 0);
      const tot2 = parseCleanNumber(p2.totalMeters, 0);
      return {
        ...c,
        id: p1.id,
        category: p1.category,
        name: p1.name,
        shortName: p1.shortName,
        color: p1.color,
        todayMeters: (t1 + t2).toLocaleString('en-US'),
        totalMeters: (tot1 + tot2).toLocaleString('en-US')
      };
    });
  }

  saveStoredTwoPhaseReport(rep);
  return rep;
}

/**
 * Categorize a line item from Daily Road Report (تقرير أعمال الطريق اليومي)
 * into one of the 6 official Phase 2 items in Two-Phase Report (تقرير إنجاز المرحلتين):
 * 1: طبقة إعادة التدوير (FDR)
 * 2: رش طبقة التشريب (MCO)
 * 3: طبقة الاسفلت المحسن
 * 4: فرمة اولي بدون اسمنت(FDR)
 * 5: طبقة أساس حبيبي
 * 6: الطريق الخدمي
 */
export function categorizeRoadItemToPhase2(rawName) {
  if (!rawName) return null;
  const name = String(rawName).toLowerCase().trim();

  // 1. فرمة أولى بدون أسمنت (Item 4 in Phase 2)
  if (name.includes('بدون أسمنت') || name.includes('بدون اسمنت') || name.includes('فرمة أولى') || name.includes('فرمة اولي')) {
    return 4;
  }

  // 2. رش طبقة التشريب MCO (Item 2 in Phase 2) - check before base so "رش MCO على طبقة الأساس" matches MCO
  if (name.includes('mco') || name.includes('تشريب') || name.includes('ام سي او') || (name.includes('رش') && !name.includes('لصق'))) {
    return 2;
  }

  // 3. طبقة إعادة التدوير FDR بالأسمنت / فرمة ثانية (Item 1 in Phase 2)
  if (name.includes('fdr') || name.includes('إعادة التدوير') || name.includes('اعادة التدوير') || name.includes('فرمة ثانية') || name.includes('فرمة تانية') || name.includes('أسمنت') || name.includes('اسمنت') || name.includes('معالجه') || name.includes('معالجة')) {
    return 1;
  }

  // 4. طبقة الاسفلت المحسن (Item 3 in Phase 2)
  if (name.includes('اسفلت') || name.includes('أسفلت')) {
    return 3;
  }

  // 5. طبقة أساس حبيبي / تشغيل الأساس / تسليم الأساس (Item 5 in Phase 2)
  if (name.includes('أساس') || name.includes('اساس')) {
    return 5;
  }

  // 6. الطريق الخدمي (Item 6 in Phase 2)
  if (name.includes('خدمي') || name.includes('خدميه') || name.includes('خدمية')) {
    return 6;
  }

  return null;
}

/**
 * Extract aggregated daily meters from a Daily Road Report object
 */
export function extractDailyMetersFromRoadReport(roadReport) {
  const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const matchedRows = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  const items = Array.isArray(roadReport?.items) ? roadReport.items : [];
  items.forEach(row => {
    if (!row) return;
    const p2Id = categorizeRoadItemToPhase2(row.item);
    if (p2Id && result[p2Id] !== undefined) {
      const cleanLen = String(row.length || '')
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/,/g, '')
        .trim();
      const num = parseFloat(cleanLen);
      if (!isNaN(num) && num > 0) {
        result[p2Id] += num;
        matchedRows[p2Id].push({
          item: row.item,
          length: num,
          stations: (row.stationFrom && row.stationTo) ? `${row.stationFrom} إلى ${row.stationTo}` : ''
        });
      }
    }
  });

  return { dailyMeters: result, matchedRows };
}

/**
 * Synchronize / Feed Daily Road Report into Phase 2 of Two-Phase Progress Report automatically
 */
export function syncDailyRoadReportToTwoPhase(roadReport, currentUser) {
  if (!roadReport || typeof roadReport !== 'object') return null;
  if (typeof window === 'undefined') return null;

  try {
    const { dailyMeters, matchedRows } = extractDailyMetersFromRoadReport(roadReport);
    const hasAnyDailyWork = Object.values(dailyMeters).some(m => m > 0);

    const currentTwoPhase = getStoredTwoPhaseReport();
    if (!currentTwoPhase || !Array.isArray(currentTwoPhase.phase2Items)) return null;

    // 1. Update Phase 2 items
    const updatedPhase2Items = currentTwoPhase.phase2Items.map((item, idx) => {
      const id = item.id || (idx + 1);
      const todayFromRoad = dailyMeters[id] !== undefined ? dailyMeters[id] : 0;
      const todayM = todayFromRoad;

      const prevM = (item.previousMeters !== undefined && item.previousMeters !== '' && !isNaN(parseCleanNumber(item.previousMeters)))
        ? parseCleanNumber(item.previousMeters)
        : Math.max(0, (parseCleanNumber(item.totalMeters) || 0) - (parseCleanNumber(item.todayMeters) || 0));

      const newTotal = prevM + todayM;
      const target = parseCleanNumber(item.dailyTarget || 800);
      const variance = todayM - target;

      const detailList = matchedRows[id] || [];
      const noteDetail = detailList.length > 0
        ? `منجز يومي معتمد بتقرير أعمال الطريق: ${todayM.toLocaleString('en-US')} م.ط (${detailList.map(d => d.item).join(' + ')})`
        : (item.notes || 'منجز معتمد بالتقرير اليومي');

      return {
        ...item,
        previousMeters: prevM.toLocaleString('en-US'),
        todayMeters: todayM.toLocaleString('en-US'),
        totalMeters: newTotal.toLocaleString('en-US'),
        varianceMeters: variance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        notes: noteDetail
      };
    });

    // 2. Update Combined items
    const updatedCombinedItems = (currentTwoPhase.phase1Items || []).map((p1, idx) => {
      const p2 = updatedPhase2Items[idx] || {};
      const custom = currentTwoPhase.combinedItems?.[idx] || {};
      const todayP1 = parseCleanNumber(p1.todayMeters) || 0;
      const todayP2 = parseCleanNumber(p2.todayMeters) || 0;
      const totalP1 = parseCleanNumber(p1.totalMeters) || 0;
      const totalP2 = parseCleanNumber(p2.totalMeters) || 0;
      const combinedToday = todayP1 + todayP2;
      const combinedTotal = totalP1 + totalP2;

      return {
        ...custom,
        id: p1.id,
        category: p1.category,
        name: p1.name,
        shortName: p1.shortName,
        color: p1.color,
        todayMeters: combinedToday > 0 ? combinedToday.toLocaleString('en-US') : (todayP1 || todayP2 ? '0' : ''),
        totalMeters: combinedTotal > 0 ? combinedTotal.toLocaleString('en-US') : '',
        readyToWorkMeters: custom.readyToWorkMeters || '',
        notes: custom.notes || ''
      };
    });

    // 3. Recalculate construction pipeline ("الجاهز للعمل في البند")
    const totalsMap = {};
    (currentTwoPhase.phase1Items || []).forEach((p1, idx) => {
      const p2 = updatedPhase2Items[idx] || {};
      const t1 = parseCleanNumber(p1.totalMeters) || 0;
      const t2 = parseCleanNumber(p2.totalMeters) || 0;
      totalsMap[p1.name] = t1 + t2;
    });
    const pipeline = calculateReadyToWorkPipeline(totalsMap);

    const updatedCombinedWithPipeline = updatedCombinedItems.map(c => {
      if (c.id === 1) return { ...c, readyToWorkMeters: pipeline.fdrReady.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), notes: 'الجاهز للعمل بالبند (منفذ فرمة اولي وغير منفذ فرمة تانية)' };
      if (c.id === 2) return { ...c, readyToWorkMeters: pipeline.mcoReady.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), notes: 'الجاهز للعمل بالبند (منفذ اساس وغير مرشوش mc)' };
      if (c.id === 3) return { ...c, readyToWorkMeters: pipeline.asphaltReady.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), notes: 'الجاهز للعمل بالبند (مرشوش mc وغير منفذ اسفلت)' };
      if (c.id === 5) return { ...c, readyToWorkMeters: pipeline.baseReady.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), notes: 'الجاهز للعمل بالبند (منفذ فرمة ثانية وغير منفذ اساس)' };
      return c;
    });

    // 4. Recalculate Remaining quantities
    const p2Map = {};
    updatedPhase2Items.forEach(p2 => {
      p2Map[p2.name] = parseCleanNumber(p2.totalMeters) || 0;
    });
    const updatedRemaining = calculateRemainingItems(p2Map);

    // 5. Build enriched Two-Phase report
    const targetDate = roadReport.reportDate || roadReport.dateFormatted || currentTwoPhase.reportDate;
    const targetDay = roadReport.dayName || currentTwoPhase.dayName;
    const targetSlash = roadReport.formattedSlashDate || roadReport.dateFormatted || currentTwoPhase.dateFormatted;

    const enrichedTwoPhase = {
      ...currentTwoPhase,
      reportDate: targetDate,
      dateFormatted: targetSlash,
      date: targetDate ? new Date(targetDate).toISOString() : currentTwoPhase.date,
      dayName: targetDay,
      phase2Items: updatedPhase2Items,
      combinedItems: updatedCombinedWithPipeline,
      remainingItems: updatedRemaining,
      isTwoPhaseProgressReport: true,
      reportType: 'تقرير إنجاز المرحلتين',
      reportCategory: 'two_phase',
      status: 'approved',
      sourceRoadReportNumber: roadReport.reportNumber,
      sourceRoadReportDate: targetDate,
      notes: `تقرير إنجاز المرحلتين — تم تحديث وتغذية المرحلة الثانية تلقائياً من تقرير أعمال الطريق اليومي (${roadReport.reportNumber || targetDate})`,
      updatedAt: new Date().toISOString()
    };

    // 6. Authoritative save into local storage & IndexedDB
    saveStoredTwoPhaseReport(enrichedTwoPhase);

    // 7. Dispatch reactive events
    window.dispatchEvent(new CustomEvent('two-phase-updated', { detail: enrichedTwoPhase }));
    window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: enrichedTwoPhase }));
    window.dispatchEvent(new CustomEvent('report-updated', { detail: enrichedTwoPhase }));

    // 8. Push to backend in background
    try {
      fastFetch('/api/two-phase-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedTwoPhase)
      }).catch(() => {});
    } catch (_) {}

    return enrichedTwoPhase;
  } catch (err) {
    console.error('[twoPhaseSync] Error syncing daily road report to two phase:', err);
    return null;
  }
}

