import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  error: string | null;
  longTermExpanded: boolean;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLongTermExpanded: (expanded: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  error: null,
  longTermExpanded: false,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLongTermExpanded: (expanded) => set({ longTermExpanded: expanded }),
}));
