import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Automatically normalize API requests in production environments
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.includes('localhost:5000/api')) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      url = url.replace(/https?:\/\/localhost:5000/, apiBase);
    }
  }
  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
    <App />
  </React.StrictMode>);
