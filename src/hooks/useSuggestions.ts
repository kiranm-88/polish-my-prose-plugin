
import { create } from 'zustand';

interface Suggestion {
  type: string;
  text: string;
  explanation: string;
  context?: string;
  originalWord?: string;
  suggestion?: string;
}

interface SuggestionsStore {
  localSuggestions: Suggestion[];
  llmSuggestions: Suggestion[];
  isLoading: boolean;
  setLocalSuggestions: (suggestions: Suggestion[]) => void;
  setLLMSuggestions: (suggestions: Suggestion[]) => void;
  setLoading: (loading: boolean) => void;
  clearSuggestions: () => void;
}

export const useSuggestions = create<SuggestionsStore>((set) => ({
  localSuggestions: [],
  llmSuggestions: [],
  isLoading: false,
  setLocalSuggestions: (suggestions) => set({ localSuggestions: suggestions }),
  setLLMSuggestions: (suggestions) => set({ llmSuggestions: suggestions }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSuggestions: () => set({ localSuggestions: [], llmSuggestions: [] }),
}));
