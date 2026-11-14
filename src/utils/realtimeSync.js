/**
 * ==============================================================================
 * Real-time Cross-Device Cloud Sync Engine (محرك المزامنة السحابية اللحظية)
 * منظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 * ==============================================================================
 * 
 * Provides:
 * 1. 1-Minute Periodic Auto-Sync (كل دقيقة) across all connected devices (phones, tablets, PCs).
 * 2. Instant wakeup & sync on Tab Focus / Phone Unlock / App Foreground (visibilitychange, focus, pageshow).
 * 3. 0ms Cross-Tab Synchronization via BroadcastChannel API on same device.
 * 4. 1-Click Mobile Setup: automatically adopts ?api=... query parameter from URL.
 * 5. Offline Resilience with Outgoing Mutation Queue (auto-syncs on reconnection).
 * 6. Reactive Event Dispatching to all UI components (Dashboard, Reports, Fuel, Road).
 */

import { clearApiCache, fastFetch } from './apiCache.js';
import { saveReportToIndexedDB } from './secureDatabase.js';
import { deduplicateReportsList, isMockOrEmptyFuelReport } from './reportDeduplication.js';

export const AUTO_SYNC_INTERVAL_MS = 60000; // 60 seconds (1 minute) as requested by user

let syncTimer = null;
let heartbeatTimer = null;
let isSyncing = false;
let isInitialized = false;
let lastSyncTimestamp = Date.now();
let lastSyncSuccess = true;
let broadcastChannel = null;

// Initialize cross-tab BroadcastChannel
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('crushers_system_sync');
    broadcastChannel.onmessage = (event) => {
      const { type, detail } = event.data || {};
      if (type === 'LOCAL_MUTATION') {
        console.log('[RealtimeSync] Cross-tab mutation received via BroadcastChannel');
        clearApiCache();
        window.dispatchEvent(new CustomEvent('report-saved', { detail }));
        window.dispatchEvent(new CustomEvent('report-updated', { detail }));
        window.dispatchEvent(new CustomEvent('reports-updated', { detail }));
        window.dispatchEvent(new CustomEvent('fuel-updated', { detail }));
        window.dispatchEvent(new CustomEvent('two-phase-updated', { detail }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail }));
        window.dispatchEvent(new CustomEvent('messages-updated', { detail }));
      }
    };
  }
} catch (_) {}

/**
 * Broadcast local mutation across tabs on the same device
 */
export function broadcastLocalMutation(detail = {}) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LOCAL_MUTATION', detail, timestamp: Date.now() });
    }
  } catch (_) {}
}

/**
 * Retrieve current API base URL
 * 1. Checks URL parameter ?api=... (automatic mobile configuration)
 * 2. Checks localStorage custom_cloud_api_url
 * 3. Checks build-time VITE_API_BASE
 */
export function getApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  
  // 1. Check URL parameter ?api=... for seamless 1-click mobile linking
  try {
    if (window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('api');
      if (urlParam && urlParam.trim()) {
        const clean = urlParam.trim().replace(/\/+$/, '');
        localStorage.setItem('custom_cloud_api_url', clean);
        return clean;
      }
    }
  } catch (_) {}

  // 2. Custom cloud API URL stored in device
  const custom = localStorage.getItem('custom_cloud_api_url');
  if (custom && custom.trim()) {
    const cleanCustom = custom.trim().replace(/\/+$/, '');
    if ((cleanCustom.includes('localhost') || cleanCustom.includes('127.0.0.1')) && 
        window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      localStorage.removeItem('custom_cloud_api_url');
    } else {
      return cleanCustom;
    }
  }

  // 3. Build-time environment variable
  const envBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';
  if (envBase && envBase.trim()) {
    return envBase.trim().replace(/\/+$/, '');
  }

  return '';
}

/**
 * Configure custom cloud API URL manually
 */
export function setCustomCloudApiUrl(url) {
  if (typeof window === 'undefined') return;
  const clean = (url || '').trim().replace(/\/+$/, '');
  if (clean) {
    localStorage.setItem('custom_cloud_api_url', clean);
  } else {
    localStorage.removeItem('custom_cloud_api_url');
  }
  clearApiCache();
  dispatchSyncStatus();
  triggerImmediateSync();
}

/**
 * Generate shareable link with ?api=... for instant mobile pairing
 */
export function getMobileSyncShareUrl() {
  if (typeof window === 'undefined') return '';
  const currentBase = getApiBaseUrl();
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  if (!currentBase) {
    return `${origin}${pathname}`;
  }
  return `${origin}${pathname}?api=${encodeURIComponent(currentBase)}`;
}

/**
 * Test connectivity to a specific server URL
 */
