<!-- STREAMING_CHUNK:Defining the role, app identity, and zero-server architecture constraints... -->
# MASTER BUILD PROMPT — MyLine: Visual Day Planner (iOS & Android)

You are an elite Principal Mobile Architect and Product Designer. Build a complete, production-ready, native cross-platform mobile application (iOS and Android) called **"MyLine: Visual Day Planner"**.

## 1. PRODUCT OVERVIEW & CORE RULES
- **App Name:** MyLine: Visual Day Planner (Home Screen Icon Label: **MyLine**)
- **Core Purpose:** An ADHD-friendly visual daily timeline planner that merges native phone calendar events, to-do tasks, and reusable daily routines onto a single proportional vertical bar of time.
- **100% Serverless & Local-First Mandate (CRITICAL):**
  - This app must have **ZERO backend server costs**, **NO user login/signup walls**, **NO cloud subscriptions**, and **NO advertisements**.
  - All user data is stored 100% locally on the user's device using SQLite.
  - Calendar events are read/written directly from the phone's native OS calendar (Apple Calendar / Google Calendar on-device) via native OS permissions.
  - Reminders and timers run 100% locally via OS Local Notifications.
  - Cloud backup uses native OS Auto-Backup (`android:allowBackup="true"` / iOS iCloud folder) plus a 1-tap JSON Export/Import to the user's own Google Drive or iCloud Drive.

---

<!-- STREAMING_CHUNK:Specifying the cross-platform native tech stack and required libraries... -->
## 2. RECOMMENDED NATIVE TECH STACK
Build the app using **React Native with Expo (Managed Workflow, SDK 52+)** and **TypeScript** for 60fps native iOS and Android compilation:
- **Navigation:** `expo-router` (3-tab bottom bar + modal sheets)
- **Local Database:** `expo-sqlite` (synchronous/async SQLite API)
- **Native Calendar Bridge:** `expo-calendar` (read/write native Android & iOS calendar events)
- **Local Notifications & Alarms:** `expo-notifications`
- **Animations & Gestures:** `react-native-reanimated` + `react-native-gesture-handler` (smooth drag-and-drop on the timeline and shrinking circular focus timer)
- **Haptics:** `expo-haptics` (light tick on 15-minute drag snapping, medium impact on task completion)
- **Backup & Restore:** `expo-file-system` + `expo-sharing` + `expo-document-picker`
- **Audio (Offline Brown Noise):** `expo-av`
- **Icons:** `lucide-react-native`

---

<!-- STREAMING_CHUNK:Configuring the visual design tokens, color palettes, and proportional spacing... -->
## 3. UI/UX DESIGN SYSTEM ("WARM TACTILE PAPER" & "MIDNIGHT SLATE")
Implement automatic Light/Dark mode support with a calm, sensory-friendly palette:

### Color Tokens
- **Light Mode ("Warm Paper"):**
  - `backgroundPrimary`: `#FAF8F5` (Warm Alabaster — reduces glare)
  - `surfaceCard`: `#FFFFFF`
  - `textPrimary`: `#1C1E21`
  - `textSecondary`: `#6E747C`
  - `brandAccent`: `#E06D53` (Warm Terracotta — used for the "NOW" line & primary CTAs)
  - `borderSubtle`: `#EAE6DF`
- **Dark Mode ("Midnight Slate"):**
  - `backgroundPrimary`: `#121417`
  - `surfaceCard`: `#1C1F26`
  - `textPrimary`: `#F3F4F6`
  - `textSecondary`: `#9CA3AF`
  - `brandAccent`: `#F2846B` (Soft Coral)
  - `borderSubtle`: `#2A2E37`
- **Category Pastel Tokens (Light Fill / Light Text | Dark Fill / Dark Text):**
  1. `deep_work` (Blue): `#DCE8F7` / `#2B5B84` | `#1E3246` / `#90C2F9`
  2. `routine` (Sage Green): `#E3F2E6` / `#2D6A4F` | `#1B3829` / `#8CE0A6`
  3. `errand` (Warm Amber): `#FDF0D5` / `#8A5A00` | `#3D2E14` / `#F9C762`
  4. `rest` (Lavender): `#EFE6F7` / `#5A3E7A` | `#2D203D` / `#D0B3F5`

### Spatial & Typography Rules
- **Proportional Time Scale:** `15 minutes = 24dp`, `30 minutes = 48dp`, `1 hour = 96dp` (minimum card height: `36dp` so 15-minute tasks remain legible).
- **Tabular Timestamps:** Always apply `fontVariant: ['tabular-nums']` to time labels (`08:00`, `11:45`) and countdown timers.

---

<!-- STREAMING_CHUNK:Defining the local SQLite database schema and tables... -->
## 4. LOCAL SQLITE DATABASE SCHEMA
Initialize these 5 tables automatically on first app launch:

