
import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';
import { useOpenAIVerifier } from './useOpenAIVerifier';
import { toast } from '@/hooks/use-toast';
import { checkGrammar } from '@/utils/grammarChecker';
import { checkSpelling } from '@/utils/spellChecker';

let spellChecker: any = null;

export const useLocalProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpellCheckerReady, setIsSpellCheckerReady] = useState(false);
  const { setLocalSuggestions } = useSuggestions();
  const { verifyAndEnhanceSuggestions, isVerifying } = useOpenAIVerifier();

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
      } catch (error) {
        setIsSpellCheckerReady(false);
      }
    };

    loadSpellChecker();
  }, []);

  const processText = async (text: string) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const suggestions = [];
      
      // Grammar checking
      const grammarSuggestions = checkGrammar(text);
      suggestions.push(...grammarSuggestions);
      
      // Spell checking
      const spellingSuggestions = checkSpelling(text, spellChecker, isSpellCheckerReady);
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
      
      // Debug: Show what we found locally
      if (suggestions.length > 0) {
        console.log('DEBUG: Local suggestions:', suggestions.map(s => `${s.type}: ${s.explanation}`));
      }
      
      // Verify and enhance suggestions with OpenAI
      const verifiedSuggestions = await verifyAndEnhanceSuggestions(text, suggestions);
      
      // Debug: Show final results
      console.log('DEBUG: Final suggestions after AI verification:', verifiedSuggestions.length);
      
      // Filter out low confidence suggestions if we have verified ones
      const finalSuggestions = verifiedSuggestions.filter(s => 
        s.verified || s.confidence !== 'low'
      );
      
      setLocalSuggestions(finalSuggestions);
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
      const verificationNote = suggestion.verified ? ' (AI verified)' : '';
      toast({
        title: "Correction Applied",
        description: `Changed "${suggestion.originalWord}" to "${suggestion.suggestion}"${verificationNote}`,
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
    isProcessing: isProcessing || isVerifying, 
    isSpellCheckerReady,
    applySuggestion
  };
};
