/**
 * MyLine: Visual Day Planner
 * Screen 2: Tab 1 — The Visual Timeline (Home Screen)
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Lock,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  CATEGORY_TOKENS,
  durationToHeightDp,
  formatDurationLabel,
  formatMinutesToTime,
  SPATIAL_RULES,
  ThemePalette,
} from '../constants/theme';
import { getTranslation } from '../constants/i18n';
import {
  doesTaskOccurOnDate,
  parseDateKey,
  ResolvedTimelineItem,
  TimelineRenderNode,
  toDateKey,
} from '../utils/timelineAlgorithms';
import { TaskRow } from '../db/schema';
import { TaskIcon } from './TaskIcon';

interface TimelineTabViewProps {
  palette: ThemePalette;
  isDark: boolean;
  language?: string;
  selectedDate: string;
  todayDateKey: string;
  nowMinute: number;
  wakeMinute: number;
  sleepMinute: number;
  allTasks: TaskRow[];
  timelineNodes: TimelineRenderNode[];
  runningBehindStats: {
    isBehind: boolean;
    overdueCount: number;
    behindMinutes: number;
  };
  onSelectDate: (dateKey: string) => void;
  onOpenSettings: () => void;
  onOpenCreatorForGap: (startMinute: number, suggestedDuration: number) => void;
  onOpenCreatorDefault: () => void;
  onRebuildDay: () => number;
  onToggleTaskStatus: (taskId: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onShiftTaskStart: (taskId: string, newStartMinute: number) => void;
  onDeleteTask: (taskId: string) => void;
  onStartFocusTimer: (item: ResolvedTimelineItem) => void;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const TimelineTabView: React.FC<TimelineTabViewProps> = ({
  palette,
  isDark,
  language = 'en',
  selectedDate,
  todayDateKey,
  nowMinute,
  wakeMinute,
  allTasks,
  timelineNodes,
  runningBehindStats,
  onSelectDate,
  onOpenSettings,
  onOpenCreatorForGap,
  onOpenCreatorDefault,
  onRebuildDay,
  onToggleTaskStatus,
  onToggleSubtask,
  onShiftTaskStart,
  onDeleteTask,
  onStartFocusTimer,
}) => {
  const t = getTranslation(language);
  const [rebuildNotice, setRebuildNotice] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragInitialMinute, setDragInitialMinute] = useState<number>(0);

  // Build 7-day strip (Mon..Sun of current selected week)
  const weekDays = useMemo(() => {
    const center = parseDateKey(selectedDate);
    const day = center.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(center);
    monday.setDate(center.getDate() + diffToMon);

    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const key = toDateKey(d);
      const matchingTasks = allTasks.filter((tk) => doesTaskOccurOnDate(tk, key));
      return {
        dateKey: key,
        dayLabel: SHORT_DAYS[d.getDay()],
        dayNumber: d.getDate(),
        densityCount: Math.min(4, matchingTasks.length),
        categories: matchingTasks.slice(0, 3).map((tk) => tk.category),
      };
    });
  }, [selectedDate, allTasks]);

  const headerDateObj = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const monthYearTitle = `${MONTHS[headerDateObj.getMonth()]} ${headerDateObj.getFullYear()}`;
  const isToday = selectedDate === todayDateKey;

  const handleRebuildClick = () => {
    const count = onRebuildDay();
    if (count > 0) {
      setRebuildNotice(
        `${t.rebuildDayBtn}: +5m (${count})`
      );
      setTimeout(() => setRebuildNotice(null), 3500);
    }
  };

  // Drag gesture handlers for 15-minute snapping
  const beginDrag = (taskId: string, clientY: number, currentStart: number) => {
    setDraggingTaskId(taskId);
    setDragStartY(clientY);
    setDragInitialMinute(currentStart);
  };

  const moveDrag = (taskId: string, clientY: number) => {
    if (draggingTaskId !== taskId) return;
    const deltaY = clientY - dragStartY;
    const steps15 = Math.round(deltaY / SPATIAL_RULES.DP_PER_15_MIN);
    if (steps15 !== 0) {
      const nextMinute = dragInitialMinute + steps15 * 15;
      onShiftTaskStart(taskId, nextMinute);
      setDragStartY(clientY);
      setDragInitialMinute(nextMinute);
    }
  };

  const endDrag = () => {
    setDraggingTaskId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <header
        className="px-4 pt-2 pb-2.5 border-b sticky top-0 z-20 transition-colors"
        style={{
          backgroundColor: palette.backgroundPrimary,
          borderColor: palette.borderSubtle,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm"
              style={{ backgroundColor: palette.brandAccent }}
            >
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight">
                  {monthYearTitle}
                </h1>
                {!isToday && (
                  <button
                    onClick={() => onSelectDate(todayDateKey)}
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 transition shadow-xs"
                    style={{
                      backgroundColor: `${palette.brandAccent}20`,
                      color: palette.brandAccent,
                    }}
                  >
                    <RotateCcw size={11} />
                    <span>{t.todayJump}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] font-medium" style={{ color: palette.textSecondary }}>
                {t.appSubtitle} • {formatMinutesToTime(nowMinute)} {t.liveLabel}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl border transition hover:opacity-80"
            style={{
              backgroundColor: palette.surfaceCard,
              borderColor: palette.borderSubtle,
              color: palette.textPrimary,
            }}
            aria-label="Settings & Backup"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Horizontal 7-Day Strip */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((wd) => {
            const selected = wd.dateKey === selectedDate;
            const isDayToday = wd.dateKey === todayDateKey;
            return (
              <button
                key={wd.dateKey}
                onClick={() => onSelectDate(wd.dateKey)}
                className="py-2 px-1 rounded-2xl flex flex-col items-center justify-center border transition"
                style={{
                  backgroundColor: selected
                    ? palette.brandAccent
                    : isDayToday
                    ? `${palette.brandAccent}14`
                    : palette.surfaceCard,
                  borderColor: selected
                    ? palette.brandAccent
                    : isDayToday
                    ? palette.brandAccent
                    : palette.borderSubtle,
                  color: selected ? '#FFFFFF' : palette.textPrimary,
                }}
              >
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: selected ? 'rgba(255,255,255,0.85)' : palette.textSecondary,
                  }}
                >
                  {wd.dayLabel}
                </span>
                <span
                  className="text-sm font-extrabold mt-0.5"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {wd.dayNumber}
                </span>
                <div className="flex items-center gap-0.5 mt-1 h-1.5">
                  {wd.categories.map((cat, idx) => {
                    const tok = CATEGORY_TOKENS[cat];
                    return (
                      <span
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: selected
                            ? '#FFFFFF'
                            : isDark
                            ? tok.darkText
                            : tok.lightText,
                        }}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Smart Rebuild Banner (Algorithm C) */}
        {runningBehindStats.isBehind && (
          <div
            className="mt-2.5 px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-2 shadow-sm animate-fadeIn"
            style={{
              backgroundColor: isDark ? '#3D2E14' : '#FDF0D5',
              borderColor: isDark ? '#F9C76255' : '#8A5A0033',
              color: isDark ? '#F9C762' : '#8A5A00',
            }}
          >
            <div className="text-xs font-bold leading-snug">
              {t.runningBehindBanner} ({runningBehindStats.behindMinutes}m)
            </div>
            <button
              onClick={handleRebuildClick}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition"
              style={{ backgroundColor: palette.brandAccent }}
            >
              <Sparkles size={13} />
              <span>{t.rebuildDayBtn}</span>
            </button>
          </div>
        )}

        {rebuildNotice && (
          <div
            className="mt-2 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: isDark ? '#1B3829' : '#E3F2E6',
              color: isDark ? '#8CE0A6' : '#2D6A4F',
            }}
          >
            {rebuildNotice}
          </div>
        )}
      </header>

      {/* Main Scrollable Timeline Canvas */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pb-28 space-y-1">
        {/* Wake-up Anchor Marker */}
        <div className="flex items-center mb-2">
          <div
            className="shrink-0 text-right pr-3 text-[11px] font-bold"
            style={{
              width: SPATIAL_RULES.LEFT_TIME_COLUMN_WIDTH_DP,
              fontVariantNumeric: 'tabular-nums',
              color: palette.textSecondary,
            }}
          >
            {formatMinutesToTime(wakeMinute)}
          </div>
          <div
            className="flex items-center gap-2 text-xs font-semibold"
            style={{ color: palette.textSecondary }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: palette.brandAccent }}
            />
            <span>{t.wakeAnchor}</span>
          </div>
        </div>

        {timelineNodes.map((node, idx) => {
          const showNowNeedleBefore =
            isToday &&
            idx === 0 &&
            nowMinute <
              (node.type === 'free_space_gap' ? node.startMinute : node.effectiveStart);

          if (node.type === 'free_space_gap') {
            const isNowInsideGap =
              isToday && nowMinute >= node.startMinute && nowMinute < node.endMinute;

            return (
              <React.Fragment key={node.id}>
                {showNowNeedleBefore && (
                  <LiveNowNeedle
                    nowMinute={nowMinute}
                    accentColor={palette.brandAccent}
                    nowLabel={t.nowLabel}
                  />
                )}

                <div className="flex items-stretch min-h-[54px] py-1">
                  {/* Left 64dp Timestamp Column + Dashed Vertical Spine */}
                  <div
                    className="shrink-0 flex flex-col items-end pr-3 relative"
                    style={{ width: SPATIAL_RULES.LEFT_TIME_COLUMN_WIDTH_DP }}
                  >
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        fontVariantNumeric: 'tabular-nums',
                        color: palette.textSecondary,
                      }}
                    >
                      {formatMinutesToTime(node.startMinute)}
                    </span>
                    <div
                      className="flex-1 w-0.5 my-1 border-l-2 border-dashed"
                      style={{ borderColor: palette.borderSubtle }}
                    />
                  </div>

                  {/* Interactive Free Space Pill */}
                  <div className="flex-1 flex flex-col justify-center gap-1.5 pl-1">
                    {isNowInsideGap && (
                      <LiveNowNeedle
                        nowMinute={nowMinute}
                        accentColor={palette.brandAccent}
                        nowLabel={t.nowLabel}
                        inline
                      />
                    )}
                    <button
                      onClick={() =>
                        onOpenCreatorForGap(
                          node.startMinute,
                          Math.min(60, node.gapDuration)
                        )
                      }
                      className="w-full py-2.5 px-3.5 rounded-2xl border border-dashed flex items-center justify-between text-xs font-bold transition hover:opacity-90 active:scale-[0.99]"
                      style={{
                        backgroundColor: `${palette.brandAccent}0D`,
                        borderColor: `${palette.brandAccent}55`,
                        color: palette.brandAccent,
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>
                          ✨ {formatDurationLabel(node.gapDuration)} {t.freeSpaceTapToSchedule}
                        </span>
                      </span>
                      <span
                        className="text-[11px] font-semibold opacity-80"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatMinutesToTime(node.startMinute)}–{formatMinutesToTime(node.endMinute)}
                      </span>
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          }

          // Task Item Node
          const item = node;
          const catToken = CATEGORY_TOKENS[item.category];
          const cardBg = isDark ? catToken.darkFill : catToken.lightFill;
          const cardText = isDark ? catToken.darkText : catToken.lightText;
          const proportionalHeight = durationToHeightDp(item.effectiveDuration);
          const isCompleted = item.status === 'completed';

          const isActiveNow =
            isToday &&
            nowMinute >= item.effectiveStart &&
            nowMinute < item.effectiveEnd;

          const elapsedPercent = isActiveNow
            ? Math.min(
                100,
                Math.max(
                  8,
                  Math.round(
                    ((nowMinute - item.effectiveStart) /
                      Math.max(1, item.effectiveDuration)) *
                      100
                  )
                )
              )
            : 0;

          const lockedStripeStyle: React.CSSProperties = item.is_locked
            ? {
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 8px, transparent 8px, transparent 16px)'
                  : 'repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 8px, transparent 8px, transparent 16px)',
              }
            : {};

          return (
            <React.Fragment key={item.id}>
              {showNowNeedleBefore && (
                <LiveNowNeedle
                  nowMinute={nowMinute}
                  accentColor={palette.brandAccent}
                  nowLabel={t.nowLabel}
                />
              )}

              <div className="flex items-stretch py-1">
                {/* Left 64dp Column */}
                <div
                  className="shrink-0 flex flex-col items-end pr-3"
                  style={{ width: SPATIAL_RULES.LEFT_TIME_COLUMN_WIDTH_DP }}
                >
                  <span
                    className="text-xs font-extrabold"
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      color: isActiveNow ? palette.brandAccent : palette.textPrimary,
                    }}
                  >
                    {formatMinutesToTime(item.effectiveStart)}
                  </span>
                  <div
                    className="flex-1 w-1 rounded-full my-1"
                    style={{
                      backgroundColor: isActiveNow
                        ? palette.brandAccent
                        : cardText,
                      opacity: isCompleted ? 0.35 : 0.75,
                    }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      color: palette.textSecondary,
                    }}
                  >
                    {formatMinutesToTime(item.effectiveEnd)}
                  </span>
                </div>

                {/* Right Column: Proportional Task Card */}
                <div className="flex-1 pl-1">
                  {isActiveNow && (
                    <div className="mb-1.5">
                      <LiveNowNeedle
                        nowMinute={nowMinute}
                        accentColor={palette.brandAccent}
                        nowLabel={t.nowLabel}
                        inline
                      />
                    </div>
                  )}

                  <div
                    style={{
                      minHeight: proportionalHeight,
                      backgroundColor: cardBg,
                      color: cardText,
                      borderColor: isActiveNow ? palette.brandAccent : `${cardText}30`,
                      ...lockedStripeStyle,
                    }}
                    className={`relative overflow-hidden rounded-2xl border-2 p-3 transition-all shadow-xs ${
                      isCompleted ? 'opacity-65' : ''
                    }`}
                    onTouchMove={(e) => {
                      if (!item.is_locked && e.touches[0]) {
                        moveDrag(item.taskId, e.touches[0].clientY);
                      }
                    }}
                    onTouchEnd={endDrag}
                  >
                    {isActiveNow && (
                      <div
                        className="absolute inset-x-0 top-0 pointer-events-none transition-all"
                        style={{
                          height: `${elapsedPercent}%`,
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.07)'
                            : 'rgba(224, 109, 83, 0.12)',
                          borderBottom: `1px dashed ${palette.brandAccent}`,
                        }}
                      />
                    )}

                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(0,0,0,0.28)'
                              : 'rgba(255,255,255,0.75)',
                          }}
                        >
                          <TaskIcon name={item.icon_name} size={18} color={cardText} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <h3
                              className={`text-sm font-extrabold leading-snug ${
                                isCompleted ? 'line-through opacity-75' : ''
                              }`}
                            >
                              {item.title}
                            </h3>
                            {item.recurrence_rule !== 'NONE' && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: isDark
                                    ? 'rgba(0,0,0,0.3)'
                                    : 'rgba(255,255,255,0.65)',
                                }}
                              >
                                🔁 {item.recurrence_rule}
                              </span>
                            )}
                            {item.is_locked && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1"
                                style={{
                                  backgroundColor: isDark
                                    ? 'rgba(0,0,0,0.35)'
                                    : 'rgba(255,255,255,0.75)',
                                }}
                              >
                                <Lock size={10} />
                                <span>🔒 {item.calendarSourceName || t.lockedAnchorBadge}</span>
                              </span>
                            )}
                          </div>

                          <div
                            className="text-xs font-semibold mt-0.5 flex items-center gap-2 opacity-85"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            <span>
                              {formatMinutesToTime(item.effectiveStart)} –{' '}
                              {formatMinutesToTime(item.effectiveEnd)}
                            </span>
                            <span>•</span>
                            <span>{formatDurationLabel(item.effectiveDuration)}</span>
                            {isActiveNow && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white"
                                style={{ backgroundColor: palette.brandAccent }}
                              >
                                {t.nowLabel} ({elapsedPercent}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!item.is_locked && (
                          <div className="flex items-center gap-0.5 mr-1">
                            <button
                              onClick={() =>
                                onShiftTaskStart(item.taskId, item.effectiveStart - 15)
                              }
                              className="p-1 rounded-lg hover:opacity-80"
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(0,0,0,0.25)'
                                  : 'rgba(255,255,255,0.6)',
                              }}
                              title="Move 15m earlier"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              onClick={() =>
                                onShiftTaskStart(item.taskId, item.effectiveStart + 15)
                              }
                              className="p-1 rounded-lg hover:opacity-80"
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(0,0,0,0.25)'
                                  : 'rgba(255,255,255,0.6)',
                              }}
                              title="Move 15m later"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <div
                              onTouchStart={(e) => {
                                if (e.touches[0]) {
                                  beginDrag(
                                    item.taskId,
                                    e.touches[0].clientY,
                                    item.effectiveStart
                                  );
                                }
                              }}
                              className="p-1 cursor-grab active:cursor-grabbing opacity-60"
                            >
                              <GripVertical size={14} />
                            </div>
                          </div>
                        )}

                        {item.source === 'myline' && !item.is_locked && (
                          <button
                            onClick={() => onDeleteTask(item.taskId)}
                            className="p-1.5 rounded-lg opacity-55 hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => onToggleTaskStatus(item.taskId)}
                          className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition"
                          style={{
                            borderColor: cardText,
                            backgroundColor: isCompleted ? cardText : 'transparent',
                            color: isCompleted ? cardBg : cardText,
                          }}
                        >
                          {isCompleted && <Check size={15} strokeWidth={3} />}
                        </button>
                      </div>
                    </div>

                    {item.subtasks.length > 0 && (
                      <div
                        className="relative z-10 mt-3 pt-2.5 border-t space-y-1.5"
                        style={{ borderColor: `${cardText}25` }}
                      >
                        {item.subtasks.map((st) => (
                          <button
                            key={st.id}
                            onClick={() => onToggleSubtask(st.id)}
                            className="w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(0,0,0,0.22)'
                                : 'rgba(255,255,255,0.6)',
                            }}
                          >
                            <span
                              className={`flex items-center gap-2 ${
                                st.is_completed ? 'line-through opacity-60' : ''
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-md border flex items-center justify-center shrink-0"
                                style={{
                                  borderColor: cardText,
                                  backgroundColor: st.is_completed
                                    ? cardText
                                    : 'transparent',
                                  color: st.is_completed ? cardBg : 'transparent',
                                }}
                              >
                                {st.is_completed && <Check size={11} strokeWidth={3} />}
                              </span>
                              <span>{st.title}</span>
                            </span>
                            <span
                              className="text-[10px] opacity-75"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {st.duration_minutes}m
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {(isActiveNow || (!isCompleted && !item.is_locked)) && (
                      <div className="relative z-10 mt-2.5 flex items-center justify-end">
                        <button
                          onClick={() => onStartFocusTimer(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                          style={{
                            backgroundColor: isActiveNow
                              ? palette.brandAccent
                              : isDark
                              ? 'rgba(0,0,0,0.35)'
                              : 'rgba(255,255,255,0.85)',
                            color: isActiveNow ? '#FFFFFF' : cardText,
                          }}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>{t.startFocusTimerBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Floating (+) Creator Button */}
      <button
        onClick={onOpenCreatorDefault}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 transition"
        style={{ backgroundColor: palette.brandAccent }}
        aria-label="New Task or Routine"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const LiveNowNeedle: React.FC<{
  nowMinute: number;
  accentColor: string;
  nowLabel: string;
  inline?: boolean;
}> = ({ nowMinute, accentColor, nowLabel, inline = false }) => {
  return (
    <div className={`flex items-center gap-2 ${inline ? 'my-0.5' : 'my-2'}`}>
      {!inline && (
        <div
          className="shrink-0 text-right pr-2 text-[11px] font-black"
          style={{
            width: SPATIAL_RULES.LEFT_TIME_COLUMN_WIDTH_DP,
            fontVariantNumeric: 'tabular-nums',
            color: accentColor,
          }}
        >
          {formatMinutesToTime(nowMinute)}
        </div>
      )}
      <div className="flex-1 flex items-center">
        <span
          className="w-3 h-3 rounded-full animate-pulse shrink-0 shadow-md"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
        <div
          className="flex-1 h-[2.5px] rounded-full"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}88`,
          }}
        />
        <span
          className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
          style={{ backgroundColor: accentColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {nowLabel} {formatMinutesToTime(nowMinute)}
        </span>
      </div>
    </div>
  );
};
