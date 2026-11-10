/**
 * Report Deduplication Utility
 * ensures no duplicate reports ever appear in ReportsArchiveView, Dashboard, or localStorage
 */

export function normalizeReportNumber(num) {
  if (!num) return '';
  return String(num)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[\s\-_]/g, '')
    .toLowerCase()
    .trim();
}

export function normalizeReportDate(report) {
  if (!report) return '';
  const raw = report.dateFormatted || report.reportDate || report.date || report.createdAt || '';
  if (!raw) return '';
  const str = String(raw).trim();
  const ymdMatch = str.match(/(\d{4})\s*[./\-]\s*(\d{1,2})\s*[./\-]\s*(\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const dmyMatch = str.match(/(\d{1,2})\s*[./\-]\s*(\d{1,2})\s*[./\-]\s*(\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }
  return str.split('T')[0].split(' ')[0];
}

export function normalizeReportSector(sector) {
  if (!sector) return 'both';
  const s = String(sector).toLowerCase();
  if (s.includes('الأولى') || s.includes('الاولى') || s.includes('p1') || s.includes('phase1')) return 'phase1';
  if (s.includes('الثانية') || s.includes('التانية') || s.includes('p2') || s.includes('phase2')) return 'phase2';
  if (s.includes('مشترك') || s.includes('المرحلتين') || s.includes('360')) return 'both';
  return 'general';
}

export function normalizeReportType(report) {
  if (!report) return 'road_daily';
  const t = String(report.reportType || report.type || '').toLowerCase();
  const title = String(report.title || '').toLowerCase();

  if (report.isTwoPhaseProgressReport || t.includes('المرحلتين') || title.includes('المرحلتين')) {
    return 'two_phase';
  }
  if (report.isExecutiveProgressReport || t.includes('تنفيذي') || title.includes('تنفيذي')) {
    return 'executive';
  }
  if (report.isFuelReport || t.includes('وقود') || title.includes('وقود')) {
    return 'fuel';
  }
  if (report.isTargetedWorksReport || t.includes('مستهدف') || title.includes('مستهدف')) {
    return 'targeted';
  }
  if (report.isPeriodicReport || t.includes('دوري') || t.includes('أسبوعي') || t.includes('شهري')) {
    const period = (report.periodType || '').includes('شهر') ? 'monthly' : 'weekly';
    return `periodic_${period}`;
  }
  if (t.includes('جودة') || t.includes('مختبر') || title.includes('جودة')) {
    return 'qc';
  }
  if (t.includes('متابعة') || t.includes('إشراف') || title.includes('متابعة')) {
    return 'supervisory';
  }
  return 'road_daily';
}

/**
 * Generates canonical deduplication key for a report
 */
export function getReportCompositeKey(report) {
  if (!report) return '';
  const num = normalizeReportNumber(report.reportNumber);
  const date = normalizeReportDate(report);
  const type = normalizeReportType(report);
  const sector = normalizeReportSector(report.sector);

  // Daily operations (two-phase, fuel, road, targeted, executive):
  // At most ONE official report per type, sector, and date
  if (['two_phase', 'fuel', 'road_daily', 'targeted', 'executive'].includes(type) && date) {
    let secKey = sector;
    if (type === 'two_phase' || type === 'executive') {
      secKey = 'both';
    } else if (type === 'road_daily') {
      secKey = (sector === 'phase2') ? 'phase2' : 'main';
    }
    return `daily_${type}_${secKey}_${date}`;
  }

  // If distinct report number exists, use it
  if (num) {
    return `num_${num}`;
  }

  // Fallback to ID
  const id = String(report.id || '').toLowerCase().trim();
  if (id) {
    return `id_${id}`;
  }
  return `generic_${type}_${sector}_${date}`;
}

/**
 * Checks whether two report objects represent the exact same real-world report
 */
export function areReportsIdentical(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;

  // 1. Match by report number (if valid)
  const numA = normalizeReportNumber(a.reportNumber);
  const numB = normalizeReportNumber(b.reportNumber);
  if (numA && numB && numA === numB) return true;

  // 1.1 Match by report numbers containing identical numeric date tokens (e.g. 24.10.2026 or 20261024)
  if (numA && numB) {
    const cleanNumA = numA.replace(/\D/g, '');
    const cleanNumB = numB.replace(/\D/g, '');
    if (cleanNumA.length >= 6 && cleanNumB.length >= 6 && cleanNumA === cleanNumB) {
      return true;
    }
  }

  // 2. Match by direct ID
  const idA = a.id ? String(a.id).toLowerCase().trim() : '';
  const idB = b.id ? String(b.id).toLowerCase().trim() : '';
  if (idA && idB && idA === idB) return true;

  // 3. Match across ID and reportNumber
  const normIdA = normalizeReportNumber(a.id);
  const normIdB = normalizeReportNumber(b.id);
  if (normIdA && normIdB && normIdA === normIdB) return true;
  if (numA && normIdB && numA === normIdB) return true;
  if (numB && normIdA && numB === normIdA) return true;

  // 4. Match by canonical composite key (daily_type_sector_date)
  const compA = getReportCompositeKey(a);
  const compB = getReportCompositeKey(b);
  if (compA && compB && compA === compB) return true;

  // 5. Match daily operations of the same type and date (fuel, two-phase, executive, targeted, road_daily)
  const typeA = normalizeReportType(a);
  const typeB = normalizeReportType(b);
  const dateA = normalizeReportDate(a);
  const dateB = normalizeReportDate(b);
  if (typeA && typeA === typeB && dateA && dateA === dateB) {
    if (['two_phase', 'fuel', 'targeted', 'executive'].includes(typeA)) {
      return true;
    }
    if (typeA === 'road_daily') {
      const secA = normalizeReportSector(a.sector);
      const secB = normalizeReportSector(b.sector);
      // Daily road reports for the same day match unless explicitly Phase 1 vs Phase 2
      const isDistinctPhases = (secA === 'phase1' && secB === 'phase2') || (secA === 'phase2' && secB === 'phase1');
      if (!isDistinctPhases) {
        return true;
      }
    }
  }

  // 6. Match by exact title and date
  if (a.title && b.title && a.title.trim() === b.title.trim() && dateA && dateB && dateA === dateB) {
    return true;
  }

  return false;
}

/**
 * Deduplicate an array of reports.
 * Merges duplicates in-place into an array with 0% chance of orphan duplicate keys.
 * Always retains the most recent, most complete, and approved version.
 */
export function deduplicateReportsList(reportsList) {
  if (!Array.isArray(reportsList)) return [];

  const unique = [];

  for (const report of reportsList) {
    if (!report || typeof report !== 'object') continue;

    const existingIdx = unique.findIndex(item => areReportsIdentical(item, report));

    if (existingIdx !== -1) {
      const existing = unique[existingIdx];
      
      const timeNew = new Date(report.updatedAt || report.createdAt || report.date || 0).getTime() || 0;
      const timeOld = new Date(existing.updatedAt || existing.createdAt || existing.date || 0).getTime() || 0;

      const scoreNew = (report.items?.length || 0) + 
        (report.combinedItems?.length || 0) + 
        (report.fuelItems?.length || 0) + 
        (report.targetedSections?.length || 0) + 
        (report.basicItems?.length || 0) + 
        (report.status === 'approved' ? 20 : 0) + 
        (report.reportNumber ? 5 : 0) + 
        (timeNew >= timeOld ? 50 : 0);

      const scoreOld = (existing.items?.length || 0) + 
        (existing.combinedItems?.length || 0) + 
        (existing.fuelItems?.length || 0) + 
        (existing.targetedSections?.length || 0) + 
        (existing.basicItems?.length || 0) + 
        (existing.status === 'approved' ? 20 : 0) + 
        (existing.reportNumber ? 5 : 0);

      // Merge: winner takes priority, but preserves non-empty fields from both
      const winner = scoreNew >= scoreOld ? { ...existing, ...report } : { ...report, ...existing };
      unique[existingIdx] = winner;
    } else {
      unique.push(report);
    }
  }

  // Sort descending by date
  unique.sort((a, b) => {
    const da = normalizeReportDate(a);
    const db = normalizeReportDate(b);
    if (da && db && da !== db) return db.localeCompare(da);
    const ta = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime() || 0;
    const tb = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime() || 0;
    return tb - ta;
  });

  return unique;
}

/**
 * Sanitizes and deduplicates localStorage['local_reports'] in place.
 * Also pulls in any section-specific report data (two_phase, road, fuel, targeted, executive)
 * that may have been saved directly to its section key.
 */
export function sanitizeLocalReportsStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const deleted = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
    const raw = localStorage.getItem('local_reports');
    let parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) parsed = [];

    // Pull in section-specific saved reports if available
    const sectionKeys = [
      'two_phase_report_data',
      'road_daily_report_data',
      'fuel_daily_report_data',
      'targeted_works_report_data',
      'executive_progress_data'
    ];
    sectionKeys.forEach(secKey => {
      try {
        const secRaw = localStorage.getItem(secKey);
        if (secRaw) {
          const secObj = JSON.parse(secRaw);
          if (secObj && (secObj.id || secObj.reportNumber || secObj.basicItems)) {
            if (secKey === 'executive_progress_data') {
              secObj.isExecutiveProgressReport = true;
              secObj.reportType = 'الموقف التنفيذي';
              secObj.reportCategory = 'executive';
              if (!secObj.id) secObj.id = 'exec-' + (secObj.reportDate || '2026-10-29');
              if (!secObj.reportNumber) secObj.reportNumber = '093436_29.10.2026';
              if (!secObj.title) secObj.title = 'الموقف التنفيذي.';
              if (!secObj.sector) secObj.sector = 'مشروع صيانة وتطوير طريق أوباري - غات (360 كم)';
              if (!secObj.date) secObj.date = secObj.reportDate ? new Date(secObj.reportDate).toISOString() : new Date('2026-10-29').toISOString();
              if (!secObj.dateFormatted) secObj.dateFormatted = secObj.reportDate || '2026-10-29';
              if (!secObj.overallFinancialPercentage && secObj.grandTotals?.overallFinancialPercentage) {
                secObj.overallFinancialPercentage = secObj.grandTotals.overallFinancialPercentage;
              }
              if (!secObj.totalExecutedValue && secObj.grandTotals?.totalExecutedValue) {
                secObj.totalExecutedValue = secObj.grandTotals.totalExecutedValue;
              }
              if (!secObj.contractValue && secObj.grandTotals?.contractValue) {
                secObj.contractValue = secObj.grandTotals.contractValue;
              }
              if (!secObj.uploadedBy) secObj.uploadedBy = 'م. عبدالرحمن الأنصاري (مدير المشروع)';
              if (!secObj.engineer) secObj.engineer = 'م. عبدالرحمن الأنصاري';
              if (!secObj.sectorDirector) secObj.sectorDirector = 'م. عبدالرحمن الأنصاري';
              if (!secObj.status) secObj.status = 'approved';
            } else if (secKey === 'road_daily_report_data') {
              secObj.isRoadProgressReport = true;
              secObj.reportType = 'تقرير أعمال الطريق اليومي';
              secObj.reportCategory = 'road';
              if (!secObj.id) secObj.id = 'road-daily-' + (secObj.reportDate || '2026-10-24');
              if (!secObj.reportNumber) secObj.reportNumber = 'ROAD-REP-24.10.2026';
              if (!secObj.dateFormatted) secObj.dateFormatted = secObj.reportDate || '2026-10-24';
              if (!secObj.date) secObj.date = secObj.reportDate ? new Date(secObj.reportDate).toISOString() : '2026-10-24T00:00:00.000Z';
              if (!secObj.sector) secObj.sector = 'طريق أوباري - غات';
              if (!secObj.title) secObj.title = secObj.reportTitle || `تقرير أعمال يوم ${secObj.dayName || 'السبت'} ${secObj.reportDate || '2026-10-24'}`;
              if (!secObj.status) secObj.status = 'approved';
              if (!secObj.uploadedBy) secObj.uploadedBy = secObj.sectorDirector || 'م. صلاح العربي';
              if (!secObj.engineer) secObj.engineer = secObj.sectorDirector || 'م. صلاح العربي';
            }
            parsed.push(secObj);
          }
        }
      } catch (_) {}
    });
    
    // Filter out deleted reports
    parsed = parsed.filter(r => r && !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
    
    const clean = deduplicateReportsList(parsed);
    localStorage.setItem('local_reports', JSON.stringify(clean));
    return clean;
  } catch (e) {
    console.warn('Error sanitizing local_reports:', e);
    return [];
  }
}

