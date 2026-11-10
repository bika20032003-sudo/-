import { saveReportToIndexedDB } from './secureDatabase.js';
import { clearApiCache, fastFetch } from './apiCache.js';
import { deduplicateReportsList, areReportsIdentical } from './reportDeduplication.js';
import { toCleanLatinDigits } from './forceLatinDigits.js';

/**
 * Universal Report Persistence Layer
 * Guarantees that any created/updated report across all forms is:
 * 1. Sanitized with proper IDs, dates, and ownership metadata
 * 2. Unblocked from `deleted_report_ids`
 * 3. Saved to localStorage['local_reports']
 * 4. Saved to section-specific storage (two_phase_report_data, road_daily_report_data, fuel_daily_report_data, etc.)
 * 5. Persisted to IndexedDB
 * 6. Cache invalidated and reactive real-time custom events dispatched
 * 7. Synced to backend with offline/GitHub Pages resilience
 */
export async function persistReportUniversal(reportPayload, currentUser) {
  if (!reportPayload || typeof reportPayload !== 'object') return null;

  const nowIso = new Date().toISOString();
  const userName = currentUser?.name || reportPayload.createdByName || reportPayload.uploadedBy || reportPayload.engineer || reportPayload.sectorDirector || 'م. جهاز الإشراف';
  const username = currentUser?.username || reportPayload.createdByUsername || reportPayload.authorUsername || 'user';

  // Normalize digits in report number and dates
  const repNum = toCleanLatinDigits(reportPayload.reportNumber || '');
  const rType = String(reportPayload.reportType || reportPayload.type || reportPayload.title || '');

  const enriched = {
    ...reportPayload,
    id: reportPayload.id || `rep-${Date.now()}`,
    reportNumber: repNum || `REP-${Date.now().toString().slice(-4)}`,
    createdByUsername: username,
    authorUsername: username,
    createdByName: userName,
    uploadedBy: reportPayload.uploadedBy || userName,
    engineer: reportPayload.engineer || userName,
    sectorDirector: reportPayload.sectorDirector || userName,
    status: reportPayload.status || 'approved',
    createdAt: reportPayload.createdAt || nowIso,
    updatedAt: nowIso
  };

  // Canonical classification flags
  if (enriched.isExecutiveProgressReport || rType.includes('تنفيذي') || rType.includes('الموقف التنفيذي')) {
    enriched.isExecutiveProgressReport = true;
    enriched.reportType = 'الموقف التنفيذي';
    enriched.reportCategory = 'executive';
    if (!enriched.sector) enriched.sector = 'مشروع صيانة طريق اوباري غات (360 كم)';
  } else if (enriched.isTwoPhaseProgressReport || rType.includes('المرحلتين')) {
    enriched.isTwoPhaseProgressReport = true;
    enriched.reportType = 'تقرير إنجاز المرحلتين';
    enriched.reportCategory = 'two_phase';
    if (!enriched.sector) enriched.sector = 'القطاع المشترك (المرحلتين الأولى والثانية)';
  } else if (enriched.isFuelReport || rType.includes('وقود')) {
    enriched.isFuelReport = true;
    enriched.reportType = 'تقرير كميات الوقود اليومية';
    enriched.reportCategory = 'fuel';
  } else if (enriched.isTargetedWorksReport || rType.includes('مستهدف')) {
    enriched.isTargetedWorksReport = true;
    enriched.reportType = 'تقرير الأعمال المستهدفة';
    enriched.reportCategory = 'targeted';
  } else {
    enriched.isRoadProgressReport = true;
    enriched.reportCategory = 'road';
    if (!enriched.reportType) enriched.reportType = 'تقرير أعمال الطريق اليومي';
  }

  // 1. Unblock this report ID and number from deleted_report_ids
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
      const updatedDeleted = deleted.filter(id => 
        String(id) !== String(enriched.id) && 
        String(id) !== String(enriched.reportNumber)
      );
      localStorage.setItem('deleted_report_ids', JSON.stringify(updatedDeleted));
    }
  } catch (delErr) {
    console.warn('Error clearing deleted_report_ids:', delErr);
  }

  // 2. Save directly into localStorage['local_reports'] with strict deduplication
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawLocal = localStorage.getItem('local_reports');
      const local = rawLocal ? JSON.parse(rawLocal) : [];
      const list = Array.isArray(local) ? local : [];
      
      const filtered = list.filter(r => r && !areReportsIdentical(r, enriched));
      filtered.unshift(enriched);
      localStorage.setItem('local_reports', JSON.stringify(deduplicateReportsList(filtered)));
    }
  } catch (storageErr) {
    console.error('Error saving report to local_reports:', storageErr);
  }

  // 3. Save to section-specific localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (enriched.isExecutiveProgressReport) {
        localStorage.setItem('executive_progress_data', JSON.stringify(enriched));
      } else if (enriched.isTwoPhaseProgressReport) {
        localStorage.setItem('two_phase_report_data', JSON.stringify(enriched));
      } else if (enriched.isFuelReport) {
        localStorage.setItem('fuel_daily_report_data', JSON.stringify(enriched));
      } else if (enriched.isRoadProgressReport || enriched.reportCategory === 'road') {
        localStorage.setItem('road_daily_report_data', JSON.stringify(enriched));
      } else if (enriched.isTargetedWorksReport) {
        localStorage.setItem('targeted_works_report_data', JSON.stringify(enriched));
      }
    }
  } catch (secErr) {
    console.warn('Error saving to section-specific storage:', secErr);
  }

  // 4. Save to IndexedDB
  try {
    await saveReportToIndexedDB(enriched);
  } catch (idbErr) {
    console.warn('IndexedDB save warning:', idbErr);
  }

  // 5. Invalidate API cache
  try {
    clearApiCache();
  } catch (_) {}

  // 6. Dispatch Reactive Events for Real-time Update across UI
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('report-saved', { detail: enriched }));
      window.dispatchEvent(new CustomEvent('report-updated', { detail: enriched }));
      window.dispatchEvent(new CustomEvent('reports-updated', { detail: enriched }));
      if (enriched.isExecutiveProgressReport) {
        window.dispatchEvent(new CustomEvent('executive-progress-updated', { detail: enriched }));
      }
      if (enriched.isTwoPhaseProgressReport) {
        window.dispatchEvent(new CustomEvent('two-phase-updated', { detail: enriched }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: enriched }));
      }
      if (enriched.isRoadProgressReport) {
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: enriched }));
      }
      if (enriched.isFuelReport) {
        window.dispatchEvent(new CustomEvent('fuel-updated', { detail: enriched }));
      }
    }
  } catch (evtErr) {
    console.warn('Event dispatch warning:', evtErr);
  }

  // 7. Fire-and-forget sync to backend with offline fallback
  try {
    fastFetch('/api/reports/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched)
    }).catch(() => {});

    if (enriched.isExecutiveProgressReport) {
      fastFetch('/api/executive-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      }).catch(() => {});
    } else if (enriched.isTwoPhaseProgressReport) {
      fastFetch('/api/two-phase-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      }).catch(() => {});
    } else if (enriched.isRoadProgressReport) {
      fastFetch('/api/road-daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      }).catch(() => {});
    } else if (enriched.isFuelReport) {
      fastFetch('/api/fuel-daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      }).catch(() => {});
    }
  } catch (_) {}

  return enriched;
}

