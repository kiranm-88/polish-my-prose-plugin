
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
import { Sparkles, Zap, Wand2, CheckCircle } from 'lucide-react';

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
    
    // Debounce analysis for style suggestions
    const timeoutId = setTimeout(() => {
      if (newText.trim().length > 10) {
        analyzeWholeText(newText);
      } else {
        clearAnalyses();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [analyzeWholeText, clearAnalyses]);

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

  const analyzeFullText = useCallback(() => {
    if (!text.trim()) return;
    setShowErrorSuggestions(true);
    
    processLocal(text);
    if (hasApiKey) {
      processLLM(text);
    }
  }, [text, processLocal, processLLM, hasApiKey]);

  const handleSparkleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    if (showSuggestion) {
      setShowSuggestion(false);
      return;
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
  }, [showSuggestion]);

  const handleSuggestionSelect = useCallback((selectedText: string) => {
    setText(selectedText);
    setShowSuggestion(false);
    
    // Reanalyze after change
    setTimeout(() => {
      analyzeWholeText(selectedText);
    }, 100);
  }, [analyzeWholeText]);

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

  return (
    <div className="space-y-4" ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enhanced Writing Assistant</span>
            <div className="flex items-center gap-2">
              {analysis && (
                <Button
                  ref={sparkleButtonRef}
                  variant="ghost"
                  size="sm"
                  onClick={handleSparkleClick}
                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                Local Processing
                {isSpellCheckerReady ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-yellow-600">⚠</span>
                )}
              </Badge>
              {hasApiKey && (
                <Badge variant="outline" className="gap-1">
                  <Wand2 className="h-3 w-3 text-purple-500" />
                  AI-Powered
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
              placeholder="Start typing... Smart suggestions will appear when you have enough text!"
              className="min-h-[300px] text-lg leading-relaxed"
              spellCheck="false"
            />
          </div>
          
          {selectedText && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
              💡 Selected: "{selectedText}" - Error corrections will appear below automatically
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              onClick={analyzeFullText}
              disabled={!text.trim() || isLocalProcessing || isLLMProcessing}
              className="gap-2"
              type="button"
            >
              <CheckCircle className="h-4 w-4" />
              Check for Errors
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            💡 <strong>Tips:</strong>
            <br />• Click the ✨ icon for formal/casual style variations
            <br />• Select text or click "Check for Errors" for grammar and spelling corrections
          </div>

          {!hasApiKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 Add your API key in Settings to unlock advanced AI-powered suggestions
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
