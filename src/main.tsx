import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './premium-ui.css';

// Auto-resolve API URLs for seamless local, mobile Wi-Fi, and cloud deployment
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  if (url.includes('localhost:5000')) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      if (window.location.port === '3000') {
        // Mobile device on same Wi-Fi network accessing port 3000 -> point to port 5000 of the same host IP
        url = url.replace('http://localhost:5000', `${window.location.protocol}//${window.location.hostname}:5000`);
      } else {
        // Deployed in cloud / production (single port or cloud host)
        url = url.replace('http://localhost:5000', (import.meta as any).env?.VITE_API_URL || window.location.origin);
      }
    }
    if (input instanceof Request) {
      input = new Request(url, input);
    } else {
      input = url;
    }
  }
  return originalFetch.call(this, input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

