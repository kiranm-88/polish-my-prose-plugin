
import { toast } from '@/hooks/use-toast';

let spellChecker: any = null;
let isSpellCheckerReady = false;

export const loadSpellChecker = async (): Promise<{ spellChecker: any; isReady: boolean }> => {
  if (spellChecker && isSpellCheckerReady) {
    return { spellChecker, isReady: isSpellCheckerReady };
  }

  try {
    // Dynamically import nspell to avoid build issues
    const { default: nspell } = await import('nspell');
    
    // Load dictionary files with error handling
    const [affResponse, dicResponse] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.2.0/index.aff').catch(() => null),
      fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.2.0/index.dic').catch(() => null)
    ]);
    
    if (!affResponse || !dicResponse || !affResponse.ok || !dicResponse.ok) {
      throw new Error('Failed to load dictionary files');
    }
    
    const aff = await affResponse.text();
    const dic = await dicResponse.text();
    
    spellChecker = nspell(aff, dic);
    isSpellCheckerReady = true;
  } catch (error) {
    isSpellCheckerReady = false;
  }

  return { spellChecker, isReady: isSpellCheckerReady };
};

export const getSpellCheckerStatus = () => ({
  spellChecker,
  isReady: isSpellCheckerReady
});
