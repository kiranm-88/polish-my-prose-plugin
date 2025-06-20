
import React from 'react';
import { createRoot } from 'react-dom/client';
import Index from './pages/Index';
import './index.css';

console.log('🔧 Extension popup initializing...');
console.log('🌍 Current URL:', window.location.href);
console.log('📄 Document ready state:', document.readyState);
console.log('🔍 DOM body exists:', !!document.body);

function initExtension() {
  console.log('🎯 Looking for root element...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Root element not found in DOM');
    console.log('🔍 Available elements:', document.querySelectorAll('*').length);
    
    // Create root element if it doesn't exist
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    newRoot.style.cssText = 'width: 100%; height: 100%; min-height: 400px;';
    document.body.appendChild(newRoot);
    console.log('✅ Created root element');
    
    // Try again with the new root
    setTimeout(() => initExtension(), 100);
    return;
  }
  
  console.log('✅ Root element found, creating React root...');
  console.log('📦 Root element details:', {
    id: rootElement.id,
    tagName: rootElement.tagName,
    className: rootElement.className,
    innerHTML: rootElement.innerHTML.substring(0, 100)
  });
  
  try {
    const root = createRoot(rootElement);
    console.log('🚀 Rendering Index component...');
    
    // Clear any existing content first
    rootElement.innerHTML = '';
    
    root.render(React.createElement(Index));
    console.log('🎉 Extension popup rendered successfully!');
    
    // Verify the component actually rendered
    setTimeout(() => {
      console.log('🔍 Post-render check:', {
        hasContent: rootElement.innerHTML.length > 0,
        contentPreview: rootElement.innerHTML.substring(0, 200)
      });
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error rendering extension:', error);
    console.error('Stack trace:', error.stack);
    
    // Fallback: show a simple message
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; background: white; height: 100%; min-height: 400px;">
        <h2 style="color: #333; margin: 0 0 10px 0;">Polish My Prose</h2>
        <p style="color: #666; margin: 0 0 15px 0;">Loading error occurred. Please refresh.</p>
        <button onclick="window.location.reload()" style="background: #007cba; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Refresh</button>
        <details style="margin-top: 15px;">
          <summary style="cursor: pointer; color: #666;">Error Details</summary>
          <pre style="background: #f5f5f5; padding: 10px; margin: 10px 0; font-size: 12px; overflow: auto;">${error.message}\n\n${error.stack}</pre>
        </details>
      </div>
    `;
  }
}

// Multiple initialization strategies
console.log('🚀 Starting extension initialization...');

// Strategy 1: Immediate if DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('📄 DOM already ready, initializing immediately');
  setTimeout(initExtension, 0);
} else {
  console.log('⏳ DOM not ready, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired');
    initExtension();
  });
}

// Strategy 2: Fallback timer
setTimeout(() => {
  console.log('⏰ Fallback timer triggered');
  if (!document.getElementById('root') || document.getElementById('root').innerHTML === '') {
    console.log('🔄 Attempting fallback initialization');
    initExtension();
  }
}, 2000);

// Strategy 3: Window load event
window.addEventListener('load', () => {
  console.log('🏁 Window load event fired');
  if (!document.getElementById('root') || document.getElementById('root').innerHTML === '') {
    console.log('🔄 Attempting window load initialization');
    initExtension();
  }
});

console.log('🎬 Extension script loaded completely');
