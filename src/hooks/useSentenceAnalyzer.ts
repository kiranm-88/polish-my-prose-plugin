
import { useState, useCallback } from 'react';
import { checkSpelling } from '@/utils/spellChecker';
import { checkGrammar } from '@/utils/grammarChecker';

interface TextAnalysis {
  original: string;
  needsImprovement: boolean;
  suggestions: {
    formal: string;
    casual: string;
  };
}

export const useSentenceAnalyzer = () => {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);

  const generateSuggestions = useCallback((text: string) => {
    // Apply spelling and grammar corrections first
    let corrected = text;
    
    // Process text for spelling corrections
    const spellingSuggestions = checkSpelling(text, null, false);
    if (spellingSuggestions.length > 0) {
      // Apply the first non-flagged suggestion
      const validSuggestion = spellingSuggestions.find(s => !s.flagged);
      if (validSuggestion) {
        corrected = validSuggestion.text;
      }
    }
    
    // Process text for grammar corrections
    const grammarSuggestions = checkGrammar(corrected);
    if (grammarSuggestions.length > 0) {
      corrected = grammarSuggestions[0].text;
    }
    
    // Generate formal version - taking into account the whole context
    const formal = makeFormalText(corrected);
    
    // Generate casual version - taking into account the whole context
    const casual = makeCasualText(corrected);
    
    return { formal, casual };
  }, []);

  const makeFormalText = (text: string): string => {
    let formal = text;
    
    // Expand contractions throughout the text
    formal = formal.replace(/can't/gi, 'cannot');
    formal = formal.replace(/won't/gi, 'will not');
    formal = formal.replace(/n't/gi, ' not');
    formal = formal.replace(/'re/gi, ' are');
    formal = formal.replace(/'ve/gi, ' have');
    formal = formal.replace(/'ll/gi, ' will');
    formal = formal.replace(/'d/gi, ' would');
    
    // Replace informal words and phrases with formal alternatives
    const formalReplacements = {
      'kinda': 'somewhat',
      'sorta': 'somewhat', 
      'gonna': 'going to',
      'wanna': 'want to',
      'yeah': 'yes',
      'nope': 'no',
      'ok': 'acceptable',
      'okay': 'acceptable',
      'stuff': 'items',
      'things': 'matters',
      'get': 'obtain',
      'got': 'received',
      'big': 'substantial',
      'small': 'minimal',
      'good': 'excellent',
      'bad': 'inadequate',
      'nice': 'pleasant',
      'cool': 'impressive',
      'awesome': 'remarkable',
      'amazing': 'extraordinary',
      'pretty': 'quite',
      'really': 'particularly',
      'very': 'extremely',
      'super': 'exceptionally',
      'lots of': 'numerous',
      'a lot of': 'many',
      'tons of': 'substantial quantities of',
      'bunch of': 'several',
      'help out': 'assist',
      'find out': 'determine',
      'figure out': 'ascertain',
      'check out': 'examine',
      'show up': 'appear',
      'come up': 'arise',
      'bring up': 'mention',
      'pick up': 'acquire',
      'set up': 'establish'
    };
    
    // Apply formal word replacements
    Object.entries(formalReplacements).forEach(([informal, formalWord]) => {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      formal = formal.replace(regex, formalWord);
    });
    
    // Improve sentence structure and flow
    formal = formal.replace(/\bso\b/gi, 'therefore');
    formal = formal.replace(/\bbut\b/gi, 'however');
    formal = formal.replace(/\balso\b/gi, 'furthermore');
    formal = formal.replace(/\bplus\b/gi, 'additionally');
    formal = formal.replace(/\banyway\b/gi, 'nonetheless');
    
    // Make more sophisticated sentence connectors
    formal = formal.replace(/\band then\b/gi, 'subsequently');
    formal = formal.replace(/\bafter that\b/gi, 'thereafter');
    formal = formal.replace(/\bbecause of\b/gi, 'due to');
    formal = formal.replace(/\bsince\b/gi, 'given that');
    
    // Ensure proper capitalization for sentences
    formal = formal.replace(/(^|\. )([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
    
    // Ensure proper punctuation
    formal = formal.trim();
    if (!/[.!?]$/.test(formal)) {
      formal += '.';
    }
    
    return formal;
  };

  const makeCasualText = (text: string): string => {
    let casual = text;
    
    // Add contractions for more conversational tone
    casual = casual.replace(/\bwill not\b/gi, "won't");
    casual = casual.replace(/\bcannot\b/gi, "can't");
    casual = casual.replace(/\bdo not\b/gi, "don't");
    casual = casual.replace(/\bdid not\b/gi, "didn't");
    casual = casual.replace(/\bis not\b/gi, "isn't");
    casual = casual.replace(/\bare not\b/gi, "aren't");
    casual = casual.replace(/\bwas not\b/gi, "wasn't");
    casual = casual.replace(/\bwere not\b/gi, "weren't");
    casual = casual.replace(/\bhave not\b/gi, "haven't");
    casual = casual.replace(/\bhas not\b/gi, "hasn't");
    casual = casual.replace(/\bwould not\b/gi, "wouldn't");
    casual = casual.replace(/\bshould not\b/gi, "shouldn't");
    casual = casual.replace(/\bgoing to\b/gi, "gonna");
    casual = casual.replace(/\bwant to\b/gi, "wanna");
    
    // Replace formal words with casual alternatives
    const casualReplacements = {
      'obtain': 'get',
      'received': 'got',
      'substantial': 'big',
      'minimal': 'small',
      'excellent': 'great',
      'inadequate': 'bad',
      'pleasant': 'nice',
      'impressive': 'cool',
      'remarkable': 'awesome',
      'extraordinary': 'amazing',
      'particularly': 'really',
      'extremely': 'super',
      'exceptionally': 'really',
      'numerous': 'lots of',
      'several': 'a bunch of',
      'assist': 'help out',
      'determine': 'find out',
      'ascertain': 'figure out',
      'examine': 'check out',
      'appear': 'show up',
      'arise': 'come up',
      'mention': 'bring up',
      'acquire': 'pick up',
      'establish': 'set up',
      'acceptable': 'okay',
      'items': 'stuff',
      'matters': 'things'
    };
    
    // Apply casual word replacements
    Object.entries(casualReplacements).forEach(([formal, casualWord]) => {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      casual = casual.replace(regex, casualWord);
    });
    
    // Make it more conversational
    casual = casual.replace(/\bhowever\b/gi, 'but');
    casual = casual.replace(/\btherefore\b/gi, 'so');
    casual = casual.replace(/\bfurthermore\b/gi, 'also');
    casual = casual.replace(/\badditionally\b/gi, 'plus');
    casual = casual.replace(/\bnonetheless\b/gi, 'anyway');
    casual = casual.replace(/\bsubsequently\b/gi, 'then');
    casual = casual.replace(/\bthereafter\b/gi, 'after that');
    casual = casual.replace(/\bdue to\b/gi, 'because of');
    casual = casual.replace(/\bgiven that\b/gi, 'since');
    
    // Use more casual phrases
    casual = casual.replace(/\bin order to\b/gi, 'to');
    casual = casual.replace(/\bdue to the fact that\b/gi, 'because');
    casual = casual.replace(/\bat this point in time\b/gi, 'now');
    casual = casual.replace(/\bsomewhat\b/gi, 'kinda');
    
    // Add casual conversation starters/connectors
    if (casual.length > 50) {
      // Sometimes add casual interjections for longer text
      if (Math.random() > 0.7) {
        casual = casual.replace(/^/, 'So, ');
      }
    }
    
    return casual;
  };

  const analyzeWholeText = useCallback((text: string) => {
    const trimmedText = text.trim();
    
    if (trimmedText.length > 10) {
      // Check if text needs improvement
      const hasSpellingIssues = checkSpelling(trimmedText, null, false).length > 0;
      const hasGrammarIssues = checkGrammar(trimmedText).length > 0;
      const needsImprovement = hasSpellingIssues || hasGrammarIssues || trimmedText.length > 20;
      
      if (needsImprovement) {
        const suggestions = generateSuggestions(trimmedText);
        
        setAnalysis({
          original: trimmedText,
          needsImprovement: true,
          suggestions
        });
      } else {
        setAnalysis(null);
      }
    } else {
      setAnalysis(null);
    }
  }, [generateSuggestions]);

  const clearAnalyses = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analysis,
    analyzeWholeText,
    clearAnalyses
  };
};
