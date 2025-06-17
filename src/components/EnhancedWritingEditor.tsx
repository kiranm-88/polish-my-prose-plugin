
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorHeader } from './EditorHeader';
import { EditorTextarea } from './EditorTextarea';
import { EditorInstructions } from './EditorInstructions';
import { InlineSuggestions } from './InlineSuggestions';
import { useSentenceAnalyzer } from '@/hooks/useSentenceAnalyzer';
import { useLocalProcessor } from '@/hooks/useLocalProcessor';
import { useLLMProcessor } from '@/hooks/useLLMProcessor';
import { useSuggestions } from '@/hooks/useSuggestions';

export const EnhancedWritingEditor = () => {
  const [text, setText] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sparkleButtonRef = useRef<HTMLButtonElement>(null);
  
  const { analysis, analyzeWholeText, clearAnalyses, rejectCorrection } = useSentenceAnalyzer();
  const { 
    processText: processLocal, 
    isSpellCheckerReady,
    applySuggestion: applyLocalSuggestion
  } = useLocalProcessor();
  const { processText: processLLM, hasApiKey } = useLLMProcessor();
  const { localSuggestions, clearSuggestions } = useSuggestions();

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Clear previous analyses when text changes
    clearAnalyses();
    clearSuggestions();
    setShowSuggestion(false);
  }, [clearAnalyses, clearSuggestions]);

  const handleSparkleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    if (text.trim().length <= 10) {
      return;
    }
    
    // Process the whole text for both style suggestions and error corrections
    analyzeWholeText(text);
    processLocal(text);
    if (hasApiKey) {
      processLLM(text);
    }
    
    // Calculate position for the suggestion popup relative to the sparkle button
    const rect = sparkleButtonRef.current?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (rect && containerRect) {
      setSuggestionPosition({
        top: rect.bottom - containerRect.top + 5,
        left: rect.left - containerRect.left - 100 // Offset to center better
      });
    }
    
    setShowSuggestion(true);
  }, [text, analyzeWholeText, processLocal, processLLM, hasApiKey]);

  const handleSuggestionSelect = useCallback((selectedText: string) => {
    setText(selectedText);
    setShowSuggestion(false);
  }, []);

  const handleSuggestionDismiss = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  // Show sparkle button when there's enough text
  const showSparkleButton = text.trim().length > 10;

  return (
    <div className="space-y-4" ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle>
            <EditorHeader
              showSparkleButton={showSparkleButton}
              onSparkleClick={handleSparkleClick}
              sparkleButtonRef={sparkleButtonRef}
              isSpellCheckerReady={isSpellCheckerReady}
              hasApiKey={hasApiKey}
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
            isSpellCheckerReady={isSpellCheckerReady}
          />
        </CardContent>
      </Card>

      {showSuggestion && (analysis || localSuggestions.length > 0) && (
        <InlineSuggestions
          suggestions={analysis?.suggestions}
          localSuggestions={localSuggestions}
          onSelect={handleSuggestionSelect}
          onDismiss={handleSuggestionDismiss}
          onRejectCorrection={rejectCorrection}
          position={suggestionPosition}
          currentText={text}
        />
      )}
    </div>
  );
};
