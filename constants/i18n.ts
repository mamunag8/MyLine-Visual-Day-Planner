/**
 * MyLine: Visual Day Planner
 * Built-In Multi-Language Full Translation Engine (14 Global Languages + LTR/RTL Support)
 */

export type AppLanguageCode =
  | 'en'
  | 'bn'
  | 'ar'
  | 'fa'
  | 'ur'
  | 'hi'
  | 'es'
  | 'fr'
  | 'de'
  | 'zh'
  | 'ru'
  | 'tr'
  | 'pt'
  | 'id';

export interface LanguageOption {
  code: AppLanguageCode;
  nativeName: string;
  englishName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bangla', flag: '🇧🇩', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', flag: '🇮🇷', dir: 'rtl' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰', dir: 'rtl' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺', dir: 'ltr' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷', dir: 'ltr' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷', dir: 'ltr' },
  { code: 'id', nativeName: 'Indonesia', englishName: 'Indonesian', flag: '🇮🇩', dir: 'ltr' },
];

export interface TranslationStrings {
  // App & Tabs
  appSubtitle: string;
  tabTimeline: string;
  tabInbox: string;
  tabFocus: string;
  todayJump: string;
  liveLabel: string;

  // Timeline & Rebuild Day
  wakeAnchor: string;
  runningBehindBanner: string;
  rebuildDayBtn: string;
  freeSpaceTapToSchedule: string;
  startFocusTimerBtn: string;
  lockedAnchorBadge: string;
  nowLabel: string;

  // Categories
  catDeepWork: string;
  catRoutine: string;
  catErrand: string;
  catRest: string;

  // Task Creator Sheet
  newBlockOrDumpTitle: string;
  taskInputPlaceholder: string;
  scheduleOnTimelineBtn: string;
  brainDumpInboxBtn: string;
  startTimeLabel: string;
  lockedLabel: string;
  flexibleLabel: string;
  oneTapDurationLabel: string;
  categoryPastelLabel: string;
  repeatLabel: string;
  onceChip: string;
  everyDayChip: string;
  weekdaysChip: string;
  weekendsChip: string;
  weeklyChip: string;
  subtasksChecklistLabel: string;
  addStepPlaceholder: string;
  addStepBtn: string;
  addToTimelineCta: string;
  saveToInboxCta: string;

  // Inbox & Routine Stacks
  inboxHeaderTitle: string;
  inboxHeaderSub: string;
  unscheduledInboxTab: string;
  routineStacksTab: string;
  quickDumpPlaceholder: string;
  dumpBtn: string;
  tagEnergyLabel: string;
  allFilter: string;
  quick5mChip: string;
  lowEnergyChip: string;
  highFocusChip: string;
  scheduleTodayBtn: string;
  dropIntoTodayBtn: string;
  mindIsClearTitle: string;
  mindIsClearSub: string;
  createCustomRoutineBtn: string;

  // Focus Timer
  focusHeaderTitle: string;
  focusHeaderSub: string;
  brownNoiseLabel: string;
  leftSuffix: string;
  startFocusBtn: string;
  pauseFocusBtn: string;
  needMoreTime5mBtn: string;
  activeSubtaskSpotlight: string;
  focusOnlyOnThisNow: string;
  doneNextStepBtn: string;
  allStepsCompletedTitle: string;
  completeBlockBtn: string;

  // Settings & Backup
  settingsTitle: string;
  settingsSubtitle: string;
  languageSectionTitle: string;
  sensoryPaletteTitle: string;
  warmPaperLight: string;
  midnightSlateDark: string;
  autoSystemTheme: string;
  dayAnchorsTitle: string;
  wakeUpTime: string;
  windDownTime: string;
  nativeCalendarOverlay: string;
  nativeCalendarSub: string;
  dataOwnershipTitle: string;
  exportBackupBtn: string;
  restoreBackupBtn: string;
  viewOnboardingBtn: string;
  resetDemoBtn: string;

  // Onboarding
  onboardingTitle1: string;
  onboardingSub1: string;
  onboardingSetAnchorsBtn: string;
  onboardingTitle2: string;
  onboardingSub2: string;
  continueBtn: string;
  onboardingTitle3: string;
  onboardingSub3: string;
  connectPhoneCalendarBtn: string;
  skipForNowBtn: string;
}

