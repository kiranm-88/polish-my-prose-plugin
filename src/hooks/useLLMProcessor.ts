
import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';

export const useLLMProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { setLLMSuggestions } = useSuggestions();

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem('writing-assistant-api-key');
      setHasApiKey(!!apiKey);
    };

    checkApiKey();
    
    // Listen for storage changes
    window.addEventListener('storage', checkApiKey);
    return () => window.removeEventListener('storage', checkApiKey);
  }, []);

  const processText = async (text: string) => {
    if (!hasApiKey) return;
    
    setIsProcessing(true);
    
    try {
      // For demo purposes, we'll simulate AI suggestions
      // In a real implementation, this would call the OpenAI API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const suggestions = [];
      
      // Simulated AI suggestions based on text analysis
      if (text.length > 100) {
        suggestions.push({
          type: 'Clarity',
          text: text.replace(/\b(very|really|quite|rather)\s+/gi, ''),
          explanation: 'Removed unnecessary intensifiers for clearer writing'
        });
      }
      
      if (text.includes('I think') || text.includes('I believe')) {
        suggestions.push({
          type: 'Confidence',
          text: text.replace(/I think that?|I believe that?/gi, ''),
          explanation: 'Removed hedging language to sound more confident'
        });
      }
      
      // Passive voice detection (simplified)
      if (text.includes(' was ') || text.includes(' were ')) {
        suggestions.push({
          type: 'Voice',
          text: text.replace(/(\w+) was (\w+ed)/g, '$2 $1'),
          explanation: 'Converted some passive voice to active voice'
        });
      }
      
      // Tone suggestions
      if (text.includes('!')) {
        const toneAdjusted = text.replace(/!/g, '.');
        suggestions.push({
          type: 'Tone',
          text: toneAdjusted,
          explanation: 'Adjusted tone to be more professional'
        });
      }
      
      setLLMSuggestions(suggestions);
    } catch (error) {
      console.error('LLM processing error:', error);
      // Graceful degradation - could show a message about API issues
    } finally {
      setIsProcessing(false);
    }
  };

  return { processText, isProcessing, hasApiKey };
};
