
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface SuggestionOptions {
  formal: string;
  casual: string;
}

interface InlineSuggestionsProps {
  suggestions: SuggestionOptions;
  onSelect: (selectedText: string) => void;
  onDismiss: () => void;
  position: { top: number; left: number };
}

export const InlineSuggestions = ({ suggestions, onSelect, onDismiss, position }: InlineSuggestionsProps) => {
  return (
    <Card 
      className="absolute z-50 p-3 shadow-lg border bg-background min-w-[300px]"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Polish your sentence</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full text-left justify-start p-2 h-auto"
            onClick={() => onSelect(suggestions.formal)}
          >
            <div>
              <div className="font-medium text-xs text-blue-600 mb-1">✨ Formal</div>
              <div className="text-sm">{suggestions.formal}</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full text-left justify-start p-2 h-auto"
            onClick={() => onSelect(suggestions.casual)}
          >
            <div>
              <div className="font-medium text-xs text-green-600 mb-1">💬 Casual</div>
              <div className="text-sm">{suggestions.casual}</div>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
};
