
import { useState, useCallback } from 'react';
import { checkSpelling } from '@/utils/spellChecker';
import { checkGrammar } from '@/utils/grammarChecker';

interface SentenceAnalysis {
  original: string;
  needsImprovement: boolean;
  suggestions: {
    formal: string;
    casual: string;
  };
  position: number;
}

export const useSentenceAnalyzer = () => {
  const [analyses, setAnalyses] = useState<Map<number, SentenceAnalysis>>(new Map());

  const generateSuggestions = useCallback((sentence: string) => {
    // Apply spelling and grammar corrections first
    let corrected = sentence;
    
    // Basic spelling corrections
    const spellingSuggestions = checkSpelling(sentence, null, false);
    if (spellingSuggestions.length > 0) {
      corrected = spellingSuggestions[0].text;
    }
    
    // Basic grammar corrections
    const grammarSuggestions = checkGrammar(corrected);
    if (grammarSuggestions.length > 0) {
      corrected = grammarSuggestions[0].text;
    }
    
    // Generate formal version
    const formal = makeFormal(corrected);
    
    // Generate casual version
    const casual = makeCasual(corrected);
    
    return { formal, casual };
  }, []);

  const makeFormal = (text: string): string => {
    let formal = text;
    
    // Expand contractions
    formal = formal.replace(/can't/gi, 'cannot');
    formal = formal.replace(/won't/gi, 'will not');
    formal = formal.replace(/n't/gi, ' not');
    formal = formal.replace(/'re/gi, ' are');
    formal = formal.replace(/'ve/gi, ' have');
    formal = formal.replace(/'ll/gi, ' will');
    formal = formal.replace(/'d/gi, ' would');
    
    // Remove informal words
    formal = formal.replace(/\b(kinda|sorta|gonna|wanna)\b/gi, (match) => {
      switch (match.toLowerCase()) {
        case 'kinda': return 'somewhat';
        case 'sorta': return 'somewhat';
        case 'gonna': return 'going to';
        case 'wanna': return 'want to';
        default: return match;
      }
    });
    
    // Ensure proper capitalization
    formal = formal.charAt(0).toUpperCase() + formal.slice(1);
    
    // Ensure it ends with proper punctuation
    if (!/[.!?]$/.test(formal.trim())) {
      formal = formal.trim() + '.';
    }
    
    return formal;
  };

  const makeCasual = (text: string): string => {
    let casual = text;
    
    // Add contractions
    casual = casual.replace(/\bwill not\b/gi, "won't");
    casual = casual.replace(/\bcannot\b/gi, "can't");
    casual = casual.replace(/\bdo not\b/gi, "don't");
    casual = casual.replace(/\bdid not\b/gi, "didn't");
    casual = casual.replace(/\bis not\b/gi, "isn't");
    casual = casual.replace(/\bare not\b/gi, "aren't");
    casual = casual.replace(/\bwas not\b/gi, "wasn't");
    casual = casual.replace(/\bwere not\b/gi, "weren't");
    casual = casual.replace(/\bhave not\b/gi, "haven't");
    casual = casual.replace(/\bhas not\b/gi, "hasn't");
    casual = casual.replace(/\bwould not\b/gi, "wouldn't");
    casual = casual.replace(/\bshould not\b/gi, "shouldn't");
    casual = casual.replace(/\bgoing to\b/gi, "gonna");
    casual = casual.replace(/\bwant to\b/gi, "wanna");
    
    // Make it more conversational
    casual = casual.replace(/\bhowever\b/gi, 'but');
    casual = casual.replace(/\btherefore\b/gi, 'so');
    casual = casual.replace(/\bfurthermore\b/gi, 'also');
    
    return casual;
  };

  const analyzeSentences = useCallback((text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const newAnalyses = new Map<number, SentenceAnalysis>();
    
    let currentPosition = 0;
    
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 5) { // Only analyze meaningful sentences
        
        // Check if sentence needs improvement (has spelling/grammar issues or could be polished)
        const hasSpellingIssues = checkSpelling(trimmedSentence, null, false).length > 0;
        const hasGrammarIssues = checkGrammar(trimmedSentence).length > 0;
        const needsImprovement = hasSpellingIssues || hasGrammarIssues || trimmedSentence.length > 10;
        
        if (needsImprovement) {
          const suggestions = generateSuggestions(trimmedSentence);
          
          // Find the position in the original text
          const sentenceIndex = text.indexOf(trimmedSentence, currentPosition);
          const endPosition = sentenceIndex + trimmedSentence.length;
          
          newAnalyses.set(index, {
            original: trimmedSentence,
            needsImprovement: true,
            suggestions,
            position: endPosition
          });
        }
        
        currentPosition = text.indexOf(trimmedSentence, currentPosition) + trimmedSentence.length;
      }
    });
    
    setAnalyses(newAnalyses);
  }, [generateSuggestions]);

  const clearAnalyses = useCallback(() => {
    setAnalyses(new Map());
  }, []);

  return {
    analyses,
    analyzeSentences,
    clearAnalyses
  };
};
