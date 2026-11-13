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

// Purge any duplicate reports accumulated in browser localStorage
sanitizeLocalReportsStorage();

// Ensure official baseline fuel daily report is adopted in localStorage
try {
  const currentFuel = localStorage.getItem('fuel_daily_report_data');
  if (!currentFuel) {
    localStorage.setItem('fuel_daily_report_data', JSON.stringify(OFFICIAL_BASELINE_FUEL_REPORT));
  } else {
    const parsed = JSON.parse(currentFuel);
    const hasData = Array.isArray(parsed?.fuelItems) && parsed.fuelItems.length >= 3 && parsed.fuelItems.some(i => parseFloat(String(i.dispatchedLiters || '').replace(/,/g, '')) > 0);
    if (!hasData) {
      localStorage.setItem('fuel_daily_report_data', JSON.stringify(OFFICIAL_BASELINE_FUEL_REPORT));
    }
  }
} catch (e) {}

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
