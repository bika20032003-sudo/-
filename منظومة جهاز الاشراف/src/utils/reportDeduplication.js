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
  const isoMatch = str.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  const dmMatch = str.match(/(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/);
  if (dmMatch) {
    const d = dmMatch[1].padStart(2, '0');
    const m = dmMatch[2].padStart(2, '0');
    const y = dmMatch[3];
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

  // Daily operations (two-phase, fuel, road, targeted):
  // At most ONE official report per type, sector, and date
  if (['two_phase', 'fuel', 'road_daily', 'targeted'].includes(type) && date) {
    const secKey = (type === 'two_phase') ? 'both' : sector;
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
 * Deduplicate an array of reports.
 * Always retains the most recent, most complete, and approved version.
 */
export function deduplicateReportsList(reportsList) {
  if (!Array.isArray(reportsList)) return [];

  const map = new Map();

  reportsList.forEach(report => {
    if (!report || typeof report !== 'object') return;

    const compKey = getReportCompositeKey(report);
    const repNum = normalizeReportNumber(report.reportNumber);
    const numKey = repNum ? `num_${repNum}` : null;
    const repId = report.id ? `id_${String(report.id).toLowerCase().trim()}` : null;

    // Check if we already have this report under any of its keys
    let matchedKey = null;
    if (compKey && map.has(compKey)) {
      matchedKey = compKey;
    } else if (numKey && map.has(numKey)) {
      matchedKey = numKey;
    } else if (repId && map.has(repId)) {
      matchedKey = repId;
    }

    if (matchedKey) {
      const existing = map.get(matchedKey);
      
      const timeNew = new Date(report.updatedAt || report.createdAt || report.date || 0).getTime() || 0;
      const timeOld = new Date(existing.updatedAt || existing.createdAt || existing.date || 0).getTime() || 0;

      const scoreNew = (report.items?.length || 0) + 
        (report.combinedItems?.length || 0) + 
        (report.fuelItems?.length || 0) + 
        (report.targetedSections?.length || 0) + 
        (report.status === 'approved' ? 20 : 0) + 
        (report.reportNumber ? 5 : 0) + 
        (timeNew >= timeOld ? 50 : 0);

      const scoreOld = (existing.items?.length || 0) + 
        (existing.combinedItems?.length || 0) + 
        (existing.fuelItems?.length || 0) + 
        (existing.targetedSections?.length || 0) + 
        (existing.status === 'approved' ? 20 : 0) + 
        (existing.reportNumber ? 5 : 0);

      const winner = scoreNew >= scoreOld ? { ...existing, ...report } : { ...report, ...existing };

      map.set(matchedKey, winner);
      if (compKey) map.set(compKey, winner);
      if (numKey) map.set(numKey, winner);
      if (repId) map.set(repId, winner);
    } else {
      if (compKey) map.set(compKey, report);
      if (numKey) map.set(numKey, report);
      if (repId) map.set(repId, report);
    }
  });

  const uniqueReports = Array.from(new Set(map.values()));

  // Sort descending by date
  uniqueReports.sort((a, b) => {
    const da = normalizeReportDate(a);
    const db = normalizeReportDate(b);
    if (da && db && da !== db) return db.localeCompare(da);
    const ta = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime() || 0;
    const tb = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime() || 0;
    return tb - ta;
  });

  return uniqueReports;
}

/**
 * Sanitizes and deduplicates localStorage['local_reports'] in place.
 * Also pulls in any section-specific report data (two_phase, road, fuel, targeted)
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
    const sectionKeys = ['two_phase_report_data', 'road_daily_report_data', 'fuel_daily_report_data', 'targeted_works_report_data'];
    sectionKeys.forEach(secKey => {
      try {
        const secRaw = localStorage.getItem(secKey);
        if (secRaw) {
          const secObj = JSON.parse(secRaw);
          if (secObj && (secObj.id || secObj.reportNumber)) {
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

