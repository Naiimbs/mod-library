/**
 * Shared sample data of the "Application UI" examples (dashboards, settings,
 * informational pages). The vocabulary, menu, hospitals, specialties and
 * statuses follow the MODHS Referral Portal ("Medical Referrals and Patient
 * Transfer System"); people, file numbers and referral numbers are invented.
 *
 * Everything is bilingual: `{ en, ar }` pairs read with `pick(pair, lang)`.
 */
import type { ModAppShellGroup, ModStatusTagVariant } from '@mod-internal/ui';

export type AppLang = 'en' | 'ar';

/** A text in both languages. */
export interface Bi {
  en: string;
  ar: string;
}

export function pick(text: Bi, lang: AppLang): string {
  return text[lang];
}

/**
 * Whose menu the shell shows:
 * - `directorate`: General Directorate of Medical Services (system-wide; lands on the dashboard)
 * - `coordinator`: medical coordinator of one hospital (lands on Home)
 * - `admin`: general admin (setup, access and notification screens)
 */
export type AppRole = 'directorate' | 'coordinator' | 'admin';

/** Ids of the side bar items (the routes of the real system without the slash). */
export type AppNavId =
  | 'dashboard'
  | 'reports'
  | 'home'
  | 'pending-actions'
  | 'referrals'
  | 'referrals-new'
  | 'appointments'
  | 'my-hospital'
  | 'hospitals'
  | 'regions'
  | 'cities'
  | 'specialties'
  | 'lookups'
  | 'expense-rates'
  | 'users'
  | 'notification-settings'
  | 'notification-log';

interface NavEntry {
  id: AppNavId;
  label: Bi;
  icon: string;
  group: 'follow' | 'work' | 'setup' | 'access' | 'notifications';
  roles: readonly AppRole[];
}

