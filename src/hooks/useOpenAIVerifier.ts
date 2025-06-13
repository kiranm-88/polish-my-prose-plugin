
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
    suggestions: Suggestion[]
  ): Promise<VerifiedSuggestion[]> => {
    const apiKey = localStorage.getItem('writing-assistant-api-key');
    
    if (!apiKey || suggestions.length === 0) {
      // Return original suggestions with default verification status
      return suggestions.map(s => ({
        ...s,
        confidence: 'medium' as const,
        verified: false
      }));
    }

    setIsVerifying(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: `You are a writing assistant that verifies and enhances grammar and spelling suggestions. 

Your task is to:
1. Verify if each suggestion is correct and helpful
2. Rate confidence level (high/medium/low)
3. Enhance explanations to be clearer
4. Filter out incorrect suggestions
5. Add any missing critical suggestions

Respond with a JSON array of verified suggestions. Each suggestion should have:
- type: string
- text: string (corrected text)
- explanation: string (enhanced explanation)
- originalWord: string (if applicable)
- suggestion: string (the suggested correction)
- context: string (if applicable)
- confidence: "high" | "medium" | "low"
- verified: boolean

Only include suggestions that are genuinely helpful and correct.`
            },
            {
              role: 'user',
              content: `Original text: "${originalText}"

Suggestions to verify:
${JSON.stringify(suggestions, null, 2)}

Please verify these suggestions and enhance them. Return only valid, helpful suggestions in JSON format.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON response
      try {
        const verifiedSuggestions = JSON.parse(content);
        return Array.isArray(verifiedSuggestions) ? verifiedSuggestions : [];
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        // Fallback to original suggestions
        return suggestions.map(s => ({
          ...s,
          confidence: 'medium' as const,
          verified: false
        }));
      }

    } catch (error) {
      console.error('OpenAI verification error:', error);
      // Fallback to original suggestions with lower confidence
      return suggestions.map(s => ({
        ...s,
        confidence: 'low' as const,
        verified: false
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyAndEnhanceSuggestions,
    isVerifying
  };
};