```sql
-- 1. User Preferences & Wake/Sleep Anchors
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  wake_minute INTEGER NOT NULL DEFAULT 450,   -- 07:30 AM (minutes from midnight)
  sleep_minute INTEGER NOT NULL DEFAULT 1350, -- 10:30 PM (minutes from midnight)
  calendar_sync_enabled INTEGER NOT NULL DEFAULT 0,
  theme_mode TEXT NOT NULL DEFAULT 'system',  -- 'light' | 'dark' | 'system'
  onboarding_completed INTEGER NOT NULL DEFAULT 0
);

-- 2. Master Tasks Table (Supports Single, Inbox, and Unlimited Recurring Tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'CheckCircle2',
  category TEXT NOT NULL DEFAULT 'deep_work', -- 'deep_work' | 'routine' | 'errand' | 'rest'
  scheduled_date TEXT,                        -- 'YYYY-MM-DD' or NULL if in Unscheduled Inbox
  start_minute INTEGER,                       -- 0 to 1439 (NULL if in Inbox)
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  recurrence_rule TEXT NOT NULL DEFAULT 'NONE', -- 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'WEEKLY'
  energy_tag TEXT NOT NULL DEFAULT 'medium',  -- 'high' | 'low' | 'quick_5m' (for Inbox filtering)
  is_locked INTEGER NOT NULL DEFAULT 0,       -- 1 = immovable anchor
  created_at TEXT NOT NULL
);

-- 3. Daily Instance Overrides (Tracks completions & "Rebuild Day" time shifts without duplicating recurring rows)
CREATE TABLE IF NOT EXISTS task_instances (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  instance_date TEXT NOT NULL,                -- 'YYYY-MM-DD'
  status TEXT NOT NULL DEFAULT 'pending',     -- 'pending' | 'completed' | 'skipped'
  override_start_minute INTEGER,              -- Populated when dragged or shifted via "Rebuild Day"
  override_duration_minutes INTEGER,          -- Populated when extended via "+5m" in Focus Mode
  UNIQUE(task_id, instance_date),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 4. Subtasks Checklist Table
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 5. Subtask Daily Completion State (So recurring tasks reset their subtasks every day)
CREATE TABLE IF NOT EXISTS subtask_completions (
  subtask_id TEXT NOT NULL,
  instance_date TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (subtask_id, instance_date)
);

-- 6. Reusable Routine Stacks (Templates like "Morning Launchpad")
CREATE TABLE IF NOT EXISTS routine_stacks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  category TEXT NOT NULL DEFAULT 'routine',
  default_start_minute INTEGER NOT NULL DEFAULT 480,
  total_duration_minutes INTEGER NOT NULL DEFAULT 45,
  steps_json TEXT NOT NULL -- JSON array of { title: string, duration: number }
);
```

Seed the database on first install with 2 pre-built Routine Stacks:
1. **"Morning Launchpad (30m)"** (`Make bed & hydrate (5m)`, `Take vitamins/meds (5m)`, `Quick stretch (10m)`, `Plan top 3 priorities (10m)`)
2. **"Evening Shutdown (25m)"** (`Clear desk (5m)`, `Prep clothes for tomorrow (10m)`, `Brain dump tomorrow's tasks (10m)`)

---

<!-- STREAMING_CHUNK:Writing the core algorithms for Rebuild Day, Free Space detection, and Recurrence... -->
## 5. CORE ALGORITHMS TO IMPLEMENT

### Algorithm A: Virtual Timeline Resolver (For any selected date `YYYY-MM-DD`)
1. Query all rows in `tasks` where:
   - `scheduled_date == selectedDate`, OR
   - `recurrence_rule == 'DAILY'`, OR
   - `recurrence_rule == 'WEEKDAYS'` (if Mon–Fri), OR
   - `recurrence_rule == 'WEEKENDS'` (if Sat–Sun), OR
   - `recurrence_rule == 'WEEKLY'` (matching weekday of `scheduled_date`).
2. Left-join `task_instances` for `selectedDate` to get `status`, `override_start_minute`, and `override_duration_minutes`.
3. Exclude any instance where `status == 'skipped'`.
4. Compute effective start time: `effectiveStart = override_start_minute ?? start_minute`.
5. If `calendar_sync_enabled == 1`, query `expo-calendar` for native OS events on `selectedDate` and map them as locked timeline items (`is_locked = 1`, `source = 'os_calendar'`).
6. Sort all resolved items ascending by `effectiveStart`.

### Algorithm B: Automatic "Free Space Pill" Gap Detector
- Walk through the sorted timeline items between `wake_minute` and `sleep_minute`.
- Whenever `nextItem.effectiveStart - currentItem.effectiveEnd >= 15`:
  - Inject a virtual `FreeSpaceGap` node with `startMinute`, `endMinute`, and `gapDuration`.
  - Render it on the timeline as a dashed vertical line (`┆`) with an interactive pill: `✨ 1h 15m Free Space — Tap to schedule`.
  - Tapping the pill opens the New Task Sheet pre-populated with `start_minute = gap.startMinute` and `duration = min(60, gap.gapDuration)`.

