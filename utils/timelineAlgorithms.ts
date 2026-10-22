/**
 * MyLine: Visual Day Planner
 * Section 5: Core Algorithms (A, B, C, D)
 * - Algorithm A: Virtual Timeline Resolver
 * - Algorithm B: Automatic "Free Space Pill" Gap Detector
 * - Algorithm C: 1-Tap "Rebuild Day" (Reflow Engine)
 * - Algorithm D: Offline Keyword-to-Icon & Category Auto-Matcher
 */

import { EnergyTag, RecurrenceRule, SPATIAL_RULES, TaskCategory, TaskStatus } from '../constants/theme';
import {
  SubtaskCompletionRow,
  SubtaskRow,
  TaskInstanceRow,
  TaskRow,
} from '../db/schema';

export interface ResolvedSubtask extends SubtaskRow {
  is_completed: boolean;
}

export interface ResolvedTimelineItem {
  id: string;
  taskId: string;
  title: string;
  icon_name: string;
  category: TaskCategory;
  effectiveStart: number;
  effectiveDuration: number;
  effectiveEnd: number;
  status: TaskStatus;
  recurrence_rule: RecurrenceRule;
  energy_tag: EnergyTag;
  is_locked: boolean;
  source: 'myline' | 'os_calendar';
  calendarSourceName?: string;
  subtasks: ResolvedSubtask[];
}

export interface FreeSpaceGapNode {
  type: 'free_space_gap';
  id: string;
  startMinute: number;
  endMinute: number;
  gapDuration: number;
}

export type TimelineRenderNode =
  | ({ type: 'task_item' } & ResolvedTimelineItem)
  | FreeSpaceGapNode;

/**
 * Helper to format date as 'YYYY-MM-DD' in local timezone
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

/**
 * Checks if a task matches the selectedDate based on its scheduled_date & recurrence_rule
 */
export function doesTaskOccurOnDate(task: TaskRow, selectedDate: string): boolean {
  // Unscheduled inbox task
  if (task.start_minute === null || task.start_minute === undefined) {
    return false;
  }

  const targetDate = parseDateKey(selectedDate);
  const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  if (task.recurrence_rule === 'NONE') {
    return task.scheduled_date === selectedDate;
  }

  // Ensure recurring tasks don't show before their creation/initial scheduled date if set
  if (task.scheduled_date && selectedDate < task.scheduled_date) {
    return false;
  }

  switch (task.recurrence_rule) {
    case 'DAILY':
      return true;
    case 'WEEKDAYS':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'WEEKENDS':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'WEEKLY': {
      if (!task.scheduled_date) return true;
      const originDay = parseDateKey(task.scheduled_date).getDay();
      return dayOfWeek === originDay;
    }
    default:
      return task.scheduled_date === selectedDate;
  }
}

/**
 * Algorithm A: Virtual Timeline Resolver (For any selected date YYYY-MM-DD)
 */
export function resolveTimelineForDate(params: {
  selectedDate: string;
  tasks: TaskRow[];
  taskInstances: TaskInstanceRow[];
  subtasks: SubtaskRow[];
  subtaskCompletions: SubtaskCompletionRow[];
  osCalendarEvents?: ResolvedTimelineItem[];
  calendarSyncEnabled: boolean;
}): ResolvedTimelineItem[] {
  const {
    selectedDate,
    tasks,
    taskInstances,
    subtasks,
    subtaskCompletions,
    osCalendarEvents = [],
    calendarSyncEnabled,
  } = params;

  const instanceMap = new Map<string, TaskInstanceRow>();
  for (const inst of taskInstances) {
    if (inst.instance_date === selectedDate) {
      instanceMap.set(inst.task_id, inst);
    }
  }

  const completionSet = new Set<string>();
  for (const comp of subtaskCompletions) {
    if (comp.instance_date === selectedDate && comp.is_completed === 1) {
      completionSet.add(comp.subtask_id);
    }
  }

  const resolved: ResolvedTimelineItem[] = [];

  for (const task of tasks) {
    if (!doesTaskOccurOnDate(task, selectedDate)) continue;

    const inst = instanceMap.get(task.id);
    const status: TaskStatus = inst?.status ?? 'pending';

    // 3. Exclude any instance where status == 'skipped'
    if (status === 'skipped') continue;

    // 4. Compute effective start time & duration
    const effectiveStart = inst?.override_start_minute ?? task.start_minute ?? 480;
    const effectiveDuration = inst?.override_duration_minutes ?? task.duration_minutes ?? 30;
    const effectiveEnd = effectiveStart + effectiveDuration;

    const taskSubtasks = subtasks
      .filter((s) => s.task_id === task.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        ...s,
        is_completed: completionSet.has(s.id),
      }));

    resolved.push({
      id: `${task.id}__${selectedDate}`,
      taskId: task.id,
      title: task.title,
      icon_name: task.icon_name,
      category: task.category,
      effectiveStart,
      effectiveDuration,
      effectiveEnd,
      status,
      recurrence_rule: task.recurrence_rule,
      energy_tag: task.energy_tag,
      is_locked: task.is_locked === 1,
      source: task.calendar_source ? 'os_calendar' : 'myline',
      calendarSourceName: task.calendar_source,
      subtasks: taskSubtasks,
    });
  }

  // 5. If calendar_sync_enabled == 1, include native OS events mapped as locked timeline items
  if (calendarSyncEnabled && osCalendarEvents.length > 0) {
    for (const calEvent of osCalendarEvents) {
      resolved.push({
        ...calEvent,
        is_locked: true,
        source: 'os_calendar',
      });
    }
  }

  // 6. Sort all resolved items ascending by effectiveStart
  resolved.sort((a, b) => {
    if (a.effectiveStart !== b.effectiveStart) {
      return a.effectiveStart - b.effectiveStart;
    }
    return a.effectiveDuration - b.effectiveDuration;
  });

  return resolved;
}

