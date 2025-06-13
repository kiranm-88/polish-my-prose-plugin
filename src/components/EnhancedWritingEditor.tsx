
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InlineSuggestions } from './InlineSuggestions';
import { SuggestionsList } from './SuggestionsList';
import { useSentenceAnalyzer } from '@/hooks/useSentenceAnalyzer';
import { useLocalProcessor } from '@/hooks/useLocalProcessor';
import { useLLMProcessor } from '@/hooks/useLLMProcessor';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Sparkles, Zap, Wand2 } from 'lucide-react';

export const EnhancedWritingEditor = () => {
  const [text, setText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showErrorSuggestions, setShowErrorSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sparkleButtonRef = useRef<HTMLButtonElement>(null);
  
  const { analysis, analyzeWholeText, clearAnalyses } = useSentenceAnalyzer();
  const { 
    processText: processLocal, 
    isProcessing: isLocalProcessing, 
    isSpellCheckerReady,
    applySuggestion: applyLocalSuggestion
  } = useLocalProcessor();
  const { processText: processLLM, isProcessing: isLLMProcessing, hasApiKey } = useLLMProcessor();
  const { clearSuggestions } = useSuggestions();

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Clear previous analyses when text changes
    clearAnalyses();
    clearSuggestions();
    setShowErrorSuggestions(false);
  }, [clearAnalyses, clearSuggestions]);

  const handleTextSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    try {
      const target = e.target as HTMLTextAreaElement;
      if (!target) return;
      
      const selected = target.value.substring(target.selectionStart, target.selectionEnd);
      setSelectedText(selected);
      setSelectionStart(target.selectionStart);
      setSelectionEnd(target.selectionEnd);
      
      if (selected.trim().length > 2) {
        setShowErrorSuggestions(true);
        processLocal(selected);
        if (hasApiKey) {
          processLLM(selected);
        }
      } else {
        clearSuggestions();
        setShowErrorSuggestions(false);
      }
    } catch (error) {
      console.error('Text selection error:', error);
    }
  }, [processLocal, processLLM, hasApiKey, clearSuggestions]);

  const handleSparkleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    if (showSuggestion) {
      setShowSuggestion(false);
      return;
    }
    
    // Generate analysis immediately when sparkle is clicked
    if (text.trim().length > 10) {
      analyzeWholeText(text);
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
  }, [showSuggestion, text, analyzeWholeText]);

  const handleSuggestionSelect = useCallback((selectedText: string) => {
    setText(selectedText);
    setShowSuggestion(false);
  }, []);

  const handleSuggestionDismiss = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  const applySuggestion = (suggestion: any) => {
    if (selectedText && selectionStart !== selectionEnd) {
      const correctedText = applyLocalSuggestion(selectedText, suggestion);
      const newText = text.substring(0, selectionStart) + correctedText + text.substring(selectionEnd);
      setText(newText);
      
      const newSelectionEnd = selectionStart + correctedText.length;
      setSelectionStart(selectionStart);
      setSelectionEnd(newSelectionEnd);
      setSelectedText(correctedText);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selectionStart, newSelectionEnd);
        }
      }, 0);
    } else {
      const correctedText = applyLocalSuggestion(text, suggestion);
      setText(correctedText);
      setSelectedText('');
    }
    
    clearSuggestions();
    setShowErrorSuggestions(false);
  };

  // Show sparkle button when there's enough text, regardless of analysis state
  const showSparkleButton = text.trim().length > 10;

  return (
    <div className="space-y-4" ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Writing Assistant</span>
            <div className="flex items-center gap-2">
              {showSparkleButton && (
                <Button
                  ref={sparkleButtonRef}
                  variant="ghost"
                  size="sm"
                  onClick={handleSparkleClick}
                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  title="Polish your text - get formal/casual variations"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                Smart Corrections
                {isSpellCheckerReady ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-yellow-600">⚠</span>
                )}
              </Badge>
              {hasApiKey && (
                <Badge variant="outline" className="gap-1">
                  <Wand2 className="h-3 w-3 text-purple-500" />
                  AI-Enhanced
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onSelect={handleTextSelect}
              placeholder="Start typing your text here... Select any text to get instant grammar and spelling suggestions!"
              className="min-h-[300px] text-lg leading-relaxed"
              spellCheck="false"
            />
          </div>
          
          {selectedText && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
              ✨ Selected: "{selectedText}" - Smart suggestions will appear below
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            💡 <strong>How to use:</strong>
            <br />• Select any text to get instant grammar and spelling corrections
            <br />• Click the ✨ icon to get formal/casual style variations for your entire text
          </div>

          {!hasApiKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 Add your OpenAI API key in Settings to unlock advanced AI-powered suggestions
              </p>
            </div>
          )}

          {!isSpellCheckerReady && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📚 Loading spell checker dictionary... Some spelling features may be limited.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showSuggestion && analysis && (
        <InlineSuggestions
          suggestions={analysis.suggestions}
          onSelect={handleSuggestionSelect}
          onDismiss={handleSuggestionDismiss}
          position={suggestionPosition}
        />
      )}

      {showErrorSuggestions && (
        <SuggestionsList onApplySuggestion={applySuggestion} />
      )}
    </div>
  );
};
