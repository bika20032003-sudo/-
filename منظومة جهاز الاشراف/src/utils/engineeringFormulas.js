/**
 * Standard Engineering & Quantity Surveying Calculation Formulas
 * Extracted directly from certified project Excel sheets:
 * "مشروع صيانة وتطوير طريق أوباري - غات (360 كم)" - 29/10/2026
 */

import { toCleanLatinDigits } from './forceLatinDigits.js';

// Parse clean number
export const parseCleanNumber = (val, defaultVal = 0) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  const cleaned = String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[٬،]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? defaultVal : num;
};

// =========================================================================
// 1. EXECUTIVE PROGRESS REPORT FORMULAS (الموقف التنفيذي)
// =========================================================================

/**
 * Calculate line item values for Executive Progress Report
 * - Remaining = Contract - Executed
 * - Executed Value = Executed Quantity * Unit Rate (الفئة)
 * - Percentage = (Executed Quantity / Contract Quantity) * 100
 */
export const calculateExecutiveItem = (contractQuantity, executedQuantity, unitRate) => {
  const cQ = parseCleanNumber(contractQuantity, 0);
  const eQ = parseCleanNumber(executedQuantity, 0);
  const rate = parseCleanNumber(unitRate, 0);

  const remaining = Math.max(0, cQ - eQ);
  const executedVal = eQ * rate;
  const percentage = cQ > 0 ? (eQ / cQ) * 100 : 0;

  return {
    contractQuantity: cQ,
    executedQuantity: eQ,
    unitRate: rate,
    remainingQuantity: parseFloat(remaining.toFixed(2)),
    executedValue: parseFloat(executedVal.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2))
  };
};

/**
 * Calculate grand totals for Executive Progress Report
 */
export const calculateExecutiveTotals = (contractValRaw, basicItems = [], additionalItems = []) => {
  const contractVal = parseCleanNumber(contractValRaw, 897665675.03);

  const basicExecutedSum = basicItems.reduce((acc, it) => {
    const val = it.executedValue !== undefined && it.executedValue !== '' 
      ? parseCleanNumber(it.executedValue) 
      : (parseCleanNumber(it.executedQuantity) * parseCleanNumber(it.unitRate));
    return acc + val;
  }, 0);

  const additionalExecutedSum = additionalItems.reduce((acc, it) => {
    const val = it.executedValue !== undefined && it.executedValue !== '' 
      ? parseCleanNumber(it.executedValue) 
      : (parseCleanNumber(it.executedQuantity) * parseCleanNumber(it.unitRate));
    return acc + val;
  }, 0);

  const grandExecutedSum = basicExecutedSum + additionalExecutedSum;
  const grandRemainingVal = Math.max(0, contractVal - grandExecutedSum);

  const basicPercentage = contractVal > 0 ? (basicExecutedSum / contractVal) * 100 : 0;
  const overallFinancialPercentage = contractVal > 0 ? (grandExecutedSum / contractVal) * 100 : 0;

  return {
    contractVal,
    basicExecutedSum: parseFloat(basicExecutedSum.toFixed(2)),
    additionalExecutedSum: parseFloat(additionalExecutedSum.toFixed(2)),
    grandExecutedSum: parseFloat(grandExecutedSum.toFixed(2)),
    grandRemainingVal: parseFloat(grandRemainingVal.toFixed(2)),
    basicPercentage: parseFloat(basicPercentage.toFixed(2)),
    overallFinancialPercentage: parseFloat(overallFinancialPercentage.toFixed(2))
  };
};

// =========================================================================
// 2. TWO-PHASE ROAD PROGRESS FORMULAS (تقرير إنجاز المرحلتين)
// =========================================================================

export const PHASE_TARGETS = {
  phase1: 226083, // Phase 1 Target Length in meters
  phase2: 133787, // Phase 2 Target Length in meters
  totalRoad: 360000 // Total Road Length: 360 km
};

/**
 * Calculate Phase row values
 * - Total Meters = Previous Meters + Today Meters
 * - Variance Meters = Today Meters - Daily Target
 */
export const calculatePhaseRow = (previousMeters, todayMeters, dailyTarget = 800) => {
  const prev = parseCleanNumber(previousMeters, 0);
  const today = parseCleanNumber(todayMeters, 0);
  const target = parseCleanNumber(dailyTarget, 800);

  const total = prev + today;
  const variance = today - target;

  return {
    previousMeters: prev,
    todayMeters: today,
    dailyTarget: target,
    totalMeters: total,
    varianceMeters: parseFloat(variance.toFixed(2))
  };
};

