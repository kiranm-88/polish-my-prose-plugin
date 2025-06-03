import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuggestionsList } from './SuggestionsList';
import { useLocalProcessor } from '@/hooks/useLocalProcessor';
import { useLLMProcessor } from '@/hooks/useLLMProcessor';
import { CheckCircle, Wand2, Zap } from 'lucide-react';

export const WritingEditor = () => {
  const [text, setText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { 
    processText: processLocal, 
    isProcessing: isLocalProcessing, 
    isSpellCheckerReady,
    applySuggestion: applyLocalSuggestion
  } = useLocalProcessor();
  const { processText: processLLM, isProcessing: isLLMProcessing, hasApiKey } = useLLMProcessor();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selected = target.value.substring(target.selectionStart, target.selectionEnd);
    setSelectedText(selected);
  };

  const analyzeText = useCallback(async () => {
    if (!text.trim()) return;
    setShowSuggestions(true);
    
    // Always run local processing
    await processLocal(text);
    
    // Run LLM processing if API key is available
    if (hasApiKey) {
      await processLLM(text);
    }
  }, [text, processLocal, processLLM, hasApiKey]);

  const analyzeSelection = useCallback(async () => {
    if (!selectedText.trim()) return;
    setShowSuggestions(true);
    
    await processLocal(selectedText);
    if (hasApiKey) {
      await processLLM(selectedText);
    }
  }, [selectedText, processLocal, processLLM, hasApiKey]);

  const applySuggestion = (suggestion: any) => {
    const currentText = selectedText || text;
    const correctedText = applyLocalSuggestion(currentText, suggestion);
    
    if (selectedText) {
      setText(text.replace(selectedText, correctedText));
      setSelectedText('');
    } else {
      setText(correctedText);
    }
  };

  return (
    <div className="space-y-6">
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
            value={text}
            onChange={handleTextChange}
            onSelect={handleTextSelect}
            placeholder="Start typing or paste your text here..."
            className="min-h-[300px] text-lg leading-relaxed"
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={analyzeText}
              disabled={!text.trim() || isLocalProcessing || isLLMProcessing}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Analyze Full Text
            </Button>
            
            {selectedText && (
              <Button 
                variant="outline"
                onClick={analyzeSelection}
                disabled={isLocalProcessing || isLLMProcessing}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Improve Selection
              </Button>
            )}
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
