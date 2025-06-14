
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface EditorTextareaProps {
  text: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const EditorTextarea = ({ text, onChange, textareaRef }: EditorTextareaProps) => {
  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={onChange}
        placeholder="Start typing your text here... Click the ✨ icon to get writing suggestions!"
        className="min-h-[300px] text-lg leading-relaxed"
        spellCheck="false"
      />
    </div>
  );
};
