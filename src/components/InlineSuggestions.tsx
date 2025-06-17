
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CorrectionsHighlight } from './CorrectionsHighlight';

interface SuggestionOptions {
  formal: string;
  casual: string;
}

interface InlineSuggestionsProps {
  suggestions?: SuggestionOptions;
  onSelect: (selectedText: string) => void;
  onDismiss: () => void;
  onRejectCorrection?: (original: string, suggestion: string) => void;
  position: { top: number; left: number };
  currentText: string;
}

export const InlineSuggestions = ({ 
  suggestions, 
  onSelect, 
  onDismiss, 
  onRejectCorrection,
  position,
  currentText
}: InlineSuggestionsProps) => {
  const handleRejectCorrection = (correction: {original: string, corrected: string}) => {
    if (onRejectCorrection) {
      onRejectCorrection(correction.original, correction.corrected);
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

          {!suggestions && (
            <div className="text-sm text-muted-foreground text-center py-2">
              💡 Try adding more text to get style suggestions
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
