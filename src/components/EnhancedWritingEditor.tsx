
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorHeader } from './EditorHeader';
import { EditorTextarea } from './EditorTextarea';
import { EditorInstructions } from './EditorInstructions';
import { InlineSuggestions } from './InlineSuggestions';
import { useLLMProcessor } from '@/hooks/useLLMProcessor';

export const EnhancedWritingEditor = () => {
  const [text, setText] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [suggestions, setSuggestions] = useState<{formal: string, casual: string} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sparkleButtonRef = useRef<HTMLButtonElement>(null);
  
  const { processText: processLLM, hasApiKey, isProcessing } = useLLMProcessor();

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Hide suggestions while typing
    setShowSuggestion(false);
  }, []);

  const handleSparkleClick = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (text.trim().length <= 10) {
      return;
    }
    
    if (hasApiKey) {
      console.log('🔄 Processing text:', text);
      try {
        const result = await processLLM(text);
        if (result && result.formal && result.casual) {
          setSuggestions(result);
          
          // Calculate position for the suggestion popup relative to the sparkle button
          const rect = sparkleButtonRef.current?.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          
          if (rect && containerRect) {
            setSuggestionPosition({
              top: rect.bottom - containerRect.top + 5,
              left: rect.left - containerRect.left - 100
            });
          }
          
          setShowSuggestion(true);
        }
      } catch (error) {
        console.error('Processing failed:', error);
      }
    }
  }, [text, processLLM, hasApiKey]);

  const handleSuggestionSelect = useCallback((selectedText: string) => {
    setText(selectedText);
    setShowSuggestion(false);
    setSuggestions(null);
  }, []);

  const handleSuggestionDismiss = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  // Show sparkle button when there's enough text and API key is available
  const showSparkleButton = text.trim().length > 10 && hasApiKey;

  return (
    <div className="space-y-4" ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle>
            <EditorHeader
              showSparkleButton={showSparkleButton}
              onSparkleClick={handleSparkleClick}
              sparkleButtonRef={sparkleButtonRef}
              isSpellCheckerReady={hasApiKey}
              hasApiKey={hasApiKey}
              isProcessing={isProcessing}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditorTextarea
            text={text}
            onChange={handleTextChange}
            textareaRef={textareaRef}
          />
          
          <EditorInstructions
            hasApiKey={hasApiKey}
            isSpellCheckerReady={hasApiKey}
          />
        </CardContent>
      </Card>

      {showSuggestion && suggestions && (
        <InlineSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          onDismiss={handleSuggestionDismiss}
          position={suggestionPosition}
          currentText={text}
        />
      )}
    </div>
  );
};
