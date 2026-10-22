/**
 * MyLine: Visual Day Planner
 * Screen 5: Tab 3 — Anti-Time-Blindness Visual Focus Timer
 * - Visual Shrinking Disk: SVG circular dial where remaining time is rendered as a solid pastel pie wedge
 *   that physically shrinks counterclockwise every second (Time-Timer style), paired with large tabular numbers (42:15 left).
 * - Active Subtask Spotlight: Shows only the current uncompleted subtask in a focused card with a [ ✓ Done — Next Step ] button.
 * - Quick Adjustments:
 *   [ +5m Need More Time ]: Adds 5 minutes to the active block and automatically cascades adjacent flexible tasks down by 5 minutes.
 *   [ 🔊 Brown Noise ]: Toggles soothing offline procedural/looped Brown Noise audio for ADHD focus.
 */

import React, { useState } from 'react';
import {
  Check,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CATEGORY_TOKENS,
  formatMinutesToTime,
  ThemePalette,
} from '../constants/theme';
import { getTranslation } from '../constants/i18n';
import { ResolvedTimelineItem } from '../utils/timelineAlgorithms';
import { TaskIcon } from './TaskIcon';

interface FocusTimerTabViewProps {
  palette: ThemePalette;
  isDark: boolean;
  language?: string;
  activeItem: ResolvedTimelineItem | null;
  allTimelineItems: ResolvedTimelineItem[];
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isBrownNoiseActive: boolean;
  onSelectFocusTask: (item: ResolvedTimelineItem) => void;
  onToggleRunning: () => void;
  onResetTimer: () => void;
  onExtend5Minutes: () => void;
  onToggleBrownNoise: () => void;
  onCompleteSubtask: (subtaskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

/**
 * Computes an SVG pie wedge path that starts at 12 o'clock and sweeps clockwise
 * by `fraction * 360` degrees — so as `fraction` decreases every second,
 * the wedge physically shrinks counterclockwise (Time-Timer style).
 */
function describePieWedge(cx: number, cy: number, radius: number, fraction: number): string {
  const clamped = Math.max(0, Math.min(0.9999, fraction));
  if (clamped <= 0.001) return '';

  const angleRad = clamped * 2 * Math.PI;
  // Start at top (12 o'clock = -PI/2)
  const startX = cx;
  const startY = cy - radius;

  const endX = cx + radius * Math.sin(angleRad);
  const endY = cy - radius * Math.cos(angleRad);

  const largeArcFlag = clamped > 0.5 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    'Z',
  ].join(' ');
}

export const FocusTimerTabView: React.FC<FocusTimerTabViewProps> = ({
  palette,
  isDark,
  language = 'en',
  activeItem,
  allTimelineItems,
  remainingSeconds,
  totalSeconds,
  isRunning,
  isBrownNoiseActive,
  onSelectFocusTask,
  onToggleRunning,
  onResetTimer,
  onExtend5Minutes,
  onToggleBrownNoise,
  onCompleteSubtask,
  onCompleteTask,
}) => {
  const t = getTranslation(language);
  const [cascadeBanner, setCascadeBanner] = useState<string | null>(null);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedCountdown = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const fractionRemaining =
    totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;

  const catToken = activeItem
    ? CATEGORY_TOKENS[activeItem.category]
    : CATEGORY_TOKENS.deep_work;

  const wedgeFill = isDark ? catToken.darkText : palette.brandAccent;
  const ringBg = isDark ? catToken.darkFill : catToken.lightFill;
  const badgeText = isDark ? catToken.darkText : catToken.lightText;

  // Active Subtask Spotlight: find the first uncompleted subtask
  const uncompletedSubtasks = (activeItem?.subtasks ?? []).filter((s) => !s.is_completed);
  const currentSpotlightSubtask = uncompletedSubtasks[0] || null;
  const completedSubtaskCount =
    (activeItem?.subtasks.length ?? 0) - uncompletedSubtasks.length;

  const handleExtendClick = () => {
    onExtend5Minutes();
    setCascadeBanner('✨ Added +5m & cascaded adjacent flexible tasks down by 5m');
    setTimeout(() => setCascadeBanner(null), 3200);
  };

  // Hour/minute tick marks around the 60-minute Time-Timer dial
  const dialTicks = Array.from({ length: 12 }, (_, idx) => {
    const angle = (idx * 30 * Math.PI) / 180;
    const x1 = 130 + 102 * Math.sin(angle);
    const y1 = 130 - 102 * Math.cos(angle);
    const x2 = 130 + 110 * Math.sin(angle);
    const y2 = 130 - 110 * Math.cos(angle);
    return { x1, y1, x2, y2, label: idx * 5 };
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pt-4 pb-28 space-y-4">
      {/* Header & Task Switcher Pill */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight">
            {t.focusHeaderTitle}
          </h1>
          <p className="text-xs" style={{ color: palette.textSecondary }}>
            {t.focusHeaderSub}
          </p>
        </div>

        {/* Brown Noise Quick Toggle Pill */}
        <button
          onClick={onToggleBrownNoise}
          className="px-3.5 py-2 rounded-2xl text-xs font-extrabold border flex items-center gap-1.5 transition shadow-xs"
          style={{
            backgroundColor: isBrownNoiseActive ? palette.brandAccent : palette.surfaceCard,
            color: isBrownNoiseActive ? '#FFFFFF' : palette.textPrimary,
            borderColor: isBrownNoiseActive ? palette.brandAccent : palette.borderSubtle,
          }}
        >
          {isBrownNoiseActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{t.brownNoiseLabel} {isBrownNoiseActive ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Active Task Selector Strip */}
      {allTimelineItems.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {allTimelineItems
            .filter((i) => !i.is_locked)
            .map((item) => {
              const selected = activeItem?.taskId === item.taskId;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectFocusTask(item)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 flex items-center gap-1.5 transition"
                  style={{
                    backgroundColor: selected ? palette.brandAccent : palette.surfaceCard,
                    color: selected ? '#FFFFFF' : palette.textPrimary,
                    borderColor: selected ? palette.brandAccent : palette.borderSubtle,
                  }}
                >
                  <TaskIcon
                    name={item.icon_name}
                    size={13}
                    color={selected ? '#FFFFFF' : palette.textPrimary}
                  />
                  <span className="truncate max-w-[150px]">{item.title}</span>
                </button>
              );
            })}
        </div>
      )}

      {cascadeBanner && (
        <div
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-center"
          style={{
            backgroundColor: isDark ? '#1B3829' : '#E3F2E6',
            color: isDark ? '#8CE0A6' : '#2D6A4F',
          }}
        >
          {cascadeBanner}
        </div>
      )}

      {/* Visual Shrinking Disk Card */}
      <div
        className="p-5 rounded-3xl border flex flex-col items-center shadow-sm"
        style={{
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
        }}
      >
        {activeItem && (
          <div className="flex items-center gap-2 mb-2 text-center">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5"
              style={{ backgroundColor: ringBg, color: badgeText }}
            >
              <TaskIcon name={activeItem.icon_name} size={13} color={badgeText} />
              <span>{activeItem.title}</span>
            </span>
            <span
              className="text-xs font-bold"
              style={{
                color: palette.textSecondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatMinutesToTime(activeItem.effectiveStart)}–
              {formatMinutesToTime(activeItem.effectiveEnd)}
            </span>
          </div>
        )}

        {/* Time-Timer Counterclockwise Shrinking SVG Pie Dial */}
        <div className="relative flex items-center justify-center my-1">
          <svg width={260} height={260} viewBox="0 0 260 260">
            {/* Outer subtle bezel */}
            <circle
              cx={130}
              cy={130}
              r={114}
              fill={palette.backgroundPrimary}
              stroke={palette.borderSubtle}
              strokeWidth={2}
            />

            {/* Soft pastel track disk */}
            <circle cx={130} cy={130} r={96} fill={ringBg} opacity={0.45} />

            {/* Shrinking Pastel Pie Wedge */}
            <path
              d={describePieWedge(130, 130, 96, fractionRemaining)}
              fill={wedgeFill}
              opacity={0.85}
            />

            {/* 5-minute tick marks */}
            {dialTicks.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={palette.textSecondary}
                strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={0.55}
              />
            ))}

            {/* Center hub */}
            <circle
              cx={130}
              cy={130}
              r={46}
              fill={palette.surfaceCard}
              stroke={palette.borderSubtle}
              strokeWidth={2}
            />
          </svg>

          {/* Center Tabular Countdown Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-xl font-black tracking-tight"
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: palette.textPrimary,
              }}
            >
              {formattedCountdown}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: palette.textSecondary }}
            >
              left
            </span>
          </div>
        </div>

        {/* Large Tabular Countdown + Play/Pause & +5m Controls */}
        <div
          className="text-3xl font-black tracking-tight mt-1 mb-3"
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: palette.textPrimary,
          }}
        >
          {formattedCountdown} left
        </div>

