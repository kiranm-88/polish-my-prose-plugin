
import { useState, useEffect } from 'react';

export const useLLMProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

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
    if (!hasApiKey) return null;
    
    const apiKey = localStorage.getItem('writing-assistant-api-key');
    if (!apiKey) return null;
    
    setIsProcessing(true);
    console.log('🔍 Processing text:', text);
    
    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a writing assistant that improves text quality and style.

Your task is to:
1. Fix any spelling, grammar, or punctuation errors
2. Create two versions: one formal and one casual
3. Only suggest improvements if the text actually needs them

IMPORTANT: If the text is already well-written, return exactly the same text for both versions.

Return a JSON object with this exact structure:
{
  "formal": "the text rewritten in a formal style",
  "casual": "the text rewritten in a casual style"
}

Examples:
- Input: "ok lets go to the store" → {"formal": "Okay, let's go to the store.", "casual": "Ok, let's go to the store!"}
- Input: "The meeting is scheduled for tomorrow." → {"formal": "The meeting is scheduled for tomorrow.", "casual": "The meeting is scheduled for tomorrow."}
`
          },
          {
            role: 'user',
            content: `Please improve this text: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
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
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      console.log('📥 Raw OpenAI response:', content);

      if (!content) {
        console.log('⚠️ Empty response from OpenAI');
        return null;
      }

      try {
        const result = JSON.parse(content);
        
        if (!result.formal || !result.casual) {
          console.error('❌ Invalid response structure:', result);
          return null;
        }
        
        console.log('✅ Successfully processed suggestions');
        return result;
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Failed to parse content:', content);
        return null;
      }

    } catch (error) {
      console.error('💥 LLM processing error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processText, isProcessing, hasApiKey };
};
