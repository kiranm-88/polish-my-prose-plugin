
export const checkGrammar = (text: string) => {
  const suggestions = [];
  
  // Common grammatical error patterns
  const grammarChecks = [
    // Subject-verb agreement
    { pattern: /\b(I|you|we|they) was\b/gi, correct: 'were', explanation: 'Subject-verb agreement: use "were" with plural subjects' },
    { pattern: /\b(he|she|it) were\b/gi, correct: 'was', explanation: 'Subject-verb agreement: use "was" with singular subjects' },
    
    // Incorrect verb forms
    { pattern: /\bshould of\b/gi, correct: 'should have', explanation: 'Use "should have" instead of "should of"' },
    { pattern: /\bcould of\b/gi, correct: 'could have', explanation: 'Use "could have" instead of "could of"' },
    { pattern: /\bwould of\b/gi, correct: 'would have', explanation: 'Use "would have" instead of "would of"' },
    
    // Common pronoun errors
    { pattern: /\bme and \w+\b/gi, correct: (match) => match.replace('me and', 'X and I'), explanation: 'Use "X and I" instead of "me and X" as subject' },
    
    // Incorrect comparisons
    { pattern: /\bmore better\b/gi, correct: 'better', explanation: 'Use "better" instead of "more better"' },
    { pattern: /\bmore easier\b/gi, correct: 'easier', explanation: 'Use "easier" instead of "more easier"' },
    { pattern: /\bmost easiest\b/gi, correct: 'easiest', explanation: 'Use "easiest" instead of "most easiest"' },
    
    // Double negatives
    { pattern: /\bdon't have no\b/gi, correct: "don't have any", explanation: 'Avoid double negatives' },
    { pattern: /\bcan't get no\b/gi, correct: "can't get any", explanation: 'Avoid double negatives' },
    
    // Incorrect prepositions
    { pattern: /\bdifferent than\b/gi, correct: 'different from', explanation: 'Use "different from" instead of "different than"' },
    
    // Common word confusions
    { pattern: /\bthen\b(?=\s+(he|she|it|they|we|I))/gi, correct: 'than', explanation: 'Use "than" for comparisons' },
    { pattern: /\byour\s+(going|coming|being|doing)\b/gi, correct: (match) => match.replace('your', "you're"), explanation: 'Use "you\'re" (you are) instead of "your"' },
    { pattern: /\bits\s+(going|being|doing|coming)\b/gi, correct: (match) => match.replace('its', "it's"), explanation: 'Use "it\'s" (it is) instead of "its"' },
    
    // Missing articles
    { pattern: /\bin\s+(beginning|end|middle)\b/gi, correct: (match) => match.replace('in ', 'in the '), explanation: 'Add article "the"' },
    
    // Redundant phrases
    { pattern: /\bfree gift\b/gi, correct: 'gift', explanation: 'Remove redundant word - gifts are inherently free' },
    { pattern: /\badvance planning\b/gi, correct: 'planning', explanation: 'Remove redundant word - planning is inherently done in advance' },
  ];
  
  grammarChecks.forEach(({ pattern, correct, explanation }) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const wordIndex = match.index || 0;
      const contextStart = Math.max(0, wordIndex - 20);
      const contextEnd = Math.min(text.length, wordIndex + match[0].length + 20);
      const context = text.substring(contextStart, contextEnd);
      
      let correctedText;
      if (typeof correct === 'function') {
        correctedText = text.replace(pattern, correct);
      } else {
        correctedText = text.replace(pattern, correct);
      }
      
      suggestions.push({
        type: 'Grammar',
        text: correctedText,
        explanation: explanation,
        originalWord: match[0],
        suggestion: typeof correct === 'function' ? correct(match[0]) : correct,
        context: context.replace(new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), `**${match[0]}**`)
      });
    }
  });
  
  return suggestions;
};
