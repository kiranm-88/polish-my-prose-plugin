
import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';
import { useOpenAIVerifier } from './useOpenAIVerifier';
import { checkGrammar } from '@/utils/grammarChecker';
import { checkSpelling } from '@/utils/spellChecker';
import { loadSpellChecker, getSpellCheckerStatus } from '@/utils/spellCheckerLoader';
import { applyBasicCorrections } from '@/utils/textCorrections';
import { applySuggestionCorrection, processFinalSuggestions } from '@/utils/suggestionProcessor';

export const useLocalProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpellCheckerReady, setIsSpellCheckerReady] = useState(false);
  const { setLocalSuggestions } = useSuggestions();
  const { verifyAndEnhanceSuggestions, isVerifying } = useOpenAIVerifier();

  useEffect(() => {
    const initializeSpellChecker = async () => {
      const { isReady } = await loadSpellChecker();
      setIsSpellCheckerReady(isReady);
    };

    initializeSpellChecker();
  }, []);

  const processText = async (text: string) => {
    if (!text || !text.trim()) return;
    
    setIsProcessing(true);
    console.log('🔧 Local processor starting for text:', text);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const suggestions = [];
      const { spellChecker } = getSpellCheckerStatus();
      
      // Grammar checking
      const grammarSuggestions = checkGrammar(text);
      suggestions.push(...grammarSuggestions);
      
      // Spell checking
      const spellingSuggestions = checkSpelling(text, spellChecker, isSpellCheckerReady);
      suggestions.push(...spellingSuggestions);
      
      // Basic corrections
      const basicCorrections = applyBasicCorrections(text);
      suggestions.push(...basicCorrections);
      
      console.log('🔧 Local processor found', suggestions.length, 'suggestions:', suggestions);
      
      // Process final suggestions with OpenAI verification
      const finalSuggestions = await processFinalSuggestions(
        text, 
        suggestions, 
        verifyAndEnhanceSuggestions
      );
      
      console.log('🔧 Final suggestions being set:', finalSuggestions);
      setLocalSuggestions(finalSuggestions);
    } catch (error) {
      console.error('Local processing error:', error);
      // Don't let errors prevent showing suggestions
      setLocalSuggestions([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return { 
    processText, 
    isProcessing: isProcessing || isVerifying, 
    isSpellCheckerReady,
    applySuggestion: applySuggestionCorrection
  };
};
