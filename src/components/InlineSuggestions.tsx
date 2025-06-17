
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CorrectionsHighlight } from './CorrectionsHighlight';

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
  onRejectCorrection?: (original: string, suggestion: string) => void;
  position: { top: number; left: number };
  currentText: string;
}

export const InlineSuggestions = ({ 
  suggestions, 
  localSuggestions = [], 
  onSelect, 
  onDismiss, 
  onRejectCorrection,
  position,
  currentText
}: InlineSuggestionsProps) => {
  // Apply corrections to the suggestion text and track what was corrected
  const applyCorrectionsToText = (text: string) => {
    let correctedText = text;
    const corrections: Array<{original: string, corrected: string, startIndex: number, endIndex: number}> = [];
    
    localSuggestions.forEach(suggestion => {
      if (suggestion.originalWord && suggestion.suggestion) {
        const regex = new RegExp(`\\b${suggestion.originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match;
        while ((match = regex.exec(correctedText)) !== null) {
          corrections.push({
            original: suggestion.originalWord,
            corrected: suggestion.suggestion,
            startIndex: match.index,
            endIndex: match.index + match[0].length
          });
          correctedText = correctedText.replace(match[0], suggestion.suggestion);
        }
      }
    });
    
    return { correctedText, corrections };
  };

  const handleRejectCorrection = (correction: {original: string, corrected: string}) => {
    if (onRejectCorrection) {
      onRejectCorrection(correction.original, correction.corrected);
    }
  };

  // Process suggestions with corrections applied
  const processedSuggestions = suggestions ? {
    formal: applyCorrectionsToText(suggestions.formal),
    casual: applyCorrectionsToText(suggestions.casual)
  } : null;

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
          {processedSuggestions && (
            <>
              <div className="space-y-2">
                <div className="text-xs font-medium text-blue-600 flex items-center gap-1">
                  ✨ Formal Style
                  {processedSuggestions.formal.corrections.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({processedSuggestions.formal.corrections.length} correction{processedSuggestions.formal.corrections.length > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed border border-muted">
                  <CorrectionsHighlight
                    text={processedSuggestions.formal.correctedText}
                    corrections={processedSuggestions.formal.corrections}
                    onRejectCorrection={handleRejectCorrection}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onSelect(processedSuggestions.formal.correctedText)}
                >
                  Use Formal Version
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                  💬 Casual Style
                  {processedSuggestions.casual.corrections.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({processedSuggestions.casual.corrections.length} correction{processedSuggestions.casual.corrections.length > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed border border-muted">
                  <CorrectionsHighlight
                    text={processedSuggestions.casual.correctedText}
                    corrections={processedSuggestions.casual.corrections}
                    onRejectCorrection={handleRejectCorrection}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onSelect(processedSuggestions.casual.correctedText)}
                >
                  Use Casual Version
                </Button>
              </div>
            </>
          )}

          {(!processedSuggestions || (!processedSuggestions.formal.correctedText && !processedSuggestions.casual.correctedText)) && localSuggestions.length > 0 && (
            <div className="text-sm text-muted-foreground text-center py-2">
              💡 Try adding more text to get style suggestions with corrections applied
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
