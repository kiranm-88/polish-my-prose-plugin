
import React from 'react';
import { createRoot } from 'react-dom/client';
import Index from './pages/Index';
import './index.css';

function initPopup() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  try {
    const root = createRoot(rootElement);
    root.render(<Index />);
    console.log('Extension popup rendered successfully');
  } catch (error) {
    console.error('Error rendering extension popup:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; background: white; height: 100%;">
        <h2 style="color: #333; margin: 0 0 10px 0;">Polish My Prose</h2>
        <p style="color: #666; margin: 0 0 15px 0;">Loading error occurred. Please refresh.</p>
        <button onclick="window.location.reload()" style="background: #007cba; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Refresh</button>
      </div>
    `;
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initPopup();
} else {
  document.addEventListener('DOMContentLoaded', initPopup);
}
