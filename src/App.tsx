import React, { useState, useEffect } from 'react';
import { Calendar, Globe, Inbox, Timer } from 'lucide-react';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/theme';
import {
  AppLanguageCode,
  getLanguageMeta,
  getTranslation,
  SUPPORTED_LANGUAGES,
} from '../constants/i18n';
import { useMyLineStore } from '../hooks/useMyLineStore';
import { TimelineTabView } from '../components/TimelineTabView';
import { InboxRoutinesTabView } from '../components/InboxRoutinesTabView';
import { FocusTimerTabView } from '../components/FocusTimerTabView';
import { TaskCreatorSheet } from '../components/TaskCreatorSheet';
import { SettingsBackupModal } from '../components/SettingsBackupModal';
import { OnboardingModal } from '../components/OnboardingModal';

export type ActiveTab = 'timeline' | 'inbox' | 'focus';

export function App() {
  const store = useMyLineStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [systemDark, setSystemDark] = useState<boolean>(false);
  const [langPopoverOpen, setLangPopoverOpen] = useState<boolean>(false);

  // Creator Sheet State
  const [creatorVisible, setCreatorVisible] = useState(false);
  const [creatorInitialStart, setCreatorInitialStart] = useState<number>(540);
  const [creatorInitialDuration, setCreatorInitialDuration] = useState<number>(30);
  const [creatorInitialDest, setCreatorInitialDest] = useState<'timeline' | 'inbox'>('timeline');

  // Settings & Onboarding Modals
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState<boolean>(
    () => store.settings.onboarding_completed === 0
  );

  // Detect OS dark mode preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Determine effective Light ("Warm Paper") vs Dark ("Midnight Slate") mode
  const isDark =
    store.settings.theme_mode === 'dark' ||
    (store.settings.theme_mode === 'system' && systemDark);

  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
  const currentLang = (store.settings.language as AppLanguageCode) || 'en';
  const langMeta = getLanguageMeta(currentLang);
  const t = getTranslation(currentLang);

  return (
    <div
      dir={langMeta.dir}
      className="min-h-screen w-full flex flex-col select-none transition-colors"
      style={{
        backgroundColor: palette.backgroundPrimary,
        color: palette.textPrimary,
      }}
    >
      {/* Quick Floating Language Switcher Bar at Top-Right */}
      <div
        className="w-full max-w-2xl mx-auto px-4 pt-2 flex items-center justify-between text-xs relative z-30"
      >
        <span className="font-semibold opacity-75" style={{ color: palette.textSecondary }}>
          {t.appSubtitle}
        </span>

        <div className="relative">
          <button
            onClick={() => setLangPopoverOpen((o) => !o)}
            className="px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            style={{
              backgroundColor: palette.surfaceCard,
              borderColor: palette.borderSubtle,
              color: palette.textPrimary,
            }}
          >
            <Globe size={13} color={palette.brandAccent} />
            <span>
              {langMeta.flag} {langMeta.nativeName}
            </span>
          </button>

          {langPopoverOpen && (
            <div
              className="absolute right-0 mt-1.5 w-64 p-2 rounded-2xl border shadow-2xl grid grid-cols-2 gap-1 z-50"
              style={{
                backgroundColor: palette.surfaceCard,
                borderColor: palette.borderSubtle,
              }}
            >
              {SUPPORTED_LANGUAGES.map((l) => {
                const selected = l.code === currentLang;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      store.updateSettings({ language: l.code });
                      setLangPopoverOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-left transition"
                    style={{
                      backgroundColor: selected
                        ? palette.brandAccent
                        : palette.backgroundPrimary,
                      color: selected ? '#FFFFFF' : palette.textPrimary,
                    }}
                  >
                    <span>{l.flag}</span>
                    <span className="truncate">{l.nativeName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Active Screen */}
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col">
        {activeTab === 'timeline' && (
          <TimelineTabView
            palette={palette}
            isDark={isDark}
            language={currentLang}
            selectedDate={store.selectedDate}
            todayDateKey={store.todayDateKey}
            nowMinute={store.nowMinute}
            wakeMinute={store.settings.wake_minute}
            sleepMinute={store.settings.sleep_minute}
            allTasks={store.db.tasks}
            timelineNodes={store.timelineNodes}
            runningBehindStats={store.runningBehindStats}
            onSelectDate={store.setSelectedDate}
            onOpenSettings={() => setSettingsVisible(true)}
            onOpenCreatorForGap={(startMin, suggestedDuration) => {
              setCreatorInitialStart(startMin);
              setCreatorInitialDuration(suggestedDuration);
              setCreatorInitialDest('timeline');
              setCreatorVisible(true);
            }}
            onOpenCreatorDefault={() => {
              const roundedNow = Math.max(
                store.settings.wake_minute,
                Math.min(1380, Math.ceil(store.nowMinute / 15) * 15)
              );
              setCreatorInitialStart(roundedNow);
              setCreatorInitialDuration(30);
              setCreatorInitialDest('timeline');
              setCreatorVisible(true);
            }}
            onRebuildDay={store.rebuildDay}
            onToggleTaskStatus={store.toggleTaskStatus}
            onToggleSubtask={store.toggleSubtaskCompletion}
            onShiftTaskStart={store.shiftTaskStartMinute}
            onDeleteTask={store.deleteTask}
            onStartFocusTimer={(item) => {
              store.startFocusSession(item);
              setActiveTab('focus');
            }}
          />
        )}

        {activeTab === 'inbox' && (
          <InboxRoutinesTabView
            palette={palette}
            isDark={isDark}
            language={currentLang}
            inboxTasks={store.inboxTasks}
            routineStacks={store.routineStacks}
            onQuickCreateInboxTask={store.createTask}
            onScheduleInboxTaskToday={store.scheduleInboxTaskToday}
            onDeleteInboxTask={store.deleteTask}
            onDropRoutineIntoToday={store.dropRoutineStackIntoToday}
            onCreateRoutineStack={store.createRoutineStack}
            onNavigateToTimeline={() => setActiveTab('timeline')}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimerTabView
            palette={palette}
            isDark={isDark}
            language={currentLang}
            activeItem={store.activeFocusItem}
            allTimelineItems={store.timelineItems}
            remainingSeconds={store.focusRemainingSeconds}
            totalSeconds={store.focusTotalSeconds}
            isRunning={store.isFocusRunning}
            isBrownNoiseActive={store.isBrownNoiseActive}
            onSelectFocusTask={(item) => {
              store.setFocusTaskId(item.taskId);
              store.setFocusTotalSeconds(item.effectiveDuration * 60);
              store.setFocusRemainingSeconds(item.effectiveDuration * 60);
              store.setIsFocusRunning(false);
            }}
            onToggleRunning={() => store.setIsFocusRunning((r) => !r)}
            onResetTimer={() => {
              store.setIsFocusRunning(false);
              store.setFocusRemainingSeconds(store.focusTotalSeconds);
            }}
            onExtend5Minutes={store.extendActiveFocusBy5Minutes}
            onToggleBrownNoise={store.toggleBrownNoise}
            onCompleteSubtask={(subId) => store.toggleSubtaskCompletion(subId)}
            onCompleteTask={(tId) => store.toggleTaskStatus(tId)}
          />
        )}
      </main>

      {/* 3-Tab Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 border-t px-4 py-2 transition-colors"
        style={{
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
        }}
      >
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className="flex flex-col items-center justify-center py-1.5 rounded-2xl transition"
            style={{
              color:
                activeTab === 'timeline' ? palette.brandAccent : palette.textSecondary,
              backgroundColor:
                activeTab === 'timeline' ? `${palette.brandAccent}15` : 'transparent',
            }}
          >
            <Calendar size={20} />
            <span className="text-[11px] font-extrabold mt-0.5">{t.tabTimeline}</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className="flex flex-col items-center justify-center py-1.5 rounded-2xl transition relative"
            style={{
              color: activeTab === 'inbox' ? palette.brandAccent : palette.textSecondary,
              backgroundColor:
                activeTab === 'inbox' ? `${palette.brandAccent}15` : 'transparent',
            }}
          >
            <div className="relative">
              <Inbox size={20} />
              {store.inboxTasks.length > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-black text-white"
                  style={{
                    backgroundColor: palette.brandAccent,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {store.inboxTasks.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-extrabold mt-0.5">{t.tabInbox}</span>
          </button>

          <button
            onClick={() => setActiveTab('focus')}
            className="flex flex-col items-center justify-center py-1.5 rounded-2xl transition"
            style={{
              color: activeTab === 'focus' ? palette.brandAccent : palette.textSecondary,
              backgroundColor:
                activeTab === 'focus' ? `${palette.brandAccent}15` : 'transparent',
            }}
          >
            <Timer size={20} />
            <span className="text-[11px] font-extrabold mt-0.5">{t.tabFocus}</span>
          </button>
        </div>
      </nav>

      {/* Screen 3: Fast Task & Routine Creator Modal Sheet */}
      <TaskCreatorSheet
        visible={creatorVisible}
        palette={palette}
        isDark={isDark}
        initialStartMinute={creatorInitialStart}
        initialDurationMinutes={creatorInitialDuration}
        initialDestination={creatorInitialDest}
        onClose={() => setCreatorVisible(false)}
        onSave={(newTask) => {
          store.createTask({
            ...newTask,
            scheduled_date: store.selectedDate,
          });
        }}
      />

      {/* Screen 6: Settings & Zero-Cost Data Backup Modal */}
      <SettingsBackupModal
        visible={settingsVisible}
        palette={palette}
        settings={store.settings}
        onClose={() => setSettingsVisible(false)}
        onUpdateSettings={store.updateSettings}
        onExportBackup={store.exportBackupJsonString}
        onRestoreBackup={store.restoreBackupFromJson}
        onResetDemoData={store.resetToDemoSeed}
        onReplayOnboarding={() => setOnboardingVisible(true)}
      />

      {/* Screen 1: 30-Second Zero-Account Onboarding */}
      <OnboardingModal
        visible={onboardingVisible}
        palette={palette}
        isDark={isDark}
        wakeMinute={store.settings.wake_minute}
        sleepMinute={store.settings.sleep_minute}
        onComplete={(res) => {
          store.updateSettings({
            ...res,
            onboarding_completed: 1,
          });
          setOnboardingVisible(false);
        }}
      />
    </div>
  );
}

export default App;
