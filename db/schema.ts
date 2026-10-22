/**
 * MyLine: Visual Day Planner
 * Section 4: Local SQLite Database Schema & Seed Data
 */

import { EnergyTag, RecurrenceRule, TaskCategory, TaskStatus, ThemeMode } from '../constants/theme';

export const SQLITE_SCHEMA_DDL = `
-- 1. User Preferences & Wake/Sleep Anchors
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  wake_minute INTEGER NOT NULL DEFAULT 450,   -- 07:30 AM (minutes from midnight)
  sleep_minute INTEGER NOT NULL DEFAULT 1350, -- 10:30 PM (minutes from midnight)
  calendar_sync_enabled INTEGER NOT NULL DEFAULT 0,
  theme_mode TEXT NOT NULL DEFAULT 'system',  -- 'light' | 'dark' | 'system'
  onboarding_completed INTEGER NOT NULL DEFAULT 0
);

-- 2. Master Tasks Table (Supports Single, Inbox, and Unlimited Recurring Tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'CheckCircle2',
  category TEXT NOT NULL DEFAULT 'deep_work', -- 'deep_work' | 'routine' | 'errand' | 'rest'
  scheduled_date TEXT,                        -- 'YYYY-MM-DD' or NULL if in Unscheduled Inbox
  start_minute INTEGER,                       -- 0 to 1439 (NULL if in Inbox)
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  recurrence_rule TEXT NOT NULL DEFAULT 'NONE', -- 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'WEEKLY'
  energy_tag TEXT NOT NULL DEFAULT 'medium',  -- 'high' | 'low' | 'quick_5m' (for Inbox filtering)
  is_locked INTEGER NOT NULL DEFAULT 0,       -- 1 = immovable anchor
  created_at TEXT NOT NULL
);

-- 3. Daily Instance Overrides (Tracks completions & "Rebuild Day" time shifts without duplicating recurring rows)
CREATE TABLE IF NOT EXISTS task_instances (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  instance_date TEXT NOT NULL,                -- 'YYYY-MM-DD'
  status TEXT NOT NULL DEFAULT 'pending',     -- 'pending' | 'completed' | 'skipped'
  override_start_minute INTEGER,              -- Populated when dragged or shifted via "Rebuild Day"
  override_duration_minutes INTEGER,          -- Populated when extended via "+5m" in Focus Mode
  UNIQUE(task_id, instance_date),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 4. Subtasks Checklist Table
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 5. Subtask Daily Completion State (So recurring tasks reset their subtasks every day)
CREATE TABLE IF NOT EXISTS subtask_completions (
  subtask_id TEXT NOT NULL,
  instance_date TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (subtask_id, instance_date)
);

-- 6. Reusable Routine Stacks (Templates like "Morning Launchpad")
CREATE TABLE IF NOT EXISTS routine_stacks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  category TEXT NOT NULL DEFAULT 'routine',
  default_start_minute INTEGER NOT NULL DEFAULT 480,
  total_duration_minutes INTEGER NOT NULL DEFAULT 45,
  steps_json TEXT NOT NULL -- JSON array of { title: string, duration: number }
);
`;

export interface UserSettingsRow {
  id: 1;
  wake_minute: number;
  sleep_minute: number;
  calendar_sync_enabled: number;
  theme_mode: ThemeMode;
  onboarding_completed: number;
  selected_calendars?: string[]; // ['Work', 'Personal', 'Birthdays']
  language?: string; // 'en' | 'bn' | 'ar' | 'fa' | 'ur' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ru' | 'tr' | 'pt' | 'id'
}

export interface TaskRow {
  id: string;
  title: string;
  icon_name: string;
  category: TaskCategory;
  scheduled_date: string | null;
  start_minute: number | null;
  duration_minutes: number;
  recurrence_rule: RecurrenceRule;
  energy_tag: EnergyTag;
  is_locked: number;
  created_at: string;
  calendar_source?: string; // Populated if OS calendar or locked anchor
}

export interface TaskInstanceRow {
  id: string;
  task_id: string;
  instance_date: string;
  status: TaskStatus;
  override_start_minute: number | null;
  override_duration_minutes: number | null;
}

export interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  duration_minutes: number;
  sort_order: number;
}

export interface SubtaskCompletionRow {
  subtask_id: string;
  instance_date: string;
  is_completed: number;
}

export interface RoutineStepItem {
  title: string;
  duration: number;
}

export interface RoutineStackRow {
  id: string;
  title: string;
  icon_name: string;
  category: TaskCategory;
  default_start_minute: number;
  total_duration_minutes: number;
  steps_json: string;
}

export const INITIAL_ROUTINE_STACKS: RoutineStackRow[] = [
  {
    id: 'routine-morning-launchpad',
    title: 'Morning Launchpad (30m)',
    icon_name: 'Sparkles',
    category: 'routine',
    default_start_minute: 450, // 07:30 AM
    total_duration_minutes: 30,
    steps_json: JSON.stringify([
      { title: 'Make bed & hydrate', duration: 5 },
      { title: 'Take vitamins/meds', duration: 5 },
      { title: 'Quick stretch', duration: 10 },
      { title: 'Plan top 3 priorities', duration: 10 },
    ] satisfies RoutineStepItem[]),
  },
  {
    id: 'routine-evening-shutdown',
    title: 'Evening Shutdown (25m)',
    icon_name: 'Moon',
    category: 'rest',
    default_start_minute: 1320, // 10:00 PM
    total_duration_minutes: 25,
    steps_json: JSON.stringify([
      { title: 'Clear desk', duration: 5 },
      { title: 'Prep clothes for tomorrow', duration: 10 },
      { title: "Brain dump tomorrow's tasks", duration: 10 },
    ] satisfies RoutineStepItem[]),
  },
];
