import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  ModBarList,
  ModBarListItem,
  ModButton,
  ModEmptyState,
  ModEmptyStateActions,
  ModIcon,
  ModInlineAlert,
  ModPageHeader,
  ModPageHeaderActions,
  ModStatCard,
  ModStatusTag,
  ModTag,
  ModTimeline,
  ModTimelineItem,
  ModTimelineTone,
} from '@mod-internal/ui';
import {
  APP_USERS,
  AppLang,
  AppNavId,
  Bi,
  HOSPITALS,
  PRIORITY,
  Priority,
  SERVICES,
  SPECIALTIES,
  ServiceCode,
  SpecialtyCode,
  appNavLabel,
} from '../../shared/app-example/app-example-data';
import { AppExampleShell } from '../../shared/app-example/app-example-shell';

/** Actions a medical coordinator takes (a subset of the real system's pending actions). */
type ActionCode = 'ELIGIBILITY' | 'BOOKING' | 'ATTENDANCE';
const ACTION_ORDER: readonly ActionCode[] = ['ELIGIBILITY', 'BOOKING', 'ATTENDANCE'];
const PRIORITY_ORDER: Record<Priority, number> = { EMERGENCY: 0, URGENT: 1, NORMAL: 2 };

const ACTIONS: Record<ActionCode, { label: Bi; done: Bi; event: Bi; icon: string }> = {
  ELIGIBILITY: {
    label: { en: 'Check treatment eligibility', ar: 'التحقق من أحقية العلاج' },
    done: { en: 'Treatment eligibility saved for referral', ar: 'حُفظ التحقق من أحقية العلاج للإحالة' },
    event: { en: 'Treatment eligibility checked', ar: 'تم التحقق من أحقية العلاج' },
    icon: 'user-check-01',
  },
  BOOKING: {
    label: { en: 'Book the clinic appointment', ar: 'حجز موعد العيادة' },
    done: { en: 'Clinic appointment booked for referral', ar: 'تم حجز موعد العيادة للإحالة' },
    event: { en: 'Clinic appointment booked', ar: 'تم حجز موعد العيادة' },
    icon: 'calendar-03',
  },
  ATTENDANCE: {
    label: { en: 'Confirm the patient attendance', ar: 'تأكيد حضور المريض' },
    done: { en: 'Attendance saved for referral', ar: 'حُفظ الحضور للإحالة' },
    event: { en: 'Attendance confirmed', ar: 'تم تأكيد الحضور' },
    icon: 'checkmark-circle-02',
  },
};

