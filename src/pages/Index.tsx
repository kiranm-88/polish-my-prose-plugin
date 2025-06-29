
import React, { useState } from 'react';
import { EnhancedWritingEditor } from '@/components/EnhancedWritingEditor';
import { SettingsPanel } from '@/components/SettingsPanel';
import { WelcomeOnboarding } from '@/components/WelcomeOnboarding';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Settings, FileText } from 'lucide-react';

const Index = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('writing-assistant-onboarded');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('writing-assistant-onboarded', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <WelcomeOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Writing Assistant</h1>
          </div>
          
          {/* Mobile/Tablet Settings - Sheet */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SettingsPanel />
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Settings - Toggle Button */}
          <div className="hidden lg:block">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={showSettings ? "lg:col-span-3" : "lg:col-span-4"}>
            <EnhancedWritingEditor />
          </div>
          
          {/* Desktop Settings Panel */}
          {showSettings && (
            <div className="hidden lg:block lg:col-span-1">
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
