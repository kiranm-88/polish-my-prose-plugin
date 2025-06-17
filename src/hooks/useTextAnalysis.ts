
import { useState, useCallback } from 'react';
import { checkSpelling } from '@/utils/spellChecker';
import { checkGrammar } from '@/utils/grammarChecker';
import { makeFormalText, makeCasualText } from '@/utils/textTransformers';

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

  const generateSuggestions = useCallback((text: string) => {
    // Apply spelling and grammar corrections first
    let corrected = text;
    
    // Process text for spelling corrections
    const spellingSuggestions = checkSpelling(text, null, false);
    if (spellingSuggestions.length > 0) {
      // Apply the first non-flagged suggestion
      const validSuggestion = spellingSuggestions.find(s => !s.flagged);
      if (validSuggestion) {
        corrected = validSuggestion.text;
      }
    }
    
    // Process text for grammar corrections
    const grammarSuggestions = checkGrammar(corrected);
    if (grammarSuggestions.length > 0) {
      corrected = grammarSuggestions[0].text;
    }
    
    // Generate formal version - taking into account the whole context
    const formal = makeFormalText(corrected);
    
    // Generate casual version - taking into account the whole context
    const casual = makeCasualText(corrected);
    
    return { formal, casual };
  }, []);

  const analyzeWholeText = useCallback((text: string) => {
    const trimmedText = text.trim();
    
    if (trimmedText.length > 10) {
      // Check if text needs improvement
      const hasSpellingIssues = checkSpelling(trimmedText, null, false).length > 0;
      const hasGrammarIssues = checkGrammar(trimmedText).length > 0;
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
  }, [generateSuggestions]);

  const clearAnalyses = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analysis,
    analyzeWholeText,
    clearAnalyses
  };
};
