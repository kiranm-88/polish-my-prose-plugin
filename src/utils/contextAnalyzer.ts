
export const analyzeContext = (text: string, word: string, wordIndex: number) => {
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