const NAV_GROUP_LABELS: Record<NavEntry['group'], Bi> = {
  follow: { en: 'Monitoring', ar: 'المتابعة' },
  work: { en: 'Work', ar: 'العمل' },
  setup: { en: 'Setup', ar: 'الإعداد' },
  access: { en: 'Access', ar: 'الصلاحيات' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
};

const NAV: readonly NavEntry[] = [
  { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة المؤشرات' }, icon: 'analytics-01', group: 'follow', roles: ['directorate', 'admin'] },
  { id: 'reports', label: { en: 'Reports', ar: 'التقارير' }, icon: 'file-01', group: 'follow', roles: ['directorate', 'admin'] },
  { id: 'home', label: { en: 'Home', ar: 'الرئيسية' }, icon: 'home-01', group: 'work', roles: ['coordinator'] },
  { id: 'pending-actions', label: { en: 'Pending actions', ar: 'الإجراءات المعلقة' }, icon: 'inbox', group: 'work', roles: ['coordinator'] },
  { id: 'referrals', label: { en: 'Referrals', ar: 'الإحالات' }, icon: 'left-to-right-list-bullet', group: 'work', roles: ['directorate', 'coordinator', 'admin'] },
  { id: 'referrals-new', label: { en: 'New referral request', ar: 'طلب إحالة جديد' }, icon: 'add-01', group: 'work', roles: [] },
  { id: 'appointments', label: { en: 'Attendance', ar: 'الحضور' }, icon: 'calendar-03', group: 'work', roles: ['coordinator'] },
  { id: 'my-hospital', label: { en: 'My hospital', ar: 'المستشفى الخاص بي' }, icon: 'hospital-01', group: 'setup', roles: ['coordinator'] },
  { id: 'hospitals', label: { en: 'Hospitals', ar: 'المستشفيات' }, icon: 'hospital-01', group: 'setup', roles: ['directorate', 'admin'] },
  { id: 'regions', label: { en: 'Regions', ar: 'المناطق' }, icon: 'maps', group: 'setup', roles: ['admin'] },
  { id: 'cities', label: { en: 'Cities', ar: 'المدن' }, icon: 'location-01', group: 'setup', roles: ['admin'] },
  { id: 'specialties', label: { en: 'Specialties', ar: 'التخصصات' }, icon: 'stethoscope', group: 'setup', roles: ['admin'] },
  { id: 'lookups', label: { en: 'Lookup lists', ar: 'القوائم المرجعية' }, icon: 'tags', group: 'setup', roles: ['admin'] },
  { id: 'expense-rates', label: { en: 'Expenses rates', ar: 'قيمه النفقات' }, icon: 'coins-01', group: 'setup', roles: ['admin'] },
  { id: 'users', label: { en: 'Users', ar: 'المستخدمون' }, icon: 'user-group', group: 'access', roles: ['admin'] },
  { id: 'notification-settings', label: { en: 'Notification settings', ar: 'إعدادات الإشعارات' }, icon: 'settings-01', group: 'notifications', roles: ['admin'] },
  { id: 'notification-log', label: { en: 'Notification log', ar: 'سجل الإشعارات' }, icon: 'note-01', group: 'notifications', roles: ['admin'] },
];

const NAV_GROUP_ORDER: readonly NavEntry['group'][] = ['follow', 'work', 'setup', 'access', 'notifications'];

/**
 * Side bar groups of a role, as `mod-app-shell` expects them. `pending` is the
 * count shown as a badge on "Pending actions" (0 hides it).
 */
export function appMenu(lang: AppLang, role: AppRole, pending = 0): ModAppShellGroup[] {
  const badgeLabel = lang === 'ar' ? `${pending} بانتظار إجرائك` : `${pending} waiting for you`;
  return NAV_GROUP_ORDER.map((group) => ({
    id: group,
    label: NAV_GROUP_LABELS[group][lang],
    items: NAV.filter((entry) => entry.group === group && entry.roles.includes(role)).map((entry) => ({
      id: entry.id,
      label: entry.label[lang],
      icon: entry.icon,
      ...(entry.id === 'pending-actions' && pending > 0 ? { badge: pending, badgeLabel } : {}),
    })),
  })).filter((group) => group.items.length > 0);
}

/** Label of one side bar item (for breadcrumbs and page titles). */
export function appNavLabel(id: AppNavId, lang: AppLang): string {
  return NAV.find((entry) => entry.id === id)?.label[lang] ?? id;
}

/** Texts of the shell itself (app name, tool labels), from the real system's translation files. */
export const APP_TEXT = {
  en: {
    appName: 'Medical Referral and Patient Transfer Management System',
    appShort: 'Medical Referrals',
    logoAlt: 'Ministry logo',
    navLabel: 'Main navigation',
    collapse: 'Collapse the side menu',
    expand: 'Expand the side menu',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    skip: 'Skip to main content',
    switchTo: 'العربية',
    switchLabel: 'Switch to Arabic',
    notifications: 'Notifications',
    unread: (n: number) => `Notifications, ${n} unread`,
    markAllRead: 'Mark all as read',
    noNotices: 'No notices.',
    scopeTitle: 'Your data scope',
    scopeAll: 'All hospitals',
    userMenu: 'Account menu',
    myHospital: 'My hospital',
    signOut: 'Sign out',
    version: 'Version 1.4 · Demo data',
  },
  ar: {
    appName: 'النظام الخاص بإدارة الإحالات الطبية وتحويل المرضى',
    appShort: 'الإحالات الطبية',
    logoAlt: 'شعار الوزارة',
    navLabel: 'القائمة الرئيسية',
    collapse: 'طيّ القائمة الجانبية',
    expand: 'توسيع القائمة الجانبية',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    skip: 'تخطّي إلى المحتوى',
    switchTo: 'English',
    switchLabel: 'التبديل إلى اللغة الإنجليزية',
    notifications: 'الإشعارات',
    unread: (n: number) => `الإشعارات، ${n} غير مقروءة`,
    markAllRead: 'تحديد الكل كمقروء',
    noNotices: 'لا توجد إشعارات.',
    scopeTitle: 'نطاق بياناتك',
    scopeAll: 'كل المستشفيات',
    userMenu: 'قائمة الحساب',
    myHospital: 'المستشفى الخاص بي',
    signOut: 'تسجيل الخروج',
    version: 'الإصدار 1.4 · بيانات تجريبية',
  },
} as const;

/** Hospitals of the real system's reference data (a subset). */
export const HOSPITALS = {
  PSMMC: { en: 'Prince Sultan Military Medical City in Riyadh', ar: 'مدينة الأمير سلطان الطبية العسكرية' },
  KFAFH: { en: 'King Fahad Armed Forces Hospital Jeddah', ar: 'مستشفى الملك فهد للقوات المسلحة بجدة' },
  KFMMC: { en: 'King Fahad Military Medical Complex', ar: 'مجمع الملك فهد الطبي العسكري بالظهران' },
  MAFH: { en: 'Armed Forces Hospital Madinah', ar: 'مستشفى القوات المسلحة بالمدينة المنورة' },
  KAFH: { en: 'Al Kharj Armed Forces Hospital', ar: 'مستشفى القوات المسلحة بالخرج' },
  WDAFH: { en: 'Wadi Aldawaser Military Hospital', ar: 'مستشفى القوات المسلحة بوادي الدواسر' },
  HADAFH: { en: 'Al Hada Armed Forces Hospital Taif', ar: 'مستشفى الهدا للقوات المسلحة بالطائف' },
  JH: { en: 'Jubail Hospital', ar: 'مستشفى القوات المسلحة بالجبيل' },
  AAFH: { en: 'Al Ahsa Armed Forces Hospital', ar: 'مستشفى القوات المسلحة بالأحساء' },
} as const satisfies Record<string, Bi>;

export type HospitalCode = keyof typeof HOSPITALS;

/** Specialties of the real system's reference data (a subset). */
export const SPECIALTIES = {
  CARD: { en: 'Cardiology', ar: 'أمراض القلب' },
  ORTHO: { en: 'Orthopedic Surgery', ar: 'جراحة العظام' },
  NEURO: { en: 'Neurology', ar: 'الأمراض العصبية' },
  NSURG: { en: 'Neurosurgery', ar: 'جراحة المخ والأعصاب' },
  ONC: { en: 'Oncology', ar: 'الأورام' },
  IM: { en: 'Internal Medicine', ar: 'الباطنة' },
  GS: { en: 'General Surgery', ar: 'الجراحة العامة' },
  PED: { en: 'Pediatrics', ar: 'طب الأطفال' },
  URO: { en: 'Urology', ar: 'المسالك البولية' },
  OPHTH: { en: 'Ophthalmology', ar: 'طب وجراحة العيون' },
} as const satisfies Record<string, Bi>;

export type SpecialtyCode = keyof typeof SPECIALTIES;

/** Referral statuses with the status-tag variant that shows them. */
export const REFERRAL_STATUS = {
  SUBMITTED: { en: 'Submitted', ar: 'مُقدَّم', variant: 'neutral' },
  MEDICAL_REVIEW: { en: 'Medical review', ar: 'المراجعة الطبية', variant: 'info' },
  ELIGIBILITY_REVIEW: { en: 'Eligibility review', ar: 'التحقق من الأحقية', variant: 'info' },
  IN_RECEIVING_REVIEW: { en: 'Receiving hospital review', ar: 'مراجعة المستشفى المستقبل', variant: 'warning' },
  ACCEPTED: { en: 'Accepted', ar: 'مقبولة', variant: 'success' },
  BOOKED: { en: 'Booked', ar: 'تم الحجز', variant: 'success' },
  REJECTED: { en: 'Rejected', ar: 'مرفوضة', variant: 'error' },
  ENDED: { en: 'Ended', ar: 'منتهية', variant: 'neutral' },
} as const satisfies Record<string, Bi & { variant: ModStatusTagVariant }>;

export type ReferralStatus = keyof typeof REFERRAL_STATUS;

/** Referral priorities with the tag variant that shows them. */
export const PRIORITY = {
  NORMAL: { en: 'Normal', ar: 'عادية', variant: 'neutral' },
  URGENT: { en: 'Urgent', ar: 'عاجلة', variant: 'warning' },
  EMERGENCY: { en: 'Emergency', ar: 'طارئة', variant: 'error' },
} as const satisfies Record<string, Bi & { variant: 'neutral' | 'warning' | 'error' }>;

export type Priority = keyof typeof PRIORITY;

/** Required services of a referral. */
export const SERVICES = {
  ADMISSION: { en: 'Admission', ar: 'تنويم' },
  OUTPATIENT_CLINIC: { en: 'Outpatient clinic', ar: 'عيادة خارجية' },
  SECOND_OPINION: { en: 'Second opinion', ar: 'رأي ثانٍ' },
} as const satisfies Record<string, Bi>;

export type ServiceCode = keyof typeof SERVICES;

/** The signed-in user of each role (invented people). */
export const APP_USERS: Record<
  AppRole,
  { name: Bi; short: Bi; initials: Bi; role: Bi; hospital: HospitalCode | null }
> = {
  directorate: {
    name: { en: 'Dr. Khalid Al-Harbi', ar: 'د. خالد الحربي' },
    short: { en: 'Dr. Khalid', ar: 'د. خالد' },
    initials: { en: 'KH', ar: 'خ ح' },
    role: { en: 'General Directorate of Medical Services', ar: 'الإدارة العامة للخدمات الطبية' },
    hospital: null,
  },
  coordinator: {
    name: { en: 'Noura Al-Qahtani', ar: 'نورة القحطاني' },
    short: { en: 'Noura', ar: 'نورة' },
    initials: { en: 'NQ', ar: 'ن ق' },
    role: { en: 'Medical coordinator', ar: 'المنسق الطبي' },
    hospital: 'PSMMC',
  },
  admin: {
    name: { en: 'Saad Al-Mutairi', ar: 'سعد المطيري' },
    short: { en: 'Saad', ar: 'سعد' },
    initials: { en: 'SM', ar: 'س م' },
    role: { en: 'General admin', ar: 'مدير النظام' },
    hospital: null,
  },
};

/** Notices listed under the bell (texts of the real system's notices). */
export const APP_NOTICES: readonly { id: string; text: Bi; time: Bi }[] = [
  {
    id: 'n1',
    text: { en: 'A new referral request was submitted.', ar: 'تم تقديم طلب إحالة جديد.' },
    time: { en: '10 minutes ago', ar: 'منذ 10 دقائق' },
  },
  {
    id: 'n2',
    text: { en: 'Referral 2026-000171 was rejected.', ar: 'تم رفض الإحالة 2026-000171.' },
    time: { en: '2 hours ago', ar: 'منذ ساعتين' },
  },
  {
    id: 'n3',
    text: { en: 'Appointment day: awaiting attendance', ar: 'حلول يوم الموعد: بانتظار تأكيد الحضور' },
    time: { en: 'Yesterday', ar: 'أمس' },
  },
];