### Algorithm C: 1-Tap "Rebuild Day" (Reflow Engine)
- **Banner Trigger:** On Today's timeline, if `currentMinute > item.effectiveEnd` for at least one uncompleted flexible task (`status != 'completed'` and `is_locked == 0`), show a floating amber banner below the header:
  `⚠️ Running behind schedule. [ ✨ Rebuild Day ]`
- **Execution when user taps `[ ✨ Rebuild Day ]`:**
  1. Round `currentMinute` up to the next 5-minute increment (`cursor = Math.ceil(currentMinute / 5) * 5`).
  2. Separate today's remaining items into:
     - `lockedBlocks`: All OS Calendar events and user tasks with `is_locked == 1` where `effectiveEnd > cursor`.
     - `flexibleQueue`: All uncompleted flexible tasks (`status == 'pending'` and `is_locked == 0`) that are overdue OR scheduled after `cursor`, preserving their original order.
  3. Loop through each `task` in `flexibleQueue`:
     - Check if `[cursor, cursor + task.effectiveDuration]` overlaps with any block in `lockedBlocks`.
     - If an overlap occurs with `lockedBlock`, jump `cursor = lockedBlock.effectiveEnd + 5` (repeat check if multiple locked blocks are back-to-back).
     - Save `override_start_minute = cursor` into `task_instances` for `(task.id, todayDate)`.
     - Advance `cursor = cursor + task.effectiveDuration + 5` (adds a calm 5-minute breathing buffer between rescheduled tasks).
  4. Trigger a success haptic (`Haptics.notificationAsync(Success)`) and animate the timeline items smoothly into their new slots.

### Algorithm D: Offline Keyword-to-Icon & Category Auto-Matcher
As the user types a task title, automatically suggest the matching Lucide icon and category color without any API calls:
- `gym|workout|run|walk|yoga|stretch` $\rightarrow$ Icon: `Dumbbell`, Category: `routine`
- `study|read|exam|write|code|research|work` $\rightarrow$ Icon: `BookOpen`, Category: `deep_work`
- `coffee|breakfast|lunch|dinner|cook|eat|water` $\rightarrow$ Icon: `Utensils`, Category: `rest`
- `call|email|pay|buy|grocery|clean|laundry` $\rightarrow$ Icon: `ShoppingBag`, Category: `errand`
- `sleep|nap|meditate|rest|break` $\rightarrow$ Icon: `Moon`, Category: `rest`

---

<!-- STREAMING_CHUNK:Detailing the screen-by-screen UI layouts and interactive workflows... -->
## 6. SCREEN-BY-SCREEN SPECIFICATIONS

### Screen 1: 30-Second Zero-Account Onboarding (Shown once)
1. **Slide 1 (Trust & Value):** "See Your Day Clearly. 100% Free Forever. No accounts, no ads, no subscriptions. Everything stays privately on your phone."
2. **Slide 2 (Day Anchors):** Interactive pickers for "Wake-up Time" (default `07:30`) and "Wind-down Time" (default `22:30`).
3. **Slide 3 (Native Calendar Overlay):** Button `[ Connect Phone Calendar ]` requesting `Calendar.requestCalendarPermissionsAsync()`, plus a `[ Skip for now ]` option.

### Screen 2: Tab 1 — The Visual Timeline (Home Screen)
- **Top Header:**
  - Month & Year title (`Oct 2026`), a `[ Today ↺ ]` quick-jump pill (visible when viewing another date), and a top-right Settings gear icon.
  - Horizontal 7-day strip (`Mon 19` to `Sun 25`) with small colored dots under each day indicating task density.
- **Smart Rebuild Banner:** Conditional animated banner (`⚠️ Running Xm behind schedule [ ✨ Rebuild Day ]`).
- **Main Scrollable Timeline Canvas:**
  - **Left Column (`64dp` wide):** Tabular timestamps (`07:30`, `08:00`, etc.) and the continuous vertical spine line (solid inside blocks, dashed during Free Space gaps).
  - **Live "NOW" Needle:** A glowing terracotta horizontal line (`#E06D53`) with a pulsing left dot positioned at the exact current minute of the day.
  - **Task Cards (Right Column):**
    - Proportional height based on duration.
    - Shows Icon Badge, Title, Time Range (`11:00 – 12:30`), Recurrence badge (`🔁`), and a circular completion checkbox (`[✓]`).
    - **Active Task Card Expansion:** If `currentMinute` falls inside a task's start/end window, shade the card's background progressively from top to bottom based on elapsed percentage, display its inline Subtasks checklist, and show a `[ ▶ Start Focus Timer ]` chip.
    - **Locked Calendar Cards:** Subtle diagonal border stripe, lock icon (`🔒`), and calendar source name.
    - **Gesture:** Long-pressing any flexible task card lets the user drag it up/down in 15-minute increments with haptic ticks, updating `override_start_minute`.

