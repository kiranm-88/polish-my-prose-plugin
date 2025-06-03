
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

  const analyzeContext = (text: string, word: string, wordIndex: number) => {
    const words = text.split(/\s+/);
    const wordPosition = text.substring(0, wordIndex).split(/\s+/).length - 1;
    
    // Get surrounding words for context
    const prevWord = wordPosition > 0 ? words[wordPosition - 1]?.toLowerCase() : '';
    const nextWord = wordPosition < words.length - 1 ? words[wordPosition + 1]?.toLowerCase() : '';
    const prevTwoWords = wordPosition > 1 ? words[wordPosition - 2]?.toLowerCase() : '';
    
    // Context analysis for "thos"
    if (word.toLowerCase() === 'thos') {
      // Patterns that suggest "this"
      const thisPatterns = [
        /\b(in|on|at|with|for|by|from|like)\b/i,
        /\b(is|was|will|can|could|should|would)\b/i,
        /\b(way|time|moment|case|situation)\b/i
      ];
      
      // Patterns that suggest "those"
      const thosePatterns = [
        /\b(are|were|have|had)\b/i,
        /\b(people|things|items|books|documents)\b/i,
        /\b(all|some|many|few)\b/i
      ];
      
      // Check context around the word
      const contextText = `${prevTwoWords} ${prevWord} ${nextWord}`.toLowerCase();
      
      // If next word is singular or context suggests singular, prefer "this"
      if (thisPatterns.some(pattern => pattern.test(contextText)) || 
          nextWord.match(/\b(is|was|will|can|could|should|would|way|time|moment|case|situation)\b/)) {
        return 'this';
      }
      
      // If context suggests plural or multiple items, prefer "those"
      if (thosePatterns.some(pattern => pattern.test(contextText)) || 
          nextWord.match(/\b(are|were|have|had|people|things|items|books|documents)\b/)) {
        return 'those';
      }
      
      // Default to "this" for ambiguous cases
      return 'this';
    }
    
    return null;
  };

  const checkSpelling = (text: string) => {
    const suggestions = [];
    
    // Enhanced fallback spell checking with context analysis
    const fallbackChecks = [
      { pattern: /\bteh\b/gi, correct: 'the', word: 'teh' },
      { pattern: /\bspelligsn\b/gi, correct: 'spellings', word: 'spelligsn' },
      { pattern: /\brecieve\b/gi, correct: 'receive', word: 'recieve' },
      { pattern: /\baccommodate\b/gi, correct: 'accommodate', word: 'accomodate' },
      { pattern: /\bseparate\b/gi, correct: 'separate', word: 'seperate' },
      { pattern: /\bstatnmnbt\b/gi, correct: 'statement', word: 'statnmnbt' },
      { pattern: /\bdefinately\b/gi, correct: 'definitely', word: 'definately' },
      { pattern: /\bneccessary\b/gi, correct: 'necessary', word: 'neccessary' },
      { pattern: /\boccurred\b/gi, correct: 'occurred', word: 'occured' },
      { pattern: /\bbeginning\b/gi, correct: 'beginning', word: 'begining' },
      { pattern: /\bwhich\b/gi, correct: 'which', word: 'wich' },
      { pattern: /\bwhere\b/gi, correct: 'where', word: 'were' },
      { pattern: /\bthere\b/gi, correct: 'there', word: 'ther' }
    ];
    
    // Handle "thos" with context analysis
    const thosMatches = text.matchAll(/\bthos\b/gi);
    for (const match of thosMatches) {
      const wordIndex = match.index || 0;
      const contextCorrection = analyzeContext(text, 'thos', wordIndex);
      
      if (contextCorrection) {
        const contextStart = Math.max(0, wordIndex - 20);
        const contextEnd = Math.min(text.length, wordIndex + 4 + 20);
        const context = text.substring(contextStart, contextEnd);
        
        suggestions.push({
          type: 'Spelling',
          text: text.replace(/\bthos\b/gi, contextCorrection),
          explanation: `Replace "thos" with "${contextCorrection}" (context-aware)`,
          originalWord: 'thos',
          suggestion: contextCorrection,
          context: context.replace(/\bthos\b/gi, '**thos**')
        });
      }
    }
    
    // Check other fallback patterns
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
    
    if (isSpellCheckerReady && spellChecker) {
      // More aggressive word matching to catch badly misspelled words
      const words = text.match(/\b[a-zA-Z]+\b/g) || [];
      const misspelledWords = new Set();
      
      for (const word of words) {
        if (!spellChecker.correct(word) && word.length > 1 && !misspelledWords.has(word.toLowerCase())) {
          // Skip if already found in fallback checks
          const alreadyFound = fallbackChecks.some(({ word: fallbackWord }) => 
            word.toLowerCase() === fallbackWord.toLowerCase()
          );
          
          if (!alreadyFound) {
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
      }
    }
    
    return suggestions;
  };

  const processText = async (text: string) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
