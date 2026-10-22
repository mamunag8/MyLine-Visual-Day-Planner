/**
 * MyLine: Visual Day Planner
 * Tab 1: The Visual Timeline (`app/(tabs)/index.tsx`)
 */

import React from 'react';
import { LIGHT_COLORS } from '../../constants/theme';
import { useMyLineStore } from '../../hooks/useMyLineStore';
import { TimelineTabView } from '../../components/TimelineTabView';

export default function VisualTimelineScreen() {
  const store = useMyLineStore();
  return (
    <TimelineTabView
      palette={LIGHT_COLORS}
      isDark={false}
      selectedDate={store.selectedDate}
      todayDateKey={store.todayDateKey}
      nowMinute={store.nowMinute}
      wakeMinute={store.settings.wake_minute}
      sleepMinute={store.settings.sleep_minute}
      allTasks={store.db.tasks}
      timelineNodes={store.timelineNodes}
      runningBehindStats={store.runningBehindStats}
      onSelectDate={store.setSelectedDate}
      onOpenSettings={() => {}}
      onOpenCreatorForGap={() => {}}
      onOpenCreatorDefault={() => {}}
      onRebuildDay={store.rebuildDay}
      onToggleTaskStatus={store.toggleTaskStatus}
      onToggleSubtask={store.toggleSubtaskCompletion}
      onShiftTaskStart={store.shiftTaskStartMinute}
      onDeleteTask={store.deleteTask}
      onStartFocusTimer={store.startFocusSession}
    />
  );
}
