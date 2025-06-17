
import { useState } from 'react';

interface Suggestion {
  type: string;
  text: string;
  explanation: string;
  originalWord?: string;
  suggestion?: string;
  context?: string;
  flagged?: boolean;
}

interface VerifiedSuggestion extends Suggestion {
  confidence: 'high' | 'medium' | 'low';
  verified: boolean;
}

export const useOpenAIVerifier = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAndEnhanceSuggestions = async (
    originalText: string, 
    suggestions: Suggestion[] = []
  ): Promise<VerifiedSuggestion[]> => {
    const apiKey = localStorage.getItem('writing-assistant-api-key');
    
    if (!apiKey) {
      return [];
    }

    setIsVerifying(true);

    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional writing assistant that analyzes text for errors and improvements.

IMPORTANT RULES:
1. DO NOT change proper nouns, company names, or brand names
2. DO NOT change contractions like "I've", "we're", "it's" unless they are genuinely incorrect
3. Only suggest changes for actual errors or significant improvements
4. If text is already well-written, return an empty array

Find these types of issues:
- Genuine spelling mistakes (not proper nouns)
- Grammar errors
- Missing punctuation
- Awkward phrasing that can be improved

For each suggestion, provide:
{
  "type": "Grammar|Spelling|Punctuation|Style",
  "text": "the corrected text",
  "explanation": "what was improved",
  "originalWord": "original word/phrase if applicable",
  "suggestion": "suggested replacement if applicable",
  "confidence": "high|medium|low",
  "verified": true
}

Return JSON array. If no improvements needed, return []`
          },
          {
            role: 'user',
            content: `Please analyze this text and suggest only necessary improvements: "${originalText}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return [];
      }

      try {
        const verifiedSuggestions = JSON.parse(content);
        
        if (!Array.isArray(verifiedSuggestions)) {
          return [];
        }
        
        // Filter out suggestions that don't actually improve the text
        const validSuggestions = verifiedSuggestions.filter((suggestion) => {
          const hasRequiredFields = suggestion.text && suggestion.explanation;
          const textChanged = suggestion.text.trim() !== originalText.trim();
          return hasRequiredFields && textChanged;
        });
        
        console.log('OpenAI verified', validSuggestions.length, 'suggestions');
        return validSuggestions;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response');
        return [];
      }

    } catch (error) {
      console.error('OpenAI verification failed:', error);
      return [];
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyAndEnhanceSuggestions,
    isVerifying
  };
};
