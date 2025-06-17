
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Correction {
  original: string;
  corrected: string;
  startIndex: number;
  endIndex: number;
}

interface CorrectionsHighlightProps {
  text: string;
  corrections: Correction[];
  onRejectCorrection: (correction: Correction) => void;
}

export const CorrectionsHighlight = ({ 
  text, 
  corrections, 
  onRejectCorrection 
}: CorrectionsHighlightProps) => {
  const [hoveredCorrection, setHoveredCorrection] = useState<number | null>(null);

  // Create segments of text with corrections highlighted
  const createHighlightedText = () => {
    if (corrections.length === 0) {
      return [{ type: 'text', content: text }];
    }

    const segments = [];
    let lastIndex = 0;

    // Sort corrections by start index
    const sortedCorrections = [...corrections].sort((a, b) => a.startIndex - b.startIndex);

    sortedCorrections.forEach((correction, index) => {
      // Add text before correction
      if (correction.startIndex > lastIndex) {
        segments.push({
          type: 'text',
          content: text.substring(lastIndex, correction.startIndex)
        });
      }

      // Add correction segment
      segments.push({
        type: 'correction',
        content: correction.corrected,
        correction,
        index
      });

      lastIndex = correction.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return segments;
  };

  const segments = createHighlightedText();

  return (
    <div className="relative">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        }

        return (
          <span
            key={index}
            className="relative inline-block bg-yellow-200 px-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredCorrection(segment.index)}
            onMouseLeave={() => setHoveredCorrection(null)}
          >
            {segment.content}
            {hoveredCorrection === segment.index && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onRejectCorrection(segment.correction);
                }}
              >
                <X className="h-3 w-3 text-gray-600" />
              </Button>
            )}
          </span>
        );
      })}
    </div>
  );
};
