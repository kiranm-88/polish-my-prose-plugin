
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Wand2 } from 'lucide-react';

interface EditorHeaderProps {
  showSparkleButton: boolean;
  onSparkleClick: (event: React.MouseEvent) => void;
  sparkleButtonRef: React.RefObject<HTMLButtonElement>;
  isSpellCheckerReady: boolean;
  hasApiKey: boolean;
}

export const EditorHeader = ({
  showSparkleButton,
  onSparkleClick,
  sparkleButtonRef,
  isSpellCheckerReady,
  hasApiKey
}: EditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <span>Writing Assistant</span>
      <div className="flex items-center gap-2">
        {showSparkleButton && (
          <Button
            ref={sparkleButtonRef}
            variant="ghost"
            size="sm"
            onClick={onSparkleClick}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            title="Get writing suggestions - corrections and style variations"
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
    </div>
  );
};
