/**
 * MyLine: Visual Day Planner
 * Screen 6: Settings, Language & Zero-Cost Data Backup Modal
 * - Instant 14-Language Switcher (LTR & RTL)
 * - Wake & Sleep hour adjusters
 * - Theme switcher ("Warm Paper" Light / "Midnight Slate" Dark / System)
 * - Toggle for Native OS Calendar overlay + picker to choose which phone calendars (Work, Personal, Birthdays) to display
 * - Data Ownership Section:
 *   [ 📤 Export Backup (JSON) ] -> myline-backup-YYYY-MM-DD.json
 *   [ 📥 Restore Backup ] -> imports JSON backup
 */

import React, { useRef, useState } from 'react';
import {
  Calendar,
  Check,
  Download,
  Globe,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import { formatMinutesToTime, ThemeMode, ThemePalette } from '../constants/theme';
import { getTranslation, SUPPORTED_LANGUAGES } from '../constants/i18n';
import { UserSettingsRow } from '../db/schema';

interface SettingsBackupModalProps {
  visible: boolean;
  palette: ThemePalette;
  settings: UserSettingsRow;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<UserSettingsRow>) => void;
  onExportBackup: () => { filename: string; content: string };
  onRestoreBackup: (rawJson: string) => boolean;
  onResetDemoData: () => void;
  onReplayOnboarding: () => void;
}

