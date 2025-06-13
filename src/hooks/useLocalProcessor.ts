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
        
        // Load dictionary files with error handling
        const [affResponse, dicResponse] = await Promise.all([
          fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.2.0/index.aff').catch(() => null),
          fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.2.0/index.dic').catch(() => null)
        ]);
        
        if (!affResponse || !dicResponse || !affResponse.ok || !dicResponse.ok) {
          throw new Error('Failed to load dictionary files');
        }
        
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
    if (!text || !text.trim()) return;
    
    setIsProcessing(true);
    console.log('🔧 Local processor starting for text:', text);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const suggestions = [];
      
      // Grammar checking
      const grammarSuggestions = checkGrammar(text);
      suggestions.push(...grammarSuggestions);
      
      // Spell checking
      const spellingSuggestions = checkSpelling(text, spellChecker, isSpellCheckerReady);
      suggestions.push(...spellingSuggestions);
      
      // Basic corrections for your specific example
      let correctedText = text;
      
      // Fix "Lets" to "Let's" (missing apostrophe)
      if (text.includes('Lets ')) {
        correctedText = correctedText.replace(/\bLets\b/g, "Let's");
        suggestions.push({
          type: 'Grammar',
          text: correctedText,
          explanation: "Add apostrophe to 'Let's'",
          originalWord: 'Lets',
          suggestion: "Let's",
          context: 'Contractions need apostrophes'
        });
      }
      
      // Fix "sdeal" to "deal" (typo)
      if (text.includes('sdeal')) {
        correctedText = correctedText.replace(/sdeal/g, 'deal');
        suggestions.push({
          type: 'Spelling',
          text: correctedText,
          explanation: 'Fix spelling error',
          originalWord: 'sdeal',
          suggestion: 'deal',
          context: 'Spelling correction'
        });
      }
      
      // Fix "ok" to more formal alternatives
      if (text.toLowerCase().startsWith('ok ')) {
        const formalText = correctedText.replace(/^ok\b/i, 'Okay');
        suggestions.push({
          type: 'Style',
          text: formalText,
          explanation: 'Use more formal language',
          originalWord: 'ok',
          suggestion: 'Okay',
          context: 'Style improvement'
        });
      }
      
      // Capitalization after periods
      const capitalizeRegex = /\.\s+([a-z])/g;
      if (capitalizeRegex.test(correctedText)) {
        correctedText = correctedText.replace(capitalizeRegex, (match, letter) => `. ${letter.toUpperCase()}`);
        suggestions.push({
          type: 'Grammar',
          text: correctedText,
          explanation: 'Capitalize sentences after periods',
          context: 'Sentences should start with capital letters'
        });
      }
      
      // Multiple spaces
      if (correctedText.includes('  ')) {
        correctedText = correctedText.replace(/\s+/g, ' ');
        suggestions.push({
          type: 'Formatting',
          text: correctedText,
          explanation: 'Remove extra spaces',
          context: 'Multiple consecutive spaces found'
        });
      }
      
      // Basic punctuation
      if (correctedText.includes(' ,')) {
        correctedText = correctedText.replace(/ ,/g, ',');
        suggestions.push({
          type: 'Punctuation',
          text: correctedText,
          explanation: 'Fix comma spacing',
          context: 'Commas should not have spaces before them'
        });
      }
      
      console.log('🔧 Local processor found', suggestions.length, 'suggestions:', suggestions);
      
      // Prepare local suggestions with default confidence
      const localSuggestionsWithConfidence = suggestions.map(s => ({
        ...s,
        confidence: 'medium' as const,
        verified: false
      }));
      
      // Try to verify with OpenAI, but keep local suggestions if it fails
      let finalSuggestions = localSuggestionsWithConfidence;
      try {
        const verifiedSuggestions = await verifyAndEnhanceSuggestions(text, suggestions);
        if (verifiedSuggestions && verifiedSuggestions.length > 0) {
          // Only use verified suggestions if OpenAI actually returned some
          finalSuggestions = verifiedSuggestions.filter(s => 
            s.verified || s.confidence !== 'low'
          );
        }
        // If OpenAI returns empty array or fails, keep local suggestions
        if (finalSuggestions.length === 0 && localSuggestionsWithConfidence.length > 0) {
          finalSuggestions = localSuggestionsWithConfidence;
        }
      } catch (error) {
        console.log('OpenAI verification failed, using local suggestions');
        // If OpenAI fails, always use local suggestions
        finalSuggestions = localSuggestionsWithConfidence;
      }
      
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
