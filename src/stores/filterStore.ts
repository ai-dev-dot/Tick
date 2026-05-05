import { create } from 'zustand';

type FilterTab = '全部' | '日常' | '近期';

interface FilterState {
  activeTab: FilterTab;
  setActiveTab: (tab: FilterTab) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeTab: '全部',
  setActiveTab: (activeTab) => set({ activeTab }),
}));