export async function testCloudApiConnection(targetUrl) {
  const base = (targetUrl || '').trim().replace(/\/+$/, '');
  const testEndpoint = base ? `${base}/api/sync/timestamp` : '/api/sync/timestamp';
  try {
    const res = await fetch(testEndpoint, { cache: 'no-store' });
    if (!res.ok) return { success: false, status: res.status, message: `فشل الاتصال: كود الاستجابة ${res.status}` };
    const data = await res.json().catch(() => null);
    if (data && (data.success || data.lastUpdated)) {
      return { success: true, message: 'تم الاتصال بالخادم المركزي بنجاح 100%' };
    }
    return { success: true, message: 'الخادم متصل وجاهز للمزامنة' };
  } catch (err) {
    return { success: false, message: `تعذر الوصول إلى الخادم: ${err.message || 'خطأ في الشبكة'}` };
  }
}

/**
 * Resolve full API endpoint URL
 */
export function resolveApiUrl(path) {
  if (!path || typeof path !== 'string') return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return base ? `${base}${cleanPath}` : cleanPath;
}

/**
 * Trigger immediate background sync
 */
export function triggerImmediateSync() {
  if (typeof window === 'undefined') return;
  broadcastLocalMutation();
  setTimeout(() => checkServerUpdates(true), 60);
}

/**
 * Emit sync status for UI components
 */
function dispatchSyncStatus() {
  if (typeof window === 'undefined') return;
  lastSyncTimestamp = Date.now();
  window.dispatchEvent(new CustomEvent('sync-status-changed', {
    detail: getSyncStatus()
  }));
}

/**
 * Get current sync engine status
 */
