/**
 * MyLine: Visual Day Planner
 * Screen 3: Fast Task & Routine Creator (Modal Bottom Sheet)
 * - Auto-updating Icon Badge + Task Title text input (Algorithm D)
 * - Toggle: [ 🗓️ Schedule on Timeline ] vs. [ 📥 Save to Brain Dump Inbox ]
 * - 1-Tap Duration Chips: 15m, 30m, 45m, 1h, 1.5h, 2h
 * - Unlimited Free Recurrence Chips: Once, Every Day, Weekdays, Weekends, Weekly
 * - Category Pastel Picker: 4 colored pills (Deep Work, Routine, Errand, Rest)
 * - Subtask Builder: Dynamic list to add/remove quick steps inside the block
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Inbox, Lock, Plus, Repeat, Sparkles, Trash2, X } from 'lucide-react';
import {
  CATEGORY_TOKENS,
  EnergyTag,
  formatMinutesToTime,
  RecurrenceRule,
  TaskCategory,
  ThemePalette,
} from '../constants/theme';
import { autoMatchKeywordToMeta } from '../utils/timelineAlgorithms';
import { AVAILABLE_TASK_ICONS, TaskIcon } from './TaskIcon';

interface TaskCreatorSheetProps {
  visible: boolean;
  palette: ThemePalette;
  isDark: boolean;
  initialStartMinute?: number | null;
  initialDurationMinutes?: number;
  initialDestination?: 'timeline' | 'inbox';
  onClose: () => void;
  onSave: (task: {
    title: string;
    icon_name: string;
    category: TaskCategory;
    destination: 'timeline' | 'inbox';
    start_minute: number;
    duration_minutes: number;
    recurrence_rule: RecurrenceRule;
    energy_tag: EnergyTag;
    is_locked: boolean;
    subtasks: Array<{ title: string; duration_minutes: number }>;
  }) => void;
}

const DURATION_CHIPS: Array<{ label: string; minutes: number }> = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
];

const RECURRENCE_CHIPS: Array<{ label: string; value: RecurrenceRule }> = [
  { label: 'Once', value: 'NONE' },
  { label: 'Every Day', value: 'DAILY' },
  { label: 'Weekdays', value: 'WEEKDAYS' },
  { label: 'Weekends', value: 'WEEKENDS' },
  { label: 'Weekly', value: 'WEEKLY' },
];

const ENERGY_CHIPS: Array<{ label: string; value: EnergyTag }> = [
  { label: '⚡ Quick 5m', value: 'quick_5m' },
  { label: '🔋 Low Energy', value: 'low' },
  { label: '🔥 High Focus', value: 'high' },
];

export const TaskCreatorSheet: React.FC<TaskCreatorSheetProps> = ({
  visible,
  palette,
  isDark,
  initialStartMinute = 540,
  initialDurationMinutes = 30,
  initialDestination = 'timeline',
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState('CheckCircle2');
  const [category, setCategory] = useState<TaskCategory>('deep_work');
  const [destination, setDestination] = useState<'timeline' | 'inbox'>(initialDestination);
  const [startMinute, setStartMinute] = useState<number>(initialStartMinute ?? 540);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDurationMinutes);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('NONE');
  const [energyTag, setEnergyTag] = useState<EnergyTag>('high');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [subtasks, setSubtasks] = useState<Array<{ title: string; duration_minutes: number }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setIconName('CheckCircle2');
      setCategory('deep_work');
      setDestination(initialDestination);
      setStartMinute(initialStartMinute ?? 540);
      setDurationMinutes(initialDurationMinutes || 30);
      setRecurrenceRule('NONE');
      setEnergyTag('high');
      setIsLocked(false);
      setSubtasks([]);
      setNewSubtaskTitle('');
      setShowIconPicker(false);
    }
  }, [visible, initialStartMinute, initialDurationMinutes, initialDestination]);

  // Algorithm D: Offline Keyword-to-Icon & Category Auto-Matcher
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const match = autoMatchKeywordToMeta(val);
    if (match.matched) {
      setIconName(match.iconName);
      setCategory(match.category);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [...prev, { title: newSubtaskTitle.trim(), duration_minutes: 5 }]);
    setNewSubtaskTitle('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalSubtasks = newSubtaskTitle.trim()
      ? [...subtasks, { title: newSubtaskTitle.trim(), duration_minutes: 5 }]
      : subtasks;

    onSave({
      title: title.trim(),
      icon_name: iconName,
      category,
      destination,
      start_minute: startMinute,
      duration_minutes: durationMinutes,
      recurrence_rule: recurrenceRule,
      energy_tag: energyTag,
      is_locked: isLocked,
      subtasks: finalSubtasks,
    });
    onClose();
  };

  if (!visible) return null;

  const currentCatToken = CATEGORY_TOKENS[category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(18, 20, 23, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto border shadow-2xl"
        style={{
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
          color: palette.textPrimary,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Close */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} color={palette.brandAccent} />
            <h3 className="text-base font-bold">New Time Block or Brain Dump</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:opacity-80"
            style={{ backgroundColor: palette.backgroundPrimary }}
          >
            <X size={18} color={palette.textSecondary} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-updating Icon Badge + Task Title Input */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition"
              style={{
                backgroundColor: isDark ? currentCatToken.darkFill : currentCatToken.lightFill,
                color: isDark ? currentCatToken.darkText : currentCatToken.lightText,
                borderColor: palette.borderSubtle,
              }}
              title="Tap to change icon (auto-matches as you type)"
            >
              <TaskIcon
                name={iconName}
                size={22}
                color={isDark ? currentCatToken.darkText : currentCatToken.lightText}
              />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Study architecture, Morning workout, Buy coffee..."
              autoFocus
              className="flex-1 h-12 px-4 rounded-2xl text-sm font-medium border outline-none"
              style={{
                backgroundColor: palette.backgroundPrimary,
                borderColor: palette.borderSubtle,
                color: palette.textPrimary,
              }}
            />
          </div>

          {/* Optional Icon Picker Drawer */}
          {showIconPicker && (
            <div
              className="p-3 rounded-2xl border flex flex-wrap gap-2"
              style={{
                backgroundColor: palette.backgroundPrimary,
                borderColor: palette.borderSubtle,
              }}
            >
              {AVAILABLE_TASK_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => {
                    setIconName(ic);
                    setShowIconPicker(false);
                  }}
                  className="p-2 rounded-xl border transition"
                  style={{
                    backgroundColor: iconName === ic ? palette.brandAccent : palette.surfaceCard,
                    borderColor: iconName === ic ? palette.brandAccent : palette.borderSubtle,
                  }}
                >
                  <TaskIcon
                    name={ic}
                    size={16}
                    color={iconName === ic ? '#FFFFFF' : palette.textPrimary}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Destination Toggle: Schedule on Timeline vs Save to Brain Dump Inbox */}
          <div
            className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl border"
            style={{
              backgroundColor: palette.backgroundPrimary,
              borderColor: palette.borderSubtle,
            }}
          >
            <button
              type="button"
              onClick={() => setDestination('timeline')}
              className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              style={{
                backgroundColor:
                  destination === 'timeline' ? palette.surfaceCard : 'transparent',
                color:
                  destination === 'timeline' ? palette.brandAccent : palette.textSecondary,
                boxShadow:
                  destination === 'timeline' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Calendar size={14} />
              <span>🗓️ Schedule on Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setDestination('inbox')}
              className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              style={{
                backgroundColor:
                  destination === 'inbox' ? palette.surfaceCard : 'transparent',
                color:
                  destination === 'inbox' ? palette.brandAccent : palette.textSecondary,
                boxShadow:
                  destination === 'inbox' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Inbox size={14} />
              <span>📥 Brain Dump Inbox</span>
            </button>
          </div>

          {/* Start Time Adjuster (if Timeline) or Energy Tag (if Inbox) */}
          {destination === 'timeline' ? (
            <div
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border"
              style={{
                backgroundColor: palette.backgroundPrimary,
                borderColor: palette.borderSubtle,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: palette.textSecondary }}>
                  Start Time:
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ fontVariantNumeric: 'tabular-nums', color: palette.textPrimary }}
                >
                  {formatMinutesToTime(startMinute)} –{' '}
                  {formatMinutesToTime(startMinute + durationMinutes)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStartMinute((m) => Math.max(0, m - 15))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: palette.surfaceCard,
                    borderColor: palette.borderSubtle,
                  }}
                >
                  -15m
                </button>
                <button
                  type="button"
                  onClick={() => setStartMinute((m) => Math.min(1410, m + 15))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: palette.surfaceCard,
                    borderColor: palette.borderSubtle,
                  }}
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocked((l) => !l)}
                  className="ml-1 px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1"
                  style={{
                    backgroundColor: isLocked ? palette.brandAccent : palette.surfaceCard,
                    color: isLocked ? '#FFFFFF' : palette.textSecondary,
                    borderColor: isLocked ? palette.brandAccent : palette.borderSubtle,
                  }}
                  title="Lock as immovable anchor"
                >
                  <Lock size={12} />
                  <span>{isLocked ? 'Locked' : 'Flexible'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: palette.textSecondary }}>
                Energy Required (for Inbox Filtering)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ENERGY_CHIPS.map((ch) => {
                  const active = energyTag === ch.value;
                  return (
                    <button
                      type="button"
                      key={ch.value}
                      onClick={() => setEnergyTag(ch.value)}
                      className="py-2 px-2 rounded-xl text-xs font-semibold border transition"
                      style={{
                        backgroundColor: active ? palette.brandAccent : palette.backgroundPrimary,
                        color: active ? '#FFFFFF' : palette.textPrimary,
                        borderColor: active ? palette.brandAccent : palette.borderSubtle,
                      }}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1-Tap Duration Chips: 15m, 30m, 45m, 1h, 1.5h, 2h */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: palette.textSecondary }}>
              1-Tap Duration
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {DURATION_CHIPS.map((chip) => {
                const active = durationMinutes === chip.minutes;
                return (
                  <button
                    type="button"
                    key={chip.minutes}
                    onClick={() => setDurationMinutes(chip.minutes)}
                    className="py-2 rounded-xl text-xs font-bold border transition"
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      backgroundColor: active ? palette.brandAccent : palette.backgroundPrimary,
                      color: active ? '#FFFFFF' : palette.textPrimary,
                      borderColor: active ? palette.brandAccent : palette.borderSubtle,
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Pastel Picker: 4 colored pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: palette.textSecondary }}>
              Category Pastel
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_TOKENS) as TaskCategory[]).map((catKey) => {
                const tok = CATEGORY_TOKENS[catKey];
                const selected = category === catKey;
                const fill = isDark ? tok.darkFill : tok.lightFill;
                const txt = isDark ? tok.darkText : tok.lightText;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey)}
                    className="py-2 px-2 rounded-xl text-xs font-bold border-2 transition"
                    style={{
                      backgroundColor: fill,
                      color: txt,
                      borderColor: selected ? txt : 'transparent',
                    }}
                  >
                    {tok.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unlimited Free Recurrence Chips */}
          {destination === 'timeline' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Repeat size={13} color={palette.textSecondary} />
                <label className="text-xs font-semibold" style={{ color: palette.textSecondary }}>
                  Repeat (Unlimited Free Recurrence)
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RECURRENCE_CHIPS.map((rec) => {
                  const active = recurrenceRule === rec.value;
                  return (
                    <button
                      type="button"
                      key={rec.value}
                      onClick={() => setRecurrenceRule(rec.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition"
                      style={{
                        backgroundColor: active ? palette.brandAccent : palette.backgroundPrimary,
                        color: active ? '#FFFFFF' : palette.textPrimary,
                        borderColor: active ? palette.brandAccent : palette.borderSubtle,
                      }}
                    >
                      {rec.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtask Builder */}
          <div className="space-y-2">
            <label className="text-xs font-semibold" style={{ color: palette.textSecondary }}>
              Micro-Steps / Subtasks Checklist ({subtasks.length})
            </label>
            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs border"
                    style={{
                      backgroundColor: palette.backgroundPrimary,
                      borderColor: palette.borderSubtle,
                    }}
                  >
                    <span>
                      {idx + 1}. {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSubtasks((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-red-500 hover:opacity-75 p-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a tiny 5-minute step..."
                className="flex-1 h-9 px-3 rounded-xl text-xs border outline-none"
                style={{
                  backgroundColor: palette.backgroundPrimary,
                  borderColor: palette.borderSubtle,
                  color: palette.textPrimary,
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1"
                style={{
                  backgroundColor: palette.backgroundPrimary,
                  borderColor: palette.borderSubtle,
                  color: palette.textPrimary,
                }}
              >
                <Plus size={14} />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition disabled:opacity-40"
            style={{ backgroundColor: palette.brandAccent }}
          >
            {destination === 'timeline'
              ? `Add to Timeline (${formatMinutesToTime(startMinute)})`
              : 'Save to Brain Dump Inbox'}
          </button>
        </form>
      </div>
    </div>
  );
};
