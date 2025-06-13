
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InlineSuggestions } from './InlineSuggestions';
import { useSentenceAnalyzer } from '@/hooks/useSentenceAnalyzer';
import { Sparkles, Zap } from 'lucide-react';

export const EnhancedWritingEditor = () => {
  const [text, setText] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sparkleButtonRef = useRef<HTMLButtonElement>(null);
  
  const { analysis, analyzeWholeText, clearAnalyses } = useSentenceAnalyzer();

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Debounce analysis
    const timeoutId = setTimeout(() => {
      if (newText.trim().length > 10) {
        analyzeWholeText(newText);
      } else {
        clearAnalyses();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [analyzeWholeText, clearAnalyses]);

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
                Smart Suggestions
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Start typing... Smart suggestions will appear when you have enough text!"
              className="min-h-[300px] text-lg leading-relaxed"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Look for the ✨ icon in the header - click it to see formal and casual versions of your text!
          </div>
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
    </div>
  );
};
