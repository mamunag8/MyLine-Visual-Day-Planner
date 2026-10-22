# MyLine: Visual Day Planner (`com.kasbllc.myline`)

**100% Free Forever • Zero Accounts • Zero Ads • 100% Local-First ADHD-Friendly Visual Daily Timeline Planner**  
Built by **kasb LLC** for **Android & iOS**.

---

## 1. Product Overview & Architecture
- **App Name:** MyLine: Visual Day Planner (Home Screen Icon Label: **MyLine**)
- **Core Purpose:** An ADHD-friendly visual daily timeline planner that merges native phone calendar events, to-do tasks, and reusable daily routines onto a single proportional vertical bar of time.
- **100% Serverless & Local-First Mandate:**
  - **Zero backend server costs**, **no user login/signup walls**, **no cloud subscriptions**, and **no advertisements**.
  - All user data is stored 100% locally on the device (`user_settings`, `tasks`, `task_instances`, `subtasks`, `subtask_completions`, `routine_stacks`).
  - Supports Android OS Auto-Backup (`android:allowBackup="true"`) plus a 1-tap JSON Export/Restore (`myline-backup-YYYY-MM-DD.json`).

---

## 2. Project File Tree

```text
MyLine Visual Day Planner/
├── app/
│   ├── _layout.tsx                 # Root layout & theme/database provider
│   └── (tabs)/
│       ├── _layout.tsx             # 3-Tab bottom bar layout
│       ├── index.tsx               # Tab 1: Visual Timeline screen
│       ├── inbox.tsx               # Tab 2: Brain Dump Inbox & Routine Stacks
│       └── focus.tsx               # Tab 3: Anti-Time-Blindness Visual Focus Timer
├── components/
│   ├── TaskIcon.tsx                # Dynamic Lucide icon badge renderer
│   ├── OnboardingModal.tsx         # Screen 1: 30-Second Zero-Account Onboarding (3 slides)
│   ├── TimelineTabView.tsx         # Screen 2: Proportional Visual Timeline + Rebuild Day
│   ├── TaskCreatorSheet.tsx        # Screen 3: Fast Task & Routine Creator Modal Sheet
│   ├── InboxRoutinesTabView.tsx    # Screen 4: Brain Dump Inbox & Reusable Routine Stacks
│   ├── FocusTimerTabView.tsx       # Screen 5: Shrinking Pie Dial + Subtask Spotlight + Brown Noise
│   └── SettingsBackupModal.tsx     # Screen 6: Settings & Zero-Cost JSON Backup Modal
├── constants/
│   └── theme.ts                    # "Warm Paper" (#FAF8F5) & "Midnight Slate" (#121417) tokens + spatial rules
├── db/
│   ├── schema.ts                   # SQLite DDL for all 6 tables & initial Routine Stack seeds
│   └── database.ts                 # Local-first SQLite / persistent adapter & demo timeline seed
├── hooks/
│   └── useMyLineStore.ts           # Unified state store, haptics, timer & backup actions
├── utils/
│   ├── timelineAlgorithms.ts       # Algorithms A (Resolver), B (Free Space), C (Rebuild Day), D (Keyword Matcher)
│   └── brownNoiseGenerator.ts      # 100% offline procedural Brown Noise synthesizer
├── play-store-submission/
│   ├── MyLine-v1.0.0-release.aab   # Signed Google Play Release App Bundle
│   ├── MyLine-v1.0.0-release.apk   # Signed Installable Release APK
│   ├── PRIVACY_POLICY.html         # Zero-data-collection Privacy Policy
│   ├── PLAY_STORE_CONSOLE_GUIDE.md # Store listing copy & signing credentials
│   └── graphics/                   # 512x512 icon, 1024x500 feature graphic, phone & tablet screenshots
└── app.json                        # Native Android & iOS permissions & backup configuration
```

---

## 3. Quick Start & Build Commands

```bash
# Start local development server
npm run dev

# Build production TypeScript & bundle
npm run build

# Sync with native Android / iOS projects
npm run cap:sync
```

# MyLine-Visual-Day-Planner
