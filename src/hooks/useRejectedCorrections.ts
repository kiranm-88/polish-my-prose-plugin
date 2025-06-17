
import { useState, useCallback } from 'react';

interface RejectedCorrection {
  original: string;
  text: string;
  timestamp: number;
}

export const useRejectedCorrections = () => {
  const [rejectedCorrections, setRejectedCorrections] = useState<RejectedCorrection[]>([]);

  const rejectCorrection = useCallback((original: string, text: string) => {
    const rejection = {
      original,
      text,
      timestamp: Date.now()
    };
    
    setRejectedCorrections(prev => [...prev, rejection]);
  }, []);

  const isRejected = useCallback((original: string, text: string) => {
    return rejectedCorrections.some(
      rejected => rejected.original === original && rejected.text === text
    );
  }, [rejectedCorrections]);

  const clearRejected = useCallback(() => {
    setRejectedCorrections([]);
  }, []);

  return {
    rejectedCorrections,
    rejectCorrection,
    isRejected,
    clearRejected
  };
};
