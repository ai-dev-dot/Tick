// Core types — see docs/plan.md §2.1 for full attribute definitions

export type Category = '生活' | '工作' | '健康';
export type DeadlineType = '日常' | '近期' | '长期';
export type DailyOption = '每天' | '每工作日';
export type TaskStatus = '待完成' | '已完成';

export interface TaskTemplate {
  id: string;
  content: string;
  category: Category;
  deadlineType: DeadlineType;
  dailyOption: DailyOption | null;
  reminderTime: string | null;      // HH:mm for daily tasks
  reminderDatetime: string | null;  // YYYY-MM-DD HH:mm for one-time tasks
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecord {
  id: string;
  templateId: string;
  content: string;
  category: Category;
  dailyOption: DailyOption | null;
  status: TaskStatus;
  completedAt: string | null;
  recordDate: string;       // YYYY-MM-DD
  reminderTime: string | null;
  reminderDatetime: string | null;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  type: 'daily_summary' | 'weekly_report';
  periodStart: string;
  periodEnd: string;
  content: string;          // JSON string from AI
  generatedAt: string;
}

export interface AIParseResult {
  content: string;
  category: Category;
  deadlineType: DeadlineType;
  dailyOption: DailyOption | null;
  reminderTime: string | null;
  reminderDatetime: string | null;
}