const TEXT = {
  en: {
    morning: (name: string) => `Good morning, ${name}`,
    evening: (name: string) => `Good evening, ${name}`,
    running: (n: number) => `${n} running referrals`,
    waiting: (n: number) => `${n} waiting for your decision`,
    newReferral: 'New referral request',
    pendingButton: (n: number) => `Pending actions (${n})`,
    tilesLabel: 'Summary',
    tileWaiting: 'Pending actions',
    tileRunning: 'Running referrals',
    tileBooked: 'Confirmed bookings',
    tileTotal: 'Visible referrals in total',
    pendingLink: 'Open the pending actions',
    pendingNone: 'Nothing is waiting for you',
    unitReferral: 'referrals',
    queueTitle: 'Pending actions',
    queueCount: (n: number) => `${n} cases waiting for an action of your role`,
    filterLabel: 'Filter by required action',
    all: 'All',
    requiredAction: 'Required action',
    priority: 'Priority',
    waitingSince: 'Waiting since',
    takeAction: 'Take action',
    takeActionFor: (n: string) => `Take action: referral ${n}`,
    emptyTitle: 'No pending actions',
    emptyText: 'No case is waiting for an action of your role now.',
    filterEmpty: 'No case is waiting for this action.',
    showAll: 'Show all',
    dismiss: 'Dismiss',
    hoursAgo: (n: number) => (n === 1 ? '1 hour ago' : `${n} hours ago`),
    appointmentsTitle: 'Attendance: appointments of the day',
    appointmentsCount: (n: number) => `${n} appointments on this day`,
    attended: 'Attended',
    awaiting: 'Awaiting attendance',
    confirm: 'Confirm attendance',
    confirmFor: (name: string) => `Confirm attendance: ${name}`,
    attendanceSaved: 'Attendance saved.',
    quickTitle: 'Quick actions',
    stagesTitle: 'Referrals by stage',
    stages: ['In review', 'Waiting for booking', 'Booked', 'Completed', 'Ended'],
    activityTitle: 'Recent activity',
    now: 'Just now',
    otherTitle: 'This screen is not part of the example',
    otherText: 'The example shows the home page only. Choose Home in the side bar to go back.',
    back: 'Back to Home',
  },
  ar: {
    morning: (name: string) => `صباح الخير، ${name}`,
    evening: (name: string) => `مساء الخير، ${name}`,
    running: (n: number) => `${n} إحالة جارية`,
    waiting: (n: number) => `${n} تنتظر قراركم`,
    newReferral: 'طلب إحالة جديد',
    pendingButton: (n: number) => `الإجراءات المعلقة (${n})`,
    tilesLabel: 'الملخص',
    tileWaiting: 'الإجراءات المعلقة',
    tileRunning: 'إحالات جارية',
    tileBooked: 'حجوزات مؤكدة',
    tileTotal: 'إجمالي الإحالات المرئية',
    pendingLink: 'فتح الإجراءات المعلقة',
    pendingNone: 'لا شيء ينتظرك',
    unitReferral: 'إحالة',
    queueTitle: 'الإجراءات المعلقة',
    queueCount: (n: number) => `${n} حالة بانتظار إجراء من دوركم`,
    filterLabel: 'تصفية حسب الإجراء المطلوب',
    all: 'الكل',
    requiredAction: 'الإجراء المطلوب',
    priority: 'الأولوية',
    waitingSince: 'بالانتظار منذ',
    takeAction: 'اتخاذ الإجراء',
    takeActionFor: (n: string) => `اتخاذ الإجراء: الإحالة ${n}`,
    emptyTitle: 'لا توجد إجراءات معلقة',
    emptyText: 'لا توجد حالات بانتظار إجراء من دوركم الآن.',
    filterEmpty: 'لا توجد حالات لهذا الإجراء.',
    showAll: 'عرض الكل',
    dismiss: 'إغلاق',
    hoursAgo: (n: number) =>
      n === 1 ? 'منذ ساعة' : n === 2 ? 'منذ ساعتين' : n <= 10 ? `منذ ${n} ساعات` : `منذ ${n} ساعة`,
    appointmentsTitle: 'الحضور: مواعيد اليوم',
    appointmentsCount: (n: number) => `${n} موعد في هذا اليوم`,
    attended: 'حضر',
    awaiting: 'بانتظار تأكيد الحضور',
    confirm: 'تأكيد الحضور',
    confirmFor: (name: string) => `تأكيد الحضور: ${name}`,
    attendanceSaved: 'حُفظ الحضور.',
    quickTitle: 'إجراءات سريعة',
    stagesTitle: 'توزيع الإحالات',
    stages: ['قيد المراجعة', 'بانتظار الحجز', 'محجوزة', 'مكتملة', 'منتهية'],
    activityTitle: 'آخر النشاط',
    now: 'الآن',
    otherTitle: 'هذه الشاشة ليست ضمن المثال',
    otherText: 'يعرض المثال الصفحة الرئيسية فقط. اختر «الرئيسية» من القائمة الجانبية للعودة.',
    back: 'العودة إلى الرئيسية',
  },
} as const;

interface PendingItem {
  number: string;
  patient: Bi;
  specialty: SpecialtyCode;
  service: ServiceCode;
  action: ActionCode;
  priority: Priority;
  /** Hours the case has been waiting. */
  hours: number;
}

/** Invented cases, in the order of the real list: priority first, then the longest wait. */
const PENDING: readonly PendingItem[] = [
  { number: '2026-000182', patient: { en: 'Abdullah Al-Dossari', ar: 'عبدالله الدوسري' }, specialty: 'NSURG', service: 'ADMISSION', action: 'ELIGIBILITY', priority: 'EMERGENCY', hours: 1 },
  { number: '2026-000174', patient: { en: 'Amal Al-Qarni', ar: 'أمل القرني' }, specialty: 'OPHTH', service: 'OUTPATIENT_CLINIC', action: 'BOOKING', priority: 'URGENT', hours: 5 },
  { number: '2026-000184', patient: { en: 'Fahad Al-Otaibi', ar: 'فهد العتيبي' }, specialty: 'CARD', service: 'OUTPATIENT_CLINIC', action: 'ELIGIBILITY', priority: 'URGENT', hours: 2 },
  { number: '2026-000169', patient: { en: 'Yousef Al-Malki', ar: 'يوسف المالكي' }, specialty: 'URO', service: 'SECOND_OPINION', action: 'ATTENDANCE', priority: 'NORMAL', hours: 26 },
  { number: '2026-000171', patient: { en: 'Salma Al-Juhani', ar: 'سلمى الجهني' }, specialty: 'IM', service: 'OUTPATIENT_CLINIC', action: 'ELIGIBILITY', priority: 'NORMAL', hours: 9 },
  { number: '2026-000176', patient: { en: 'Nasser Al-Shammari', ar: 'ناصر الشمري' }, specialty: 'CARD', service: 'OUTPATIENT_CLINIC', action: 'BOOKING', priority: 'NORMAL', hours: 6 },
];

interface Appointment {
  id: string;
  time: string;
  patient: Bi;
  department: Bi;
  attended: boolean;
}

