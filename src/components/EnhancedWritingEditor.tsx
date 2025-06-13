
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InlineSuggestions } from './InlineSuggestions';
import { useSentenceAnalyzer } from '@/hooks/useSentenceAnalyzer';
import { Sparkles, Zap } from 'lucide-react';

export const EnhancedWritingEditor = () => {
  const [text, setText] = useState('');
  const [showSuggestion, setShowSuggestion] = useState<number | null>(null);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { analyses, analyzeSentences, clearAnalyses } = useSentenceAnalyzer();

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Debounce analysis
    const timeoutId = setTimeout(() => {
      if (newText.trim()) {
        analyzeSentences(newText);
      } else {
        clearAnalyses();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [analyzeSentences, clearAnalyses]);

  const handleIconClick = useCallback((analysisKey: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (showSuggestion === analysisKey) {
      setShowSuggestion(null);
      return;
    }
    
    // Calculate position for the suggestion popup
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
    
    setSuggestionPosition({
      top: rect.top - containerRect.top - 10,
      left: rect.left - containerRect.left
    });
    
    setShowSuggestion(analysisKey);
  }, [showSuggestion]);

  const handleSuggestionSelect = useCallback((selectedText: string) => {
    if (showSuggestion === null) return;
    
    const analysis = analyses.get(showSuggestion);
    if (!analysis) return;
    
    // Replace the original sentence with the selected suggestion
    const newText = text.replace(analysis.original, selectedText);
    setText(newText);
    
    setShowSuggestion(null);
    
    // Reanalyze after change
    setTimeout(() => {
      analyzeSentences(newText);
    }, 100);
  }, [showSuggestion, analyses, text, analyzeSentences]);

  const handleSuggestionDismiss = useCallback(() => {
    setShowSuggestion(null);
  }, []);

  const renderTextWithIcons = () => {
    if (!text || analyses.size === 0) {
      return null;
    }

    const icons = Array.from(analyses.entries()).map(([key, analysis]) => {
      // Calculate approximate position of the icon
      const beforeText = text.substring(0, analysis.position);
      const lines = beforeText.split('\n');
      const lineNumber = lines.length - 1;
      const charInLine = lines[lines.length - 1].length;
      
      return (
        <span
          key={key}
          className="absolute cursor-pointer text-blue-500 hover:text-blue-700 ml-1"
          style={{
            top: `${lineNumber * 1.5 + 0.5}rem`,
            left: `${charInLine * 0.6 + 0.5}rem`,
            zIndex: 10
          }}
          onClick={(e) => handleIconClick(key, e)}
        >
          <Sparkles className="h-4 w-4" />
        </span>
      );
    });

    return icons;
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enhanced Writing Assistant</span>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              Smart Suggestions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Start typing... Smart suggestions will appear as you write!"
              className="min-h-[300px] text-lg leading-relaxed pr-8"
            />
            {renderTextWithIcons()}
          </div>
          
          <div className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Look for the ✨ icons at the end of sentences - click them to see formal and casual versions!
          </div>
        </CardContent>
      </Card>

      {showSuggestion !== null && analyses.has(showSuggestion) && (
        <InlineSuggestions
          suggestions={analyses.get(showSuggestion)!.suggestions}
          onSelect={handleSuggestionSelect}
          onDismiss={handleSuggestionDismiss}
          position={suggestionPosition}
        />
      )}
    </div>
  );
};
