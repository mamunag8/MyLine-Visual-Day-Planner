/**
 * MyLine: Visual Day Planner
 * Local-First Database Engine (SQLite / LocalStorage Persistent Adapter)
 * Implements all 6 tables from Section 4 plus JSON Backup Export/Restore.
 */

import {
  INITIAL_ROUTINE_STACKS,
  RoutineStackRow,
  SQLITE_SCHEMA_DDL,
  SubtaskCompletionRow,
  SubtaskRow,
  TaskInstanceRow,
  TaskRow,
  UserSettingsRow,
} from './schema';
import { toDateKey } from '../utils/timelineAlgorithms';

export interface MyLineDatabaseSnapshot {
  version: number;
  exportedAt: string;
  user_settings: UserSettingsRow;
  tasks: TaskRow[];
  task_instances: TaskInstanceRow[];
  subtasks: SubtaskRow[];
  subtask_completions: SubtaskCompletionRow[];
  routine_stacks: RoutineStackRow[];
}

const STORAGE_KEY = 'myline_sqlite_db_v1';

/**
 * Generates initial demo tasks anchored dynamically around Today and the current time
 * so the user immediately sees:
 * 1) A completed morning routine
 * 2) An overdue flexible task that triggers the `[ ✨ Rebuild Day ]` banner
 * 3) A locked OS Calendar event (`🔒 Team Design Sync`)
 * 4) An active task spanning the current minute with inline subtasks & `[ ▶ Start Focus Timer ]`
 * 5) Clear `✨ Free Space — Tap to schedule` gaps
 * 6) Unscheduled Brain Dump Inbox items across energy levels
 */
