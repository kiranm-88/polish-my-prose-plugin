
// Content script to inject the writing assistant into web pages
(function() {
  'use strict';

  let assistantIframe: HTMLIFrameElement | null = null;
  let isVisible = false;
  let assistantButton: HTMLButtonElement | null = null;

  function createAssistantButton(): HTMLButtonElement {
    // Remove existing button if it exists
    if (assistantButton) {
      assistantButton.remove();
    }

    const button = document.createElement('button');
    button.innerHTML = '✨';
    button.id = 'polish-my-prose-button';
    button.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      width: 50px !important;
      height: 50px !important;
      border-radius: 50% !important;
      border: none !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      font-size: 20px !important;
      cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      transition: all 0.3s ease !important;
      font-family: system-ui, -apple-system, sans-serif !important;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', toggleAssistant);
    
    // Ensure the button is added to the body
    if (document.body) {
      document.body.appendChild(button);
      assistantButton = button;
      console.log('Polish My Prose: Button added to page');
    } else {
      console.log('Polish My Prose: Body not ready, retrying...');
      setTimeout(createAssistantButton, 100);
    }
    
    return button;
  }

  function createAssistantIframe(): HTMLIFrameElement {
    if (assistantIframe) {
      assistantIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('src/popup.html');
    iframe.id = 'polish-my-prose-iframe';
    iframe.style.cssText = `
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      width: 400px !important;
      height: 600px !important;
      border: none !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
      z-index: 2147483646 !important;
      background: white !important;
      display: none !important;
    `;
    
    if (document.body) {
      document.body.appendChild(iframe);
      console.log('Polish My Prose: Iframe created');
    }
    
    return iframe;
  }

  function toggleAssistant(): void {
    console.log('Polish My Prose: Button clicked');
    
    if (!assistantIframe) {
      assistantIframe = createAssistantIframe();
    }
    
    if (isVisible) {
      assistantIframe.style.display = 'none';
      isVisible = false;
      console.log('Polish My Prose: Hidden');
    } else {
      assistantIframe.style.display = 'block';
      isVisible = true;
      console.log('Polish My Prose: Shown');
    }
  }

  function initialize(): void {
    console.log('Polish My Prose: Initializing content script');
    
    // Wait for body to be available
    if (document.body) {
      createAssistantButton();
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        if (document.body) {
          createAssistantButton();
          obs.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Also initialize after a short delay to handle dynamic pages
  setTimeout(initialize, 1000);
})();
