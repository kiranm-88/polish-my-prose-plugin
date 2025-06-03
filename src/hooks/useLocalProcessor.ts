import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';

let spellChecker: any = null;

export const useLocalProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpellCheckerReady, setIsSpellCheckerReady] = useState(false);
  const { setLocalSuggestions } = useSuggestions();

  useEffect(() => {
    const loadSpellChecker = async () => {
      try {
        // Dynamically import nspell to avoid build issues
        const { default: nspell } = await import('nspell');
        
        // Load dictionary files
        const [affResponse, dicResponse] = await Promise.all([
          fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.2.0/index.aff'),
          fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.2.0/index.dic')
        ]);
        
        const aff = await affResponse.text();
        const dic = await dicResponse.text();
        
        spellChecker = nspell(aff, dic);
        setIsSpellCheckerReady(true);
        console.log('Spell checker loaded successfully');
      } catch (error) {
        console.error('Failed to load spell checker:', error);
        // Fallback to basic spell checking if loading fails
        setIsSpellCheckerReady(false);
      }
    };

    loadSpellChecker();
  }, []);

  const checkSpelling = (text: string) => {
    const suggestions = [];
    
    if (isSpellCheckerReady && spellChecker) {
      // Split text into words and check each one
      const words = text.match(/\b[a-zA-Z]+\b/g) || [];
      const misspelledWords = new Set();
      
      for (const word of words) {
        if (!spellChecker.correct(word) && word.length > 2 && !misspelledWords.has(word.toLowerCase())) {
          misspelledWords.add(word.toLowerCase());
          
          // Get suggestions for the misspelled word
          const spellSuggestions = spellChecker.suggest(word);
          if (spellSuggestions.length > 0) {
            const bestSuggestion = spellSuggestions[0];
            const correctedText = text.replace(new RegExp(`\\b${word}\\b`, 'gi'), bestSuggestion);
            
            suggestions.push({
              type: 'Spelling',
              text: correctedText,
              explanation: `Corrected "${word}" to "${bestSuggestion}"`
            });
          }
        }
      }
    } else {
      // Fallback to basic spell checking
      if (text.includes('teh ')) {
        suggestions.push({
          type: 'Spelling',
          text: text.replace(/\bteh\b/g, 'the'),
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
    }
    
    return suggestions;
  };

  const processText = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const suggestions = [];
      
      // Spell checking
      const spellingSuggestions = checkSpelling(text);
      suggestions.push(...spellingSuggestions);
      
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

  return { processText, isProcessing, isSpellCheckerReady };
};
