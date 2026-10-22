/**
 * MyLine: Visual Day Planner
 * Screen 4: Tab 2 — Brain Dump Inbox & Routine Stacks
 */

import React, { useState } from 'react';
import {
  Calendar,
  Inbox,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  CATEGORY_TOKENS,
  EnergyTag,
  formatDurationLabel,
  formatMinutesToTime,
  RecurrenceRule,
  TaskCategory,
  ThemePalette,
} from '../constants/theme';
import { RoutineStackRow, RoutineStepItem, TaskRow } from '../db/schema';
import { getTranslation } from '../constants/i18n';
import { autoMatchKeywordToMeta } from '../utils/timelineAlgorithms';
import { TaskIcon } from './TaskIcon';

interface InboxRoutinesTabViewProps {
  palette: ThemePalette;
  isDark: boolean;
  language?: string;
  inboxTasks: TaskRow[];
  routineStacks: RoutineStackRow[];
  onQuickCreateInboxTask: (input: {
    title: string;
    icon_name: string;
    category: TaskCategory;
    destination: 'inbox';
    duration_minutes: number;
    recurrence_rule: RecurrenceRule;
    energy_tag: EnergyTag;
  }) => void;
  onScheduleInboxTaskToday: (taskId: string) => number | null;
  onDeleteInboxTask: (taskId: string) => void;
  onDropRoutineIntoToday: (stack: RoutineStackRow) => { newTaskId: string; startMin: number };
  onCreateRoutineStack: (input: {
    title: string;
    icon_name: string;
    category: TaskCategory;
    default_start_minute: number;
    steps: RoutineStepItem[];
  }) => void;
  onNavigateToTimeline: () => void;
}

