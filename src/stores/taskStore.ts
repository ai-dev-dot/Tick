import { create } from 'zustand';
import type { TaskTemplate, DailyRecord } from '../types';

interface TaskState {
  templates: TaskTemplate[];
  dailyRecords: DailyRecord[];
  setTemplates: (templates: TaskTemplate[]) => void;
  setDailyRecords: (records: DailyRecord[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  templates: [],
  dailyRecords: [],
  setTemplates: (templates) => set({ templates }),
  setDailyRecords: (dailyRecords) => set({ dailyRecords }),
}));
