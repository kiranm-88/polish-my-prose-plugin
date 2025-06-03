
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Zap, Wand2, CheckCircle } from 'lucide-react';

interface SuggestionsListProps {
  onApplySuggestion: (suggestion: string) => void;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ onApplySuggestion }) => {
  const { localSuggestions, llmSuggestions, isLoading } = useSuggestions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Analyzing your text...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {localSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-500" />
              Quick Fixes
              <Badge variant="secondary" className="text-xs">Local Processing</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-blue-800 mb-1">{suggestion.type}</p>
                    <p className="text-gray-700 mb-2">{suggestion.text}</p>
                    {suggestion.explanation && (
                      <p className="text-sm text-gray-600">{suggestion.explanation}</p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onApplySuggestion(suggestion.text)}
                    className="ml-3"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {llmSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="h-5 w-5 text-purple-500" />
              AI Enhancements
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {llmSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 bg-purple-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-purple-800 mb-1">{suggestion.type}</p>
                    <p className="text-gray-700 mb-2">{suggestion.text}</p>
                    {suggestion.explanation && (
                      <p className="text-sm text-gray-600">{suggestion.explanation}</p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onApplySuggestion(suggestion.text)}
                    className="ml-3"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {localSuggestions.length === 0 && llmSuggestions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-lg font-medium">Looking good!</p>
              <p>No immediate improvements needed for this text.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
