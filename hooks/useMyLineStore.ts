import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  EnergyTag,
  RecurrenceRule,
  TaskCategory,
  TaskStatus,
  ThemeMode,
} from '../constants/theme';
import {
  buildInitialSeedDatabase,
  loadDatabaseSnapshot,
  MyLineDatabaseSnapshot,
  saveDatabaseSnapshot,
  validateBackupJson,
} from '../db/database';
import {
  RoutineStackRow,
  RoutineStepItem,
  SubtaskRow,
  TaskInstanceRow,
  TaskRow,
} from '../db/schema';
import {
  buildTimelineWithFreeSpaceGaps,
  computeRebuildDayOverrides,
  findNextAvailableSlot,
  getRunningBehindStats,
  ResolvedTimelineItem,
  resolveTimelineForDate,
  TimelineRenderNode,
  toDateKey,
} from '../utils/timelineAlgorithms';
import { brownNoiseEngine } from '../utils/brownNoiseGenerator';

export function triggerHaptic(type: 'light' | 'medium' | 'success') {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'success') navigator.vibrate([15, 40, 25]);
    }
  } catch {
    // Ignore on unsupported devices
  }
}

export function useMyLineStore() {
  const [db, setDb] = useState<MyLineDatabaseSnapshot>(() => loadDatabaseSnapshot());
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [nowMinute, setNowMinute] = useState<number>(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  // Focus Timer State
  const [focusTaskId, setFocusTaskId] = useState<string | null>('task-active-sprint');
  const [focusRemainingSeconds, setFocusRemainingSeconds] = useState<number>(42 * 60 + 15);
  const [focusTotalSeconds, setFocusTotalSeconds] = useState<number>(60 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);
  const [isBrownNoiseActive, setIsBrownNoiseActive] = useState<boolean>(false);

  // Persist DB changes automatically
  useEffect(() => {
    saveDatabaseSnapshot(db);
  }, [db]);

  // Live clock updater for the glowing "NOW" needle
  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setNowMinute(n.getHours() * 60 + n.getMinutes());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Countdown interval for Visual Focus Timer
  useEffect(() => {
    if (!isFocusRunning) return;
    const timer = setInterval(() => {
      setFocusRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsFocusRunning(false);
          triggerHaptic('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFocusRunning]);

  const todayDateKey = useMemo(() => toDateKey(new Date()), []);

  // Simulated Native OS Calendar overlay events when calendar_sync_enabled == 1
  const osCalendarEvents = useMemo<ResolvedTimelineItem[]>(() => {
    if (db.user_settings.calendar_sync_enabled !== 1) return [];
    const selectedCals = db.user_settings.selected_calendars ?? ['Work Calendar', 'Personal'];
    const events: ResolvedTimelineItem[] = [];

    if (selectedCals.includes('Personal')) {
      events.push({
        id: `os-cal-dentist-${selectedDate}`,
        taskId: `os-cal-dentist`,
        title: 'Lunch Break & Coffee Catch-up',
        icon_name: 'Utensils',
        category: 'rest',
        effectiveStart: 780, // 13:00
        effectiveDuration: 45,
        effectiveEnd: 825, // 13:45
        status: 'pending',
        recurrence_rule: 'DAILY',
        energy_tag: 'low',
        is_locked: true,
        source: 'os_calendar',
        calendarSourceName: 'Personal Calendar',
        subtasks: [],
      });
    }
    return events;
  }, [db.user_settings.calendar_sync_enabled, db.user_settings.selected_calendars, selectedDate]);

  // Algorithm A: Resolved timeline items for selectedDate
  const timelineItems = useMemo<ResolvedTimelineItem[]>(() => {
    return resolveTimelineForDate({
      selectedDate,
      tasks: db.tasks,
      taskInstances: db.task_instances,
      subtasks: db.subtasks,
      subtaskCompletions: db.subtask_completions,
      osCalendarEvents,
      calendarSyncEnabled: db.user_settings.calendar_sync_enabled === 1,
    });
  }, [
    selectedDate,
    db.tasks,
    db.task_instances,
    db.subtasks,
    db.subtask_completions,
    osCalendarEvents,
    db.user_settings.calendar_sync_enabled,
  ]);

  // Algorithm B: Timeline nodes with injected FreeSpaceGap pills
  const timelineNodes = useMemo<TimelineRenderNode[]>(() => {
    return buildTimelineWithFreeSpaceGaps(
      timelineItems,
      db.user_settings.wake_minute,
      db.user_settings.sleep_minute
    );
  }, [timelineItems, db.user_settings.wake_minute, db.user_settings.sleep_minute]);

  // Algorithm C: Running behind schedule detector (only on Today)
  const runningBehindStats = useMemo(() => {
    if (selectedDate !== todayDateKey) {
      return { isBehind: false, overdueCount: 0, behindMinutes: 0 };
    }
    return getRunningBehindStats(timelineItems, nowMinute);
  }, [selectedDate, todayDateKey, timelineItems, nowMinute]);

  // Unscheduled Brain Dump Inbox items
  const inboxTasks = useMemo(() => {
    return db.tasks.filter((t) => t.start_minute === null || t.scheduled_date === null);
  }, [db.tasks]);

  // Update User Settings
  const updateSettings = useCallback((patch: Partial<MyLineDatabaseSnapshot['user_settings']>) => {
    setDb((prev) => ({
      ...prev,
      user_settings: {
        ...prev.user_settings,
        ...patch,
      },
    }));
  }, []);

  // Toggle Task Completion on selectedDate
  const toggleTaskStatus = useCallback(
    (taskId: string, dateKey = selectedDate) => {
      triggerHaptic('medium');
      setDb((prev) => {
        const existingIdx = prev.task_instances.findIndex(
          (i) => i.task_id === taskId && i.instance_date === dateKey
        );
        const nextInstances = [...prev.task_instances];
        if (existingIdx >= 0) {
          const current = nextInstances[existingIdx];
          const nextStatus: TaskStatus =
            current.status === 'completed' ? 'pending' : 'completed';
          nextInstances[existingIdx] = {
            ...current,
            status: nextStatus,
          };
        } else {
          nextInstances.push({
            id: `inst-${taskId}-${dateKey}-${Date.now()}`,
            task_id: taskId,
            instance_date: dateKey,
            status: 'completed',
            override_start_minute: null,
            override_duration_minutes: null,
          });
        }
        return {
          ...prev,
          task_instances: nextInstances,
        };
      });
    },
    [selectedDate]
  );

  // Toggle Subtask Daily Completion
  const toggleSubtaskCompletion = useCallback(
    (subtaskId: string, dateKey = selectedDate) => {
      triggerHaptic('light');
      setDb((prev) => {
        const idx = prev.subtask_completions.findIndex(
          (c) => c.subtask_id === subtaskId && c.instance_date === dateKey
        );
        const next = [...prev.subtask_completions];
        if (idx >= 0) {
          next.splice(idx, 1);
        } else {
          next.push({
            subtask_id: subtaskId,
            instance_date: dateKey,
            is_completed: 1,
          });
        }
        return {
          ...prev,
          subtask_completions: next,
        };
      });
    },
    [selectedDate]
  );

  // Shift or Drag Task by 15-minute increments (updates override_start_minute)
  const shiftTaskStartMinute = useCallback(
    (taskId: string, newStartMinute: number, dateKey = selectedDate) => {
      const snapped = Math.max(0, Math.min(1425, Math.round(newStartMinute / 15) * 15));
      triggerHaptic('light');
      setDb((prev) => {
        const idx = prev.task_instances.findIndex(
          (i) => i.task_id === taskId && i.instance_date === dateKey
        );
        const nextInstances = [...prev.task_instances];
        if (idx >= 0) {
          nextInstances[idx] = {
            ...nextInstances[idx],
            override_start_minute: snapped,
          };
        } else {
          nextInstances.push({
            id: `inst-${taskId}-${dateKey}-${Date.now()}`,
            task_id: taskId,
            instance_date: dateKey,
            status: 'pending',
            override_start_minute: snapped,
            override_duration_minutes: null,
          });
        }
        return {
          ...prev,
          task_instances: nextInstances,
        };
      });
    },
    [selectedDate]
  );

  // Algorithm C: Execute 1-Tap "Rebuild Day" Reflow Engine
  const rebuildDay = useCallback(() => {
    const updates = computeRebuildDayOverrides(timelineItems, nowMinute);
    if (updates.length === 0) return 0;

    triggerHaptic('success');
    setDb((prev) => {
      const nextInstances = [...prev.task_instances];
      for (const upd of updates) {
        const idx = nextInstances.findIndex(
          (i) => i.task_id === upd.taskId && i.instance_date === selectedDate
        );
        if (idx >= 0) {
          nextInstances[idx] = {
            ...nextInstances[idx],
            override_start_minute: upd.newStartMinute,
          };
        } else {
          nextInstances.push({
            id: `inst-${upd.taskId}-${selectedDate}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            task_id: upd.taskId,
            instance_date: selectedDate,
            status: 'pending',
            override_start_minute: upd.newStartMinute,
            override_duration_minutes: null,
          });
        }
      }
      return {
        ...prev,
        task_instances: nextInstances,
      };
    });
    return updates.length;
  }, [timelineItems, nowMinute, selectedDate]);

  // Create New Task (Timeline or Brain Dump Inbox) with optional subtasks
  const createTask = useCallback(
    (input: {
      title: string;
      icon_name: string;
      category: TaskCategory;
      destination: 'timeline' | 'inbox';
      scheduled_date?: string;
      start_minute?: number;
      duration_minutes: number;
      recurrence_rule: RecurrenceRule;
      energy_tag: EnergyTag;
      is_locked?: boolean;
      subtasks?: Array<{ title: string; duration_minutes: number }>;
    }) => {
      const newTaskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isTimeline = input.destination === 'timeline';
      const newTask: TaskRow = {
        id: newTaskId,
        title: input.title.trim(),
        icon_name: input.icon_name || 'CheckCircle2',
        category: input.category,
        scheduled_date: isTimeline ? input.scheduled_date || selectedDate : null,
        start_minute: isTimeline ? (input.start_minute ?? 540) : null,
        duration_minutes: input.duration_minutes,
        recurrence_rule: isTimeline ? input.recurrence_rule : 'NONE',
        energy_tag: input.energy_tag,
        is_locked: input.is_locked ? 1 : 0,
        created_at: new Date().toISOString(),
      };

      const newSubtasks: SubtaskRow[] = (input.subtasks ?? [])
        .filter((s) => s.title.trim().length > 0)
        .map((s, idx) => ({
          id: `sub-${newTaskId}-${idx}`,
          task_id: newTaskId,
          title: s.title.trim(),
          duration_minutes: s.duration_minutes || 5,
          sort_order: idx,
        }));

      triggerHaptic('medium');
      setDb((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
        subtasks: [...prev.subtasks, ...newSubtasks],
      }));
      return newTaskId;
    },
    [selectedDate]
  );

  // Delete Task
  const deleteTask = useCallback((taskId: string) => {
    triggerHaptic('light');
    setDb((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      task_instances: prev.task_instances.filter((i) => i.task_id !== taskId),
      subtasks: prev.subtasks.filter((s) => s.task_id !== taskId),
    }));
  }, []);

  // Schedule an Unscheduled Inbox Task into Today's next available Free Space gap
  const scheduleInboxTaskToday = useCallback(
    (taskId: string) => {
      const targetTask = db.tasks.find((t) => t.id === taskId);
      if (!targetTask) return null;

      const todayResolved = resolveTimelineForDate({
        selectedDate: todayDateKey,
        tasks: db.tasks,
        taskInstances: db.task_instances,
        subtasks: db.subtasks,
        subtaskCompletions: db.subtask_completions,
        osCalendarEvents,
        calendarSyncEnabled: db.user_settings.calendar_sync_enabled === 1,
      });

      const slotMinute = findNextAvailableSlot(
        todayResolved,
        db.user_settings.wake_minute,
        db.user_settings.sleep_minute,
        nowMinute,
        targetTask.duration_minutes
      );

      triggerHaptic('success');
      setDb((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                scheduled_date: todayDateKey,
                start_minute: slotMinute,
              }
            : t
        ),
      }));
      setSelectedDate(todayDateKey);
      return slotMinute;
    },
    [db, todayDateKey, osCalendarEvents, nowMinute]
  );

  // Drop a Routine Stack into Today's timeline in 1 tap
  const dropRoutineStackIntoToday = useCallback(
    (stack: RoutineStackRow) => {
      let steps: RoutineStepItem[] = [];
      try {
        steps = JSON.parse(stack.steps_json) as RoutineStepItem[];
      } catch {
        steps = [];
      }

      const todayResolved = resolveTimelineForDate({
        selectedDate: todayDateKey,
        tasks: db.tasks,
        taskInstances: db.task_instances,
        subtasks: db.subtasks,
        subtaskCompletions: db.subtask_completions,
        osCalendarEvents,
        calendarSyncEnabled: db.user_settings.calendar_sync_enabled === 1,
      });

      // Check if default_start_minute is free; otherwise find next available gap
      const hasConflictAtDefault = todayResolved.some(
        (item) =>
          stack.default_start_minute < item.effectiveEnd &&
          stack.default_start_minute + stack.total_duration_minutes > item.effectiveStart
      );

      const startMin = hasConflictAtDefault
        ? findNextAvailableSlot(
            todayResolved,
            db.user_settings.wake_minute,
            db.user_settings.sleep_minute,
            nowMinute,
            stack.total_duration_minutes
          )
        : stack.default_start_minute;

      const newTaskId = createTask({
        title: stack.title.replace(/\s*\(\d+m\)$/i, ''),
        icon_name: stack.icon_name,
        category: stack.category,
        destination: 'timeline',
        scheduled_date: todayDateKey,
        start_minute: startMin,
        duration_minutes: stack.total_duration_minutes,
        recurrence_rule: 'NONE',
        energy_tag: 'low',
        subtasks: steps.map((s) => ({
          title: s.title,
          duration_minutes: s.duration,
        })),
      });

      setSelectedDate(todayDateKey);
      return { newTaskId, startMin };
    },
    [db, todayDateKey, osCalendarEvents, nowMinute, createTask]
  );

  // Create a new reusable Routine Stack template
  const createRoutineStack = useCallback(
    (input: {
      title: string;
      icon_name: string;
      category: TaskCategory;
      default_start_minute: number;
      steps: RoutineStepItem[];
    }) => {
      const total = input.steps.reduce((acc, s) => acc + (s.duration || 5), 0) || 20;
      const newStack: RoutineStackRow = {
        id: `routine-${Date.now()}`,
        title: `${input.title.trim()} (${total}m)`,
        icon_name: input.icon_name || 'Sparkles',
        category: input.category,
        default_start_minute: input.default_start_minute,
        total_duration_minutes: total,
        steps_json: JSON.stringify(input.steps),
      };
      triggerHaptic('medium');
      setDb((prev) => ({
        ...prev,
        routine_stacks: [...prev.routine_stacks, newStack],
      }));
    },
    []
  );

  // Start Focus Timer for a specific timeline item
  const startFocusSession = useCallback((item: ResolvedTimelineItem) => {
    setFocusTaskId(item.taskId);
    const totalSecs = item.effectiveDuration * 60;
    setFocusTotalSeconds(totalSecs);
    setFocusRemainingSeconds(totalSecs);
    setIsFocusRunning(true);
    triggerHaptic('medium');
  }, []);

  // [+5m Need More Time]: Adds 5m to active block and cascades adjacent flexible tasks down by 5m
  const extendActiveFocusBy5Minutes = useCallback(() => {
    setFocusRemainingSeconds((prev) => prev + 300);
    setFocusTotalSeconds((prev) => prev + 300);
    triggerHaptic('medium');

    if (!focusTaskId) return;

    const currentItem = timelineItems.find((i) => i.taskId === focusTaskId);
    if (!currentItem) return;

    const newDuration = currentItem.effectiveDuration + 5;
    const newEnd = currentItem.effectiveStart + newDuration;

    setDb((prev) => {
      const nextInstances = [...prev.task_instances];

      const upsertInstance = (
        tId: string,
        patch: { override_start_minute?: number; override_duration_minutes?: number }
      ) => {
        const idx = nextInstances.findIndex(
          (i) => i.task_id === tId && i.instance_date === selectedDate
        );
        if (idx >= 0) {
          nextInstances[idx] = {
            ...nextInstances[idx],
            ...patch,
          };
        } else {
          nextInstances.push({
            id: `inst-${tId}-${selectedDate}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            task_id: tId,
            instance_date: selectedDate,
            status: 'pending',
            override_start_minute: patch.override_start_minute ?? null,
            override_duration_minutes: patch.override_duration_minutes ?? null,
          });
        }
      };

      upsertInstance(focusTaskId, { override_duration_minutes: newDuration });

      // Cascade immediately adjacent flexible tasks down by 5 minutes
      let cascadeCursor = newEnd;
      for (const item of timelineItems) {
        if (item.taskId === focusTaskId || item.is_locked) continue;
        if (item.effectiveStart >= currentItem.effectiveEnd - 5 && item.effectiveStart <= cascadeCursor) {
          const shiftedStart = item.effectiveStart + 5;
          upsertInstance(item.taskId, { override_start_minute: shiftedStart });
          cascadeCursor = shiftedStart + item.effectiveDuration;
        }
      }

      return {
        ...prev,
        task_instances: nextInstances,
      };
    });
  }, [focusTaskId, timelineItems, selectedDate]);

  // Toggle Brown Noise
  const toggleBrownNoise = useCallback(() => {
    const active = brownNoiseEngine.toggle();
    setIsBrownNoiseActive(active);
    triggerHaptic('light');
  }, []);

  // Export JSON Backup
  const exportBackupJsonString = useCallback((): { filename: string; content: string } => {
    const dateStr = toDateKey(new Date());
    const filename = `myline-backup-${dateStr}.json`;
    const content = JSON.stringify(
      {
        ...db,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    return { filename, content };
  }, [db]);

  // Restore JSON Backup
  const restoreBackupFromJson = useCallback((rawJson: string): boolean => {
    const validated = validateBackupJson(rawJson);
    if (!validated) return false;
    setDb(validated);
    saveDatabaseSnapshot(validated);
    triggerHaptic('success');
    return true;
  }, []);

  // Reset Demo Data (helpful for testing/demoing)
  const resetToDemoSeed = useCallback(() => {
    const fresh = buildInitialSeedDatabase(new Date());
    setDb(fresh);
    saveDatabaseSnapshot(fresh);
    triggerHaptic('success');
  }, []);

  const activeFocusItem = useMemo(() => {
    return (
      timelineItems.find((i) => i.taskId === focusTaskId) ||
      timelineItems.find((i) => i.status !== 'completed') ||
      timelineItems[0] ||
      null
    );
  }, [timelineItems, focusTaskId]);

  return {
    db,
    settings: db.user_settings,
    selectedDate,
    setSelectedDate,
    todayDateKey,
    nowMinute,
    timelineItems,
    timelineNodes,
    runningBehindStats,
    inboxTasks,
    routineStacks: db.routine_stacks,
    updateSettings,
    toggleTaskStatus,
    toggleSubtaskCompletion,
    shiftTaskStartMinute,
    rebuildDay,
    createTask,
    deleteTask,
    scheduleInboxTaskToday,
    dropRoutineStackIntoToday,
    createRoutineStack,
    // Focus Timer
    activeFocusItem,
    focusTaskId,
    setFocusTaskId,
    focusRemainingSeconds,
    setFocusRemainingSeconds,
    focusTotalSeconds,
    setFocusTotalSeconds,
    isFocusRunning,
    setIsFocusRunning,
    startFocusSession,
    extendActiveFocusBy5Minutes,
    isBrownNoiseActive,
    toggleBrownNoise,
    // Backup & Restore
    exportBackupJsonString,
    restoreBackupFromJson,
    resetToDemoSeed,
  };
}

export type MyLineStore = ReturnType<typeof useMyLineStore>;
