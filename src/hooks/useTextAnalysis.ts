
import { useState, useCallback } from 'react';
import { checkSpelling } from '@/utils/spellChecker';
import { checkGrammar } from '@/utils/grammarChecker';
import { makeFormalText, makeCasualText } from '@/utils/textTransformers';
import { useRejectedCorrections } from './useRejectedCorrections';

interface TextAnalysis {
  original: string;
  needsImprovement: boolean;
  suggestions: {
    formal: string;
    casual: string;
  };
}

export const useTextAnalysis = () => {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const { rejectCorrection, isRejected, clearRejected } = useRejectedCorrections();

  const generateSuggestions = useCallback((text: string) => {
    // Apply spelling and grammar corrections first, filtering out rejected ones
    let corrected = text;
    
    // Process text for spelling corrections
    const spellingSuggestions = checkSpelling(text, null, false);
    if (spellingSuggestions.length > 0) {
      // Apply the first non-flagged and non-rejected suggestion
      const validSuggestion = spellingSuggestions.find(s => 
        !s.flagged && 
        s.originalWord && 
        s.suggestion && 
        !isRejected(s.originalWord, s.suggestion)
      );
      if (validSuggestion) {
        corrected = validSuggestion.text;
      }
    }
    
    // Process text for grammar corrections, filtering out rejected ones
    const grammarSuggestions = checkGrammar(corrected);
    if (grammarSuggestions.length > 0) {
      const validGrammarSuggestion = grammarSuggestions.find(s => 
        s.originalWord && 
        s.suggestion && 
        !isRejected(s.originalWord, s.suggestion)
      );
      if (validGrammarSuggestion) {
        corrected = validGrammarSuggestion.text;
      }
    }
    
    // Generate formal version - taking into account the whole context
    const formal = makeFormalText(corrected);
    
    // Generate casual version - taking into account the whole context
    const casual = makeCasualText(corrected);
    
    return { formal, casual };
  }, [isRejected]);

  const analyzeWholeText = useCallback((text: string) => {
    const trimmedText = text.trim();
    
    if (trimmedText.length > 10) {
      // Check if text needs improvement (excluding rejected corrections)
      const spellingIssues = checkSpelling(trimmedText, null, false).filter(s => 
        s.originalWord && s.suggestion && !isRejected(s.originalWord, s.suggestion)
      );
      const grammarIssues = checkGrammar(trimmedText).filter(s => 
        s.originalWord && s.suggestion && !isRejected(s.originalWord, s.suggestion)
      );
      
      const hasSpellingIssues = spellingIssues.length > 0;
      const hasGrammarIssues = grammarIssues.length > 0;
      const needsImprovement = hasSpellingIssues || hasGrammarIssues || trimmedText.length > 20;
      
      if (needsImprovement) {
        const suggestions = generateSuggestions(trimmedText);
        
        setAnalysis({
          original: trimmedText,
          needsImprovement: true,
          suggestions
        });
      } else {
        setAnalysis(null);
      }
    } else {
      setAnalysis(null);
    }
  }, [generateSuggestions, isRejected]);

  const clearAnalyses = useCallback(() => {
    setAnalysis(null);
  }, []);

  const handleRejectCorrection = useCallback((original: string, suggestion: string) => {
    rejectCorrection(original, suggestion);
    // Re-analyze the current text to update suggestions
    if (analysis) {
      analyzeWholeText(analysis.original);
    }
  }, [rejectCorrection, analysis, analyzeWholeText]);

  return {
    analysis,
    analyzeWholeText,
    clearAnalyses,
    rejectCorrection: handleRejectCorrection,
    clearRejectedCorrections: clearRejected
  };
};
