// Database schema — see docs/plan.md §3 for full entity definitions

export const SCHEMA = {
  taskTemplates: `
    CREATE TABLE IF NOT EXISTS task_templates (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '生活',
      deadline_type TEXT NOT NULL DEFAULT '日常',
      daily_option TEXT,
      reminder_time TEXT,
      reminder_datetime TEXT,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
  dailyRecords: `
    CREATE TABLE IF NOT EXISTS daily_records (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      daily_option TEXT,
      status TEXT NOT NULL DEFAULT '待完成',
      completed_at TEXT,
      record_date TEXT NOT NULL,
      reminder_time TEXT,
      reminder_datetime TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (template_id) REFERENCES task_templates(id)
    );
    CREATE INDEX IF NOT EXISTS idx_records_date ON daily_records(record_date);
    CREATE INDEX IF NOT EXISTS idx_records_template ON daily_records(template_id);
    CREATE INDEX IF NOT EXISTS idx_records_status ON daily_records(status);
  `,
  aiAnalyses: `
    CREATE TABLE IF NOT EXISTS ai_analyses (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      content TEXT NOT NULL,
      generated_at TEXT NOT NULL
    );
  `,
};

export const SCHEMA_VERSION = 1;
