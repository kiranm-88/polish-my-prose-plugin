
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
            content: `You are a professional writing assistant. Analyze the provided text and suggest improvements for:
            1. Grammar and spelling corrections
            2. Clarity and conciseness
            3. Tone and style improvements
            4. Removing redundant words
            5. Making the text more engaging

            Respond with a JSON array of suggestions. Each suggestion should have:
            - type: string (Grammar, Style, Clarity, etc.)
            - text: string (the corrected/improved version of the entire text)
            - explanation: string (what was improved and why)

            Only provide genuinely helpful suggestions. If the text is already good, return fewer suggestions.`
          },
          {
            role: 'user',
            content: `Please analyze and improve this text: "${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
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
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON response
      try {
        const suggestions = JSON.parse(content);
        
        if (!Array.isArray(suggestions)) {
          throw new Error('Invalid response format from OpenAI');
        }
        
        console.log('OpenAI provided', suggestions.length, 'suggestions');
        setLLMSuggestions(suggestions);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        // Fallback: create a single suggestion with the raw response
        setLLMSuggestions([{
          type: 'AI Enhancement',
          text: content,
          explanation: 'AI-generated improvement suggestion'
        }]);
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