/**
 * Algorithm B: Automatic "Free Space Pill" Gap Detector
 * Walk through sorted timeline items between wake_minute and sleep_minute.
 * Whenever nextItem.effectiveStart - currentItem.effectiveEnd >= 15:
 * Inject a virtual FreeSpaceGap node with startMinute, endMinute, and gapDuration.
 */
export function buildTimelineWithFreeSpaceGaps(
  items: ResolvedTimelineItem[],
  wakeMinute: number,
  sleepMinute: number
): TimelineRenderNode[] {
  const nodes: TimelineRenderNode[] = [];
  let cursor = wakeMinute;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Check gap before this item (within wake..sleep bounds)
    const gapStart = Math.max(wakeMinute, cursor);
    const gapEnd = Math.min(sleepMinute, item.effectiveStart);
    const gapDuration = gapEnd - gapStart;

    if (gapDuration >= 15) {
      nodes.push({
        type: 'free_space_gap',
        id: `gap-${gapStart}-${gapEnd}`,
        startMinute: gapStart,
        endMinute: gapEnd,
        gapDuration,
      });
    }

    nodes.push({
      type: 'task_item',
      ...item,
    });

    cursor = Math.max(cursor, item.effectiveEnd);
  }

  // Check trailing gap until sleep_minute
  if (sleepMinute - cursor >= 15) {
    const gapStart = Math.max(wakeMinute, cursor);
    const gapEnd = sleepMinute;
    if (gapEnd - gapStart >= 15) {
      nodes.push({
        type: 'free_space_gap',
        id: `gap-${gapStart}-${gapEnd}`,
        startMinute: gapStart,
        endMinute: gapEnd,
        gapDuration: gapEnd - gapStart,
      });
    }
  }

  return nodes;
}

/**
 * Finds the first available Free Space gap on today's timeline that can fit a task,
 * or appends after the last scheduled block.
 */
export function findNextAvailableSlot(
  items: ResolvedTimelineItem[],
  wakeMinute: number,
  sleepMinute: number,
  currentMinute: number,
  requiredDuration: number
): number {
  const earliestStart = Math.max(
    wakeMinute,
    Math.ceil(currentMinute / 15) * 15
  );
  const gaps = buildTimelineWithFreeSpaceGaps(items, earliestStart, sleepMinute).filter(
    (n): n is FreeSpaceGapNode => n.type === 'free_space_gap'
  );

  for (const gap of gaps) {
    if (gap.gapDuration >= requiredDuration) {
      return gap.startMinute;
    }
  }
  // If no gap >= requiredDuration, take the first gap >= 15m or after the last item
  if (gaps.length > 0) {
    return gaps[0].startMinute;
  }
  const lastEnd = items.reduce((max, item) => Math.max(max, item.effectiveEnd), earliestStart);
  return Math.min(1410, Math.ceil(lastEnd / 15) * 15);
}

/**
 * Algorithm C: 1-Tap "Rebuild Day" (Reflow Engine)
 * Checks if Today's timeline has at least one overdue uncompleted flexible task.
 */
export function getRunningBehindStats(
  items: ResolvedTimelineItem[],
  currentMinute: number
): { isBehind: boolean; overdueCount: number; behindMinutes: number } {
  const overdueFlexible = items.filter(
    (item) =>
      item.status !== 'completed' &&
      !item.is_locked &&
      currentMinute > item.effectiveEnd
  );

  if (overdueFlexible.length === 0) {
    return { isBehind: false, overdueCount: 0, behindMinutes: 0 };
  }

  const earliestOverdueEnd = Math.min(...overdueFlexible.map((i) => i.effectiveEnd));
  const behindMinutes = Math.max(5, currentMinute - earliestOverdueEnd);

  return {
    isBehind: true,
    overdueCount: overdueFlexible.length,
    behindMinutes,
  };
}

