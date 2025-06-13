import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuggestionsList } from './SuggestionsList';
import { useLocalProcessor } from '@/hooks/useLocalProcessor';
import { useLLMProcessor } from '@/hooks/useLLMProcessor';
import { useSuggestions } from '@/hooks/useSuggestions';
import { CheckCircle, Wand2, Zap } from 'lucide-react';

export const WritingEditor = () => {
  const [text, setText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    processText: processLocal, 
    isProcessing: isLocalProcessing, 
    isSpellCheckerReady,
    applySuggestion: applyLocalSuggestion
  } = useLocalProcessor();
  const { processText: processLLM, isProcessing: isLLMProcessing, hasApiKey } = useLLMProcessor();
  const { clearSuggestions } = useSuggestions();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleTextSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    try {
      const target = e.target as HTMLTextAreaElement;
      const selected = target.value.substring(target.selectionStart, target.selectionEnd);
      setSelectedText(selected);
      setSelectionStart(target.selectionStart);
      setSelectionEnd(target.selectionEnd);
      
      // Auto-analyze selection if text is selected and longer than 2 characters
      if (selected.trim().length > 2) {
        setShowSuggestions(true);
        // Use requestAnimationFrame to avoid blocking
        requestAnimationFrame(() => {
          processLocal(selected).catch(() => {});
          if (hasApiKey) {
            processLLM(selected).catch(() => {});
          }
        });
      } else {
        // Clear suggestions if no meaningful selection
        clearSuggestions();
        setShowSuggestions(false);
      }
    } catch (error) {
      // Prevent errors from bubbling up
      console.log('Selection error handled');
    }
  }, [processLocal, processLLM, hasApiKey, clearSuggestions]);

  const analyzeText = useCallback(() => {
    if (!text.trim()) return;
    setShowSuggestions(true);
    
    // Use requestAnimationFrame to avoid blocking
    requestAnimationFrame(() => {
      processLocal(text).catch(() => {});
      if (hasApiKey) {
        processLLM(text).catch(() => {});
      }
    });
  }, [text, processLocal, processLLM, hasApiKey]);

  const applySuggestion = (suggestion: any) => {
    if (selectedText && selectionStart !== selectionEnd) {
      // Apply suggestion to selected text using position-based replacement
      const correctedText = applyLocalSuggestion(selectedText, suggestion);
      const newText = text.substring(0, selectionStart) + correctedText + text.substring(selectionEnd);
      setText(newText);
      
      // Update selection to highlight the changed text
      const newSelectionEnd = selectionStart + correctedText.length;
      setSelectionStart(selectionStart);
      setSelectionEnd(newSelectionEnd);
      setSelectedText(correctedText);
      
      // Focus and update selection in textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selectionStart, newSelectionEnd);
        }
      }, 0);
    } else {
      // Apply suggestion to full text
      const correctedText = applyLocalSuggestion(text, suggestion);
      setText(correctedText);
      setSelectedText('');
    }
    
    // Clear suggestions after applying
    clearSuggestions();
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Write & Improve</span>
            <div className="flex gap-2">
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
          <Textarea
            id="writing-textarea"
            name="writing-textarea"
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onSelect={handleTextSelect}
            placeholder="Start typing or paste your text here..."
            className="min-h-[300px] text-lg leading-relaxed"
            aria-label="Writing editor"
            autoComplete="off"
            spellCheck="false"
          />
          
          {selectedText && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
              💡 Selected: "{selectedText}" - Suggestions will appear below automatically
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              onClick={analyzeText}
              disabled={!text.trim() || isLocalProcessing || isLLMProcessing}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Analyze Full Text
            </Button>
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

      {showSuggestions && (
        <SuggestionsList onApplySuggestion={applySuggestion} />
      )}
    </div>
  );
};
