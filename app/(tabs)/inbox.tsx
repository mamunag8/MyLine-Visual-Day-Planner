/**
 * MyLine: Visual Day Planner
 * Tab 2: Brain Dump Inbox & Routine Stacks (`app/(tabs)/inbox.tsx`)
 */

import React from 'react';
import { LIGHT_COLORS } from '../../constants/theme';
import { useMyLineStore } from '../../hooks/useMyLineStore';
import { InboxRoutinesTabView } from '../../components/InboxRoutinesTabView';

export default function InboxRoutinesScreen() {
  const store = useMyLineStore();
  return (
    <InboxRoutinesTabView
      palette={LIGHT_COLORS}
      isDark={false}
      inboxTasks={store.inboxTasks}
      routineStacks={store.routineStacks}
      onQuickCreateInboxTask={store.createTask}
      onScheduleInboxTaskToday={store.scheduleInboxTaskToday}
      onDeleteInboxTask={store.deleteTask}
      onDropRoutineIntoToday={store.dropRoutineStackIntoToday}
      onCreateRoutineStack={store.createRoutineStack}
      onNavigateToTimeline={() => {}}
    />
  );
}
