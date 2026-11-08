/**
 * ==============================================================================
 * Real-time Cross-Device Cloud Sync Engine (محرك المزامنة السحابية اللحظية)
 * منظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 * ==============================================================================
 * 
 * Provides:
 * 1. Background Smart Polling (every 12 seconds when active).
 * 2. Instant wakeup on Tab Focus / Phone Unlock.
 * 3. Offline Resilience with Outgoing Mutation Queue (auto-syncs on reconnection).
 * 4. Reactive Event Dispatching to all UI components (Dashboard, Reports, Fuel, Road).
 */

import { clearApiCache, fastFetch } from './apiCache.js';
import { saveReportToIndexedDB } from './secureDatabase.js';

let syncTimer = null;
let isSyncing = false;
let isInitialized = false;

// 1. Check for server-side updates
export async function checkServerUpdates(force = false) {
  if (isSyncing) return;
  if (typeof window === 'undefined' || !navigator.onLine) return;

  isSyncing = true;
  try {
    const res = await fetch('/api/sync/timestamp', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    if (!res || !res.ok) {
      isSyncing = false;
      return;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      isSyncing = false;
      return;
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.success) {
      isSyncing = false;
      return;
    }

    const serverTimestamp = data.lastUpdated;
    const localTimestamp = localStorage.getItem('last_server_sync_timestamp');

    // If server has newer data, or forced sync
    if (force || !localTimestamp || serverTimestamp !== localTimestamp) {
      console.log('[RealtimeSync] New server state detected. Syncing to local device...', serverTimestamp);
      
      // Clear client API cache
      clearApiCache();

      // Pull fresh data in parallel
      const [reportsRes, twoPhaseRes, messagesRes, roadDailyRes, fuelDailyRes] = await Promise.allSettled([
        fetch('/api/reports', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch('/api/two-phase-report', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch('/api/messages', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch('/api/road-daily-report', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch('/api/fuel-daily-report', { cache: 'no-store' }).then(r => r.json()).catch(() => null)
      ]);

      // Update Reports in Local Storage & IndexedDB
      if (reportsRes.status === 'fulfilled' && reportsRes.value && Array.isArray(reportsRes.value.reports)) {
        const serverReports = reportsRes.value.reports;
        try {
          const deleted = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]').map(String));
          const validReports = serverReports.filter(r => !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
          localStorage.setItem('local_reports', JSON.stringify(validReports));
          validReports.forEach(r => saveReportToIndexedDB(r));
        } catch (_) {}
      }

      // Update Two-Phase Report
      if (twoPhaseRes.status === 'fulfilled' && twoPhaseRes.value && twoPhaseRes.value.data) {
        try {
          localStorage.setItem('two_phase_report_data', JSON.stringify(twoPhaseRes.value.data));
        } catch (_) {}
      }

      // Update Road Daily Report
      if (roadDailyRes.status === 'fulfilled' && roadDailyRes.value && roadDailyRes.value.data) {
        try {
          localStorage.setItem('road_daily_report_data', JSON.stringify(roadDailyRes.value.data));
        } catch (_) {}
      }

      // Update Fuel Daily Report
      if (fuelDailyRes.status === 'fulfilled' && fuelDailyRes.value && fuelDailyRes.value.data) {
        try {
          localStorage.setItem('fuel_daily_report_data', JSON.stringify(fuelDailyRes.value.data));
        } catch (_) {}
      }

      // Update Messages
      if (messagesRes.status === 'fulfilled' && messagesRes.value && Array.isArray(messagesRes.value.messages)) {
        try {
          localStorage.setItem('system_messages', JSON.stringify(messagesRes.value.messages));
          localStorage.setItem('local_messages', JSON.stringify(messagesRes.value.messages));
        } catch (_) {}
      }

      // Record new sync timestamp
      localStorage.setItem('last_server_sync_timestamp', serverTimestamp);

      // Dispatch UI reactivity events
      window.dispatchEvent(new CustomEvent('report-saved'));
      window.dispatchEvent(new CustomEvent('report-updated'));
      window.dispatchEvent(new CustomEvent('road-progress-updated'));
      window.dispatchEvent(new CustomEvent('two-phase-updated'));
      window.dispatchEvent(new CustomEvent('executive-progress-updated'));
      window.dispatchEvent(new CustomEvent('fuel-updated'));
      window.dispatchEvent(new CustomEvent('messages-updated'));

      // If this was an incoming update from another device, show subtle toast
      if (localTimestamp && localTimestamp !== serverTimestamp) {
        showSyncToast('تم استلام ومزامنة تحديثات جديدة من الخادم لحظياً');
      }
    }

    // Flush any pending offline queue items
    await flushPendingQueue();

  } catch (err) {
    console.warn('[RealtimeSync] Sync poll error:', err);
  } finally {
    isSyncing = false;
  }
}

// 2. Queue mutation if offline
export function queueOfflineMutation(endpoint, method, payload) {
  try {
    const queue = JSON.parse(localStorage.getItem('pending_sync_queue') || '[]');
    queue.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      endpoint,
      method,
      payload,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('pending_sync_queue', JSON.stringify(queue));
    showSyncToast('تم حفظ التقرير محلياً؛ سيتم رفعه تلقائياً فور توفر الاتصال');
  } catch (e) {
    console.error('[RealtimeSync] Error queueing offline mutation:', e);
  }
}

// 3. Flush offline queue when online
export async function flushPendingQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    const raw = localStorage.getItem('pending_sync_queue');
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    console.log(`[RealtimeSync] Flushing ${queue.length} pending offline items...`);
    const remaining = [];

    for (const item of queue) {
      try {
        const res = await fetch(item.endpoint, {
          method: item.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
        if (!res.ok) {
          remaining.push(item);
        }
      } catch (_) {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem('pending_sync_queue');
      showSyncToast('تم رفع ومزامنة كافة التقارير المعلقة بنجاح');
      checkServerUpdates(true);
    } else {
      localStorage.setItem('pending_sync_queue', JSON.stringify(remaining));
    }
  } catch (e) {
    console.error('[RealtimeSync] Flush error:', e);
  }
}

// 4. Subtle UI Notification Toast
function showSyncToast(message) {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('cloud-sync-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cloud-sync-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #0f172a;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      border-radius: 9999px;
      padding: 10px 20px;
      font-family: 'Cairo', system-ui, sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: none;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span>
    <span>${message}</span>
  `;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 3500);
}

// 5. Engine Initializer
export function initRealtimeSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // Immediate check on startup
  setTimeout(() => checkServerUpdates(true), 1200);

  // Periodic poll every 12 seconds when active
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(() => {
    if (!document.hidden) {
      checkServerUpdates(false);
    }
  }, 12000);

  // Wakeup triggers
  window.addEventListener('online', () => {
    flushPendingQueue();
    checkServerUpdates(true);
  });

  window.addEventListener('focus', () => {
    checkServerUpdates(false);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkServerUpdates(false);
    }
  });

  console.log('[RealtimeSync] Cloud Sync Engine active and listening (12s interval).');
}

