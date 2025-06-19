
import React from 'react';
import { createRoot } from 'react-dom/client';
import Index from './pages/Index';
import './index.css';

console.log('🔧 Extension popup initializing...');

function initExtension() {
  console.log('🎯 Looking for root element...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Root element not found in DOM');
    // Create root element if it doesn't exist
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    console.log('✅ Created root element');
    return initExtension(); // Try again
  }
  
  console.log('✅ Root element found, creating React root...');
  
  try {
    const root = createRoot(rootElement);
    console.log('🚀 Rendering Index component...');
    
    root.render(React.createElement(Index));
    console.log('🎉 Extension popup rendered successfully!');
    
  } catch (error) {
    console.error('❌ Error rendering extension:', error);
    
    // Fallback: show a simple message
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui;">
        <h2>Polish My Prose</h2>
        <p>Loading error occurred. Please refresh.</p>
        <button onclick="window.location.reload()">Refresh</button>
      </div>
    `;
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  // DOM already ready
  initExtension();
}
