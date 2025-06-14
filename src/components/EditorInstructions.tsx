
import React from 'react';

interface EditorInstructionsProps {
  hasApiKey: boolean;
  isSpellCheckerReady: boolean;
}

export const EditorInstructions = ({ hasApiKey, isSpellCheckerReady }: EditorInstructionsProps) => {
  return (
    <>
      <div className="text-sm text-muted-foreground">
        💡 <strong>How to use:</strong>
        <br />• Type your text in the editor above
        <br />• Click the ✨ icon to get grammar corrections, spell check, and style variations (formal/casual)
      </div>

      {!hasApiKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            💡 Add your OpenAI API key in Settings to unlock advanced AI-powered suggestions
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
    </>
  );
};