const PHONE_CALENDARS = ['Work Calendar', 'Personal', 'Birthdays'];

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  visible,
  palette,
  settings,
  onClose,
  onUpdateSettings,
  onExportBackup,
  onRestoreBackup,
  onResetDemoData,
  onReplayOnboarding,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  if (!visible) return null;

  const currentLang = settings.language || 'en';
  const t = getTranslation(currentLang);
  const selectedCalendars = settings.selected_calendars ?? ['Work Calendar', 'Personal'];

  const toggleCalendarSelection = (calName: string) => {
    const exists = selectedCalendars.includes(calName);
    const next = exists
      ? selectedCalendars.filter((c) => c !== calName)
      : [...selectedCalendars, calName];
    onUpdateSettings({ selected_calendars: next });
  };

  const handleExportClick = async () => {
    const { filename, content } = onExportBackup();
    try {
      const blob = new Blob([content], { type: 'application/json' });
      const file = new File([blob], filename, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'MyLine Backup',
          text: 'MyLine: Visual Day Planner local SQLite backup JSON',
          files: [file],
        });
        setBackupMessage(`Shared ${filename} successfully!`);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage(`Exported ${filename} to your device!`);
    } catch {
      setBackupMessage(`Saved ${filename} ready.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const ok = onRestoreBackup(text);
      setBackupMessage(
        ok
          ? '✅ Backup restored successfully!'
          : '❌ Invalid backup file format. Please choose a valid myline-backup JSON file.'
      );
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(18, 20, 23, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto border shadow-2xl space-y-4"
        style={{
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
          color: palette.textPrimary,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{t.settingsTitle}</h3>
            <p className="text-xs" style={{ color: palette.textSecondary }}>
              {t.settingsSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ backgroundColor: palette.backgroundPrimary }}
          >
            <X size={18} color={palette.textSecondary} />
          </button>
        </div>

        {/* Built-In 14-Language Selector (Full Translation + LTR/RTL) */}
        <div
          className="p-4 rounded-2xl border space-y-2.5"
          style={{
            backgroundColor: palette.backgroundPrimary,
            borderColor: palette.borderSubtle,
          }}
        >
          <div className="flex items-center gap-2">
            <Globe size={16} color={palette.brandAccent} />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: palette.textSecondary }}
            >
              {t.languageSectionTitle}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onUpdateSettings({ language: lang.code })}
                  className="py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition"
                  style={{
                    backgroundColor: active ? palette.brandAccent : palette.surfaceCard,
                    color: active ? '#FFFFFF' : palette.textPrimary,
                    borderColor: active ? palette.brandAccent : palette.borderSubtle,
                  }}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Mode Picker */}
        <div
          className="p-4 rounded-2xl border space-y-2.5"
          style={{
            backgroundColor: palette.backgroundPrimary,
            borderColor: palette.borderSubtle,
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: palette.textSecondary }}
          >
            {t.sensoryPaletteTitle}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'light', label: t.warmPaperLight },
                { id: 'dark', label: t.midnightSlateDark },
                { id: 'system', label: t.autoSystemTheme },
              ] as Array<{ id: ThemeMode; label: string }>
            ).map((opt) => {
              const active = settings.theme_mode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ theme_mode: opt.id })}
                  className="py-2 px-2 rounded-xl text-xs font-semibold border transition"
                  style={{
                    backgroundColor: active ? palette.brandAccent : palette.surfaceCard,
                    color: active ? '#FFFFFF' : palette.textPrimary,
                    borderColor: active ? palette.brandAccent : palette.borderSubtle,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wake & Sleep Hour Adjusters */}
        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{
            backgroundColor: palette.backgroundPrimary,
            borderColor: palette.borderSubtle,
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: palette.textSecondary }}
          >
            {t.dayAnchorsTitle}
          </span>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sun size={16} color="#E06D53" />
              <span>{t.wakeUpTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onUpdateSettings({
                    wake_minute: Math.max(240, settings.wake_minute - 30),
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{ backgroundColor: palette.surfaceCard, borderColor: palette.borderSubtle }}
              >
                -30m
              </button>
              <span
                className="text-sm font-bold px-2"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMinutesToTime(settings.wake_minute)}
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({
                    wake_minute: Math.min(720, settings.wake_minute + 30),
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{ backgroundColor: palette.surfaceCard, borderColor: palette.borderSubtle }}
              >
                +30m
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Moon size={16} color="#5A3E7A" />
              <span>{t.windDownTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onUpdateSettings({
                    sleep_minute: Math.max(1080, settings.sleep_minute - 30),
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{ backgroundColor: palette.surfaceCard, borderColor: palette.borderSubtle }}
              >
                -30m
              </button>
              <span
                className="text-sm font-bold px-2"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMinutesToTime(settings.sleep_minute)}
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({
                    sleep_minute: Math.min(1410, settings.sleep_minute + 30),
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{ backgroundColor: palette.surfaceCard, borderColor: palette.borderSubtle }}
              >
                +30m
              </button>
            </div>
          </div>
        </div>

        {/* Native OS Calendar Overlay Toggle + Calendar Picker */}
        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{
            backgroundColor: palette.backgroundPrimary,
            borderColor: palette.borderSubtle,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={17} color={palette.brandAccent} />
              <div>
                <div className="text-sm font-bold">{t.nativeCalendarOverlay}</div>
                <div className="text-xs" style={{ color: palette.textSecondary }}>
                  {t.nativeCalendarSub}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  calendar_sync_enabled: settings.calendar_sync_enabled === 1 ? 0 : 1,
                })
              }
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
              style={{
                backgroundColor:
                  settings.calendar_sync_enabled === 1
                    ? palette.brandAccent
                    : palette.borderSubtle,
                color:
                  settings.calendar_sync_enabled === 1
                    ? '#FFFFFF'
                    : palette.textSecondary,
              }}
            >
              {settings.calendar_sync_enabled === 1 ? 'Enabled' : 'Off'}
            </button>
          </div>

          {settings.calendar_sync_enabled === 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {PHONE_CALENDARS.map((cal) => {
                const checked = selectedCalendars.includes(cal);
                return (
                  <button
                    key={cal}
                    onClick={() => toggleCalendarSelection(cal)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5"
                    style={{
                      backgroundColor: checked ? `${palette.brandAccent}18` : palette.surfaceCard,
                      borderColor: checked ? palette.brandAccent : palette.borderSubtle,
                      color: checked ? palette.brandAccent : palette.textSecondary,
                    }}
                  >
                    {checked && <Check size={12} />}
                    <span>{cal}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Data Ownership & Backup Section */}
        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{
            backgroundColor: palette.backgroundPrimary,
            borderColor: palette.borderSubtle,
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} color="#2D6A4F" />
            <div>
              <div className="text-sm font-bold">{t.dataOwnershipTitle}</div>
              <div className="text-xs" style={{ color: palette.textSecondary }}>
                Auto-Backup enabled (`allowBackup=true`) + manual JSON export to Google Drive / iCloud Drive.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExportClick}
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm"
              style={{ backgroundColor: palette.brandAccent }}
            >
              <Download size={14} />
              <span>{t.exportBackupBtn}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: palette.surfaceCard,
                borderColor: palette.borderSubtle,
                color: palette.textPrimary,
              }}
            >
              <Upload size={14} />
              <span>{t.restoreBackupBtn}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {backupMessage && (
            <div
              className="text-xs font-semibold px-3 py-2 rounded-xl"
              style={{
                backgroundColor: '#E3F2E6',
                color: '#2D6A4F',
              }}
            >
              {backupMessage}
            </div>
          )}

          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: palette.borderSubtle }}
          >
            <button
              onClick={() => {
                onReplayOnboarding();
                onClose();
              }}
              className="text-xs font-semibold underline"
              style={{ color: palette.textSecondary }}
            >
              {t.viewOnboardingBtn}
            </button>

            <button
              onClick={() => {
                onResetDemoData();
                setBackupMessage('✨ Demo timeline restored!');
              }}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: palette.brandAccent }}
            >
              <RotateCcw size={12} />
              <span>{t.resetDemoBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