/**
 * Algorithm C Execution: Computes new override_start_minute values for flexible tasks.
 * 1. Round currentMinute up to the next 5-minute increment (cursor = Math.ceil(currentMinute / 5) * 5).
 * 2. Separate today's remaining items into lockedBlocks & flexibleQueue.
 * 3. Loop through each task in flexibleQueue, jump over lockedBlocks + 5m, and advance cursor with 5m buffer.
 */
export function computeRebuildDayOverrides(
  items: ResolvedTimelineItem[],
  currentMinute: number
): Array<{ taskId: string; newStartMinute: number }> {
  let cursor = Math.ceil(currentMinute / 5) * 5;

  const lockedBlocks = items
    .filter((item) => item.is_locked && item.effectiveEnd > cursor)
    .sort((a, b) => a.effectiveStart - b.effectiveStart);

  // All uncompleted flexible tasks (status == 'pending' and is_locked == 0)
  // that are overdue OR scheduled after cursor, preserving their original order
  const flexibleQueue = items.filter(
    (item) =>
      item.status === 'pending' &&
      !item.is_locked &&
      (currentMinute > item.effectiveEnd || item.effectiveStart >= cursor || item.effectiveEnd > cursor)
  );

  const updates: Array<{ taskId: string; newStartMinute: number }> = [];

  for (const task of flexibleQueue) {
    // Check if [cursor, cursor + task.effectiveDuration] overlaps with any block in lockedBlocks.
    // Repeat check if multiple locked blocks are back-to-back.
    let hasConflict = true;
    while (hasConflict) {
      hasConflict = false;
      for (const lockedBlock of lockedBlocks) {
        const proposedStart = cursor;
        const proposedEnd = cursor + task.effectiveDuration;
        const overlaps =
          proposedStart < lockedBlock.effectiveEnd &&
          proposedEnd > lockedBlock.effectiveStart;

        if (overlaps) {
          cursor = lockedBlock.effectiveEnd + SPATIAL_RULES.REBUILD_BUFFER_MINUTES;
          hasConflict = true;
          break;
        }
      }
    }

    // Clamp within day bounds (0..1425)
    const clampedStart = Math.min(1435 - task.effectiveDuration, Math.max(0, cursor));
    updates.push({
      taskId: task.taskId,
      newStartMinute: clampedStart,
    });

    // Advance cursor = cursor + task.effectiveDuration + 5 (calm 5-minute breathing buffer)
    cursor = clampedStart + task.effectiveDuration + SPATIAL_RULES.REBUILD_BUFFER_MINUTES;
  }

  return updates;
}

/**
 * Algorithm D: Offline Keyword-to-Icon & Category Auto-Matcher
 * Suggests the matching Lucide icon and category color without any API calls:
 * - gym|workout|run|walk|yoga|stretch -> Icon: Dumbbell, Category: routine
 * - study|read|exam|write|code|research|work -> Icon: BookOpen, Category: deep_work
 * - coffee|breakfast|lunch|dinner|cook|eat|water -> Icon: Utensils, Category: rest
 * - call|email|pay|buy|grocery|clean|laundry -> Icon: ShoppingBag, Category: errand
 * - sleep|nap|meditate|rest|break -> Icon: Moon, Category: rest
 */
export function autoMatchKeywordToMeta(title: string): {
  matched: boolean;
  iconName: string;
  category: TaskCategory;
} {
  const normalized = title.toLowerCase();

  if (/\b(gym|workout|run|walk|yoga|stretch)\b/.test(normalized)) {
    return { matched: true, iconName: 'Dumbbell', category: 'routine' };
  }
  if (/\b(study|read|exam|write|code|research|work)\b/.test(normalized)) {
    return { matched: true, iconName: 'BookOpen', category: 'deep_work' };
  }
  if (/\b(coffee|breakfast|lunch|dinner|cook|eat|water)\b/.test(normalized)) {
    return { matched: true, iconName: 'Utensils', category: 'rest' };
  }
  if (/\b(call|email|pay|buy|grocery|clean|laundry)\b/.test(normalized)) {
    return { matched: true, iconName: 'ShoppingBag', category: 'errand' };
  }
  if (/\b(sleep|nap|meditate|rest|break)\b/.test(normalized)) {
    return { matched: true, iconName: 'Moon', category: 'rest' };
  }

  return { matched: false, iconName: 'CheckCircle2', category: 'deep_work' };
}