const APPOINTMENTS: readonly Appointment[] = [
  { id: 'a1', time: '08:30', patient: { en: 'Khalid Al-Rashidi', ar: 'خالد الرشيدي' }, department: { en: 'Cardiology', ar: 'القلب' }, attended: true },
  { id: 'a2', time: '09:15', patient: { en: 'Mona Al-Balawi', ar: 'منى البلوي' }, department: { en: 'Orthopedics', ar: 'العظام' }, attended: true },
  { id: 'a3', time: '10:45', patient: { en: 'Ibrahim Al-Faifi', ar: 'إبراهيم الفيفي' }, department: { en: 'Internal Medicine', ar: 'الباطنة' }, attended: false },
  { id: 'a4', time: '12:00', patient: { en: 'Dalal Al-Mutlaq', ar: 'دلال المطلق' }, department: { en: 'Pediatrics', ar: 'الأطفال' }, attended: false },
];

interface Activity {
  id: string;
  heading: Bi;
  body: Bi;
  actor: Bi;
  time: Bi;
  tone: ModTimelineTone;
  icon: string;
  toneLabel?: Bi;
}

const ROLE_COORDINATOR: Bi = APP_USERS.coordinator.role;
const ROLE_HEAD: Bi = { en: 'Head of medical department', ar: 'رئيس القسم الطبي' };
const ROLE_DOCTOR: Bi = { en: 'Doctor', ar: 'الطبيب' };
const ROLE_SYSTEM: Bi = { en: 'System', ar: 'النظام' };

const ACTIVITY: readonly Activity[] = [
  {
    id: 'e1',
    heading: { en: 'Clinic appointment booked', ar: 'تم حجز موعد العيادة' },
    body: { en: 'Referral 2026-000166 · Cardiology · 17 Nov 2026, 10:30', ar: 'الإحالة 2026-000166 · أمراض القلب · 17 نوفمبر 2026، 10:30' },
    actor: ROLE_COORDINATOR,
    time: { en: 'Today, 09:40', ar: 'اليوم، 09:40' },
    tone: 'success',
    icon: 'calendar-03',
  },
  {
    id: 'e2',
    heading: { en: 'Referral accepted', ar: 'قبول الإحالة' },
    body: { en: 'Referral 2026-000174 · Ophthalmology', ar: 'الإحالة 2026-000174 · طب وجراحة العيون' },
    actor: ROLE_HEAD,
    time: { en: 'Today, 08:55', ar: 'اليوم، 08:55' },
    tone: 'success',
    icon: 'checkmark-circle-02',
  },
  {
    id: 'e3',
    heading: { en: 'Referral rejected', ar: 'رفض الإحالة' },
    body: { en: 'Referral 2026-000179 · Neurology', ar: 'الإحالة 2026-000179 · الأمراض العصبية' },
    actor: ROLE_HEAD,
    time: { en: 'Yesterday, 15:20', ar: 'أمس، 15:20' },
    tone: 'error',
    icon: 'cancel-circle',
    toneLabel: { en: 'Rejected', ar: 'مرفوضة' },
  },
  {
    id: 'e4',
    heading: { en: 'A new referral request was submitted.', ar: 'تم تقديم طلب إحالة جديد.' },
    body: { en: 'Referral 2026-000184 · Cardiology · Outpatient clinic', ar: 'الإحالة 2026-000184 · أمراض القلب · عيادة خارجية' },
    actor: ROLE_DOCTOR,
    time: { en: 'Yesterday, 13:05', ar: 'أمس، 13:05' },
    tone: 'default',
    icon: 'file-add',
  },
  {
    id: 'e5',
    heading: { en: 'Appointment reminder', ar: 'إشعار حلول الموعد' },
    body: { en: 'Referral 2026-000169 · Urology', ar: 'الإحالة 2026-000169 · المسالك البولية' },
    actor: ROLE_SYSTEM,
    time: { en: 'Yesterday, 08:00', ar: 'أمس، 08:00' },
    tone: 'info',
    icon: 'notification-03',
  },
];

const QUICK: readonly { id: AppNavId; icon: string }[] = [
  { id: 'referrals-new', icon: 'add-01' },
  { id: 'referrals', icon: 'left-to-right-list-bullet' },
  { id: 'appointments', icon: 'calendar-03' },
  { id: 'my-hospital', icon: 'hospital-01' },
];

const STAGE_COUNTS = [14, 9, 21, 96, 24];

/**
 * Dashboards 02: the working home of a hospital's medical coordinator in the
 * hospital referral portal (home + pending actions + attendance): greeting with
 * the user's hospital, summary tiles, the pending-actions queue in the real
 * order (priority, then the longest wait), today's appointments, quick
 * actions, the referrals by stage and the recent activity.
 *
 * Demo behaviour: "Take action" removes the case from the queue, shows the
 * saved message, lowers the counters (tile, header button, side bar badge)
 * and adds an entry to the activity; "Confirm attendance" marks an
 * appointment as attended; the filter narrows the queue by required action.
 */
