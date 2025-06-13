
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
            content: `You are a professional writing assistant. Analyze the provided text for errors and improvements.

CRITICAL: You must find and fix ALL errors in the text. Look for:
- Missing punctuation (commas, apostrophes, periods)
- Spelling errors and typos
- Grammar mistakes
- Regional spelling inconsistencies (use American English)
- Capitalization errors
- Word choice improvements

For the example "Acceptable let's try again, Lets catch up at the end of the week and finalise the deal." you should find:
1. Missing comma after "Acceptable"
2. Missing apostrophe in "Lets" 
3. British spelling "finalise" should be "finalize"

Respond with a JSON array. Each suggestion must have:
- type: string (one of: "Grammar", "Spelling", "Punctuation", "Style", "Clarity")
- text: string (the CORRECTED version of the entire text)
- explanation: string (specific explanation of what was wrong)

Example:
[
  {
    "type": "Punctuation",
    "text": "Acceptable, let's try again. Let's catch up at the end of the week and finalize the deal.",
    "explanation": "Added missing comma after 'Acceptable', fixed apostrophe in 'Let's', and changed British 'finalise' to American 'finalize'"
  }
]

IMPORTANT: Always return the complete corrected text, not just the changed parts.`
          },
          {
            role: 'user',
            content: `Find and fix ALL errors in this text: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      };

      console.log('=== OpenAI Request ===');
      console.log('Text to analyze:', text);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

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

      console.log('=== OpenAI Response ===');
      console.log('Raw response:', content);
      console.log('Full API response:', JSON.stringify(data, null, 2));

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
        
        console.log('=== Suggestion Analysis ===');
        console.log('Total suggestions received:', suggestions.length);
        
        // Filter out suggestions that don't actually change the text
        const validSuggestions = suggestions.filter((suggestion, index) => {
          console.log(`Suggestion ${index + 1}:`, suggestion);
          console.log(`Original text: "${text.trim()}"`);
          console.log(`Suggested text: "${suggestion.text?.trim()}"`);
          console.log(`Text changed: ${suggestion.text?.trim() !== text.trim()}`);
          
          if (!suggestion.text || !suggestion.explanation) {
            console.log(`Suggestion ${index + 1} rejected: Missing text or explanation`);
            return false;
          }
          
          // Only include if the suggestion actually changes something
          const textChanged = suggestion.text.trim() !== text.trim();
          if (!textChanged) {
            console.log(`Suggestion ${index + 1} rejected: No text changes`);
          }
          return textChanged;
        });
        
        console.log('=== Final Results ===');
        console.log('Valid suggestions after filtering:', validSuggestions.length);
        console.log('Valid suggestions:', validSuggestions);
        
        setLLMSuggestions(validSuggestions);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', content);
        console.error('Parse error:', parseError);
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
