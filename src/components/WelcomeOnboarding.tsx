
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, FileText, Zap, Wand2, Shield, CheckCircle } from 'lucide-react';

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Writing Assistant",
      icon: <FileText className="h-12 w-12 text-blue-600" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            Improve your writing with intelligent suggestions across any platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium">Instant Fixes</h3>
              <p className="text-sm text-gray-600">Grammar, spelling, and style corrections</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Wand2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium">AI Enhancement</h3>
              <p className="text-sm text-gray-600">Advanced rewriting and tone adjustments</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium">Privacy First</h3>
              <p className="text-sm text-gray-600">Your data stays secure and private</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Two Types of Processing",
      icon: <Zap className="h-12 w-12 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <Zap className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">Local Processing</h3>
                <Badge variant="outline" className="text-xs">Always Available</Badge>
              </div>
              <p className="text-sm text-gray-700">
                Basic grammar, spelling, and common style issues are fixed instantly without needing an internet connection or API key.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
            <Wand2 className="h-6 w-6 text-purple-500 mt-1" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">AI-Powered Processing</h3>
                <Badge variant="outline" className="text-xs">Requires API Key</Badge>
              </div>
              <p className="text-sm text-gray-700">
                Advanced features like tone adjustment, restructuring, and creative rewriting using OpenAI's language models.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Visual Indicators",
      icon: <CheckCircle className="h-12 w-12 text-green-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">You'll always know which type of processing is being used:</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                Local Processing
              </Badge>
              <span className="text-sm text-gray-600">Fast, offline suggestions</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="gap-1">
                <Wand2 className="h-3 w-3 text-purple-500" />
                AI-Powered
              </Badge>
              <span className="text-sm text-gray-600">Advanced AI suggestions</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-800">
              💡 You can add your OpenAI API key later in Settings to unlock AI features
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button onClick={nextStep} className="gap-2">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