@Component({
  selector: 'demo-dashboards-02',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppExampleShell,
    ModPageHeader,
    ModPageHeaderActions,
    ModStatCard,
    ModBarList,
    ModButton,
    ModIcon,
    ModTag,
    ModStatusTag,
    ModInlineAlert,
    ModTimeline,
    ModTimelineItem,
    ModEmptyState,
    ModEmptyStateActions,
  ],
  template: `
    <demo-app-example-shell
      [lang]="lang()"
      role="coordinator"
      [pending]="pending().length"
      [(activeId)]="page"
      (languageToggle)="languageToggle.emit()"
    >
      @if (page() === 'home') {
        <mod-page-header [heading]="greeting()" [description]="summary()">
          <button modPageHeaderActions mod-button size="medium" type="button" (click)="page.set('referrals-new')">
            <mod-icon name="add-01" /> {{ t().newReferral }}
          </button>
          @if (pending().length) {
            <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="page.set('pending-actions')">
              {{ t().pendingButton(pending().length) }}
            </button>
          }
        </mod-page-header>

        <div class="app-ex-stack">
          <div role="status" aria-live="polite">
            @if (saved(); as message) {
              <mod-inline-alert variant="success" colored dismissible [heading]="message" [closeLabel]="t().dismiss" (dismissed)="saved.set('')" />
            }
          </div>

          <section class="app-ex-kpis" [attr.aria-label]="t().tilesLabel">
            <mod-stat-card
              icon="inbox"
              [label]="t().tileWaiting"
              [value]="pending().length"
              [tone]="pending().length ? 'warning' : 'default'"
              [caption]="pending().length ? t().pendingLink : t().pendingNone"
            />
            <mod-stat-card icon="hourglass" [label]="t().tileRunning" [value]="38" [unit]="t().unitReferral" />
            <mod-stat-card icon="calendar-03" [label]="t().tileBooked" [value]="booked()" />
            <mod-stat-card icon="medical-file" [label]="t().tileTotal" [value]="164" [unit]="t().unitReferral" />
          </section>

          <div class="app-ex-cols app-ex-cols--main">
            <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="dash02-queue">
              <div class="app-ex-panel__head">
                <div>
                  <h2 class="app-ex-panel__title" id="dash02-queue">{{ t().queueTitle }}</h2>
                  <p class="app-ex-panel__meta">{{ t().queueCount(pending().length) }}</p>
                </div>
                @if (pending().length) {
                  <div class="app-ex-seg d2-filter" role="group" [attr.aria-label]="t().filterLabel">
                    @for (option of filters(); track option.value) {
                      <button type="button" [attr.aria-pressed]="filter() === option.value" (click)="filter.set(option.value)">
                        {{ option.label }} ({{ option.count }})
                      </button>
                    }
                  </div>
                }
              </div>
              <div class="app-ex-panel__body">
                @if (!pending().length) {
                  <mod-empty-state compact icon="inbox-check" [heading]="t().emptyTitle" [text]="t().emptyText" />
                } @else if (!queue().length) {
                  <mod-empty-state compact icon="filter" [heading]="t().filterEmpty">
                    <button modEmptyStateActions mod-button variant="secondary-outline" size="small" type="button" (click)="filter.set('all')">
                      {{ t().showAll }}
                    </button>
                  </mod-empty-state>
                } @else {
                  <ul class="d2-queue" role="list">
                    @for (item of queue(); track item.number) {
                      <li class="d2-case">
                        <div class="d2-case__main">
                          <p class="d2-case__top">
                            <strong class="d2-case__number">{{ item.number }}</strong>
                            <mod-tag size="xs" [variant]="item.priorityVariant">
                              <span class="app-ex-sr">{{ t().priority }}: </span>{{ item.priority }}
                            </mod-tag>
                          </p>
                          <p class="d2-case__patient">{{ item.patient }}</p>
                          <p class="d2-case__sub">{{ item.specialty }} · {{ item.service }}</p>
                        </div>
                        <div class="d2-case__state">
                          <mod-status-tag size="sm" variant="warning" [statusLabel]="t().requiredAction + ':'">{{ item.action }}</mod-status-tag>
                          <span class="d2-case__wait"><mod-icon name="clock-01" /> {{ t().waitingSince }}: {{ item.waiting }}</span>
                        </div>
                        <button
                          mod-button
                          size="small"
                          type="button"
                          class="d2-case__button"
                          [variant]="item.urgent ? 'primary' : 'secondary-outline'"
                          [attr.aria-label]="t().takeActionFor(item.number)"
                          (click)="take(item.number)"
                        >
                          {{ t().takeAction }}
                        </button>
                      </li>
                    }
                  </ul>
                }
              </div>
            </section>

            <div class="app-ex-stack">
              <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="dash02-today">
                <div class="app-ex-panel__head">
                  <div>
                    <h2 class="app-ex-panel__title" id="dash02-today">{{ t().appointmentsTitle }}</h2>
                    <p class="app-ex-panel__meta">{{ t().appointmentsCount(appointments().length) }}</p>
                  </div>
                </div>
                <div class="app-ex-panel__body">
                  <ul class="d2-queue" role="list">
                    @for (slot of appointments(); track slot.id) {
                      <li class="d2-slot">
                        <span class="d2-slot__time">{{ slot.time }}</span>
                        <div class="d2-slot__main">
                          <p class="d2-case__patient">{{ slot.patient }}</p>
                          <p class="d2-case__sub">{{ slot.department }}</p>
                        </div>
                        @if (slot.attended) {
                          <mod-status-tag size="sm" variant="success">{{ t().attended }}</mod-status-tag>
                        } @else {
                          <button
                            mod-button
                            variant="secondary-outline"
                            size="small"
                            type="button"
                            [attr.aria-label]="t().confirmFor(slot.patient)"
                            (click)="confirm(slot.id)"
                          >
                            {{ t().confirm }}
                          </button>
                        }
                      </li>
                    }
                  </ul>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="dash02-quick">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="dash02-quick">{{ t().quickTitle }}</h2>
                </div>
                <div class="app-ex-panel__body d2-quick">
                  @for (action of quick(); track action.id) {
                    <button mod-button variant="secondary-outline" size="medium" type="button" (click)="page.set(action.id)">
                      <mod-icon [name]="action.icon" /> {{ action.label }}
                    </button>
                  }
                </div>
              </section>
            </div>
          </div>

          <div class="app-ex-cols">
            <section class="app-ex-panel" aria-labelledby="dash02-stages">
              <div class="app-ex-panel__head">
                <h2 class="app-ex-panel__title" id="dash02-stages">{{ t().stagesTitle }}</h2>
              </div>
              <div class="app-ex-panel__body">
                <mod-bar-list [aria-label]="t().stagesTitle" [items]="stages()" [unit]="t().unitReferral" />
              </div>
            </section>

            <section class="app-ex-panel" aria-labelledby="dash02-activity">
              <div class="app-ex-panel__head">
                <h2 class="app-ex-panel__title" id="dash02-activity">{{ t().activityTitle }}</h2>
              </div>
              <div class="app-ex-panel__body">
                <mod-timeline [aria-label]="t().activityTitle">
                  @for (event of activity(); track event.id) {
                    <mod-timeline-item
                      [heading]="event.heading"
                      [time]="event.time"
                      [actor]="event.actor"
                      [tone]="event.tone"
                      [icon]="event.icon"
                      [toneLabel]="event.toneLabel"
                    >
                      {{ event.body }}
                    </mod-timeline-item>
                  }
                </mod-timeline>
              </div>
            </section>
          </div>
        </div>
      } @else {
        <mod-page-header [heading]="otherTitle()" />
        <mod-empty-state bordered icon="home-01" [level]="2" [heading]="t().otherTitle" [text]="t().otherText">
          <button modEmptyStateActions mod-button size="medium" type="button" (click)="page.set('home')">{{ t().back }}</button>
        </mod-empty-state>
      }
    </demo-app-example-shell>
  `,
  styles: `
    :host {
      display: block;
    }

    .d2-queue {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .d2-case,
    .d2-slot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md) var(--spacing-xl);
      padding: var(--spacing-xl) var(--spacing-2xl);
    }

    .d2-case + .d2-case,
    .d2-slot + .d2-slot {
      border-block-start: 1px solid var(--gray-200);
    }

    .d2-case__main,
    .d2-slot__main {
      flex: 1 1 180px;
      min-width: 0;
    }

    .d2-case p {
      margin: 0;
    }

    .d2-case__top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md);
    }

    .d2-case__number {
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      font-variant-numeric: tabular-nums;
      color: var(--gray-900);
    }

    .d2-case__patient {
      margin: 0;
      font-size: 14px;
      line-height: 22px;
      color: var(--gray-900);
    }

    .d2-case__sub {
      margin: 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-500);
    }

    .d2-case__state {
      flex: 1 1 200px;
      display: grid;
      justify-items: start;
      gap: var(--spacing-xs);
      min-width: 0;
    }

    .d2-case__wait {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
    }

    .d2-case__button {
      flex: none;
    }

    .d2-slot__time {
      flex: none;
      min-width: 48px;
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      font-variant-numeric: tabular-nums;
      color: var(--gray-900);
    }

    .d2-quick {
      display: grid;
      gap: var(--spacing-md);
    }

    .d2-quick button {
      justify-content: flex-start;
      width: 100%;
    }

    .d2-filter {
      flex-wrap: wrap;
    }

    @container mod-app-content (max-width: 479px) {
      .d2-case,
      .d2-slot {
        padding-inline: var(--spacing-xl);
      }
    }
  `,
})
export class Dashboards02Example {
  readonly lang = input<AppLang>('en');
  /** The language button of the shell was pressed. */
  readonly languageToggle = output<void>();

  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly page = signal<string>('home');
  protected readonly filter = signal<ActionCode | 'all'>('all');
  /** Text of the last saved action (shown in the status area). */
  protected readonly saved = signal('');