export const InboxRoutinesTabView: React.FC<InboxRoutinesTabViewProps> = ({
  palette,
  isDark,
  language = 'en',
  inboxTasks,
  routineStacks,
  onQuickCreateInboxTask,
  onScheduleInboxTaskToday,
  onDeleteInboxTask,
  onDropRoutineIntoToday,
  onCreateRoutineStack,
  onNavigateToTimeline,
}) => {
  const t = getTranslation(language);
  const [subTab, setSubTab] = useState<'inbox' | 'routines'>('inbox');
  const [energyFilter, setEnergyFilter] = useState<'ALL' | EnergyTag>('ALL');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickEnergy, setQuickEnergy] = useState<EnergyTag>('quick_5m');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Routine Stack Builder state
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [newStackTitle, setNewStackTitle] = useState('');
  const [newStackCategory, setNewStackCategory] = useState<TaskCategory>('routine');
  const [newStackSteps, setNewStackSteps] = useState<RoutineStepItem[]>([
    { title: 'Step 1: Hydrate & stretch', duration: 5 },
    { title: 'Step 2: Review top priority', duration: 10 },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleQuickBrainDump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const matched = autoMatchKeywordToMeta(quickTitle);
    const duration = quickEnergy === 'quick_5m' ? 15 : quickEnergy === 'low' ? 20 : 45;
    onQuickCreateInboxTask({
      title: quickTitle.trim(),
      icon_name: matched.iconName,
      category: matched.category,
      destination: 'inbox',
      duration_minutes: duration,
      recurrence_rule: 'NONE',
      energy_tag: quickEnergy,
    });
    setQuickTitle('');
    showToast('📥 Saved to Brain Dump Inbox!');
  };

  const filteredInbox = inboxTasks.filter((t) =>
    energyFilter === 'ALL' ? true : t.energy_tag === energyFilter
  );

  const handleSaveCustomRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackTitle.trim()) return;
    onCreateRoutineStack({
      title: newStackTitle.trim(),
      icon_name: 'Sparkles',
      category: newStackCategory,
      default_start_minute: 540,
      steps: newStackSteps.filter((s) => s.title.trim().length > 0),
    });
    setNewStackTitle('');
    setShowRoutineBuilder(false);
    showToast('✨ Custom Routine Stack saved!');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Segmented Top Control */}
      <header
        className="px-4 pt-4 pb-3 border-b sticky top-0 z-20"
        style={{
          backgroundColor: palette.backgroundPrimary,
          borderColor: palette.borderSubtle,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">
              {t.inboxHeaderTitle}
            </h1>
            <p className="text-xs" style={{ color: palette.textSecondary }}>
              {t.inboxHeaderSub}
            </p>
          </div>
        </div>

        {/* Segmented Control */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl border"
          style={{
            backgroundColor: palette.surfaceCard,
            borderColor: palette.borderSubtle,
          }}
        >
          <button
            onClick={() => setSubTab('inbox')}
            className="py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
            style={{
              backgroundColor: subTab === 'inbox' ? palette.brandAccent : 'transparent',
              color: subTab === 'inbox' ? '#FFFFFF' : palette.textSecondary,
            }}
          >
            <Inbox size={14} />
            <span>{t.unscheduledInboxTab} ({inboxTasks.length})</span>
          </button>

          <button
            onClick={() => setSubTab('routines')}
            className="py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
            style={{
              backgroundColor: subTab === 'routines' ? palette.brandAccent : 'transparent',
              color: subTab === 'routines' ? '#FFFFFF' : palette.textSecondary,
            }}
          >
            <Layers size={14} />
            <span>{t.routineStacksTab} ({routineStacks.length})</span>
          </button>
        </div>

        {toastMsg && (
          <div
            className="mt-2.5 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between"
            style={{
              backgroundColor: isDark ? '#1B3829' : '#E3F2E6',
              color: isDark ? '#8CE0A6' : '#2D6A4F',
            }}
          >
            <span>{toastMsg}</span>
            <button
              onClick={onNavigateToTimeline}
              className="underline font-extrabold ml-2"
            >
              View Timeline →
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">
        {subTab === 'inbox' ? (
          <>
            {/* 2-Second Quick Brain Dump Input Bar */}
            <form
              onSubmit={handleQuickBrainDump}
              className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs"
              style={{
                backgroundColor: palette.surfaceCard,
                borderColor: palette.borderSubtle,
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="2-second brain dump... (e.g. Call pharmacy, Read chapter 4)"
                  className="flex-1 h-10 px-3.5 rounded-xl text-xs font-medium border outline-none"
                  style={{
                    backgroundColor: palette.backgroundPrimary,
                    borderColor: palette.borderSubtle,
                    color: palette.textPrimary,
                  }}
                />
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="h-10 px-4 rounded-xl text-xs font-extrabold text-white flex items-center gap-1 disabled:opacity-40 transition"
                  style={{ backgroundColor: palette.brandAccent }}
                >
                  <Plus size={15} />
                  <span>Dump</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold mr-1" style={{ color: palette.textSecondary }}>
                  Tag energy:
                </span>
                {(
                  [
                    { label: '⚡ Quick 5m', val: 'quick_5m' },
                    { label: '🔋 Low Energy', val: 'low' },
                    { label: '🔥 High Focus', val: 'high' },
                  ] as Array<{ label: string; val: EnergyTag }>
                ).map((eOpt) => {
                  const active = quickEnergy === eOpt.val;
                  return (
                    <button
                      type="button"
                      key={eOpt.val}
                      onClick={() => setQuickEnergy(eOpt.val)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition"
                      style={{
                        backgroundColor: active ? `${palette.brandAccent}20` : palette.backgroundPrimary,
                        borderColor: active ? palette.brandAccent : palette.borderSubtle,
                        color: active ? palette.brandAccent : palette.textSecondary,
                      }}
                    >
                      {eOpt.label}
                    </button>
                  );
                })}
              </div>
            </form>

            {/* Filter Chips by Energy Required */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { label: 'All', val: 'ALL' },
                  { label: '⚡ Quick 5m', val: 'quick_5m' },
                  { label: '🔋 Low Energy', val: 'low' },
                  { label: '🔥 High Focus', val: 'high' },
                ] as const
              ).map((chip) => {
                const active = energyFilter === chip.val;
                return (
                  <button
                    key={chip.val}
                    onClick={() => setEnergyFilter(chip.val)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 transition"
                    style={{
                      backgroundColor: active ? palette.brandAccent : palette.surfaceCard,
                      color: active ? '#FFFFFF' : palette.textPrimary,
                      borderColor: active ? palette.brandAccent : palette.borderSubtle,
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Unscheduled Inbox Cards */}
            {filteredInbox.length === 0 ? (
              <div
                className="p-8 rounded-3xl border text-center space-y-2"
                style={{
                  backgroundColor: palette.surfaceCard,
                  borderColor: palette.borderSubtle,
                }}
              >
                <Sparkles size={28} color={palette.brandAccent} className="mx-auto" />
                <div className="text-sm font-bold">Your Mind is Clear</div>
                <p className="text-xs" style={{ color: palette.textSecondary }}>
                  No unscheduled brain dumps in this energy filter. Use the bar above anytime a random thought pops up!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredInbox.map((task) => {
                  const tok = CATEGORY_TOKENS[task.category];
                  const badgeBg = isDark ? tok.darkFill : tok.lightFill;
                  const badgeText = isDark ? tok.darkText : tok.lightText;
                  const energyBadge =
                    task.energy_tag === 'quick_5m'
                      ? '⚡ Quick 5m'
                      : task.energy_tag === 'low'
                      ? '🔋 Low Energy'
                      : '🔥 High Focus';

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs transition"
                      style={{
                        backgroundColor: palette.surfaceCard,
                        borderColor: palette.borderSubtle,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: badgeBg, color: badgeText }}
                        >
                          <TaskIcon name={task.icon_name} size={19} color={badgeText} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold truncate">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold" style={{ color: palette.textSecondary }}>
                            <span>{energyBadge}</span>
                            <span>•</span>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {formatDurationLabel(task.duration_minutes)}
                            </span>
                            <span>•</span>
                            <span style={{ color: badgeText }}>{tok.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            const slot = onScheduleInboxTaskToday(task.id);
                            if (slot !== null) {
                              showToast(
                                `🗓️ Scheduled "${task.title}" into Free Space at ${formatMinutesToTime(slot)}!`
                              );
                            }
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                          style={{ backgroundColor: palette.brandAccent }}
                        >
                          <Calendar size={13} />
                          <span>🗓️ Schedule Today</span>
                        </button>

                        <button
                          onClick={() => onDeleteInboxTask(task.id)}
                          className="p-2 rounded-xl border opacity-65 hover:opacity-100"
                          style={{ borderColor: palette.borderSubtle }}
                          title="Delete inbox item"
                        >
                          <Trash2 size={14} color={palette.textSecondary} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Routine Stacks Sub-View */
          <div className="space-y-3">
            {routineStacks.map((stack) => {
              const tok = CATEGORY_TOKENS[stack.category] || CATEGORY_TOKENS.routine;
              const fill = isDark ? tok.darkFill : tok.lightFill;
              const txt = isDark ? tok.darkText : tok.lightText;
              let steps: RoutineStepItem[] = [];
              try {
                steps = JSON.parse(stack.steps_json) as RoutineStepItem[];
              } catch {
                steps = [];
              }

              return (
                <div
                  key={stack.id}
                  className="p-4 rounded-3xl border space-y-3 shadow-xs"
                  style={{
                    backgroundColor: palette.surfaceCard,
                    borderColor: palette.borderSubtle,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: fill, color: txt }}
                      >
                        <TaskIcon name={stack.icon_name} size={22} color={txt} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold">{stack.title}</h3>
                        <p
                          className="text-xs font-semibold"
                          style={{
                            color: palette.textSecondary,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          Default {formatMinutesToTime(stack.default_start_minute)} •{' '}
                          {steps.length} micro-steps ({stack.total_duration_minutes}m total)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const res = onDropRoutineIntoToday(stack);
                        showToast(
                          `✨ Dropped "${stack.title}" onto Today's timeline at ${formatMinutesToTime(res.startMin)}!`
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition"
                      style={{ backgroundColor: palette.brandAccent }}
                    >
                      <Plus size={14} />
                      <span>+ Drop into Today</span>
                    </button>
                  </div>

                  {/* Pre-configured Subtask Steps */}
                  <div
                    className="p-3 rounded-2xl border space-y-1.5"
                    style={{
                      backgroundColor: palette.backgroundPrimary,
                      borderColor: palette.borderSubtle,
                    }}
                  >
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                            style={{ backgroundColor: fill, color: txt }}
                          >
                            {i + 1}
                          </span>
                          <span>{step.title}</span>
                        </span>
                        <span
                          className="text-[11px]"
                          style={{
                            color: palette.textSecondary,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {step.duration}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Create Custom Routine Stack Button / Form */}
            {!showRoutineBuilder ? (
              <button
                onClick={() => setShowRoutineBuilder(true)}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                style={{
                  borderColor: palette.borderSubtle,
                  color: palette.brandAccent,
                }}
              >
                <Plus size={16} />
                <span>Create Custom Reusable Routine Stack</span>
              </button>
            ) : (
              <form
                onSubmit={handleSaveCustomRoutine}
                className="p-4 rounded-3xl border space-y-3"
                style={{
                  backgroundColor: palette.surfaceCard,
                  borderColor: palette.borderSubtle,
                }}
              >
                <h4 className="text-sm font-extrabold">New Reusable Routine Stack</h4>
                <input
                  type="text"
                  value={newStackTitle}
                  onChange={(e) => setNewStackTitle(e.target.value)}
                  placeholder="Routine title (e.g., Afternoon Reset, Study Warmup)"
                  className="w-full h-10 px-3 rounded-xl text-xs font-semibold border outline-none"
                  style={{
                    backgroundColor: palette.backgroundPrimary,
                    borderColor: palette.borderSubtle,
                    color: palette.textPrimary,
                  }}
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(CATEGORY_TOKENS) as TaskCategory[]).map((cat) => {
                    const tok = CATEGORY_TOKENS[cat];
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setNewStackCategory(cat)}
                        className="py-1.5 rounded-xl text-[11px] font-bold border-2"
                        style={{
                          backgroundColor: isDark ? tok.darkFill : tok.lightFill,
                          color: isDark ? tok.darkText : tok.lightText,
                          borderColor:
                            newStackCategory === cat
                              ? isDark
                                ? tok.darkText
                                : tok.lightText
                              : 'transparent',
                        }}
                      >
                        {tok.label}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-1.5">
                  {newStackSteps.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewStackSteps((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                          );
                        }}
                        className="flex-1 h-8 px-2.5 rounded-lg text-xs border outline-none"
                        style={{
                          backgroundColor: palette.backgroundPrimary,
                          borderColor: palette.borderSubtle,
                          color: palette.textPrimary,
                        }}
                      />
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={st.duration}
                        onChange={(e) => {
                          const dur = Number(e.target.value) || 5;
                          setNewStackSteps((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, duration: dur } : item
                            )
                          );
                        }}
                        className="w-14 h-8 px-2 rounded-lg text-xs font-bold border text-center"
                        style={{
                          backgroundColor: palette.backgroundPrimary,
                          borderColor: palette.borderSubtle,
                          color: palette.textPrimary,
                        }}
                      />
                      <span className="text-xs" style={{ color: palette.textSecondary }}>
                        m
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setNewStackSteps((prev) => [...prev, { title: '', duration: 5 }])
                    }
                    className="text-xs font-bold"
                    style={{ color: palette.brandAccent }}
                  >
                    + Add another step
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white"
                    style={{ backgroundColor: palette.brandAccent }}
                  >
                    Save Routine Stack
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRoutineBuilder(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border"
                    style={{ borderColor: palette.borderSubtle }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
