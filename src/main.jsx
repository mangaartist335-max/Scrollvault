import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Set theme before first paint to avoid flash.
(() => {
  try {
    const saved = localStorage.getItem('genesisx:theme');
    document.documentElement.dataset.theme =
      saved === 'playground' || saved === 'studio' ? saved : 'studio';
  } catch {
    document.documentElement.dataset.theme = 'studio';
  }
})();

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