  /** The cases still waiting, and what was done in this session. */
  protected readonly pending = signal<readonly PendingItem[]>(PENDING);
  private readonly slots = signal<readonly Appointment[]>(APPOINTMENTS);
  private readonly events = signal<readonly Activity[]>(ACTIVITY);
  private readonly bookings = signal(21);
  private nextEvent = 0;

  protected readonly booked = computed(() => this.bookings());
  protected readonly otherTitle = computed(() => appNavLabel(this.page() as AppNavId, this.lang()));

  /** The greeting follows the browser's hour, as in the real system. */
  protected readonly greeting = computed(() => {
    const name = APP_USERS.coordinator.short[this.lang()];
    return new Date().getHours() < 12 ? this.t().morning(name) : this.t().evening(name);
  });

  protected readonly summary = computed(() => {
    const t = this.t();
    const parts = [HOSPITALS.RCH[this.lang()], t.running(38)];
    if (this.pending().length) parts.push(t.waiting(this.pending().length));
    return parts.join(' · ');
  });

  protected readonly filters = computed(() => {
    const lang = this.lang();
    const items = this.pending();
    return [
      { value: 'all' as const, label: this.t().all, count: items.length },
      ...ACTION_ORDER.map((action) => ({
        value: action,
        label: ACTIONS[action].label[lang],
        count: items.filter((item) => item.action === action).length,
      })).filter((option) => option.count > 0 || option.value === this.filter()),
    ];
  });