/**
 * Calculate the Engineering Construction Pipeline ("الجاهز للعمل في البند"):
 * 1. Ready for FDR 2nd pass = Form 1st pass - FDR 2nd pass
 * 2. Ready for Base = FDR 2nd pass - Aggregate Base
 * 3. Ready for MCO = Aggregate Base - MCO Spray
 * 4. Ready for Asphalt = MCO Spray - Asphalt Layer
 */
export const calculateReadyToWorkPipeline = (combinedTotals = {}) => {
  const form1 = parseCleanNumber(combinedTotals['فرمة اولي بدون اسمنت(FDR)'] || combinedTotals['فرم أولى'] || 245403, 0);
  const fdr = parseCleanNumber(combinedTotals['طبقة إعادة التدوير (FDR)'] || combinedTotals['إعادة تدوير'] || 245383, 0);
  const base = parseCleanNumber(combinedTotals['طبقة أساس حبيبي'] || combinedTotals['أساس حبيبي'] || 238713, 0);
  const mco = parseCleanNumber(combinedTotals['رش طبقة التشريب (MCO)'] || combinedTotals['رش تشريب'] || 238603, 0);
  const asphalt = parseCleanNumber(combinedTotals['طبقة الاسفلت المحسن'] || combinedTotals['اسفلت محسن'] || 236373, 0);

  return {
    fdrReady: Math.max(0, form1 - fdr), // منفذ فرمة أولى وغير منفذ فرمة ثانية
    baseReady: Math.max(0, fdr - base), // منفذ فرمة ثانية وغير منفذ أساس
    mcoReady: Math.max(0, base - mco), // منفذ أساس وغير مرشوش MC
    asphaltReady: Math.max(0, mco - asphalt) // مرشوش MC وغير منفذ أسفلت
  };
};

/**
 * Calculate Remaining Quantities for both phases:
 * - Phase 1 remaining = 130 meters (جزء العبارة المنهارة)
 * - Phase 2 remaining = Phase 2 Target (133,787) - Phase 2 Executed
 * - Total remaining = Phase 1 remaining + Phase 2 remaining
 */
export const calculateRemainingItems = (phase2ItemsMap = {}) => {
  const p1CollapsedCulvert = 130; // 130 meters remaining in Phase 1 at the collapsed culvert
  const p2Target = PHASE_TARGETS.phase2; // 133,787m

  const calcRemaining = (p2Executed) => {
    const executed = parseCleanNumber(p2Executed, 0);
    const p2Rem = Math.max(0, p2Target - executed);
    const totalRem = p1CollapsedCulvert + p2Rem;
    return {
      phase1: p1CollapsedCulvert.toFixed(2),
      phase2: p2Rem.toFixed(2),
      total: totalRem.toFixed(2)
    };
  };

  const form1Rem = calcRemaining(phase2ItemsMap['فرمة اولي بدون اسمنت(FDR)'] || 19320);
  const fdrRem = calcRemaining(phase2ItemsMap['طبقة إعادة التدوير (FDR)'] || 19300);
  const baseRem = calcRemaining(phase2ItemsMap['طبقة أساس حبيبي'] || 12630);
  const mcoRem = calcRemaining(phase2ItemsMap['رش طبقة التشريب (MCO)'] || 12520);
  const asphRem = calcRemaining(phase2ItemsMap['طبقة الاسفلت المحسن'] || 10290);

  return [
    { id: 1, group: 'A', name: 'المتبقي من الفرمة الأولى', ...form1Rem, notes: 'جزء العبارة المنهارة' },
    { id: 2, group: 'A', name: 'المتبقي من الفرمة الثانية', ...fdrRem, notes: 'جزء العبارة المنهارة' },
    { id: 3, group: 'A', name: 'المتبقي من الأساس', ...baseRem, notes: '' },
    { id: 4, group: 'B', name: 'المتبقي من طبقة التشريب', ...mcoRem, notes: '' },
    { id: 5, group: 'B', name: 'المتبقي من الاسفلت', ...asphRem, notes: '' },
    { id: 6, group: 'B', name: 'طول الطريق الخدمي العامل', phase1: '', phase2: '', total: '9030.00', notes: 'كيلومتر' },
  ];
};

// =========================================================================
// 3. STATION QUANTITIES FORMULAS (حساب محطات طبقات الرصف)
// =========================================================================

/**
 * Calculate station segment area and volume:
 * - Length = Math.abs(to - from)
 * - Area (m2) = Length * Width
 * - Volume (m3) = Area * (Thickness in cm / 100)
 */
