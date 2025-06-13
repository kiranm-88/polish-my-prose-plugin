
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Zap, Wand2, CheckCircle, Shield, AlertTriangle } from 'lucide-react';

interface SuggestionsListProps {
  onApplySuggestion: (suggestion: any) => void;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ onApplySuggestion }) => {
  const { localSuggestions, llmSuggestions, isLoading } = useSuggestions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Analyzing and verifying suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceIcon = (suggestion: any) => {
    if (suggestion.verified) {
      return <Shield className="h-3 w-3 text-green-600" />;
    }
    if (suggestion.confidence === 'high') {
      return <CheckCircle className="h-3 w-3 text-blue-600" />;
    }
    if (suggestion.confidence === 'low') {
      return <AlertTriangle className="h-3 w-3 text-orange-600" />;
    }
    return null;
  };

  const getConfidenceBadge = (suggestion: any) => {
    if (suggestion.verified) {
      return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">AI Verified</Badge>;
    }
    if (suggestion.confidence) {
      const colors = {
        high: 'bg-blue-50 text-blue-700 border-blue-200',
        medium: 'bg-gray-50 text-gray-700 border-gray-200',
        low: 'bg-orange-50 text-orange-700 border-orange-200'
      };
      return <Badge variant="outline" className={`text-xs ${colors[suggestion.confidence]}`}>
        {suggestion.confidence} confidence
      </Badge>;
    }
    return null;
  };

  // Filter out error suggestions from LLM
  const validLLMSuggestions = llmSuggestions.filter(suggestion => 
    suggestion.type !== 'Error' && suggestion.text && suggestion.explanation
  );

  return (
    <div className="space-y-4">
      {localSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-500" />
              Smart Corrections
              <Badge variant="secondary" className="text-xs">AI Enhanced</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{suggestion.type}</Badge>
                      {getConfidenceBadge(suggestion)}
                      <div className="flex items-center gap-1">
                        {getConfidenceIcon(suggestion)}
                        <p className="font-medium text-sm text-blue-800">{suggestion.explanation}</p>
                      </div>
                    </div>
                    
                    {suggestion.context && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Context:</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border font-mono">
                          {suggestion.context}
                        </p>
                      </div>
                    )}
                    
                    {suggestion.originalWord && suggestion.suggestion && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Change:</p>
                        <p className="text-sm">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            {suggestion.originalWord}
                          </span>
                          <span className="mx-2">→</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {suggestion.suggestion}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onApplySuggestion(suggestion)}
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

      {validLLMSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="h-5 w-5 text-purple-500" />
              AI Enhancements
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validLLMSuggestions.map((suggestion, index) => (
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
                    onClick={() => onApplySuggestion(suggestion)}
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

      {localSuggestions.length === 0 && validLLMSuggestions.length === 0 && (
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
