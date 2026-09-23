import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './premium-ui.css';
import { getFallbackData } from './utils/apiCache.js';

// Automatically normalize API requests and provide offline/static fallback in production
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  let requestUrl = url;
  if (typeof url === 'string' && typeof window !== 'undefined') {
    // If accessing via local network IP, redirect localhost:5000 to current host:5000 or relative /api
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.hostname.includes('github.io')) {
      requestUrl = url.replace('localhost:5000', `${window.location.hostname}:5000`);
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

  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
    <App />
  </React.StrictMode>);
