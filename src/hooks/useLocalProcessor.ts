
import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';
import { useOpenAIVerifier } from './useOpenAIVerifier';

export const useLocalProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setLocalSuggestions } = useSuggestions();
  const { verifyAndEnhanceSuggestions, isVerifying } = useOpenAIVerifier();

  const processText = async (text: string) => {
    if (!text || !text.trim()) return;
    
    const apiKey = localStorage.getItem('writing-assistant-api-key');
    if (!apiKey) {
      console.log('🔧 No API key available, skipping local processing');
      setLocalSuggestions([]);
      return;
    }
    
    setIsProcessing(true);
    console.log('🔧 Using OpenAI-only processing for text:', text);
    
    try {
      // Use OpenAI directly for all suggestions instead of local processing
      const suggestions = await verifyAndEnhanceSuggestions(text, []);
      
      console.log('🔧 OpenAI suggestions received:', suggestions);
      setLocalSuggestions(suggestions);
    } catch (error) {
      console.error('OpenAI processing error:', error);
      setLocalSuggestions([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const applySuggestion = (originalText: string, suggestion: any) => {
    // Simple application of suggestion
    return suggestion.text || originalText;
  };

  return { 
    processText, 
    isProcessing: isProcessing || isVerifying, 
    isSpellCheckerReady: true, // Always ready since we're using OpenAI
    applySuggestion
  };
};