### Screen 3: Fast Task & Routine Creator (Modal Bottom Sheet)
Opened via the floating `(+)` button or tapping a `Free Space Pill`:
- Auto-updating Icon Badge + Task Title text input.
- Toggle: `[ 🗓️ Schedule on Timeline ]` vs. `[ 📥 Save to Brain Dump Inbox ]`.
- **1-Tap Duration Chips:** `15m`, `30m`, `45m`, `1h`, `1.5h`, `2h`.
- **Unlimited Free Recurrence Chips:** `Once`, `Every Day`, `Weekdays`, `Weekends`, `Weekly`.
- **Category Pastel Picker:** 4 colored pills (`Deep Work`, `Routine`, `Errand`, `Rest`).
- **Subtask Builder:** Dynamic list to add/remove quick steps inside the block.

### Screen 4: Tab 2 — Brain Dump Inbox & Routine Stacks
Segmented top control switching between two sub-views:
1. **Unscheduled Inbox:**
   - Quick input bar at top for 2-second brain dumps.
   - Filter chips by energy required: `All`, `⚡ Quick 5m`, `🔋 Low Energy`, `🔥 High Focus`.
   - Each card has a `[ 🗓️ Schedule Today ]` button that automatically drops it into the next available Free Space gap on today's timeline!
2. **Routine Stacks:**
   - Displays reusable multi-step routine cards (e.g., *Morning Launchpad*, *Evening Shutdown*, plus user-created stacks).
   - Tapping `[ + Drop into Today ]` creates a task block with all its pre-configured subtasks on today's timeline in one tap.

### Screen 5: Tab 3 — Anti-Time-Blindness Visual Focus Timer
- **Visual Shrinking Disk:** An SVG circular dial (`react-native-svg`) where the remaining time is rendered as a solid pastel pie wedge that physically shrinks counterclockwise every second (Time-Timer style), paired with large tabular numbers (`42:15 left`).
- **Active Subtask Spotlight:** Shows only the *current* uncompleted subtask in a focused card with a `[ ✓ Done — Next Step ]` button so the user isn't overwhelmed.
- **Quick Adjustments:**
  - `[ +5m Need More Time ]`: Adds 5 minutes to the active block and automatically cascades any immediately adjacent flexible tasks down by 5 minutes.
  - `[ 🔊 Brown Noise ]`: Toggles soothing offline procedural/looped Brown Noise audio for ADHD focus.

### Screen 6: Settings & Zero-Cost Data Backup Modal
- Wake & Sleep hour adjusters.
- Toggle for Native OS Calendar overlay + picker to choose which phone calendars (Work, Personal, Birthdays) to display.
- **Data Ownership Section:**
  - `[ 📤 Export Backup (JSON) ]`: Serializes the SQLite tables into a timestamped `myline-backup-YYYY-MM-DD.json` file and opens the native OS share sheet so the user can save it to Google Drive, iCloud Drive, or local files.
  - `[ 📥 Restore Backup ]`: Uses `expo-document-picker` to import and restore a backup JSON file.

---

<!-- STREAMING_CHUNK:Configuring native Android and iOS permissions and project structure... -->
## 7. NATIVE ANDROID & iOS CONFIGURATION (`app.json`)
Configure `app.json` with full native permissions and backup flags:
- **iOS (`ios.infoPlist`):**
  - `NSCalendarsFullAccessUsageDescription`: `"MyLine overlays your existing calendar events onto your visual daily timeline so you can see your free space. All data stays 100% on your device."`
  - `NSRemindersFullAccessUsageDescription`: `"MyLine helps you schedule your daily tasks."`
  - `UIBackgroundModes`: `["audio", "fetch"]`
- **Android (`android`):**
  - `permissions`: `["READ_CALENDAR", "WRITE_CALENDAR", "SCHEDULE_EXACT_ALARM", "POST_NOTIFICATIONS", "VIBRATE"]`
  - `allowBackup`: `true` (enables automatic zero-cost encrypted Google Drive app data backup on Android devices)

## 8. EXECUTION INSTRUCTIONS
1. Generate the complete project file tree (`app/`, `components/`, `db/`, `hooks/`, `utils/`, `constants/`).
2. Write complete, runnable TypeScript code for every file—never use `// TODO` or placeholder comments.
3. Ensure the SQLite database initializes cleanly with demo tasks on Today's timeline so the user immediately sees a rich Visual Timeline, a Free Space gap, and the `[ ✨ Rebuild Day ]` button in action on first launch.