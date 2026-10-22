/**
 * MyLine: Visual Day Planner
 * Tab 3: Anti-Time-Blindness Visual Focus Timer (`app/(tabs)/focus.tsx`)
 */

import React from 'react';
import { LIGHT_COLORS } from '../../constants/theme';
import { useMyLineStore } from '../../hooks/useMyLineStore';
import { FocusTimerTabView } from '../../components/FocusTimerTabView';

export default function FocusTimerScreen() {
  const store = useMyLineStore();
  return (
    <FocusTimerTabView
      palette={LIGHT_COLORS}
      isDark={false}
      activeItem={store.activeFocusItem}
      allTimelineItems={store.timelineItems}
      remainingSeconds={store.focusRemainingSeconds}
      totalSeconds={store.focusTotalSeconds}
      isRunning={store.isFocusRunning}
      isBrownNoiseActive={store.isBrownNoiseActive}
      onSelectFocusTask={(item) => store.startFocusSession(item)}
      onToggleRunning={() => store.setIsFocusRunning((r) => !r)}
      onResetTimer={() => store.setFocusRemainingSeconds(store.focusTotalSeconds)}
      onExtend5Minutes={store.extendActiveFocusBy5Minutes}
      onToggleBrownNoise={store.toggleBrownNoise}
      onCompleteSubtask={store.toggleSubtaskCompletion}
      onCompleteTask={store.toggleTaskStatus}
    />
  );
}
