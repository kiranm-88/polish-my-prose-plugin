
// Content script to inject the writing assistant into web pages
(function() {
  'use strict';

  let assistantIframe = null;
  let isVisible = false;

  function createAssistantButton() {
    const button = document.createElement('button');
    button.innerHTML = '✨';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', toggleAssistant);
    document.body.appendChild(button);
    
    return button;
  }

  function createAssistantIframe() {
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html');
    iframe.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 9999;
      background: white;
      display: none;
    `;
    
    document.body.appendChild(iframe);
    return iframe;
  }

  function toggleAssistant() {
    if (!assistantIframe) {
      assistantIframe = createAssistantIframe();
    }
    
    if (isVisible) {
      assistantIframe.style.display = 'none';
      isVisible = false;
    } else {
      assistantIframe.style.display = 'block';
      isVisible = true;
    }
  }

  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAssistantButton);
  } else {
    createAssistantButton();
  }
})();