export function buildInitialSeedDatabase(now = new Date()): MyLineDatabaseSnapshot {
  const todayKey = toDateKey(now);
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  // Anchor demo blocks around either standard daytime (08:00..21:00) or currentMinute so it always looks alive
  const anchorMin = Math.max(510, Math.min(1140, Math.floor(currentMinute / 15) * 15));

  const createdIso = now.toISOString();

  const tasks: TaskRow[] = [
    {
      id: 'task-morning-launchpad',
      title: 'Morning Launchpad & Hydration',
      icon_name: 'Sparkles',
      category: 'routine',
      scheduled_date: todayKey,
      start_minute: 450, // 07:30
      duration_minutes: 30,
      recurrence_rule: 'DAILY',
      energy_tag: 'low',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'task-overdue-review',
      title: 'Review Weekly Roadmap & Notes',
      icon_name: 'BookOpen',
      category: 'deep_work',
      scheduled_date: todayKey,
      start_minute: Math.max(495, anchorMin - 90), // Overdue flexible task -> triggers Rebuild Day!
      duration_minutes: 45,
      recurrence_rule: 'WEEKDAYS',
      energy_tag: 'high',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'task-active-sprint',
      title: 'Deep Focus: Product Architecture Block',
      icon_name: 'BookOpen',
      category: 'deep_work',
      scheduled_date: todayKey,
      start_minute: Math.max(540, anchorMin - 15), // Active right now!
      duration_minutes: 60,
      recurrence_rule: 'NONE',
      energy_tag: 'high',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'task-locked-calendar-sync',
      title: 'Product & Design Weekly Sync',
      icon_name: 'Calendar',
      category: 'deep_work',
      scheduled_date: todayKey,
      start_minute: Math.min(1260, anchorMin + 90), // 45m Free Space gap before this!
      duration_minutes: 45,
      recurrence_rule: 'WEEKLY',
      energy_tag: 'medium',
      is_locked: 1,
      calendar_source: 'Work Calendar',
      created_at: createdIso,
    },
    {
      id: 'task-mindful-walk',
      title: 'Outdoor Walk & Mobility Stretch',
      icon_name: 'Dumbbell',
      category: 'routine',
      scheduled_date: todayKey,
      start_minute: Math.min(1305, anchorMin + 180),
      duration_minutes: 30,
      recurrence_rule: 'DAILY',
      energy_tag: 'low',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'task-evening-winddown',
      title: 'Evening Shutdown & Tomorrow Prep',
      icon_name: 'Moon',
      category: 'rest',
      scheduled_date: todayKey,
      start_minute: 1290, // 21:30
      duration_minutes: 30,
      recurrence_rule: 'DAILY',
      energy_tag: 'low',
      is_locked: 0,
      created_at: createdIso,
    },
    // Unscheduled Brain Dump Inbox Tasks (scheduled_date = null, start_minute = null)
    {
      id: 'inbox-quick-reply',
      title: 'Reply to dentist appointment text',
      icon_name: 'ShoppingBag',
      category: 'errand',
      scheduled_date: null,
      start_minute: null,
      duration_minutes: 15,
      recurrence_rule: 'NONE',
      energy_tag: 'quick_5m',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'inbox-low-desk-tidy',
      title: 'Clean cables & water desk plants',
      icon_name: 'Sparkles',
      category: 'routine',
      scheduled_date: null,
      start_minute: null,
      duration_minutes: 15,
      recurrence_rule: 'NONE',
      energy_tag: 'low',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'inbox-high-write-spec',
      title: 'Write Q4 design system documentation',
      icon_name: 'BookOpen',
      category: 'deep_work',
      scheduled_date: null,
      start_minute: null,
      duration_minutes: 45,
      recurrence_rule: 'NONE',
      energy_tag: 'high',
      is_locked: 0,
      created_at: createdIso,
    },
    {
      id: 'inbox-errand-groceries',
      title: 'Buy oat milk, berries, and espresso beans',
      icon_name: 'ShoppingBag',
      category: 'errand',
      scheduled_date: null,
      start_minute: null,
      duration_minutes: 30,
      recurrence_rule: 'NONE',
      energy_tag: 'low',
      is_locked: 0,
      created_at: createdIso,
    },
  ];

  const subtasks: SubtaskRow[] = [
    {
      id: 'sub-morning-1',
      task_id: 'task-morning-launchpad',
      title: 'Make bed & drink full glass of water',
      duration_minutes: 5,
      sort_order: 0,
    },
    {
      id: 'sub-morning-2',
      task_id: 'task-morning-launchpad',
      title: 'Take morning vitamins & meds',
      duration_minutes: 5,
      sort_order: 1,
    },
    {
      id: 'sub-morning-3',
      task_id: 'task-morning-launchpad',
      title: 'Review top 3 priorities on MyLine',
      duration_minutes: 10,
      sort_order: 2,
    },
    {
      id: 'sub-active-1',
      task_id: 'task-active-sprint',
      title: 'Outline core timeline data model & SQLite schema',
      duration_minutes: 15,
      sort_order: 0,
    },
    {
      id: 'sub-active-2',
      task_id: 'task-active-sprint',
      title: 'Verify proportional 15m/30m/1h card spacing',
      duration_minutes: 25,
      sort_order: 1,
    },
    {
      id: 'sub-active-3',
      task_id: 'task-active-sprint',
      title: 'Test 1-tap Rebuild Day reflow buffer logic',
      duration_minutes: 20,
      sort_order: 2,
    },
    {
      id: 'sub-review-1',
      task_id: 'task-overdue-review',
      title: 'Check open milestones from yesterday',
      duration_minutes: 15,
      sort_order: 0,
    },
    {
      id: 'sub-review-2',
      task_id: 'task-overdue-review',
      title: 'Archive completed sprint notes',
      duration_minutes: 15,
      sort_order: 1,
    },
  ];

  const task_instances: TaskInstanceRow[] = [
    {
      id: `inst-morning-${todayKey}`,
      task_id: 'task-morning-launchpad',
      instance_date: todayKey,
      status: 'completed',
      override_start_minute: null,
      override_duration_minutes: null,
    },
  ];

  const subtask_completions: SubtaskCompletionRow[] = [
    {
      subtask_id: 'sub-morning-1',
      instance_date: todayKey,
      is_completed: 1,
    },
    {
      subtask_id: 'sub-morning-2',
      instance_date: todayKey,
      is_completed: 1,
    },
    {
      subtask_id: 'sub-morning-3',
      instance_date: todayKey,
      is_completed: 1,
    },
    {
      subtask_id: 'sub-active-1',
      instance_date: todayKey,
      is_completed: 1,
    },
  ];

  return {
    version: 1,
    exportedAt: createdIso,
    user_settings: {
      id: 1,
      wake_minute: 450, // 07:30 AM
      sleep_minute: 1350, // 10:30 PM
      calendar_sync_enabled: 1,
      theme_mode: 'light',
      onboarding_completed: 1,
      selected_calendars: ['Work Calendar', 'Personal'],
    },
    tasks,
    task_instances,
    subtasks,
    subtask_completions,
    routine_stacks: INITIAL_ROUTINE_STACKS,
  };
}

export function loadDatabaseSnapshot(): MyLineDatabaseSnapshot {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MyLineDatabaseSnapshot;
        if (parsed && parsed.user_settings && Array.isArray(parsed.tasks)) {
          return parsed;
        }
      }
    }
  } catch {
    // Fall back to fresh seed
  }
  const initial = buildInitialSeedDatabase();
  saveDatabaseSnapshot(initial);
  return initial;
}

export function saveDatabaseSnapshot(snapshot: MyLineDatabaseSnapshot): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...snapshot,
          exportedAt: new Date().toISOString(),
        })
      );
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function validateBackupJson(rawJson: string): MyLineDatabaseSnapshot | null {
  try {
    const data = JSON.parse(rawJson) as Partial<MyLineDatabaseSnapshot>;
    if (
      !data ||
      typeof data !== 'object' ||
      !data.user_settings ||
      !Array.isArray(data.tasks) ||
      !Array.isArray(data.task_instances) ||
      !Array.isArray(data.subtasks) ||
      !Array.isArray(data.subtask_completions) ||
      !Array.isArray(data.routine_stacks)
    ) {
      return null;
    }
    return data as MyLineDatabaseSnapshot;
  } catch {
    return null;
  }
}

export { SQLITE_SCHEMA_DDL };