export const calculateStationSegment = (from, to, width = 9, thicknessCm = 12.5) => {
  const f = parseCleanNumber(from, 0);
  const t = parseCleanNumber(to, 0);
  const w = parseCleanNumber(width, 9);
  const h = parseCleanNumber(thicknessCm, 12.5);

  const length = Math.abs(t - f);
  const area = length * w;
  const volume = area * (h / 100);

  return {
    stationFrom: f,
    stationTo: t,
    length: parseFloat(length.toFixed(2)),
    width: parseFloat(w.toFixed(2)),
    area: parseFloat(area.toFixed(2)),
    thicknessCm: h,
    volume: parseFloat(volume.toFixed(4))
  };
};

// =========================================================================
// 4. CERTIFIED PROJECT RATES & BASELINES (29/10/2026)
// =========================================================================

export const CERTIFIED_RATES = {
  study_design: 17601287.75, // مقطوعية
  fdr: 119.44, // م2
  mco: 13.73, // م2
  asphalt: 145.35, // م2
  guide_signs: 1783.99, // عدد
  ground_reflectors: 135.04, // عدد
  guard_rail: 1205.23, // م.ط
  paint_surface: 23.07, // م.ط
  paint_yellow_line: 23.07, // م.ط
  paint_white_broken: 23.07, // م.ط
  paint_white_continuous: 23.07, // م.ط
  base_course_m3: 299.52, // م3
  service_road_km: 59500.00 // كم
};

export const CERTIFIED_PROJECT_META = {
  contractValue: 897665675.030,
  reportDate: '2026-10-29',
  reportNumber: '093436_29.10.2026',
  projectName: 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
  currency: 'دينار'
};


/**
 * Convert any station format to meters:
 * '241+200' -> 241200
 * '-00+640' -> -640
 * '241.200' (km) -> 241200
 * '1200' (meters) -> 1200
 */
export const parseStationToMeters = (stationVal) => {
  if (stationVal === null || stationVal === undefined) return null;
  const rawStr = toCleanLatinDigits(String(stationVal)).trim();
  if (!rawStr) return null;

  if (rawStr.includes('+')) {
    const isNeg = rawStr.startsWith('-');
    const parts = rawStr.replace(/^-/, '').split('+');
    const km = parseFloat(parts[0].replace(/[^\d.]/g, '')) || 0;
    const m = parseFloat(parts[1]?.replace(/[^\d.]/g, '')) || 0;
    const total = (km * 1000) + m;
    return isNeg ? -total : total;
  }

  const clean = rawStr.replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return null;

  if (rawStr.includes('.') && Math.abs(num) < 1000) {
    return num * 1000;
  }

  return num;
};

export const calculateStationLength = (stationFrom, stationTo) => {
  const fromM = parseStationToMeters(stationFrom);
  const toM = parseStationToMeters(stationTo);

  if (fromM === null || toM === null) return null;
  const diff = Math.abs(toM - fromM);
  return parseFloat(diff.toFixed(2));
};

export const calculateDefaultArea = (itemTitle, length, customWidth = null) => {
  const l = parseFloat(length);
  if (isNaN(l) || l <= 0) return '';
  const title = (itemTitle || '').toLowerCase();

  let w = 9.4;
  if (customWidth !== null && customWidth !== undefined && customWidth !== '') {
    const cw = parseFloat(customWidth);
    if (!isNaN(cw) && cw > 0) w = cw;
  } else if (title.includes('اسفلت') || title.includes('أسفلت')) {
    w = 9.0;
  } else if (title.includes('خدمي') || title.includes('خدمه')) {
    return '';
  }
  return (l * w).toFixed(2);
};

export const calculateRowDimensions = (stationFrom, stationTo, widthVal = null, itemTitle = '') => {
  const length = calculateStationLength(stationFrom, stationTo);
  const title = (itemTitle || '').toLowerCase();
  
  let width = widthVal !== null && widthVal !== undefined && widthVal !== '' 
    ? parseFloat(widthVal) 
    : (title.includes('اسفلت') || title.includes('أسفلت') ? 9.0 : 9.4);
  
  if (isNaN(width) || width <= 0) {
    width = title.includes('اسفلت') || title.includes('أسفلت') ? 9.0 : 9.4;
  }

  let area = '';
  if (length !== null && length > 0) {
    if (!title.includes('خدمي') && !title.includes('خدمه')) {
      area = (length * width).toFixed(2);
    }
  }

  return {
    length: length !== null ? length.toFixed(2) : '',
    width: width ? width.toFixed(2) : '',
    area: area
  };
};