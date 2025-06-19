
import { createRoot } from 'react-dom/client';
import Index from './pages/Index';
import './index.css';

console.log('Extension popup loading...');

// Wait for DOM to be ready
function initializeExtension() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  console.log('Creating React root...');
  const root = createRoot(rootElement);
  
  try {
    root.render(<Index />);
    console.log('Extension popup rendered successfully');
  } catch (error) {
    console.error('Error rendering extension popup:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}