export function getSyncStatus() {
  return {
    isSyncing,
    lastSyncTimestamp,
    lastSyncSuccess,
    apiBaseUrl: getApiBaseUrl(),
    hasCustomApi: !!localStorage.getItem('custom_cloud_api_url'),
    autoIntervalMs: AUTO_SYNC_INTERVAL_MS,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}

/**
 * Check for server-side updates & sync across all devices
 */
export async function checkServerUpdates(force = false) {
  if (isSyncing) return;
  if (typeof window === 'undefined' || !navigator.onLine) {
    dispatchSyncStatus();
    return;
  }

  isSyncing = true;
  dispatchSyncStatus();

  try {
    const syncUrl = resolveApiUrl('/api/sync/timestamp');
    const res = await fetch(syncUrl, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    if (!res || !res.ok) {
      // If server does not support timestamp endpoint or offline, flush pending queue and stop
      lastSyncSuccess = false;
      await flushPendingQueue();
      return;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      lastSyncSuccess = false;
      return;
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.success) {
      lastSyncSuccess = false;
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
      const [reportsRes, twoPhaseRes, messagesRes, roadDailyRes, fuelDailyRes, executiveRes] = await Promise.allSettled([
        fetch(resolveApiUrl('/api/reports'), { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(resolveApiUrl('/api/two-phase-report'), { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(resolveApiUrl('/api/messages'), { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(resolveApiUrl('/api/road-daily-report'), { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(resolveApiUrl('/api/fuel-daily-report'), { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(resolveApiUrl('/api/executive-progress'), { cache: 'no-store' }).then(r => r.json()).catch(() => null)
      ]);

      // 1. Update Reports in Local Storage & IndexedDB
      if (reportsRes.status === 'fulfilled' && reportsRes.value && Array.isArray(reportsRes.value.reports)) {
        const serverReports = reportsRes.value.reports;
        try {
          const deleted = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]').map(String));
          if (Array.isArray(reportsRes.value.deletedReportIds)) {
            reportsRes.value.deletedReportIds.forEach(id => deleted.add(String(id)));
          }
          // Server-delivered active reports must never be suppressed by a stale local blacklist
          serverReports.forEach(r => {
            if (r?.id) deleted.delete(String(r.id));
            if (r?.reportNumber) deleted.delete(String(r.reportNumber));
          });
          localStorage.setItem('deleted_report_ids', JSON.stringify(Array.from(deleted)));

          const validReports = serverReports.filter(r => !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
          const rawLocal = localStorage.getItem('local_reports');
          const localReports = (rawLocal ? JSON.parse(rawLocal) : []).filter(r => !deleted.has(String(r?.id)) && !deleted.has(String(r?.reportNumber)));
          const merged = deduplicateReportsList([...validReports, ...localReports]);
          localStorage.setItem('local_reports', JSON.stringify(merged));
          validReports.forEach(r => saveReportToIndexedDB(r));
        } catch (_) {}
      }

      // 2. Update Two-Phase Report
      if (twoPhaseRes.status === 'fulfilled' && twoPhaseRes.value && twoPhaseRes.value.data) {
        try {
          localStorage.setItem('two_phase_report_data', JSON.stringify(twoPhaseRes.value.data));
        } catch (_) {}
      }

      // 3. Update Road Daily Report
      if (roadDailyRes.status === 'fulfilled' && roadDailyRes.value && roadDailyRes.value.data) {
        try {
          localStorage.setItem('road_daily_report_data', JSON.stringify(roadDailyRes.value.data));
        } catch (_) {}
      }

      // 4. Update Fuel Daily Report & merge into archive
      if (fuelDailyRes.status === 'fulfilled' && fuelDailyRes.value && fuelDailyRes.value.data) {
        try {
          const fuelData = fuelDailyRes.value.data;
          if (fuelData && typeof fuelData === 'object' && !isMockOrEmptyFuelReport(fuelData) && fuelData.reportNumber) {
            localStorage.setItem('fuel_daily_report_data', JSON.stringify(fuelData));

            const deleted = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]').map(String));
            if (!deleted.has(String(fuelData.id)) && !deleted.has(String(fuelData.reportNumber))) {
              const rawLocal = localStorage.getItem('local_reports');
              const localReports = (rawLocal ? JSON.parse(rawLocal) : []).filter(r => !deleted.has(String(r?.id)) && !deleted.has(String(r?.reportNumber)) && !isMockOrEmptyFuelReport(r));
              const merged = deduplicateReportsList([fuelData, ...localReports]);
              localStorage.setItem('local_reports', JSON.stringify(merged));
              saveReportToIndexedDB(fuelData);
            }
          }
        } catch (_) {}
      }

      // 5. Update Executive Progress
      if (executiveRes.status === 'fulfilled' && executiveRes.value && executiveRes.value.data) {
        try {
          localStorage.setItem('executive_progress_data', JSON.stringify(executiveRes.value.data));
        } catch (_) {}
      }

      // 6. Update Messages
      if (messagesRes.status === 'fulfilled' && messagesRes.value && Array.isArray(messagesRes.value.messages)) {
        try {
          localStorage.setItem('system_messages', JSON.stringify(messagesRes.value.messages));
          localStorage.setItem('local_messages', JSON.stringify(messagesRes.value.messages));
          window.dispatchEvent(new CustomEvent('messages-updated'));
        } catch (_) {}
      }

      // Record new sync timestamp
      if (serverTimestamp) {
        localStorage.setItem('last_server_sync_timestamp', serverTimestamp);
      }

      // Dispatch UI reactivity events
      window.dispatchEvent(new CustomEvent('report-saved'));
      window.dispatchEvent(new CustomEvent('report-updated'));
      window.dispatchEvent(new CustomEvent('reports-updated'));
      window.dispatchEvent(new CustomEvent('road-progress-updated'));
      window.dispatchEvent(new CustomEvent('two-phase-updated'));
      window.dispatchEvent(new CustomEvent('executive-progress-updated'));
      window.dispatchEvent(new CustomEvent('fuel-updated', { detail: fuelDailyRes?.value?.data }));
      window.dispatchEvent(new CustomEvent('messages-updated'));

      // If this was an incoming update from another device, show subtle toast
      if (localTimestamp && localTimestamp !== serverTimestamp) {
        showSyncToast('تم استلام ومزامنة تحديثات جديدة من الخادم لحظياً');
      }
    }

    lastSyncSuccess = true;

    // Flush any pending offline queue items
    await flushPendingQueue();

  } catch (err) {
    console.warn('[RealtimeSync] Sync poll error:', err);
    lastSyncSuccess = false;
  } finally {
    isSyncing = false;
    dispatchSyncStatus();
  }
}

/**
 * Queue mutation if offline
 */
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

/**
 * Flush offline queue when online
 */
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
        const targetUrl = resolveApiUrl(item.endpoint);
        const res = await fetch(targetUrl, {
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

/**
 * Subtle UI Notification Toast
 */
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

/**
 * Engine Initializer
 * Starts 1-minute recurring schedule and life-cycle listeners
 */
export function initRealtimeSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // Immediate check on startup
  setTimeout(() => checkServerUpdates(true), 600);

  // Periodic auto-sync every 60 seconds (1 minute) as requested
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(() => {
    checkServerUpdates(false);
  }, AUTO_SYNC_INTERVAL_MS);

  // 1-second UI heartbeat ticker for live countdown in Navbar
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    dispatchSyncStatus();
  }, 3000);

  // Wakeup triggers (mobile phone unlock, tab switch, focus, app return)
  window.addEventListener('online', () => {
    flushPendingQueue();
    checkServerUpdates(true);
  });

  window.addEventListener('focus', () => {
    checkServerUpdates(true);
  });

  window.addEventListener('pageshow', () => {
    checkServerUpdates(true);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkServerUpdates(true);
    }
  });

  // Local storage changes across browser windows
  window.addEventListener('storage', (e) => {
    if (e.key === 'custom_cloud_api_url' || e.key === 'fuel_daily_report_data' || e.key === 'local_reports' || e.key === 'two_phase_report_data') {
      clearApiCache();
      triggerImmediateSync();
    }
  });

  console.log('[RealtimeSync] Cloud Sync Engine active (1-minute interval, cross-device ready).');
}
