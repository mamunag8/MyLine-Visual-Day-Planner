/**
 * MyLine: Visual Day Planner
 * Screen 1: 30-Second Zero-Account Onboarding
 * Slide 1 (Trust & Value): "See Your Day Clearly. 100% Free Forever. No accounts, no ads, no subscriptions. Everything stays privately on your phone."
 * Slide 2 (Day Anchors): Interactive pickers for "Wake-up Time" (default 07:30) and "Wind-down Time" (default 22:30).
 * Slide 3 (Native Calendar Overlay): Button [ Connect Phone Calendar ] + [ Skip for now ].
 */

import React, { useState } from 'react';
import { Calendar, Check, ChevronRight, Moon, ShieldCheck, Sparkles, Sun } from 'lucide-react';
import { formatMinutesToTime, ThemePalette } from '../constants/theme';

interface OnboardingModalProps {
  visible: boolean;
  palette: ThemePalette;
  isDark: boolean;
  wakeMinute: number;
  sleepMinute: number;
  onComplete: (params: {
    wake_minute: number;
    sleep_minute: number;
    calendar_sync_enabled: number;
  }) => void;
}

const WAKE_OPTIONS = [360, 390, 420, 450, 480, 510, 540]; // 06:00 to 09:00
const SLEEP_OPTIONS = [1260, 1290, 1320, 1350, 1380, 1410]; // 21:00 to 23:30

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  palette,
  wakeMinute,
  sleepMinute,
  onComplete,
}) => {
  const [slide, setSlide] = useState<1 | 2 | 3>(1);
  const [wake, setWake] = useState<number>(wakeMinute || 450);
  const [sleep, setSleep] = useState<number>(sleepMinute || 1350);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(18, 20, 23, 0.72)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all"
        style={{
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
          color: palette.textPrimary,
        }}
      >
        {/* Step Progress Dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-2 rounded-full transition-all"
                style={{
                  width: slide === s ? 28 : 8,
                  backgroundColor:
                    slide >= s ? palette.brandAccent : palette.borderSubtle,
                }}
              />
            ))}
          </div>
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: palette.textSecondary }}
          >
            Step {slide} of 3
          </span>
        </div>

        {slide === 1 && (
          <div className="space-y-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${palette.brandAccent}1F` }}
            >
              <ShieldCheck size={30} color={palette.brandAccent} />
            </div>

            <div className="space-y-2">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: '#E3F2E6',
                  color: '#2D6A4F',
                }}
              >
                <Sparkles size={13} />
                100% Free Forever • Local-First SQLite
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                See Your Day Clearly.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: palette.textSecondary }}>
                100% Free Forever. No accounts, no ads, no subscriptions. Everything stays privately on your phone.
              </p>
            </div>

            <div
              className="rounded-2xl p-4 space-y-2.5 border"
              style={{
                backgroundColor: palette.backgroundPrimary,
                borderColor: palette.borderSubtle,
              }}
            >
              {[
                'Proportional visual timeline eliminates time blindness',
                '1-Tap "Rebuild Day" gently reflows overdue tasks',
                'Zero servers, zero login walls, 100% offline privacy',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-medium">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${palette.brandAccent}22` }}
                  >
                    <Check size={12} color={palette.brandAccent} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSlide(2)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition"
              style={{ backgroundColor: palette.brandAccent }}
            >
              <span>Set My Day Anchors</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {slide === 2 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">
                Your Daily Anchors
              </h2>
              <p className="text-sm" style={{ color: palette.textSecondary }}>
                MyLine scales your vertical timeline between your Wake-up and Wind-down hours so you can see every Free Space gap.
              </p>
            </div>

            {/* Wake-up Picker */}
            <div
              className="rounded-2xl p-4 border space-y-3"
              style={{
                backgroundColor: palette.backgroundPrimary,
                borderColor: palette.borderSubtle,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Sun size={18} color="#E06D53" />
                  <span>Wake-up Time</span>
                </div>
                <span
                  className="text-base font-bold px-2.5 py-0.5 rounded-lg"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    backgroundColor: `${palette.brandAccent}20`,
                    color: palette.brandAccent,
                  }}
                >
                  {formatMinutesToTime(wake)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {WAKE_OPTIONS.map((m) => {
                  const active = wake === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setWake(m)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition"
                      style={{
                        fontVariantNumeric: 'tabular-nums',
                        backgroundColor: active ? palette.brandAccent : palette.surfaceCard,
                        color: active ? '#FFFFFF' : palette.textPrimary,
                        borderColor: active ? palette.brandAccent : palette.borderSubtle,
                      }}
                    >
                      {formatMinutesToTime(m)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wind-down Picker */}
            <div
              className="rounded-2xl p-4 border space-y-3"
              style={{
                backgroundColor: palette.backgroundPrimary,
                borderColor: palette.borderSubtle,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Moon size={18} color="#5A3E7A" />
                  <span>Wind-down Time</span>
                </div>
                <span
                  className="text-base font-bold px-2.5 py-0.5 rounded-lg"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    backgroundColor: '#EFE6F7',
                    color: '#5A3E7A',
                  }}
                >
                  {formatMinutesToTime(sleep)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SLEEP_OPTIONS.map((m) => {
                  const active = sleep === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSleep(m)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition"
                      style={{
                        fontVariantNumeric: 'tabular-nums',
                        backgroundColor: active ? '#5A3E7A' : palette.surfaceCard,
                        color: active ? '#FFFFFF' : palette.textPrimary,
                        borderColor: active ? '#5A3E7A' : palette.borderSubtle,
                      }}
                    >
                      {formatMinutesToTime(m)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setSlide(3)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition"
              style={{ backgroundColor: palette.brandAccent }}
            >
              <span>Continue</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {slide === 3 && (
          <div className="space-y-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#DCE8F7' }}
            >
              <Calendar size={28} color="#2B5B84" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Native Calendar Overlay
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: palette.textSecondary }}>
                MyLine overlays your existing phone calendar events as locked anchor blocks (`🔒`) so "Rebuild Day" automatically flows your flexible tasks around meetings.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() =>
                  onComplete({
                    wake_minute: wake,
                    sleep_minute: sleep,
                    calendar_sync_enabled: 1,
                  })
                }
                className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition"
                style={{ backgroundColor: palette.brandAccent }}
              >
                <Calendar size={18} />
                <span>Connect Phone Calendar</span>
              </button>

              <button
                onClick={() =>
                  onComplete({
                    wake_minute: wake,
                    sleep_minute: sleep,
                    calendar_sync_enabled: 0,
                  })
                }
                className="w-full py-3 rounded-2xl font-semibold text-sm border transition"
                style={{
                  backgroundColor: palette.backgroundPrimary,
                  borderColor: palette.borderSubtle,
                  color: palette.textSecondary,
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
