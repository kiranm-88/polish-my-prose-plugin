import { toast } from '@/hooks/use-toast';

export interface LocalSuggestion {
  type: string;
  text: string;
  explanation: string;
  originalWord?: string;
  suggestion?: string;
  context?: string;
  confidence?: 'high' | 'medium' | 'low';
  verified?: boolean;
}

export const applySuggestionCorrection = (originalText: string, suggestion: LocalSuggestion) => {
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

export const prepareSuggestionsWithConfidence = (suggestions: any[]): LocalSuggestion[] => {
  return suggestions.map(s => ({
    ...s,
    confidence: 'medium' as const,
    verified: false
  }));
};

export const processFinalSuggestions = async (
  text: string,
  suggestions: any[],
  verifyAndEnhanceSuggestions: (text: string, suggestions: any[]) => Promise<any[]>
): Promise<LocalSuggestion[]> => {
  const localSuggestionsWithConfidence = prepareSuggestionsWithConfidence(suggestions);
  
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
  
  return finalSuggestions;
};
