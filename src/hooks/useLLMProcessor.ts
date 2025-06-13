
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
            content: `You are a writing assistant. Your job is to find and fix errors in text.

Find these types of errors:
- Missing punctuation (commas, apostrophes, periods)
- Spelling mistakes and typos
- Grammar errors
- Use American English spelling

IMPORTANT: Only suggest corrections if you find actual errors. If the text is already correct, return an empty array [].

Respond ONLY with a JSON array. Each correction should have:
{
  "type": "Grammar" | "Spelling" | "Punctuation",
  "text": "the corrected text",
  "explanation": "what was fixed"
}

Examples:
- "lets go" → "let's go" (missing apostrophe)
- "finalise" → "finalize" (American spelling)
- "Hello,how are you" → "Hello, how are you" (missing space)`
          },
          {
            role: 'user',
            content: `Fix any errors in this text: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 800,
      };

      console.log('🔍 Analyzing text:', text);
      console.log('📤 Sending to OpenAI...');

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
        console.error('❌ OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      console.log('📥 OpenAI response:', content);

      if (!content) {
        console.log('⚠️ Empty response from OpenAI');
        setLLMSuggestions([]);
        return;
      }

      // Try to parse JSON response
      try {
        const suggestions = JSON.parse(content);
        
        if (!Array.isArray(suggestions)) {
          console.error('❌ Response is not an array:', suggestions);
          setLLMSuggestions([]);
          return;
        }
        
        console.log(`✅ Parsed ${suggestions.length} suggestions`);
        
        // Validate each suggestion
        const validSuggestions = suggestions.filter((suggestion, index) => {
          const isValid = suggestion.text && 
                         suggestion.explanation && 
                         suggestion.text.trim() !== text.trim();
          
          console.log(`Suggestion ${index + 1}:`, {
            valid: isValid,
            hasText: !!suggestion.text,
            hasExplanation: !!suggestion.explanation,
            textChanged: suggestion.text?.trim() !== text.trim(),
            suggestion
          });
          
          return isValid;
        });
        
        console.log(`🎯 Final valid suggestions: ${validSuggestions.length}`);
        setLLMSuggestions(validSuggestions);
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Raw content that failed to parse:', content);
        setLLMSuggestions([]);
      }

    } catch (error) {
      console.error('💥 LLM processing error:', error);
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