  protected readonly queue = computed(() => {
    const lang = this.lang();
    const t = this.t();
    const filter = this.filter();
    return this.pending()
      .filter((item) => filter === 'all' || item.action === filter)
      .slice()
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.hours - a.hours)
      .map((item) => ({
        number: item.number,
        patient: item.patient[lang],
        specialty: SPECIALTIES[item.specialty][lang],
        service: SERVICES[item.service][lang],
        action: ACTIONS[item.action].label[lang],
        priority: PRIORITY[item.priority][lang],
        priorityVariant: PRIORITY[item.priority].variant,
        urgent: item.priority !== 'NORMAL',
        waiting: t.hoursAgo(item.hours),
      }));
  });

  protected readonly appointments = computed(() => {
    const lang = this.lang();
    return this.slots().map((slot) => ({
      id: slot.id,
      time: slot.time,
      patient: slot.patient[lang],
      department: slot.department[lang],
      attended: slot.attended,
    }));
  });

  protected readonly quick = computed(() =>
    QUICK.map((action) => ({ ...action, label: appNavLabel(action.id, this.lang()) })),
  );

  protected readonly stages = computed<ModBarListItem[]>(() => {
    const labels: readonly string[] = this.t().stages;
    return labels.map((label, index) => ({
      id: String(index),
      label,
      value: STAGE_COUNTS[index],
      tone: index === 1 ? 'warning' : index === 4 ? 'neutral' : 'default',
    }));
  });

  protected readonly activity = computed(() => {
    const lang = this.lang();
    return this.events().map((event) => ({
      id: event.id,
      heading: event.heading[lang],
      body: event.body[lang],
      actor: event.actor[lang],
      time: event.time[lang],
      tone: event.tone,
      icon: event.icon,
      toneLabel: event.toneLabel?.[lang] ?? '',
    }));
  });

  /** Stand-in for the action form of the real system: the case leaves the queue and the result is reported. */
  protected take(number: string): void {
    const item = this.pending().find((entry) => entry.number === number);
    if (!item) return;
    const lang = this.lang();
    const action = ACTIONS[item.action];
    this.pending.set(this.pending().filter((entry) => entry !== item));
    if (item.action === 'BOOKING') this.bookings.update((count) => count + 1);
    this.saved.set(`${action.done[lang]} ${item.number}.`);
    this.log({
      heading: action.event,
      body: {
        en: `Referral ${item.number} · ${SPECIALTIES[item.specialty].en}`,
        ar: `الإحالة ${item.number} · ${SPECIALTIES[item.specialty].ar}`,
      },
      icon: action.icon,
    });
  }

  protected confirm(id: string): void {
    const slot = this.slots().find((entry) => entry.id === id);
    if (!slot || slot.attended) return;
    this.slots.set(this.slots().map((entry) => (entry === slot ? { ...entry, attended: true } : entry)));
    this.saved.set(this.t().attendanceSaved);
    this.log({
      heading: ACTIONS.ATTENDANCE.event,
      body: { en: `${slot.patient.en} · ${slot.department.en} · ${slot.time}`, ar: `${slot.patient.ar} · ${slot.department.ar} · ${slot.time}` },
      icon: ACTIONS.ATTENDANCE.icon,
    });
  }

  private log(entry: Pick<Activity, 'heading' | 'body' | 'icon'>): void {
    const event: Activity = {
      ...entry,
      id: `new-${this.nextEvent++}`,
      actor: ROLE_COORDINATOR,
      time: { en: TEXT.en.now, ar: TEXT.ar.now },
      tone: 'success',
    };
    this.events.set([event, ...this.events()].slice(0, 6));
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const DASHBOARDS_02_CODE = `import { Component, computed, signal } from '@angular/core';
import {
  ModAppShell, ModAppShellActions, ModAppShellGroup, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle,
  ModAvatar, ModBarList, ModButton, ModEmptyState, ModIcon, ModInlineAlert, ModPageHeader, ModPageHeaderActions,
  ModStatCard, ModStatusTag, ModTag, ModTimeline, ModTimelineItem,
} from '@mod-internal/ui';

interface PendingCase {
  number: string;
  patient: string;
  detail: string; // specialty · required service
  action: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  waiting: string;
}

interface ActivityEntry {
  heading: string;
  body: string;
  actor: string;
  time: string;
  tone: 'default' | 'success' | 'error' | 'info';
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [
    ModAppShell, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle, ModAppShellActions,
    ModPageHeader, ModPageHeaderActions, ModStatCard, ModBarList, ModButton, ModIcon, ModTag, ModStatusTag,
    ModInlineAlert, ModTimeline, ModTimelineItem, ModEmptyState, ModAvatar,
  ],
  template: \`
    <mod-app-shell [groups]="menu()" [(activeId)]="page" (itemSelect)="open($event.id)">
      <img modAppShellLogo src="assets/img/emblem-placeholder.svg" width="40" height="41" alt="Organization logo" />
      <img modAppShellLogoMark src="assets/img/emblem-placeholder.svg" width="36" height="37" alt="Organization logo" />
      <span modAppShellTitle>Medical Referral and Patient Transfer Management System</span>
      <button modAppShellActions mod-button variant="subtle" size="medium" type="button" aria-label="Switch to Arabic">
        <mod-icon name="language-square" /> العربية
      </button>
      <mod-avatar modAppShellActions size="32" initials="NQ" label="Noura Al-Qahtani" />

      <mod-page-header
        heading="Good morning, Noura"
        [description]="'Riyadh Central Hospital · 38 running referrals · ' + pending().length + ' waiting for your decision'"
      >
        <button modPageHeaderActions mod-button size="medium" type="button" (click)="open('referrals-new')">
          <mod-icon name="add-01" /> New referral request
        </button>
        <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="open('pending-actions')">
          Pending actions ({{ pending().length }})
        </button>
      </mod-page-header>

      <div class="stack">
        <div role="status" aria-live="polite">
          @if (saved(); as message) {
            <mod-inline-alert variant="success" colored dismissible [heading]="message" (dismissed)="saved.set('')" />
          }
        </div>

        <section class="kpis" aria-label="Summary">
          <mod-stat-card
            label="Pending actions" icon="inbox" [value]="pending().length"
            [tone]="pending().length ? 'warning' : 'default'"
            [caption]="pending().length ? 'Open the pending actions' : 'Nothing is waiting for you'"
          />
          <mod-stat-card label="Running referrals" icon="hourglass" [value]="38" unit="referrals" />
          <mod-stat-card label="Confirmed bookings" icon="calendar-03" [value]="21" />
          <mod-stat-card label="Visible referrals in total" icon="medical-file" [value]="164" unit="referrals" />
        </section>

        <div class="cols">
          <section class="panel" aria-labelledby="queue-title">
            <h2 id="queue-title">Pending actions</h2>
            <p class="meta">{{ pending().length }} cases waiting for an action of your role</p>
            @if (pending().length) {
              <ul class="queue" role="list">
                @for (item of pending(); track item.number) {
                  <li>
                    <div class="grow">
                      <p>
                        <strong>{{ item.number }}</strong>
                        <mod-tag size="xs" [variant]="item.priority === 'Emergency' ? 'error' : item.priority === 'Urgent' ? 'warning' : 'neutral'">
                          {{ item.priority }}
                        </mod-tag>
                      </p>
                      <p>{{ item.patient }}</p>
                      <p class="meta">{{ item.detail }}</p>
                    </div>
                    <div class="grow">
                      <mod-status-tag size="sm" variant="warning" statusLabel="Required action:">{{ item.action }}</mod-status-tag>
                      <p class="meta"><mod-icon name="clock-01" /> Waiting since: {{ item.waiting }}</p>
                    </div>
                    <button
                      mod-button
                      size="small"
                      type="button"
                      [variant]="item.priority === 'Normal' ? 'secondary-outline' : 'primary'"
                      [attr.aria-label]="'Take action: referral ' + item.number"
                      (click)="take(item)"
                    >
                      Take action
                    </button>
                  </li>
                }
              </ul>
            } @else {
              <mod-empty-state
                compact
                icon="inbox-check"
                heading="No pending actions"
                text="No case is waiting for an action of your role now."
              />
            }
          </section>

          <div class="stack">
            <section class="panel" aria-labelledby="stages-title">
              <h2 id="stages-title">Referrals by stage</h2>
              <mod-bar-list aria-label="Referrals by stage" [items]="stages" unit="referrals" />
            </section>

            <section class="panel" aria-labelledby="activity-title">
              <h2 id="activity-title">Recent activity</h2>
              <mod-timeline aria-label="Recent activity">
                @for (event of activity(); track $index) {
                  <mod-timeline-item [heading]="event.heading" [time]="event.time" [actor]="event.actor" [tone]="event.tone" [icon]="event.icon">
                    {{ event.body }}
                  </mod-timeline-item>
                }
              </mod-timeline>
            </section>
          </div>
        </div>
      </div>
    </mod-app-shell>
  \`,
  styles: \`
    /* The widths are those of the shell's main area (container "mod-app-content"), not of the window. */
    .stack { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-3xl); }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-xl); }
    .cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--spacing-3xl); align-items: start; }
    .panel {
      min-width: 0; padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--alpha-white);
    }
    .panel h2 { margin: 0 0 var(--spacing-xs); font-size: 16px; line-height: 24px; font-weight: var(--font-weight-semibold); color: var(--gray-900); }
    .panel h2 + :not(.meta) { margin-block-start: var(--spacing-xl); }
    .meta { margin: 0; font-size: 13px; line-height: 20px; color: var(--gray-500); }
    .queue { margin: var(--spacing-lg) 0 0; padding: 0; list-style: none; }
    .queue li {
      display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-md) var(--spacing-xl);
      padding-block: var(--spacing-xl); border-block-start: 1px solid var(--gray-200);
    }
    .queue p { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-md); margin: 0; }
    .grow { flex: 1 1 180px; min-width: 0; }
    @container mod-app-content (max-width: 859px) {
      .cols { grid-template-columns: minmax(0, 1fr); }
    }
  \`,
})
export class Home {
  protected readonly page = signal('home');
  protected readonly saved = signal('');

  /** Replace with the pending-actions request; the Api returns the cases by priority, then the longest wait. */
  protected readonly pending = signal<PendingCase[]>([
    { number: '2026-000182', patient: 'Abdullah Al-Dossari', detail: 'Neurosurgery · Admission', action: 'Check treatment eligibility', priority: 'Emergency', waiting: '1 hour ago' },
    { number: '2026-000174', patient: 'Amal Al-Qarni', detail: 'Ophthalmology · Outpatient clinic', action: 'Book the clinic appointment', priority: 'Urgent', waiting: '5 hours ago' },
    { number: '2026-000184', patient: 'Fahad Al-Otaibi', detail: 'Cardiology · Outpatient clinic', action: 'Check treatment eligibility', priority: 'Urgent', waiting: '2 hours ago' },
    { number: '2026-000169', patient: 'Yousef Al-Malki', detail: 'Urology · Second opinion', action: 'Confirm the patient attendance', priority: 'Normal', waiting: '26 hours ago' },
  ]);

  protected readonly activity = signal<ActivityEntry[]>([
    { heading: 'Clinic appointment booked', body: 'Referral 2026-000166 · Cardiology', actor: 'Medical coordinator', time: 'Today, 09:40', tone: 'success', icon: 'calendar-03' },
    { heading: 'Referral accepted', body: 'Referral 2026-000174 · Ophthalmology', actor: 'Head of medical department', time: 'Today, 08:55', tone: 'success', icon: 'checkmark-circle-02' },
    { heading: 'Referral rejected', body: 'Referral 2026-000179 · Neurology', actor: 'Head of medical department', time: 'Yesterday, 15:20', tone: 'error', icon: 'cancel-circle' },
  ]);

  protected readonly stages = [
    { label: 'In review', value: 14 },
    { label: 'Waiting for booking', value: 9 },
    { label: 'Booked', value: 21 },
    { label: 'Completed', value: 96 },
    { label: 'Ended', value: 24 },
  ];

  /** The menu of a hospital's medical coordinator; the badge is the pending-actions count. */
  protected readonly menu = computed<ModAppShellGroup[]>(() => [
    {
      label: 'Work',
      items: [
        { id: 'home', label: 'Home', icon: 'home-01' },
        {
          id: 'pending-actions',
          label: 'Pending actions',
          icon: 'inbox',
          badge: this.pending().length || undefined,
          badgeLabel: this.pending().length + ' waiting for you',
        },
        { id: 'referrals', label: 'Referrals', icon: 'left-to-right-list-bullet' },
        { id: 'appointments', label: 'Attendance', icon: 'calendar-03' },
      ],
    },
    { label: 'Setup', items: [{ id: 'my-hospital', label: 'My hospital', icon: 'hospital-01' }] },
  ]);

  /** Replace with the action form of the case; here the case leaves the queue and the result is reported. */
  protected take(item: PendingCase): void {
    this.pending.update((items) => items.filter((entry) => entry !== item));
    this.saved.set('Saved: ' + item.action.toLowerCase() + ' for referral ' + item.number + '.');
    this.activity.update((entries) => [
      { heading: item.action, body: 'Referral ' + item.number, actor: 'Medical coordinator', time: 'Just now', tone: 'success', icon: 'checkmark-circle-02' },
      ...entries,
    ]);
  }

  protected open(id: string): void {
    this.page.set(id);
    // this.router.navigate(['/', id]);
  }
}
`;
