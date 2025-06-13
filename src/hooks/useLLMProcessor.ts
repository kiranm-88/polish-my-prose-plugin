
import { useState, useEffect } from 'react';
import { useSuggestions } from './useSuggestions';

export const useLLMProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { setLLMSuggestions } = useSuggestions();

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem('writing-assistant-api-key');
      setHasApiKey(!!apiKey);
    };

    checkApiKey();
    
    // Listen for storage changes
    window.addEventListener('storage', checkApiKey);
    return () => window.removeEventListener('storage', checkApiKey);
  }, []);

  const processText = async (text: string) => {
    if (!hasApiKey) return;
    
    const apiKey = localStorage.getItem('writing-assistant-api-key');
    if (!apiKey) return;
    
    setIsProcessing(true);
    
    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional writing assistant. Your job is to analyze text and provide specific, actionable improvements.

IMPORTANT: Only suggest changes if there are actual issues to fix. If the text is already well-written, return an empty array.

For each suggestion you provide:
1. Identify a specific problem (grammar, spelling, clarity, style, etc.)
2. Provide the CORRECTED version of the text
3. Explain what was wrong and why your version is better

Respond with a JSON array. Each suggestion must have:
- type: string (one of: "Grammar", "Spelling", "Clarity", "Style", "Punctuation", "Conciseness")
- text: string (the IMPROVED version of the entire text)
- explanation: string (specific explanation of what was wrong and how you fixed it)

Example response:
[
  {
    "type": "Grammar",
    "text": "Let's catch up at the end of the week and finalize the deal.",
    "explanation": "Changed 'finalise' to 'finalize' for American English spelling consistency"
  }
]

If no improvements are needed, return: []`
          },
          {
            role: 'user',
            content: `Analyze this text for errors and improvements: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      };

      console.log('Sending request to OpenAI with text:', text);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      console.log('OpenAI raw response:', content);

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON response
      try {
        const suggestions = JSON.parse(content);
        
        if (!Array.isArray(suggestions)) {
          console.error('OpenAI returned non-array response:', suggestions);
          throw new Error('Invalid response format from OpenAI');
        }
        
        // Filter out suggestions that don't actually change the text
        const validSuggestions = suggestions.filter(suggestion => {
          if (!suggestion.text || !suggestion.explanation) {
            return false;
          }
          // Only include if the suggestion actually changes something
          return suggestion.text.trim() !== text.trim();
        });
        
        console.log('OpenAI provided', validSuggestions.length, 'valid suggestions out of', suggestions.length, 'total');
        setLLMSuggestions(validSuggestions);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', content);
        // If it's not valid JSON, don't create fallback suggestions
        setLLMSuggestions([]);
      }

    } catch (error) {
      console.error('LLM processing error:', error);
      // Provide user feedback about the error
      setLLMSuggestions([{
        type: 'Error',
        text: text,
        explanation: 'Unable to get AI suggestions. Please check your API key and try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return { processText, isProcessing, hasApiKey };
};
