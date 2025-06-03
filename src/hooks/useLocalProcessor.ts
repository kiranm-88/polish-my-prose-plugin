
import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';
import { toast } from '@/hooks/use-toast';

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
        setIsSpellCheckerReady(false);
      }
    };

    loadSpellChecker();
  }, []);

  const checkSpelling = (text: string) => {
    const suggestions = [];
    
    if (isSpellCheckerReady && spellChecker) {
      // More aggressive word matching to catch badly misspelled words
      const words = text.match(/\b[a-zA-Z]+\b/g) || [];
      const misspelledWords = new Set();
      
      for (const word of words) {
        if (!spellChecker.correct(word) && word.length > 1 && !misspelledWords.has(word.toLowerCase())) {
          misspelledWords.add(word.toLowerCase());
          
          const spellSuggestions = spellChecker.suggest(word);
          if (spellSuggestions.length > 0) {
            const bestSuggestion = spellSuggestions[0];
            
            // Find the context around the misspelled word
            const wordIndex = text.toLowerCase().indexOf(word.toLowerCase());
            const contextStart = Math.max(0, wordIndex - 20);
            const contextEnd = Math.min(text.length, wordIndex + word.length + 20);
            const context = text.substring(contextStart, contextEnd);
            
            suggestions.push({
              type: 'Spelling',
              text: text.replace(new RegExp(`\\b${word}\\b`, 'gi'), bestSuggestion),
              explanation: `Replace "${word}" with "${bestSuggestion}"`,
              originalWord: word,
              suggestion: bestSuggestion,
              context: context.replace(new RegExp(`\\b${word}\\b`, 'gi'), `**${word}**`)
            });
          }
        }
      }
    } else {
      // Enhanced fallback spell checking with more common misspellings
      const fallbackChecks = [
        { pattern: /\bteh\b/gi, correct: 'the', word: 'teh' },
        { pattern: /\brecieve\b/gi, correct: 'receive', word: 'recieve' },
        { pattern: /\baccommodate\b/gi, correct: 'accommodate', word: 'accomodate' },
        { pattern: /\bseparate\b/gi, correct: 'separate', word: 'seperate' },
        { pattern: /\bstatnmnbt\b/gi, correct: 'statement', word: 'statnmnbt' },
        { pattern: /\bdefinately\b/gi, correct: 'definitely', word: 'definately' },
        { pattern: /\bneccessary\b/gi, correct: 'necessary', word: 'neccessary' },
        { pattern: /\boccurred\b/gi, correct: 'occurred', word: 'occured' }
      ];
      
      fallbackChecks.forEach(({ pattern, correct, word }) => {
        if (pattern.test(text)) {
          const wordIndex = text.toLowerCase().indexOf(word.toLowerCase());
          if (wordIndex !== -1) {
            const contextStart = Math.max(0, wordIndex - 20);
            const contextEnd = Math.min(text.length, wordIndex + word.length + 20);
            const context = text.substring(contextStart, contextEnd);
            
            suggestions.push({
              type: 'Spelling',
              text: text.replace(pattern, correct),
              explanation: `Replace "${word}" with "${correct}"`,
              originalWord: word,
              suggestion: correct,
              context: context.replace(new RegExp(`\\b${word}\\b`, 'gi'), `**${word}**`)
            });
          }
        }
      });
    }
    
    return suggestions;
  };

  const processText = async (text: string) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay for better UX
      
      const suggestions = [];
      
      // Spell checking
      const spellingSuggestions = checkSpelling(text);
      suggestions.push(...spellingSuggestions);
      
      // Multiple spaces
      if (text.includes('  ')) {
        suggestions.push({
          type: 'Formatting',
          text: text.replace(/\s+/g, ' '),
          explanation: 'Remove extra spaces',
          context: 'Multiple consecutive spaces found'
        });
      }
      
      // Capitalization after periods
      const capitalizeRegex = /\.\s+([a-z])/g;
      if (capitalizeRegex.test(text)) {
        suggestions.push({
          type: 'Grammar',
          text: text.replace(capitalizeRegex, (match, letter) => `. ${letter.toUpperCase()}`),
          explanation: 'Capitalize sentences after periods',
          context: 'Sentences should start with capital letters'
        });
      }
      
      // Basic punctuation
      if (text.includes(' ,')) {
        suggestions.push({
          type: 'Punctuation',
          text: text.replace(/ ,/g, ','),
          explanation: 'Fix comma spacing',
          context: 'Commas should not have spaces before them'
        });
      }
      
      setLocalSuggestions(suggestions);
    } catch (error) {
      console.error('Local processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applySuggestion = (originalText: string, suggestion: any) => {
    let correctedText = suggestion.text;
    
    // Show success toast with specific correction details
    if (suggestion.originalWord && suggestion.suggestion) {
      toast({
        title: "Correction Applied",
        description: `Changed "${suggestion.originalWord}" to "${suggestion.suggestion}"`,
      });
    } else {
      toast({
        title: "Improvement Applied",
        description: suggestion.explanation,
      });
    }
    
    return correctedText;
  };

  return { 
    processText, 
    isProcessing, 
    isSpellCheckerReady,
    applySuggestion
  };
};
