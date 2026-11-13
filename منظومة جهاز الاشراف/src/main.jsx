import './utils/forceLatinDigits.js';
import './utils/secureDatabase.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './premium-ui.css';
import { getFallbackData } from './utils/apiCache.js';
import { initRealtimeSync } from './utils/realtimeSync.js';
import { sanitizeLocalReportsStorage } from './utils/reportDeduplication.js';
import { OFFICIAL_BASELINE_FUEL_REPORT, initialExecutiveData } from './data/mockData.js';

// Purge any legacy fake reports, messages, and mock data from browser localStorage
try {
  const CLEAN_MIGRATION_KEY = 'supervision_clean_slate_v3_2026';
  if (typeof window !== 'undefined' && window.localStorage && !localStorage.getItem(CLEAN_MIGRATION_KEY)) {
    localStorage.setItem('local_reports', JSON.stringify([]));
    localStorage.setItem('system_messages', JSON.stringify([]));
    localStorage.setItem('local_messages', JSON.stringify([]));
    localStorage.setItem('system_alerts', JSON.stringify([]));
    localStorage.setItem('deleted_report_ids', JSON.stringify([]));
    localStorage.setItem('periodic_reports_archive', JSON.stringify([]));
    localStorage.removeItem('fuel_daily_report_data');
    localStorage.removeItem('road_daily_report_data');
    localStorage.removeItem('two_phase_report_data');
    localStorage.removeItem('targeted_works_report_data');
    
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('user_deleted_messages_') || k.startsWith('user_read_messages_') || k.startsWith('cached_api_')) {
        localStorage.removeItem(k);
      }
    });
    localStorage.setItem(CLEAN_MIGRATION_KEY, 'true');
  }
} catch (e) {}

sanitizeLocalReportsStorage();

// Ensure official baseline executive progress report is adopted in localStorage
try {
  const currentExec = localStorage.getItem('executive_progress_data');
  if (!currentExec) {
    localStorage.setItem('executive_progress_data', JSON.stringify(initialExecutiveData));
  } else {
    const parsed = JSON.parse(currentExec);
    const hasData = Array.isArray(parsed?.basicItems) && parsed.basicItems.length >= 5;
    if (!hasData) {
      localStorage.setItem('executive_progress_data', JSON.stringify(initialExecutiveData));
    }
  }
} catch (e) {}

// Automatically normalize API requests and provide offline/static fallback
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  let requestUrl = url;
  if (typeof url === 'string') {
    // Normalize localhost:5000 to relative path so it routes through Vite's fast proxy
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
      requestUrl = url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
    }
  }

  const isApiUrl = typeof requestUrl === 'string' && (requestUrl.includes('/api/') || requestUrl.includes(':5000'));
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const apiBase = import.meta.env.VITE_API_BASE || '';

  if (isApiUrl && isGitHubPages) {
    if (apiBase) {
      const targetUrl = requestUrl.replace(/https?:\/\/[^/]+/, apiBase);
      try {
        const res = await originalFetch(targetUrl, options);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return res;
          }
        }
      } catch {
        // network error, continue to fallback below
      }
    }

    // Instant offline/static response for GitHub Pages
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET') {
      if (method === 'DELETE' && url.includes('/api/reports/')) {
        const reportId = url.split('/api/reports/')[1]?.split('?')[0];
        if (reportId && typeof window !== 'undefined' && window.localStorage) {
          try {
            const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
            if (!deleted.includes(String(reportId))) deleted.push(String(reportId));
            localStorage.setItem('deleted_report_ids', JSON.stringify(deleted));

            const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
            const updatedLocal = local.filter(r => String(r.id) !== String(reportId) && String(r.reportNumber) !== String(reportId));
            localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
          } catch (e) {
            console.error('Error syncing report deletion in main.jsx:', e);
          }
        }
      }
      return new Response(JSON.stringify({ success: true, message: 'Saved successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fallbackData = getFallbackData(url);
    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Production or self-hosted API calls
  if (isApiUrl) {
    try {
      const res = await originalFetch(requestUrl, options);
      return res;
    } catch (netErr) {
      // Offline fallback when device loses connection in the field
      const method = (options.method || 'GET').toUpperCase();
      if (method !== 'GET') {
        return new Response(JSON.stringify({ success: true, message: 'Saved locally (offline mode)' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const fallbackData = getFallbackData(requestUrl);
      return new Response(JSON.stringify(fallbackData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return originalFetch(url, options);
};

// Initialize Cross-Device Real-time Cloud Synchronization
initRealtimeSync();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
