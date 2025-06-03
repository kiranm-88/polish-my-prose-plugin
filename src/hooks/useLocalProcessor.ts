
import { useState } from 'react';
import { useSuggestions } from './useSuggestions';

export const useLocalProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setLocalSuggestions } = useSuggestions();

  const processText = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const suggestions = [];
      
      // Basic grammar and spelling checks
      if (text.includes('teh ')) {
        suggestions.push({
          type: 'Spelling',
          text: text.replace(/teh /g, 'the '),
          explanation: 'Corrected "teh" to "the"'
        });
      }
      
      if (text.includes('recieve')) {
        suggestions.push({
          type: 'Spelling',
          text: text.replace(/recieve/g, 'receive'),
          explanation: 'Corrected "recieve" to "receive"'
        });
      }
      
      // Multiple spaces
      if (text.includes('  ')) {
        suggestions.push({
          type: 'Formatting',
          text: text.replace(/\s+/g, ' '),
          explanation: 'Removed extra spaces'
        });
      }
      
      // Capitalization after periods
      const capitalizeRegex = /\.\s+([a-z])/g;
      if (capitalizeRegex.test(text)) {
        suggestions.push({
          type: 'Grammar',
          text: text.replace(capitalizeRegex, (match, letter) => `. ${letter.toUpperCase()}`),
          explanation: 'Capitalized sentences after periods'
        });
      }
      
      // Basic punctuation
      if (text.includes(' ,')) {
        suggestions.push({
          type: 'Punctuation',
          text: text.replace(/ ,/g, ','),
          explanation: 'Fixed comma spacing'
        });
      }
      
      setLocalSuggestions(suggestions);
    } catch (error) {
      console.error('Local processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return { processText, isProcessing };
};
