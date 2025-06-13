
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle } from 'lucide-react';

interface SuggestionOptions {
  formal: string;
  casual: string;
}

interface LocalSuggestion {
  type: string;
  text: string;
  explanation: string;
  originalWord?: string;
  suggestion?: string;
  context?: string;
}

interface InlineSuggestionsProps {
  suggestions?: SuggestionOptions;
  localSuggestions?: LocalSuggestion[];
  onSelect: (selectedText: string) => void;
  onDismiss: () => void;
  onApplyCorrection?: (originalText: string, suggestion: LocalSuggestion) => string;
  position: { top: number; left: number };
  currentText: string;
}

export const InlineSuggestions = ({ 
  suggestions, 
  localSuggestions = [], 
  onSelect, 
  onDismiss, 
  onApplyCorrection,
  position,
  currentText
}: InlineSuggestionsProps) => {
  const handleCorrectionApply = (suggestion: LocalSuggestion) => {
    if (onApplyCorrection) {
      const correctedText = onApplyCorrection(currentText, suggestion);
      onSelect(correctedText);
    }
  };

  return (
    <Card 
      className="fixed z-50 shadow-xl border bg-background max-w-md"
      style={{ 
        top: position.top, 
        left: Math.max(10, Math.min(position.left, window.innerWidth - 400))
      }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Polish your text</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Local corrections (spell check, grammar) */}
          {localSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-red-600 flex items-center gap-1">
                🔧 Corrections
              </div>
              {localSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="space-y-2">
                  <div className="p-3 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{suggestion.type}</Badge>
                    </div>
                    <p className="text-sm text-red-800 font-medium mb-1">{suggestion.explanation}</p>
                    {suggestion.originalWord && suggestion.suggestion && (
                      <p className="text-sm">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                          {suggestion.originalWord}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {suggestion.suggestion}
                        </span>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleCorrectionApply(suggestion)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Apply Fix
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Style suggestions */}
          {suggestions && (
            <>
              <div className="space-y-2">
                <div className="text-xs font-medium text-blue-600 flex items-center gap-1">
                  ✨ Formal Style
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed border border-muted">
                  {suggestions.formal}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onSelect(suggestions.formal)}
                >
                  Use Formal Version
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                  💬 Casual Style
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed border border-muted">
                  {suggestions.casual}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onSelect(suggestions.casual)}
                >
                  Use Casual Version
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