const EN: TranslationStrings = {
  appSubtitle: 'MyLine Visual Timeline',
  tabTimeline: 'Visual Timeline',
  tabInbox: 'Inbox & Routines',
  tabFocus: 'Focus Timer',
  todayJump: 'Today ↺',
  liveLabel: 'Live',

  wakeAnchor: '☀️ Day Wake-up Anchor',
  runningBehindBanner: '⚠️ Running behind schedule',
  rebuildDayBtn: '✨ Rebuild Day',
  freeSpaceTapToSchedule: 'Free Space — Tap to schedule',
  startFocusTimerBtn: '▶ Start Focus Timer',
  lockedAnchorBadge: 'Locked Anchor',
  nowLabel: 'NOW',

  catDeepWork: 'Deep Work',
  catRoutine: 'Routine',
  catErrand: 'Errand',
  catRest: 'Rest',

  newBlockOrDumpTitle: 'New Time Block or Brain Dump',
  taskInputPlaceholder: 'e.g., Study architecture, Morning workout, Buy coffee...',
  scheduleOnTimelineBtn: '🗓️ Schedule on Timeline',
  brainDumpInboxBtn: '📥 Brain Dump Inbox',
  startTimeLabel: 'Start Time:',
  lockedLabel: 'Locked',
  flexibleLabel: 'Flexible',
  oneTapDurationLabel: '1-Tap Duration',
  categoryPastelLabel: 'Category Pastel',
  repeatLabel: 'Repeat (Unlimited Free Recurrence)',
  onceChip: 'Once',
  everyDayChip: 'Every Day',
  weekdaysChip: 'Weekdays',
  weekendsChip: 'Weekends',
  weeklyChip: 'Weekly',
  subtasksChecklistLabel: 'Micro-Steps / Subtasks Checklist',
  addStepPlaceholder: 'Add a tiny 5-minute step...',
  addStepBtn: 'Add Step',
  addToTimelineCta: 'Add to Timeline',
  saveToInboxCta: 'Save to Brain Dump Inbox',

  inboxHeaderTitle: 'Brain Dump & Routine Stacks',
  inboxHeaderSub: 'Capture thoughts in 2 seconds or drop multi-step routines into Today',
  unscheduledInboxTab: 'Unscheduled Inbox',
  routineStacksTab: 'Routine Stacks',
  quickDumpPlaceholder: '2-second brain dump... (e.g. Call pharmacy, Read chapter 4)',
  dumpBtn: 'Dump',
  tagEnergyLabel: 'Tag energy:',
  allFilter: 'All',
  quick5mChip: '⚡ Quick 5m',
  lowEnergyChip: '🔋 Low Energy',
  highFocusChip: '🔥 High Focus',
  scheduleTodayBtn: '🗓️ Schedule Today',
  dropIntoTodayBtn: '+ Drop into Today',
  mindIsClearTitle: 'Your Mind is Clear',
  mindIsClearSub: 'No unscheduled brain dumps in this energy filter.',
  createCustomRoutineBtn: 'Create Custom Reusable Routine Stack',

  focusHeaderTitle: 'Visual Focus Timer',
  focusHeaderSub: 'Anti-time-blindness shrinking disk & single-step spotlight',
  brownNoiseLabel: '🔊 Brown Noise',
  leftSuffix: 'left',
  startFocusBtn: 'Start Focus',
  pauseFocusBtn: 'Pause Focus',
  needMoreTime5mBtn: '+5m Need More Time',
  activeSubtaskSpotlight: 'Active Subtask Spotlight',
  focusOnlyOnThisNow: 'Focus only on this right now:',
  doneNextStepBtn: '✓ Done — Next Step',
  allStepsCompletedTitle: 'All micro-steps completed!',
  completeBlockBtn: 'Complete Block',

  settingsTitle: 'Settings, Language & Backup',
  settingsSubtitle: '100% On-Device SQLite • Zero Servers • Zero Subscriptions',
  languageSectionTitle: 'App Language (Instant Full Translation)',
  sensoryPaletteTitle: 'Sensory Palette ("Warm Paper" & "Midnight Slate")',
  warmPaperLight: '☀️ Warm Paper',
  midnightSlateDark: '🌙 Midnight Slate',
  autoSystemTheme: '📱 Auto System',
  dayAnchorsTitle: 'Day Timeline Anchors',
  wakeUpTime: 'Wake-up Time',
  windDownTime: 'Wind-down Time',
  nativeCalendarOverlay: 'Native OS Calendar Overlay',
  nativeCalendarSub: 'Show phone calendar events as locked timeline anchors (🔒)',
  dataOwnershipTitle: 'Data Ownership & Zero-Cost Backup',
  exportBackupBtn: '📤 Export Backup (JSON)',
  restoreBackupBtn: '📥 Restore Backup',
  viewOnboardingBtn: 'View 30s Onboarding Tour',
  resetDemoBtn: 'Reset Demo Timeline',

  onboardingTitle1: 'See Your Day Clearly.',
  onboardingSub1: '100% Free Forever. No accounts, no ads, no subscriptions. Everything stays privately on your phone.',
  onboardingSetAnchorsBtn: 'Set My Day Anchors',
  onboardingTitle2: 'Your Daily Anchors',
  onboardingSub2: 'MyLine scales your vertical timeline between your Wake-up and Wind-down hours so you can see every Free Space gap.',
  continueBtn: 'Continue',
  onboardingTitle3: 'Native Calendar Overlay',
  onboardingSub3: 'MyLine overlays your existing phone calendar events as locked anchor blocks (🔒) so "Rebuild Day" flows your flexible tasks around meetings.',
  connectPhoneCalendarBtn: 'Connect Phone Calendar',
  skipForNowBtn: 'Skip for now',
};

