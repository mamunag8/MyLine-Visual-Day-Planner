/**
 * MyLine: Visual Day Planner
 * Section 3: UI/UX Design System ("Warm Tactile Paper" & "Midnight Slate")
 * Automatic Light/Dark mode support with a calm, sensory-friendly palette.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type TaskCategory = 'deep_work' | 'routine' | 'errand' | 'rest';
export type RecurrenceRule = 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'WEEKLY';
export type EnergyTag = 'high' | 'low' | 'quick_5m' | 'medium';
export type TaskStatus = 'pending' | 'completed' | 'skipped';

export interface ThemePalette {
  backgroundPrimary: string;
  surfaceCard: string;
  textPrimary: string;
  textSecondary: string;
  brandAccent: string;
  borderSubtle: string;
}

export const LIGHT_COLORS: ThemePalette = {
  backgroundPrimary: '#FAF8F5', // Warm Alabaster — reduces glare
  surfaceCard: '#FFFFFF',
  textPrimary: '#1C1E21',
  textSecondary: '#6E747C',
  brandAccent: '#E06D53', // Warm Terracotta — used for the "NOW" line & primary CTAs
  borderSubtle: '#EAE6DF',
};

export const DARK_COLORS: ThemePalette = {
  backgroundPrimary: '#121417', // Midnight Slate
  surfaceCard: '#1C1F26',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  brandAccent: '#F2846B', // Soft Coral
  borderSubtle: '#2A2E37',
};

export interface CategoryToken {
  id: TaskCategory;
  label: string;
  lightFill: string;
  lightText: string;
  darkFill: string;
  darkText: string;
}

export const CATEGORY_TOKENS: Record<TaskCategory, CategoryToken> = {
  deep_work: {
    id: 'deep_work',
    label: 'Deep Work',
    lightFill: '#DCE8F7',
    lightText: '#2B5B84',
    darkFill: '#1E3246',
    darkText: '#90C2F9',
  },
  routine: {
    id: 'routine',
    label: 'Routine',
    lightFill: '#E3F2E6',
    lightText: '#2D6A4F',
    darkFill: '#1B3829',
    darkText: '#8CE0A6',
  },
  errand: {
    id: 'errand',
    label: 'Errand',
    lightFill: '#FDF0D5',
    lightText: '#8A5A00',
    darkFill: '#3D2E14',
    darkText: '#F9C762',
  },
  rest: {
    id: 'rest',
    label: 'Rest',
    lightFill: '#EFE6F7',
    lightText: '#5A3E7A',
    darkFill: '#2D203D',
    darkText: '#D0B3F5',
  },
};

/**
 * Spatial & Typography Rules
 * Proportional Time Scale:
 * 15 minutes = 24dp, 30 minutes = 48dp, 1 hour = 96dp
 * Minimum card height: 36dp so 15-minute tasks remain legible.
 */
export const SPATIAL_RULES = {
  DP_PER_15_MIN: 24,
  DP_PER_30_MIN: 48,
  DP_PER_HOUR: 96,
  DP_PER_MINUTE: 96 / 60, // 1.6dp per minute
  MIN_CARD_HEIGHT_DP: 36,
  LEFT_TIME_COLUMN_WIDTH_DP: 64,
  SNAP_INCREMENT_MINUTES: 15,
  REBUILD_BUFFER_MINUTES: 5,
} as const;

export function durationToHeightDp(durationMinutes: number): number {
  const proportional = Math.round(durationMinutes * SPATIAL_RULES.DP_PER_MINUTE);
  return Math.max(SPATIAL_RULES.MIN_CARD_HEIGHT_DP, proportional);
}

export function formatMinutesToTime(minutesFromMidnight: number, use24Hour = true): string {
  const normalized = ((Math.floor(minutesFromMidnight) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const minStr = mins.toString().padStart(2, '0');
  if (use24Hour) {
    return `${hours24.toString().padStart(2, '0')}:${minStr}`;
  }
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12.toString().padStart(2, '0')}:${minStr} ${period}`;
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
}
