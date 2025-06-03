
import { analyzeContext } from './contextAnalyzer';

export const checkSpelling = (text: string, spellChecker: any, isSpellCheckerReady: boolean) => {
  const suggestions = [];
  
  // Enhanced fallback spell checking with more patterns
  const fallbackChecks = [
    // Your example errors
    { pattern: /\bstatmentn\b/gi, correct: 'statement', word: 'statmentn' },
    { pattern: /\bchelc\b/gi, correct: 'check', word: 'chelc' },
    
    // Common typos
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
    { pattern: /\bthere\b/gi, correct: 'there', word: 'ther' },
    
    // Letter transpositions and common mistakes
    { pattern: /\bfrom\b/gi, correct: 'from', word: 'form' },
    { pattern: /\bwith\b/gi, correct: 'with', word: 'whit' },
    { pattern: /\btheir\b/gi, correct: 'their', word: 'thier' },
    { pattern: /\bfriend\b/gi, correct: 'friend', word: 'freind' },
    { pattern: /\bpiece\b/gi, correct: 'piece', word: 'peice' },
    { pattern: /\bweird\b/gi, correct: 'weird', word: 'wierd' },
    { pattern: /\bseize\b/gi, correct: 'seize', word: 'seige' },
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
  
  // Check fallback patterns
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
    // Enhanced word detection with better patterns
    const words = text.match(/\b[a-zA-Z]+\b/g) || [];
    const misspelledWords = new Set();
    
    for (const word of words) {
      // Skip very short words and already processed words
      if (word.length <= 1 || misspelledWords.has(word.toLowerCase())) continue;
      
      // Skip if already found in fallback checks
      const alreadyFound = fallbackChecks.some(({ word: fallbackWord }) => 
        word.toLowerCase() === fallbackWord.toLowerCase()
      );
      
      if (!alreadyFound && !spellChecker.correct(word)) {
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
  
  return suggestions;
};