export const TRANSLATIONS: Record<AppLanguageCode, TranslationStrings> = {
  en: EN,
  bn: {
    ...EN,
    appSubtitle: 'মাইলাইন ভিজ্যুয়াল টাইমলাইন',
    tabTimeline: 'টাইমলাইন',
    tabInbox: 'ইনবক্স ও রুটিন',
    tabFocus: 'ফোকাস টাইমার',
    todayJump: 'আজ ↺',
    liveLabel: 'লাইভ',
    wakeAnchor: '☀️ দিনের শুরুর সময়',
    runningBehindBanner: '⚠️ নির্ধারিত সময়ের চেয়ে পিছিয়ে আছেন',
    rebuildDayBtn: '✨ দিনটি সাজান',
    freeSpaceTapToSchedule: 'ফাঁকা সময় — শিডিউল করতে ট্যাপ করুন',
    startFocusTimerBtn: '▶ ফোকাস টাইমার শুরু করুন',
    lockedAnchorBadge: 'লক করা ইভেন্ট',
    nowLabel: 'এখন',
    catDeepWork: 'গভীর কাজ',
    catRoutine: 'রুটিন',
    catErrand: 'জরুরি কাজ',
    catRest: 'বিশ্রাম',
    newBlockOrDumpTitle: 'নতুন কাজ বা ব্রেইন ডাম্প যোগ করুন',
    scheduleOnTimelineBtn: '🗓️ টাইমলাইনে রাখুন',
    brainDumpInboxBtn: '📥 ইনবক্সে রাখুন',
    startTimeLabel: 'শুরুর সময়:',
    addToTimelineCta: 'টাইমলাইনে যোগ করুন',
    saveToInboxCta: 'ইনবক্সে সংরক্ষণ করুন',
    inboxHeaderTitle: 'ব্রেইন ডাম্প ও রুটিন স্ট্যাক',
    inboxHeaderSub: '২ সেকেন্ডে চিন্তা লিখে রাখুন বা রুটিন যোগ করুন',
    unscheduledInboxTab: 'ইনবক্স তালিকা',
    routineStacksTab: 'রুটিন স্ট্যাক',
    dumpBtn: 'যোগ করুন',
    allFilter: 'সব',
    quick5mChip: '⚡ দ্রুত ৫ মি.',
    lowEnergyChip: '🔋 কম শক্তি',
    highFocusChip: '🔥 গভীর মনোযোগ',
    scheduleTodayBtn: '🗓️ আজ শিডিউল করুন',
    dropIntoTodayBtn: '+ আজকের দিনে যোগ করুন',
    focusHeaderTitle: 'ভিজ্যুয়াল ফোকাস টাইমার',
    focusHeaderSub: 'সময়ের সঠিক ধারণা ও এক-ধাপ ফোকাস স্পটলাইট',
    brownNoiseLabel: '🔊 ব্রাউন নয়েজ',
    leftSuffix: 'বাকি',
    startFocusBtn: 'ফোকাস শুরু',
    pauseFocusBtn: 'বিরতি',
    needMoreTime5mBtn: '+৫ মি. সময় বাড়ান',
    activeSubtaskSpotlight: 'বর্তমান ধাপ স্পটলাইট',
    doneNextStepBtn: '✓ সম্পন্ন — পরের ধাপ',
    settingsTitle: 'সেটিংস, ভাষা ও ব্যাকআপ',
    languageSectionTitle: 'অ্যাপের ভাষা (Language)',
    exportBackupBtn: '📤 ব্যাকআপ এক্সপোর্ট (JSON)',
    restoreBackupBtn: '📥 ব্যাকআপ রিস্টোর',
    onboardingTitle1: 'আপনার পুরো দিনটি স্পষ্টভাবে দেখুন।',
    onboardingSub1: '১০০% আজীবন ফ্রি। কোনো অ্যাকাউন্ট বা বিজ্ঞাপন নেই। সব তথ্য আপনার ফোনেই সুরক্ষিত থাকে।',
  },
  ar: {
    ...EN,
    appSubtitle: 'خطي الزمني المرئي',
    tabTimeline: 'الجدول المرئي',
    tabInbox: 'صندوق الأفكار والروتين',
    tabFocus: 'مؤقت التركيز',
    todayJump: 'اليوم ↺',
    liveLabel: 'مباشر',
    wakeAnchor: '☀️ بداية الاستيقاظ',
    runningBehindBanner: '⚠️ متأخر عن الجدول المحدد',
    rebuildDayBtn: '✨ إعادة ترتيب اليوم',
    freeSpaceTapToSchedule: 'وقت متاح — اضغط للجدولة',
    startFocusTimerBtn: '▶ ابدأ مؤقت التركيز',
    lockedAnchorBadge: 'موعد ثابت',
    nowLabel: 'الآن',
    catDeepWork: 'عمل عميق',
    catRoutine: 'روتين',
    catErrand: 'مهمة',
    catRest: 'راحة',
    newBlockOrDumpTitle: 'مهمة جديدة أو تفريغ ذهني',
    scheduleOnTimelineBtn: '🗓️ جدولة في اليوم',
    brainDumpInboxBtn: '📥 حفظ في الصندوق',
    addToTimelineCta: 'إضافة إلى الجدول',
    saveToInboxCta: 'حفظ في صندوق الأفكار',
    inboxHeaderTitle: 'صندوق الأفكار والروتين اليومي',
    inboxHeaderSub: 'دوّن أفكارك في ثانيتين أو أضف روتينك الكامل بضغطة واحدة',
    unscheduledInboxTab: 'غير مجدول',
    routineStacksTab: 'قوالب الروتين',
    dumpBtn: 'إضافة',
    allFilter: 'الكل',
    quick5mChip: '⚡ سريع 5 د',
    lowEnergyChip: '🔋 طاقة هادئة',
    highFocusChip: '🔥 تركيز عالٍ',
    scheduleTodayBtn: '🗓️ جدولة اليوم',
    dropIntoTodayBtn: '+ إضافة لليوم',
    focusHeaderTitle: 'مؤقت التركيز المرئي',
    focusHeaderSub: 'قرص مرئي متناقص مع ضوضاء بنية للتركيز العميق',
    brownNoiseLabel: '🔊 ضوضاء بنية',
    leftSuffix: 'متبقي',
    startFocusBtn: 'ابدأ التركيز',
    pauseFocusBtn: 'إيقاف مؤقت',
    needMoreTime5mBtn: '+5 دقائق إضافية',
    activeSubtaskSpotlight: 'الخطوة الحالية فقط',
    doneNextStepBtn: '✓ تم — الخطوة التالية',
    settingsTitle: 'الإعدادات واللغة والنسخ الاحتياطي',
    languageSectionTitle: 'لغة التطبيق (Language)',
    exportBackupBtn: '📤 تصدير نسخة احتياطية',
    restoreBackupBtn: '📥 استعادة نسخة احتياطية',
    onboardingTitle1: 'شاهد يومك بوضوح تام.',
    onboardingSub1: 'مجاني 100% للأبد. بدون حسابات أو إعلانات أو اشتراكات. جميع بياناتك محفوظة محلياً على هاتفك.',
  },
  fa: {
    ...EN,
    appSubtitle: 'خط زمانی دیداری مای‌لاین',
    tabTimeline: 'خط زمانی',
    tabInbox: 'صندوق ذهن و روتین‌ها',
    tabFocus: 'تایمر تمرکز',
    todayJump: 'امروز ↺',
    liveLabel: 'زنده',
    wakeAnchor: '☀️ زمان بیداری',
    runningBehindBanner: '⚠️ عقب‌تر از برنامه امروز هستید',
    rebuildDayBtn: '✨ بازچینی هوشمند روز',
    freeSpaceTapToSchedule: 'زمان آزاد — برای برنامه‌ریزی لمس کنید',
    startFocusTimerBtn: '▶ شروع تایمر تمرکز',
    nowLabel: 'اکنون',
    catDeepWork: 'کار عمیق',
    catRoutine: 'روتین',
    catErrand: 'کارهای روزمره',
    catRest: 'استراحت',
    newBlockOrDumpTitle: 'بلوک زمانی جدید یا تخلیه ذهنی',
    scheduleOnTimelineBtn: '🗓️ افزودن به خط زمانی',
    brainDumpInboxBtn: '📥 ذخیره در صندوق ذهن',
    inboxHeaderTitle: 'تخلیه ذهنی و بسته‌های روتین',
    unscheduledInboxTab: 'صندوق برنامه‌ریزی‌نشده',
    routineStacksTab: 'بسته‌های روتین',
    scheduleTodayBtn: '🗓️ برنامه‌ریزی امروز',
    dropIntoTodayBtn: '+ افزودن به امروز',
    focusHeaderTitle: 'تایمر تمرکز دیداری',
    brownNoiseLabel: '🔊 صدای قهوه‌ای',
    leftSuffix: 'باقی‌مانده',
    startFocusBtn: 'شروع تمرکز',
    pauseFocusBtn: 'توقف',
    needMoreTime5mBtn: '+۵ دقیقه زمان بیشتر',
    doneNextStepBtn: '✓ انجام شد — گام بعدی',
    settingsTitle: 'تنظیمات، زبان و پشتیبان‌گیری',
    languageSectionTitle: 'زبان برنامه (Language)',
    exportBackupBtn: '📤 خروجی پشتیبان (JSON)',
    restoreBackupBtn: '📥 بازیابی پشتیبان',
  },
  ur: {
    ...EN,
    appSubtitle: 'مائی لائن بصری ٹائم لائن',
    tabTimeline: 'ٹائم لائن',
    tabInbox: 'ان باکس اور روٹین',
    tabFocus: 'فوکس ٹائمر',
    todayJump: 'آج ↺',
    liveLabel: 'لائیو',
    wakeAnchor: '☀️ جاگنے کا وقت',
    runningBehindBanner: '⚠️ شیڈول سے پیچھے چل رہے ہیں',
    rebuildDayBtn: '✨ دن دوبارہ ترتیب دیں',
    freeSpaceTapToSchedule: 'خالی وقت — شیڈول کے لیے ٹیپ کریں',
    startFocusTimerBtn: '▶ فوکس ٹائمر شروع کریں',
    nowLabel: 'ابھی',
    catDeepWork: 'گہرا کام',
    catRoutine: 'روٹین',
    catErrand: 'ضروری کام',
    catRest: 'آرام',
    inboxHeaderTitle: 'برین ڈمپ اور روٹین اسٹیکس',
    scheduleTodayBtn: '🗓️ آج شیڈول کریں',
    dropIntoTodayBtn: '+ آج شامل کریں',
    focusHeaderTitle: 'بصری فوکس ٹائمر',
    brownNoiseLabel: '🔊 براؤن نائز',
    leftSuffix: 'باقی',
    startFocusBtn: 'فوکس شروع کریں',
    pauseFocusBtn: 'وقفہ',
    needMoreTime5mBtn: '+5 منٹ مزید وقت',
    doneNextStepBtn: '✓ مکمل — اگلا قدم',
    settingsTitle: 'سیٹنگز، زبان اور بیک اپ',
    languageSectionTitle: 'ایپ کی زبان (Language)',
  },
  hi: {
    ...EN,
    appSubtitle: 'माईलाइन विज़ुअल टाइमलाइन',
    tabTimeline: 'टाइमलाइन',
    tabInbox: 'इनबॉक्स और रूटीन',
    tabFocus: 'फोकस टाइमर',
    todayJump: 'आज ↺',
    liveLabel: 'लाइव',
    wakeAnchor: '☀️ जागने का समय',
    runningBehindBanner: '⚠️ शेड्यूल से पीछे चल रहे हैं',
    rebuildDayBtn: '✨ दिन रीबिल्ड करें',
    freeSpaceTapToSchedule: 'खाली समय — शेड्यूल करने के लिए टैप करें',
    startFocusTimerBtn: '▶ फोकस टाइमर शुरू करें',
    nowLabel: 'अभी',
    catDeepWork: 'डीप वर्क',
    catRoutine: 'रूटीन',
    catErrand: 'ज़रूरी काम',
    catRest: 'आराम',
    inboxHeaderTitle: 'ब्रेन डंप और रूटीन स्टैक्स',
    scheduleTodayBtn: '🗓️ आज शेड्यूल करें',
    dropIntoTodayBtn: '+ आज में जोड़ें',
    focusHeaderTitle: 'विज़ुअल फोकस टाइमर',
    brownNoiseLabel: '🔊 ब्राउन नॉइज़',
    leftSuffix: 'शेष',
    startFocusBtn: 'फोकस शुरू करें',
    pauseFocusBtn: 'रोकें',
    needMoreTime5mBtn: '+5 मि. और समय',
    doneNextStepBtn: '✓ पूर्ण — अगला चरण',
    settingsTitle: 'सेटिंग्स, भाषा और बैकअप',
    languageSectionTitle: 'ऐप की भाषा (Language)',
  },
  es: {
    ...EN,
    appSubtitle: 'Línea Visual del Día',
    tabTimeline: 'Línea del Día',
    tabInbox: 'Bandeja y Rutinas',
    tabFocus: 'Temporizador',
    todayJump: 'Hoy ↺',
    wakeAnchor: '☀️ Hora de Despertar',
    runningBehindBanner: '⚠️ Vas con retraso en el horario',
    rebuildDayBtn: '✨ Reorganizar Día',
    freeSpaceTapToSchedule: 'Espacio Libre — Toca para agendar',
    startFocusTimerBtn: '▶ Iniciar Enfoque',
    nowLabel: 'AHORA',
    catDeepWork: 'Trabajo Profundo',
    catRoutine: 'Rutina',
    catErrand: 'Recado',
    catRest: 'Descanso',
    inboxHeaderTitle: 'Bandeja Mental y Rutinas',
    scheduleTodayBtn: '🗓️ Agendar Hoy',
    dropIntoTodayBtn: '+ Añadir a Hoy',
    focusHeaderTitle: 'Temporizador Visual de Enfoque',
    brownNoiseLabel: '🔊 Ruido Marrón',
    leftSuffix: 'restantes',
    startFocusBtn: 'Iniciar Enfoque',
    pauseFocusBtn: 'Pausar',
    needMoreTime5mBtn: '+5m Más Tiempo',
    doneNextStepBtn: '✓ Hecho — Siguiente Paso',
    settingsTitle: 'Ajustes, Idioma y Copia Local',
    languageSectionTitle: 'Idioma de la App (Language)',
  },
  fr: {
    ...EN,
    appSubtitle: 'Planning Visuel MyLine',
    tabTimeline: 'Timeline',
    tabInbox: 'Idées & Routines',
    tabFocus: 'Minuteur Focus',
    todayJump: "Aujourd'hui ↺",
    wakeAnchor: '☀️ Heure de Réveil',
    runningBehindBanner: '⚠️ En retard sur le programme',
    rebuildDayBtn: '✨ Réorganiser le Jour',
    freeSpaceTapToSchedule: 'Temps Libre — Appuyer pour planifier',
    startFocusTimerBtn: '▶ Démarrer le Focus',
    nowLabel: 'MAINTENANT',
    catDeepWork: 'Travail Profond',
    catRoutine: 'Routine',
    catErrand: 'Course',
    catRest: 'Repos',
    inboxHeaderTitle: 'Boîte à Idées & Routines',
    scheduleTodayBtn: "🗓️ Planifier Aujourd'hui",
    dropIntoTodayBtn: "+ Ajouter à Aujourd'hui",
    focusHeaderTitle: 'Minuteur Visuel Anti-Cécité Temporelle',
    brownNoiseLabel: '🔊 Bruit Brun',
    leftSuffix: 'restant',
    startFocusBtn: 'Démarrer',
    pauseFocusBtn: 'Pause',
    needMoreTime5mBtn: '+5m de Plus',
    doneNextStepBtn: '✓ Fait — Étape Suivante',
    settingsTitle: 'Paramètres, Langue & Sauvegarde',
    languageSectionTitle: "Langue de l'Application",
  },
  de: {
    ...EN,
    appSubtitle: 'Visueller Tagesplaner',
    tabTimeline: 'Zeitstrahl',
    tabInbox: 'Inbox & Routinen',
    tabFocus: 'Fokus-Timer',
    todayJump: 'Heute ↺',
    wakeAnchor: '☀️ Aufwachzeit',
    runningBehindBanner: '⚠️ Hinter dem Zeitplan',
    rebuildDayBtn: '✨ Tag neu planen',
    freeSpaceTapToSchedule: 'Freie Zeit — Tippen zum Planen',
    startFocusTimerBtn: '▶ Fokus-Timer starten',
    nowLabel: 'JETZT',
    catDeepWork: 'Fokusarbeit',
    catRoutine: 'Routine',
    catErrand: 'Erledigung',
    catRest: 'Pause',
    inboxHeaderTitle: 'Brain-Dump & Routinen',
    scheduleTodayBtn: '🗓️ Heute planen',
    dropIntoTodayBtn: '+ In Heute einfügen',
    focusHeaderTitle: 'Visueller Fokus-Timer',
    brownNoiseLabel: '🔊 Braunes Rauschen',
    leftSuffix: 'übrig',
    startFocusBtn: 'Fokus starten',
    pauseFocusBtn: 'Pause',
    needMoreTime5mBtn: '+5 Min. mehr Zeit',
    doneNextStepBtn: '✓ Erledigt — Nächster Schritt',
    settingsTitle: 'Einstellungen, Sprache & Backup',
    languageSectionTitle: 'App-Sprache (Language)',
  },
  zh: {
    ...EN,
    appSubtitle: 'MyLine 视觉时间轴日程',
    tabTimeline: '视觉时间轴',
    tabInbox: '灵感箱与日常习惯',
    tabFocus: '专注计时器',
    todayJump: '今天 ↺',
    wakeAnchor: '☀️ 晨起时间锚点',
    runningBehindBanner: '⚠️ 进度落后于计划时间',
    rebuildDayBtn: '✨ 一键重排今日日程',
    freeSpaceTapToSchedule: '空闲时段 — 点击安排任务',
    startFocusTimerBtn: '▶ 开始专注计时',
    nowLabel: '现在',
    catDeepWork: '深度工作',
    catRoutine: '日常习惯',
    catErrand: '琐事跑腿',
    catRest: '休息充电',
    inboxHeaderTitle: '闪念收集箱与习惯模板',
    scheduleTodayBtn: '🗓️ 安排到今天',
    dropIntoTodayBtn: '+ 一键放入今天',
    focusHeaderTitle: '抗时间盲区视觉专注计时器',
    brownNoiseLabel: '🔊 离线棕噪音',
    leftSuffix: '剩余',
    startFocusBtn: '开始专注',
    pauseFocusBtn: '暂停专注',
    needMoreTime5mBtn: '+5分钟 延长时间',
    doneNextStepBtn: '✓ 完成 — 下一步',
    settingsTitle: '设置、多语言与本地备份',
    languageSectionTitle: '应用语言 (Language)',
  },
  ru: {
    ...EN,
    appSubtitle: 'Визуальный планер дня',
    tabTimeline: 'Таймлайн',
    tabInbox: 'Входящие и Рутины',
    tabFocus: 'Фокус-таймер',
    todayJump: 'Сегодня ↺',
    wakeAnchor: '☀️ Время подъема',
    runningBehindBanner: '⚠️ Отставание от расписания',
    rebuildDayBtn: '✨ Перестроить день',
    freeSpaceTapToSchedule: 'Свободное окно — Нажмите для плана',
    startFocusTimerBtn: '▶ Запустить таймер',
    nowLabel: 'СЕЙЧАС',
    catDeepWork: 'Глубокая работа',
    catRoutine: 'Рутина',
    catErrand: 'Поручение',
    catRest: 'Отдых',
    inboxHeaderTitle: 'Разгрузка мыслей и Рутины',
    scheduleTodayBtn: '🗓️ На сегодня',
    dropIntoTodayBtn: '+ Добавить в сегодня',
    focusHeaderTitle: 'Визуальный фокус-таймер',
    brownNoiseLabel: '🔊 Коричневый шум',
    leftSuffix: 'осталось',
    startFocusBtn: 'Старт',
    pauseFocusBtn: 'Пауза',
    needMoreTime5mBtn: '+5 мин ещё',
    doneNextStepBtn: '✓ Готово — Следующий шаг',
    settingsTitle: 'Настройки, Язык и Бэкап',
    languageSectionTitle: 'Язык приложения (Language)',
  },
  tr: {
    ...EN,
    appSubtitle: 'Görsel Günlük Planlayıcı',
    tabTimeline: 'Zaman Çizelgesi',
    tabInbox: 'Kutu ve Rutinler',
    tabFocus: 'Odak Sayacı',
    todayJump: 'Bugün ↺',
    wakeAnchor: '☀️ Uyanış Saati',
    runningBehindBanner: '⚠️ Programın gerisindesiniz',
    rebuildDayBtn: '✨ Günü Yeniden Planla',
    freeSpaceTapToSchedule: 'Boş Zaman — Planlamak için dokun',
    startFocusTimerBtn: '▶ Odak Sayacını Başlat',
    nowLabel: 'ŞİMDİ',
    catDeepWork: 'Derin Çalışma',
    catRoutine: 'Rutin',
    catErrand: 'İşler',
    catRest: 'Dinlenme',
    inboxHeaderTitle: 'Zihin Boşaltma ve Rutinler',
    scheduleTodayBtn: '🗓️ Bugüne Planla',
    dropIntoTodayBtn: '+ Bugüne Ekle',
    focusHeaderTitle: 'Görsel Odak Sayacı',
    brownNoiseLabel: '🔊 Kahverengi Gürültü',
    leftSuffix: 'kaldı',
    startFocusBtn: 'Başlat',
    pauseFocusBtn: 'Duraklat',
    needMoreTime5mBtn: '+5 dk Ek Süre',
    doneNextStepBtn: '✓ Tamam — Sonraki Adım',
    settingsTitle: 'Ayarlar, Dil ve Yedekleme',
    languageSectionTitle: 'Uygulama Dili (Language)',
  },
  pt: {
    ...EN,
    appSubtitle: 'Linha do Tempo Visual',
    tabTimeline: 'Linha do Tempo',
    tabInbox: 'Entrada e Rotinas',
    tabFocus: 'Timer de Foco',
    todayJump: 'Hoje ↺',
    wakeAnchor: '☀️ Hora de Acordar',
    runningBehindBanner: '⚠️ Atrasado no cronograma',
    rebuildDayBtn: '✨ Reorganizar Dia',
    freeSpaceTapToSchedule: 'Tempo Livre — Toque para agendar',
    startFocusTimerBtn: '▶ Iniciar Foco',
    nowLabel: 'AGORA',
    catDeepWork: 'Foco Profundo',
    catRoutine: 'Rotina',
    catErrand: 'Tarefa',
    catRest: 'Descanso',
    inboxHeaderTitle: 'Captura Rápida e Rotinas',
    scheduleTodayBtn: '🗓️ Agendar Hoje',
    dropIntoTodayBtn: '+ Adicionar a Hoje',
    focusHeaderTitle: 'Timer Visual de Foco',
    brownNoiseLabel: '🔊 Ruído Marrom',
    leftSuffix: 'restantes',
    startFocusBtn: 'Iniciar Foco',
    pauseFocusBtn: 'Pausar',
    needMoreTime5mBtn: '+5m Mais Tempo',
    doneNextStepBtn: '✓ Pronto — Próximo Passo',
    settingsTitle: 'Configurações, Idioma e Backup',
    languageSectionTitle: 'Idioma do App (Language)',
  },
  id: {
    ...EN,
    appSubtitle: 'Linimasa Harian Visual',
    tabTimeline: 'Linimasa',
    tabInbox: 'Kotak Ide & Rutinitas',
    tabFocus: 'Timer Fokus',
    todayJump: 'Hari Ini ↺',
    wakeAnchor: '☀️ Waktu Bangun',
    runningBehindBanner: '⚠️ Tertinggal dari jadwal',
    rebuildDayBtn: '✨ Susun Ulang Hari',
    freeSpaceTapToSchedule: 'Waktu Luang — Ketuk untuk jadwalkan',
    startFocusTimerBtn: '▶ Mulai Timer Fokus',
    nowLabel: 'SEKARANG',
    catDeepWork: 'Kerja Fokus',
    catRoutine: 'Rutinitas',
    catErrand: 'Urusan',
    catRest: 'Istirahat',
    inboxHeaderTitle: 'Curah Pikiran & Rutinitas',
    scheduleTodayBtn: '🗓️ Jadwalkan Hari Ini',
    dropIntoTodayBtn: '+ Masukkan ke Hari Ini',
    focusHeaderTitle: 'Timer Fokus Visual',
    brownNoiseLabel: '🔊 Brown Noise',
    leftSuffix: 'tersisa',
    startFocusBtn: 'Mulai Fokus',
    pauseFocusBtn: 'Jeda',
    needMoreTime5mBtn: '+5m Tambah Waktu',
    doneNextStepBtn: '✓ Selesai — Langkah Berikutnya',
    settingsTitle: 'Pengaturan, Bahasa & Cadangan',
    languageSectionTitle: 'Bahasa Aplikasi (Language)',
  },
};

export function getLanguageMeta(code?: string): LanguageOption {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
  );
}

export function getTranslation(code?: string): TranslationStrings {
  const validCode = (code as AppLanguageCode) || 'en';
  return TRANSLATIONS[validCode] || TRANSLATIONS.en;
}