        <div className="flex items-center gap-2.5 w-full max-w-sm">
          <button
            onClick={onToggleRunning}
            className="flex-1 py-3.5 px-4 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
            style={{ backgroundColor: palette.brandAccent }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            <span>{isRunning ? 'Pause Focus' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleExtendClick}
            className="py-3.5 px-4 rounded-2xl text-xs font-extrabold border flex items-center gap-1 transition active:scale-95"
            style={{
              backgroundColor: palette.backgroundPrimary,
              borderColor: palette.borderSubtle,
              color: palette.textPrimary,
            }}
            title="Adds 5 minutes to active block and cascades adjacent flexible tasks"
          >
            <Plus size={14} />
            <span>+5m Need More Time</span>
          </button>

          <button
            onClick={onResetTimer}
            className="p-3.5 rounded-2xl border transition"
            style={{
              backgroundColor: palette.backgroundPrimary,
              borderColor: palette.borderSubtle,
              color: palette.textSecondary,
            }}
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Active Subtask Spotlight (Shows ONLY the current uncompleted subtask so user isn't overwhelmed) */}
      <div
        className="p-4 rounded-3xl border space-y-3 shadow-xs"
        style={{
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: palette.brandAccent }}
          >
            <Sparkles size={14} />
            <span>Active Subtask Spotlight</span>
          </span>
          {activeItem && activeItem.subtasks.length > 0 && (
            <span
              className="text-xs font-bold"
              style={{
                color: palette.textSecondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Step {Math.min(activeItem.subtasks.length, completedSubtaskCount + 1)} of{' '}
              {activeItem.subtasks.length}
            </span>
          )}
        </div>

        {currentSpotlightSubtask ? (
          <div
            className="p-4 rounded-2xl border flex items-center justify-between gap-3"
            style={{
              backgroundColor: ringBg,
              borderColor: `${badgeText}35`,
              color: badgeText,
            }}
          >
            <div>
              <div className="text-[11px] font-bold uppercase opacity-75">
                Focus only on this right now:
              </div>
              <div className="text-base font-extrabold mt-0.5">
                {currentSpotlightSubtask.title}
              </div>
              <div
                className="text-xs font-semibold opacity-80 mt-0.5"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                Estimated: {currentSpotlightSubtask.duration_minutes}m
              </div>
            </div>

            <button
              onClick={() => onCompleteSubtask(currentSpotlightSubtask.id)}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              style={{ backgroundColor: palette.brandAccent }}
            >
              <Check size={15} strokeWidth={3} />
              <span>✓ Done — Next Step</span>
            </button>
          </div>
        ) : activeItem ? (
          <div
            className="p-4 rounded-2xl border flex items-center justify-between gap-3"
            style={{
              backgroundColor: palette.backgroundPrimary,
              borderColor: palette.borderSubtle,
            }}
          >
            <div>
              <div className="text-sm font-extrabold">
                All micro-steps completed for "{activeItem.title}"!
              </div>
              <div className="text-xs" style={{ color: palette.textSecondary }}>
                Ready to check off the entire time block?
              </div>
            </div>
            <button
              onClick={() => onCompleteTask(activeItem.taskId)}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shrink-0 flex items-center gap-1.5"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Check size={15} />
              <span>Complete Block</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
