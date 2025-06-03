
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Key, Shield, Info } from 'lucide-react';

export const SettingsPanel = () => {
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const savedKey = localStorage.getItem('writing-assistant-api-key');
    const savedRemember = localStorage.getItem('writing-assistant-remember-key') === 'true';
    
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeyValid(true);
    }
    setRememberKey(savedRemember);
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    if (rememberKey) {
      localStorage.setItem('writing-assistant-api-key', apiKey);
      localStorage.setItem('writing-assistant-remember-key', 'true');
    } else {
      localStorage.removeItem('writing-assistant-api-key');
      localStorage.setItem('writing-assistant-remember-key', 'false');
    }

    setIsKeyValid(true);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved successfully"
    });
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setIsKeyValid(false);
    localStorage.removeItem('writing-assistant-api-key');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">API Key Status</Label>
            <Badge variant={isKeyValid ? "default" : "secondary"}>
              {isKeyValid ? "Connected" : "Not Set"}
            </Badge>
          </div>

          <div className="space-y-3">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              OpenAI API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="remember-key"
              checked={rememberKey}
              onCheckedChange={setRememberKey}
            />
            <Label htmlFor="remember-key" className="text-sm">
              Remember API key
            </Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveApiKey} size="sm" className="flex-1">
              Save Key
            </Button>
            {isKeyValid && (
              <Button 
                onClick={handleClearApiKey} 
                size="sm" 
                variant="outline"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                <strong>Local Processing:</strong> Grammar, spelling, and basic style fixes work without an API key.
              </p>
              <p>
                <strong>AI Features:</strong> Advanced rewriting and tone adjustments require an OpenAI API key.
              </p>
              <p>
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
