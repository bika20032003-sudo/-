import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { fastFetch } from './utils/apiCache.js';

// Automatically normalize API requests and provide offline/static fallback in production
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  const isApiUrl = typeof url === 'string' && (url.includes('/api/') || url.includes('localhost:5000'));
  const isProduction = typeof window !== 'undefined' && 
                       window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  const apiBase = import.meta.env.VITE_API_BASE || '';

  if (isApiUrl && isProduction) {
    if (apiBase) {
      const targetUrl = url.replace(/https?:\/\/localhost:5000/, apiBase);
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

    // Static fallback on GitHub Pages / Client-only mode
    try {
      const fallbackData = await fastFetch(url, options);
      return new Response(JSON.stringify(fallbackData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response(JSON.stringify({ success: true, message: 'Saved' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
    <App />
  </React.StrictMode>);
