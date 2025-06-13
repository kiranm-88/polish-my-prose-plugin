
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
    window.addEventListener('storage', checkApiKey);
    return () => window.removeEventListener('storage', checkApiKey);
  }, []);

  const processText = async (text: string) => {
    if (!hasApiKey) return;
    
    const apiKey = localStorage.getItem('writing-assistant-api-key');
    if (!apiKey) return;
    
    setIsProcessing(true);
    console.log('🔍 Processing text:', text);
    
    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a writing assistant that finds and corrects errors in text.

Find these specific types of errors:
1. Missing punctuation (commas, periods, apostrophes)
2. Spelling mistakes and typos
3. Grammar errors
4. British to American English conversion

CRITICAL: Only return corrections if you find ACTUAL errors. If the text is perfect, return an empty array [].

Each correction must have:
{
  "type": "Grammar|Spelling|Punctuation", 
  "text": "the fully corrected text",
  "explanation": "what was fixed"
}

Examples of what to fix:
- "ok let's" → "Ok, let's" (missing comma, capitalization)
- "Lets go" → "Let's go" (missing apostrophe)
- "finalise" → "finalize" (British to American)
- "sdeal" → "deal" (typo)`
          },
          {
            role: 'user',
            content: `Analyze and fix errors in: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 800,
      };

      console.log('📤 Sending request to OpenAI...');

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

      console.log('📥 Raw OpenAI response:', content);

      if (!content) {
        console.log('⚠️ Empty response from OpenAI');
        setLLMSuggestions([]);
        return;
      }

      try {
        const suggestions = JSON.parse(content);
        
        if (!Array.isArray(suggestions)) {
          console.error('❌ Response is not an array:', suggestions);
          setLLMSuggestions([]);
          return;
        }
        
        console.log(`📊 Received ${suggestions.length} suggestions from OpenAI`);
        
        // Filter out suggestions that don't actually change the text
        const validSuggestions = suggestions.filter((suggestion) => {
          const hasRequiredFields = suggestion.text && suggestion.explanation;
          const textChanged = suggestion.text.trim().toLowerCase() !== text.trim().toLowerCase();
          
          console.log('🔍 Validating suggestion:', {
            text: suggestion.text,
            explanation: suggestion.explanation,
            hasRequiredFields,
            textChanged,
            original: text.trim(),
            suggested: suggestion.text?.trim()
          });
          
          return hasRequiredFields && textChanged;
        });
        
        console.log(`✅ Valid suggestions after filtering: ${validSuggestions.length}`);
        setLLMSuggestions(validSuggestions);
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Failed to parse content:', content);
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
