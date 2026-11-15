import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import {
  ModBarList,
  ModBarListItem,
  ModButton,
  ModColumnChart,
  ModEmptyState,
  ModEmptyStateActions,
  ModIcon,
  ModPageHeader,
  ModPageHeaderActions,
  ModStatCard,
  ModStatCardTrend,
  ModStatCardTrendTone,
  ModStatusTag,
  ModTable,
  ModTableCell,
  ModTableColumn,
  ModTableSort,
  ModTag,
} from '@mod-internal/ui';
import {
  AppLang,
  HOSPITALS,
  HospitalCode,
  PRIORITY,
  Priority,
  REFERRAL_STATUS,
  ReferralStatus,
  SPECIALTIES,
  SpecialtyCode,
  appNavLabel,
  AppNavId,
} from '../../shared/app-example/app-example-data';
import { AppExampleShell } from '../../shared/app-example/app-example-shell';

type Period = 30 | 90 | 180;
const PERIODS: readonly Period[] = [30, 90, 180];

const TEXT = {
  en: {
    title: 'Dashboard',
    allHospitals: 'All hospitals',
    period: 'Period',
    periods: { 30: 'Last 30 days', 90: 'Last 3 months', 180: 'Last 6 months' },
    export: 'Export',
    exported: 'The report file is being prepared.',
    kpiLabel: 'Performance indicators of transfer operations',
    total: 'Total referrals',
    acceptance: 'Acceptance rate',
    attendance: 'Attendance rate',
    running: 'Running now',
    runningNote: 'Not completed yet',
    response: 'Average response time',
    daysToBooking: 'Average days to booking',
    within: (n: string) => `Answered within 48 hours: ${n}`,
    unitReferral: 'referrals',
    unitHour: 'hours',
    unitDay: 'days',
    higher: (amount: string) => `${amount} higher than the previous period`,
    lower: (amount: string) => `${amount} lower than the previous period`,
    same: 'No change from the previous period',
    points: (n: string) => `${n} points`,
    hours: (n: string) => `${n} hours`,
    days: (n: string) => `${n} days`,
    up: 'Increase',
    down: 'Decrease',
    flat: 'No change',
    loading: 'Loading',
    updated: 'The figures were updated.',
    monthly: 'Monthly referrals',
    monthlyMeta: 'Last 6 months',
    monthlyLabel: 'Monthly referrals, received and accepted, last 6 months',
    received: 'Received',
    accepted: 'Accepted',
    legend: 'Legend',
    month: 'Month',
    months: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    outcomes: 'Referral outcomes',
    outcomesMeta: (n: string) => `${n} referrals in the period`,
    outcomeAccepted: 'Accepted',
    outcomeRejected: 'Rejected',
    outcomeNotEligible: 'Not eligible',
    outcomeRunning: 'Running now',
    hospitals: 'Top referring hospitals',
    hospitalsMeta: 'Outgoing referrals by sending hospital',
    specialties: 'Most requested specialties',
    specialtiesMeta: 'Referrals by main specialty',
    latest: 'Latest referrals',
    all: 'All referrals',
    number: 'Number',
    patient: 'Patient',
    specialty: 'Specialty',
    origin: 'Referring hospital',
    priority: 'Priority',
    status: 'Status',
    created: 'Created',
    noData: 'No data',
    otherTitle: 'This screen is not part of the example',
    otherText: 'The example shows the dashboard only. The side bar still works: choose Dashboard to go back.',
    back: 'Back to the dashboard',
  },
  ar: {
    title: 'لوحة المؤشرات',
    allHospitals: 'كل المستشفيات',
    period: 'الفترة',
    periods: { 30: 'آخر 30 يومًا', 90: 'آخر 3 أشهر', 180: 'آخر 6 أشهر' },
    export: 'تصدير',
    exported: 'جارٍ تجهيز ملف التقرير.',
    kpiLabel: 'متابعة مؤشرات الأداء لعمليات التحويل',
    total: 'إجمالي الإحالات',
    acceptance: 'نسبة القبول',
    attendance: 'نسبة الحضور',
    running: 'جارية الآن',
    runningNote: 'لم تكتمل بعد',
    response: 'متوسط زمن الاستجابة',
    daysToBooking: 'متوسط الأيام حتى الحجز',
    within: (n: string) => `الرد خلال 48 ساعة: ${n}`,
    unitReferral: 'إحالة',
    unitHour: 'ساعة',
    unitDay: 'يوم',
    higher: (amount: string) => `أعلى ${amount} من الفترة السابقة`,
    lower: (amount: string) => `أقل ${amount} من الفترة السابقة`,
    same: 'دون تغيير عن الفترة السابقة',
    points: (n: string) => `${n} نقطة`,
    hours: (n: string) => `${n} ساعة`,
    days: (n: string) => `${n} يوم`,
    up: 'ارتفاع',
    down: 'انخفاض',
    flat: 'دون تغيير',
    loading: 'جارٍ التحميل',
    updated: 'تم تحديث الأرقام.',
    monthly: 'الإحالات الشهرية',
    monthlyMeta: 'آخر 6 أشهر',
    monthlyLabel: 'الإحالات الشهرية، الواردة والمقبولة، آخر 6 أشهر',
    received: 'واردة',
    accepted: 'مقبولة',
    legend: 'مفتاح الرسم',
    month: 'الشهر',
    months: ['يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر'],
    outcomes: 'نتيجة الإحالات',
    outcomesMeta: (n: string) => `${n} إحالة في الفترة`,
    outcomeAccepted: 'مقبولة',
    outcomeRejected: 'مرفوضة',
    outcomeNotEligible: 'غير مستحق',
    outcomeRunning: 'جارية الآن',
    hospitals: 'أكثر المستشفيات إحالةً',
    hospitalsMeta: 'الإحالات الصادرة حسب المستشفى المحيل',
    specialties: 'أكثر التخصصات طلبًا',
    specialtiesMeta: 'الإحالات حسب التخصص الرئيسي',
    latest: 'آخر الإحالات',
    all: 'كل الإحالات',
    number: 'الرقم',
    patient: 'المريض',
    specialty: 'التخصص',
    origin: 'المستشفى المُحيل',
    priority: 'الأولوية',
    status: 'الحالة',
    created: 'تاريخ الإنشاء',
    noData: 'لا توجد بيانات',
    otherTitle: 'هذه الشاشة ليست ضمن المثال',
    otherText: 'يعرض المثال لوحة المؤشرات فقط. القائمة الجانبية تعمل: اختر «لوحة المؤشرات» للعودة.',
    back: 'العودة إلى لوحة المؤشرات',
  },
} as const;

type Texts = (typeof TEXT)[AppLang];

/** A KPI with its change against the previous period (`delta` in the KPI's own unit; null = no previous period). */
interface Kpi {
  value: number;
  delta: number | null;
}

interface PeriodData {
  total: Kpi;
  acceptance: Kpi;
  attendance: Kpi;
  running: number;
  response: Kpi;
  within48: number;
  daysToBooking: Kpi;
  outcomes: { accepted: number; rejected: number; notEligible: number; running: number };
  hospitals: readonly (readonly [HospitalCode, number])[];
  specialties: readonly (readonly [SpecialtyCode, number])[];
}

/** Sample figures per period (the numbers add up: outcomes sum to the total, months sum to the periods). */
const DATA: Record<Period, PeriodData> = {
  30: {
    total: { value: 226, delta: -22 },
    acceptance: { value: 76.3, delta: -1.4 },
    attendance: { value: 91.2, delta: 0.9 },
    running: 47,
    response: { value: 18.6, delta: -2.3 },
    within48: 91,
    daysToBooking: { value: 3.4, delta: -0.5 },
    outcomes: { accepted: 129, rejected: 40, notEligible: 10, running: 47 },
    hospitals: [['KGH', 39], ['WGH', 31], ['TGH', 30], ['JH', 24], ['AGH', 21]],
    specialties: [['CARD', 47], ['ORTHO', 36], ['ONC', 29], ['NSURG', 26], ['NEURO', 20]],
  },
  90: {
    total: { value: 705, delta: 122 },
    acceptance: { value: 77.9, delta: 0 },
    attendance: { value: 90.5, delta: 1.6 },
    running: 58,
    response: { value: 20.1, delta: -2.6 },
    within48: 88,
    daysToBooking: { value: 3.8, delta: -0.7 },
    outcomes: { accepted: 482, rejected: 137, notEligible: 28, running: 58 },
    hospitals: [['KGH', 118], ['WGH', 101], ['TGH', 92], ['JH', 77], ['AGH', 63]],
    specialties: [['CARD', 149], ['ORTHO', 108], ['ONC', 96], ['NSURG', 75], ['NEURO', 66]],
  },
  180: {
    total: { value: 1288, delta: null },
    acceptance: { value: 78.4, delta: null },
    attendance: { value: 89.7, delta: null },
    running: 64,
    response: { value: 21.3, delta: null },
    within48: 86,
    daysToBooking: { value: 4.1, delta: null },
    outcomes: { accepted: 912, rejected: 251, notEligible: 61, running: 64 },
    hospitals: [['KGH', 214], ['WGH', 187], ['TGH', 163], ['JH', 141], ['AGH', 118]],
    specialties: [['CARD', 268], ['ORTHO', 201], ['ONC', 173], ['NSURG', 142], ['NEURO', 117]],
  },
};

const MONTHLY_RECEIVED = [182, 204, 197, 231, 248, 226];
const MONTHLY_ACCEPTED = [133, 152, 145, 167, 186, 129];

interface Referral {
  number: string;
  patient: { en: string; ar: string };
  specialty: SpecialtyCode;
  origin: HospitalCode;
  priority: Priority;
  status: ReferralStatus;
  created: string;
}

/** Invented patients; hospitals, specialties and statuses are those of the real system. */
const REFERRALS: readonly Referral[] = [
  { number: '2026-000184', patient: { en: 'Fahad Al-Otaibi', ar: 'فهد العتيبي' }, specialty: 'CARD', origin: 'KGH', priority: 'URGENT', status: 'MEDICAL_REVIEW', created: '2026-11-12' },
  { number: '2026-000183', patient: { en: 'Maha Al-Shehri', ar: 'مها الشهري' }, specialty: 'ONC', origin: 'TGH', priority: 'NORMAL', status: 'IN_RECEIVING_REVIEW', created: '2026-11-12' },
  { number: '2026-000182', patient: { en: 'Abdullah Al-Dossari', ar: 'عبدالله الدوسري' }, specialty: 'NSURG', origin: 'WGH', priority: 'EMERGENCY', status: 'ACCEPTED', created: '2026-11-11' },
  { number: '2026-000181', patient: { en: 'Reem Al-Ghamdi', ar: 'ريم الغامدي' }, specialty: 'ORTHO', origin: 'JH', priority: 'NORMAL', status: 'BOOKED', created: '2026-11-11' },
  { number: '2026-000180', patient: { en: 'Sultan Al-Zahrani', ar: 'سلطان الزهراني' }, specialty: 'CARD', origin: 'AGH', priority: 'NORMAL', status: 'ELIGIBILITY_REVIEW', created: '2026-11-10' },
  { number: '2026-000179', patient: { en: 'Huda Al-Anazi', ar: 'هدى العنزي' }, specialty: 'NEURO', origin: 'KGH', priority: 'URGENT', status: 'REJECTED', created: '2026-11-10' },
  { number: '2026-000178', patient: { en: 'Turki Al-Subaie', ar: 'تركي السبيعي' }, specialty: 'ORTHO', origin: 'WGH', priority: 'NORMAL', status: 'BOOKED', created: '2026-11-09' },
  { number: '2026-000177', patient: { en: 'Lama Al-Harthi', ar: 'لمى الحارثي' }, specialty: 'ONC', origin: 'TGH', priority: 'NORMAL', status: 'SUBMITTED', created: '2026-11-09' },
];

/** A table row: the referral with its texts in the current language. */
interface ReferralRow {
  number: string;
  patient: string;
  specialty: string;
  origin: string;
  priority: Priority;
  priorityLabel: string;
  status: ReferralStatus;
  statusLabel: string;
  created: string;
  createdLabel: string;
}

interface KpiTile {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: string;
  caption: string;
  trend: ModStatCardTrend | '';
  trendTone: ModStatCardTrendTone;
  trendText: string;
}

function count(value: number): string {
  return value.toLocaleString('en-US');
}

function decimal(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Trend of a KPI against the previous period. `betterWhen` says which
 * direction is the good one (a shorter response time is good).
 */
function trendOf(
  t: Texts,
  kpi: Kpi,
  amount: (magnitude: string) => string,
  betterWhen: 'up' | 'down' | 'none',
  format: (value: number) => string,
): Pick<KpiTile, 'trend' | 'trendTone' | 'trendText'> {
  if (kpi.delta === null) return { trend: '', trendTone: 'neutral', trendText: '' };
  if (kpi.delta === 0) return { trend: 'flat', trendTone: 'neutral', trendText: t.same };
  const direction = kpi.delta > 0 ? 'up' : 'down';
  const text = amount(format(Math.abs(kpi.delta)));
  return {
    trend: direction,
    trendTone: betterWhen === 'none' ? 'neutral' : betterWhen === direction ? 'positive' : 'negative',
    trendText: direction === 'up' ? t.higher(text) : t.lower(text),
  };
}

/**
 * Dashboards 01: the dashboard of the General Directorate of Medical Services
 * in a hospital referral portal (report-dashboard): the application shell, the
 * page header with the period filter, the KPI tiles with their change against
 * the previous period, the monthly referrals chart, the outcome and "top"
 * breakdowns and the latest referrals.
 *
 * Demo behaviour: the period filter reloads the figures (a short skeleton,
 * then the new numbers); the table sorts; the side bar selects, collapses and
 * becomes a drawer on narrow widths; "All referrals" selects the Referrals
 * item, which shows a placeholder.
 */
@Component({
  selector: 'demo-dashboards-01',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppExampleShell,
    ModPageHeader,
    ModPageHeaderActions,
    ModStatCard,
    ModColumnChart,
    ModBarList,
    ModTable,
    ModTableCell,
    ModStatusTag,
    ModTag,
    ModButton,
    ModIcon,
    ModEmptyState,
    ModEmptyStateActions,
  ],
  template: `
    <demo-app-example-shell [lang]="lang()" role="directorate" [(activeId)]="page" (languageToggle)="languageToggle.emit()">
      @if (page() === 'dashboard') {
        <mod-page-header [heading]="t().title" [description]="t().allHospitals + ' · ' + t().periods[period()]">
          <div modPageHeaderActions class="app-ex-toolbar">
            <span class="app-ex-toolbar__label" id="dash01-period">{{ t().period }}</span>
            <div class="app-ex-seg" role="group" aria-labelledby="dash01-period">
              @for (option of periods; track option) {
                <button type="button" [attr.aria-pressed]="period() === option" (click)="setPeriod(option)">
                  {{ t().periods[option] }}
                </button>
              }
            </div>
          </div>
        </mod-page-header>

        <!-- One announcement for the whole dashboard: the cards themselves are not live regions. -->
        <p class="app-ex-sr" role="status">{{ loading() ? t().loading : announced() ? t().updated : '' }}</p>

        <div class="app-ex-stack" [attr.aria-busy]="loading()">
          <section class="app-ex-kpis" [attr.aria-label]="t().kpiLabel">
            @for (kpi of kpis(); track kpi.id) {
              <mod-stat-card
                [label]="kpi.label"
                [value]="kpi.value"
                [unit]="kpi.unit"
                [icon]="kpi.icon"
                [caption]="kpi.caption"
                [trend]="kpi.trend"
                [trendTone]="kpi.trendTone"
                [trendText]="kpi.trendText"
                [upLabel]="t().up"
                [downLabel]="t().down"
                [flatLabel]="t().flat"
                [loadingLabel]="t().loading"
                [loading]="loading()"
              />
            }
          </section>

          <div class="app-ex-cols app-ex-cols--main">
            <section class="app-ex-panel" aria-labelledby="dash01-monthly">
              <div class="app-ex-panel__head">
                <h2 class="app-ex-panel__title" id="dash01-monthly">{{ t().monthly }}</h2>
                <p class="app-ex-panel__meta">{{ t().monthlyMeta }}</p>
              </div>
              <div class="app-ex-panel__body">
                <mod-column-chart
                  [aria-label]="t().monthlyLabel"
                  [categories]="t().months"
                  [series]="monthly()"
                  [unit]="t().unitReferral"
                  [legendLabel]="t().legend"
                  [categoryHeader]="t().month"
                  [height]="220"
                />
              </div>
            </section>

            <section class="app-ex-panel" aria-labelledby="dash01-outcomes">
              <div class="app-ex-panel__head">
                <h2 class="app-ex-panel__title" id="dash01-outcomes">{{ t().outcomes }}</h2>
                <p class="app-ex-panel__meta">{{ t().outcomesMeta(totalText()) }}</p>
              </div>
              <div class="app-ex-panel__body">
                <mod-bar-list [aria-label]="t().outcomes" [items]="outcomes()" [unit]="t().unitReferral" [emptyText]="t().noData" />
              </div>
            </section>
          </div>

          <div class="app-ex-cols">
            <section class="app-ex-panel" aria-labelledby="dash01-hospitals">
              <div class="app-ex-panel__head">
                <h2 class="app-ex-panel__title" id="dash01-hospitals">{{ t().hospitals }}</h2>
                <p class="app-ex-panel__meta">{{ t().hospitalsMeta }}</p>
              </div>
              <div class="app-ex-panel__body">
                <mod-bar-list ranked [aria-label]="t().hospitals" [items]="hospitals()" [unit]="t().unitReferral" [emptyText]="t().noData" />
              </div>
            </section>

            <section class="app-ex-panel" aria-labelledby="dash01-specialties">
              <div class="app-ex-panel__head">
                <h2 class="app-ex-panel__title" id="dash01-specialties">{{ t().specialties }}</h2>
                <p class="app-ex-panel__meta">{{ t().specialtiesMeta }}</p>
              </div>
              <div class="app-ex-panel__body">
                <mod-bar-list ranked [aria-label]="t().specialties" [items]="specialties()" [unit]="t().unitReferral" [emptyText]="t().noData" />
              </div>
            </section>
          </div>

          <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="dash01-latest">
            <div class="app-ex-panel__head">
              <h2 class="app-ex-panel__title" id="dash01-latest">{{ t().latest }}</h2>
              <button mod-button variant="subtle" size="small" type="button" (click)="page.set('referrals')">
                {{ t().all }} <mod-icon class="dash01-arrow" name="arrow-right-02" />
              </button>
            </div>
            <div class="app-ex-panel__body">
              <mod-table
                density="compact"
                [label]="t().latest"
                [columns]="columns()"
                [rows]="rows()"
                [rowKey]="rowKey"
                [(sort)]="sort"
                [emptyText]="t().noData"
              >
                <ng-template modTableCell="priority" let-row>
                  <mod-tag size="xs" [variant]="priorityVariant(row)">{{ row.priorityLabel }}</mod-tag>
                </ng-template>
                <ng-template modTableCell="status" let-row>
                  <mod-status-tag size="sm" [variant]="statusVariant(row)">{{ row.statusLabel }}</mod-status-tag>
                </ng-template>
              </mod-table>
            </div>
          </section>
        </div>
      } @else {
        <mod-page-header [heading]="otherTitle()" />
        <mod-empty-state bordered icon="dashboard-square-01" [level]="2" [heading]="t().otherTitle" [text]="t().otherText">
          <button modEmptyStateActions mod-button size="medium" type="button" (click)="page.set('dashboard')">
            {{ t().back }}
          </button>
        </mod-empty-state>
      }
    </demo-app-example-shell>
  `,
  styles: `
    :host {
      display: block;
    }

    /* The "go" arrow points to the reading direction. */
    :host-context([dir='rtl']) .dash01-arrow {
      transform: scaleX(-1);
    }
  `,
})
export class Dashboards01Example {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<AppLang>('en');
  /** The language button of the shell was pressed. */
  readonly languageToggle = output<void>();

  protected readonly t = computed(() => TEXT[this.lang()]);
  protected readonly periods = PERIODS;

  protected readonly page = signal<string>('dashboard');
  protected readonly period = signal<Period>(30);
  protected readonly loading = signal(false);
  /** A period was chosen at least once: the status region then reports the result. */
  protected readonly announced = signal(false);
  protected readonly sort = signal<ModTableSort | null>({ key: 'created', direction: 'desc' });

  private readonly data = computed(() => DATA[this.period()]);
  protected readonly totalText = computed(() => count(this.data().total.value));
  protected readonly otherTitle = computed(() => appNavLabel(this.page() as AppNavId, this.lang()));

  protected readonly kpis = computed<KpiTile[]>(() => {
    const t = this.t();
    const d = this.data();
    return [
      {
        id: 'total',
        label: t.total,
        value: count(d.total.value),
        unit: t.unitReferral,
        icon: 'medical-file',
        caption: '',
        ...trendOf(t, d.total, (n) => `${n} ${t.unitReferral}`, 'none', count),
      },
      {
        id: 'acceptance',
        label: t.acceptance,
        value: decimal(d.acceptance.value),
        unit: '%',
        icon: 'checkmark-circle-02',
        caption: '',
        ...trendOf(t, d.acceptance, t.points, 'up', decimal),
      },
      {
        id: 'attendance',
        label: t.attendance,
        value: decimal(d.attendance.value),
        unit: '%',
        icon: 'user-check-01',
        caption: '',
        ...trendOf(t, d.attendance, t.points, 'up', decimal),
      },
      {
        id: 'running',
        label: t.running,
        value: count(d.running),
        unit: t.unitReferral,
        icon: 'hourglass',
        caption: t.runningNote,
        trend: '',
        trendTone: 'neutral',
        trendText: '',
      },
      {
        id: 'response',
        label: t.response,
        value: decimal(d.response.value),
        unit: t.unitHour,
        icon: 'clock-01',
        caption: t.within(`${d.within48}%`),
        ...trendOf(t, d.response, t.hours, 'down', decimal),
      },
      {
        id: 'booking',
        label: t.daysToBooking,
        value: decimal(d.daysToBooking.value),
        unit: t.unitDay,
        icon: 'calendar-03',
        caption: '',
        ...trendOf(t, d.daysToBooking, t.days, 'down', decimal),
      },
    ];
  });

  protected readonly monthly = computed(() => [
    { name: this.t().received, values: MONTHLY_RECEIVED },
    { name: this.t().accepted, values: MONTHLY_ACCEPTED },
  ]);

  protected readonly outcomes = computed<ModBarListItem[]>(() => {
    const t = this.t();
    const o = this.data().outcomes;
    return [
      { id: 'accepted', label: t.outcomeAccepted, value: o.accepted },
      { id: 'rejected', label: t.outcomeRejected, value: o.rejected, tone: 'critical' },
      { id: 'notEligible', label: t.outcomeNotEligible, value: o.notEligible, tone: 'neutral' },
      { id: 'running', label: t.outcomeRunning, value: o.running, tone: 'warning' },
    ];
  });

  protected readonly hospitals = computed<ModBarListItem[]>(() =>
    this.data().hospitals.map(([code, value]) => ({ id: code, label: HOSPITALS[code][this.lang()], value })),
  );

  protected readonly specialties = computed<ModBarListItem[]>(() =>
    this.data().specialties.map(([code, value]) => ({ id: code, label: SPECIALTIES[code][this.lang()], value })),
  );

  protected readonly columns = computed<ModTableColumn<ReferralRow>[]>(() => {
    const t = this.t();
    return [
      { key: 'number', header: t.number, sortable: true },
      { key: 'patient', header: t.patient, sortable: true },
      { key: 'specialty', header: t.specialty, sortable: true },
      { key: 'origin', header: t.origin },
      { key: 'priority', header: t.priority },
      { key: 'status', header: t.status, sortable: true, value: (row) => row.statusLabel },
      {
        key: 'created',
        header: t.created,
        sortable: true,
        value: (row) => row.createdLabel,
        compare: (a, b) => a.created.localeCompare(b.created) || a.number.localeCompare(b.number),
      },
    ];
  });

  protected readonly rows = computed<ReferralRow[]>(() => {
    const lang = this.lang();
    const dates = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return REFERRALS.map((referral) => ({
      number: referral.number,
      patient: referral.patient[lang],
      specialty: SPECIALTIES[referral.specialty][lang],
      origin: HOSPITALS[referral.origin][lang],
      priority: referral.priority,
      priorityLabel: PRIORITY[referral.priority][lang],
      status: referral.status,
      statusLabel: REFERRAL_STATUS[referral.status][lang],
      created: referral.created,
      createdLabel: dates.format(new Date(`${referral.created}T00:00:00`)),
    }));
  });

  protected readonly rowKey = (row: ReferralRow): string => row.number;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected priorityVariant(row: ReferralRow): 'neutral' | 'warning' | 'error' {
    return PRIORITY[row.priority].variant;
  }

  protected statusVariant(row: ReferralRow): 'neutral' | 'info' | 'success' | 'warning' | 'error' {
    return REFERRAL_STATUS[row.status].variant;
  }

  /** Stand-in for the dashboard request: a short loading state, then the new figures. */
  protected setPeriod(period: Period): void {
    if (period === this.period()) return;
    this.period.set(period);
    this.announced.set(true);
    this.loading.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.loading.set(false), 450);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const DASHBOARDS_01_CODE = `import { Component, computed, signal } from '@angular/core';
import {
  ModAppShell, ModAppShellActions, ModAppShellGroup, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle,
  ModAvatar, ModBarList, ModBarListItem, ModButton, ModColumnChart, ModIcon, ModPageHeader, ModPageHeaderActions,
  ModStatCard, ModStatusTag, ModTable, ModTableCell, ModTableColumn, ModTableSort, ModTag,
} from '@mod-internal/ui';

type Period = 30 | 90 | 180;

interface Referral {
  number: string;
  patient: string;
  specialty: string;
  origin: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  status: string;
  statusVariant: 'neutral' | 'info' | 'success' | 'warning' | 'error';
  created: string; // ISO date
}

@Component({
  selector: 'app-dashboard',
  imports: [
    ModAppShell, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle, ModAppShellActions,
    ModPageHeader, ModPageHeaderActions, ModStatCard, ModColumnChart, ModBarList,
    ModTable, ModTableCell, ModStatusTag, ModTag, ModButton, ModIcon, ModAvatar,
  ],
  template: \`
    <mod-app-shell [groups]="menu" [(activeId)]="page" [(collapsed)]="collapsed" (itemSelect)="open($event.id)">
      <img modAppShellLogo src="assets/img/emblem-placeholder.svg" width="40" height="41" alt="Organization logo" />
      <img modAppShellLogoMark src="assets/img/emblem-placeholder.svg" width="36" height="37" alt="Organization logo" />

      <span modAppShellTitle>Medical Referral and Patient Transfer Management System</span>

      <button modAppShellActions mod-button variant="subtle" size="medium" type="button" aria-label="Switch to Arabic">
        <mod-icon name="language-square" /> العربية
      </button>
      <button modAppShellActions mod-button variant="subtle" size="medium" iconOnly type="button" aria-label="Notifications, 3 unread">
        <mod-icon name="notification-03" />
      </button>
      <mod-avatar modAppShellActions size="32" initials="KH" label="Dr. Khalid Al-Harbi" />

      <mod-page-header heading="Dashboard" [description]="'All hospitals · ' + periodLabels[period()]">
        <div modPageHeaderActions class="period" role="group" aria-label="Period">
          @for (option of periods; track option) {
            <button
              mod-button
              size="small"
              type="button"
              [variant]="period() === option ? 'primary' : 'secondary-outline'"
              [attr.aria-pressed]="period() === option"
              (click)="period.set(option)"
            >
              {{ periodLabels[option] }}
            </button>
          }
        </div>
      </mod-page-header>

      <div class="stack">
        <section class="kpis" aria-label="Performance indicators of transfer operations">
          <mod-stat-card
            label="Total referrals" [value]="data().total" unit="referrals" icon="medical-file"
            trend="down" trendText="22 referrals lower than the previous period"
          />
          <mod-stat-card
            label="Acceptance rate" [value]="data().acceptance" unit="%" icon="checkmark-circle-02"
            trend="down" trendTone="negative" trendText="1.4 points lower than the previous period"
          />
          <mod-stat-card
            label="Attendance rate" [value]="data().attendance" unit="%" icon="user-check-01"
            trend="up" trendTone="positive" trendText="0.9 points higher than the previous period"
          />
          <mod-stat-card label="Running now" [value]="data().running" unit="referrals" icon="hourglass" caption="Not completed yet" />
          <mod-stat-card
            label="Average response time" [value]="data().response" unit="hours" icon="clock-01"
            trend="down" trendTone="positive" trendText="2.3 hours lower than the previous period"
            caption="Answered within 48 hours: 91%"
          />
        </section>

        <div class="cols cols--main">
          <section class="panel" aria-labelledby="monthly-title">
            <h2 id="monthly-title">Monthly referrals</h2>
            <mod-column-chart
              aria-label="Monthly referrals, received and accepted, last 6 months"
              [categories]="['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']"
              [series]="monthly"
              unit="referrals"
              categoryHeader="Month"
              [height]="220"
            />
          </section>

          <section class="panel" aria-labelledby="outcomes-title">
            <h2 id="outcomes-title">Referral outcomes</h2>
            <mod-bar-list aria-label="Referral outcomes" [items]="data().outcomes" unit="referrals" />
          </section>
        </div>

        <div class="cols">
          <section class="panel" aria-labelledby="hospitals-title">
            <h2 id="hospitals-title">Top referring hospitals</h2>
            <mod-bar-list ranked aria-label="Top referring hospitals" [items]="data().hospitals" unit="referrals" />
          </section>
          <section class="panel" aria-labelledby="specialties-title">
            <h2 id="specialties-title">Most requested specialties</h2>
            <mod-bar-list ranked aria-label="Most requested specialties" [items]="data().specialties" unit="referrals" />
          </section>
        </div>

        <section class="panel panel--flush" aria-labelledby="latest-title">
          <div class="panel__head">
            <h2 id="latest-title">Latest referrals</h2>
            <button mod-button variant="subtle" size="small" type="button" (click)="open('referrals')">
              All referrals <mod-icon name="arrow-right-02" />
            </button>
          </div>
          <mod-table density="compact" label="Latest referrals" [columns]="columns" [rows]="referrals" [(sort)]="sort">
            <ng-template modTableCell="priority" let-row>
              <mod-tag size="xs" [variant]="row.priority === 'Emergency' ? 'error' : row.priority === 'Urgent' ? 'warning' : 'neutral'">
                {{ row.priority }}
              </mod-tag>
            </ng-template>
            <ng-template modTableCell="status" let-row>
              <mod-status-tag size="sm" [variant]="row.statusVariant">{{ row.status }}</mod-status-tag>
            </ng-template>
          </mod-table>
        </section>
      </div>
    </mod-app-shell>
  \`,
  styles: \`
    /* The widths are those of the shell's main area (container "mod-app-content"), not of the window. */
    .stack { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-3xl); }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-xl); }
    .cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-3xl); align-items: start; }
    .cols--main { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
    .period { display: flex; flex-wrap: wrap; gap: var(--spacing-md); }
    .panel {
      min-width: 0; padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--alpha-white);
    }
    .panel h2 { margin: 0 0 var(--spacing-xl); font-size: 16px; line-height: 24px; font-weight: var(--font-weight-semibold); color: var(--gray-900); }
    .panel--flush { padding: 0; overflow-x: auto; }
    .panel__head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-xl); padding: var(--spacing-xl) var(--spacing-2xl); }
    .panel__head h2 { margin: 0; }
    @container mod-app-content (max-width: 859px) {
      .cols, .cols--main { grid-template-columns: minmax(0, 1fr); }
    }
  \`,
})
export class Dashboard {
  protected readonly page = signal('dashboard');
  protected readonly collapsed = signal(false);
  protected readonly period = signal<Period>(30);
  protected readonly sort = signal<ModTableSort | null>({ key: 'created', direction: 'desc' });

  protected readonly periods: readonly Period[] = [30, 90, 180];
  protected readonly periodLabels: Record<Period, string> = { 30: 'Last 30 days', 90: 'Last 3 months', 180: 'Last 6 months' };

  /** The menu of the General Directorate of Medical Services. */
  protected readonly menu: ModAppShellGroup[] = [
    {
      label: 'Monitoring',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'analytics-01' },
        { id: 'reports', label: 'Reports', icon: 'file-01' },
      ],
    },
    { label: 'Work', items: [{ id: 'referrals', label: 'Referrals', icon: 'left-to-right-list-bullet' }] },
    { label: 'Setup', items: [{ id: 'hospitals', label: 'Hospitals', icon: 'hospital-01' }] },
  ];

  /** Replace with the dashboard request of the selected period. */
  private readonly byPeriod: Record<Period, {
    total: string; acceptance: string; attendance: string; running: string; response: string;
    outcomes: ModBarListItem[]; hospitals: ModBarListItem[]; specialties: ModBarListItem[];
  }> = {
    30: {
      total: '226', acceptance: '76.3', attendance: '91.2', running: '47', response: '18.6',
      outcomes: [
        { label: 'Accepted', value: 129 },
        { label: 'Rejected', value: 40, tone: 'critical' },
        { label: 'Not eligible', value: 10, tone: 'neutral' },
        { label: 'Running now', value: 47, tone: 'warning' },
      ],
      hospitals: [
        { label: 'Al Kharj General Hospital', value: 39 },
        { label: 'Wadi Aldawaser General Hospital', value: 31 },
        { label: 'Taif General Hospital', value: 30 },
      ],
      specialties: [
        { label: 'Cardiology', value: 47 },
        { label: 'Orthopedic Surgery', value: 36 },
        { label: 'Oncology', value: 29 },
      ],
    },
    90: {
      total: '705', acceptance: '77.9', attendance: '90.5', running: '58', response: '20.1',
      outcomes: [
        { label: 'Accepted', value: 482 },
        { label: 'Rejected', value: 137, tone: 'critical' },
        { label: 'Not eligible', value: 28, tone: 'neutral' },
        { label: 'Running now', value: 58, tone: 'warning' },
      ],
      hospitals: [
        { label: 'Al Kharj General Hospital', value: 118 },
        { label: 'Wadi Aldawaser General Hospital', value: 101 },
        { label: 'Taif General Hospital', value: 92 },
      ],
      specialties: [
        { label: 'Cardiology', value: 149 },
        { label: 'Orthopedic Surgery', value: 108 },
        { label: 'Oncology', value: 96 },
      ],
    },
    180: {
      total: '1,288', acceptance: '78.4', attendance: '89.7', running: '64', response: '21.3',
      outcomes: [
        { label: 'Accepted', value: 912 },
        { label: 'Rejected', value: 251, tone: 'critical' },
        { label: 'Not eligible', value: 61, tone: 'neutral' },
        { label: 'Running now', value: 64, tone: 'warning' },
      ],
      hospitals: [
        { label: 'Al Kharj General Hospital', value: 214 },
        { label: 'Wadi Aldawaser General Hospital', value: 187 },
        { label: 'Taif General Hospital', value: 163 },
      ],
      specialties: [
        { label: 'Cardiology', value: 268 },
        { label: 'Orthopedic Surgery', value: 201 },
        { label: 'Oncology', value: 173 },
      ],
    },
  };
  protected readonly data = computed(() => this.byPeriod[this.period()]);

  protected readonly monthly = [
    { name: 'Received', values: [182, 204, 197, 231, 248, 226] },
    { name: 'Accepted', values: [133, 152, 145, 167, 186, 129] },
  ];

  protected readonly columns: ModTableColumn<Referral>[] = [
    { key: 'number', header: 'Number', sortable: true },
    { key: 'patient', header: 'Patient', sortable: true },
    { key: 'specialty', header: 'Specialty', sortable: true },
    { key: 'origin', header: 'Referring hospital' },
    { key: 'priority', header: 'Priority' },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'created',
      header: 'Created',
      sortable: true,
      value: (row) => new Date(row.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      compare: (a, b) => a.created.localeCompare(b.created),
    },
  ];

  protected readonly referrals: Referral[] = [
    { number: '2026-000184', patient: 'Fahad Al-Otaibi', specialty: 'Cardiology', origin: 'Al Kharj General Hospital', priority: 'Urgent', status: 'Medical review', statusVariant: 'info', created: '2026-11-12' },
    { number: '2026-000183', patient: 'Maha Al-Shehri', specialty: 'Oncology', origin: 'Taif General Hospital', priority: 'Normal', status: 'Receiving hospital review', statusVariant: 'warning', created: '2026-11-12' },
    { number: '2026-000182', patient: 'Abdullah Al-Dossari', specialty: 'Neurosurgery', origin: 'Wadi Aldawaser General Hospital', priority: 'Emergency', status: 'Accepted', statusVariant: 'success', created: '2026-11-11' },
    { number: '2026-000181', patient: 'Reem Al-Ghamdi', specialty: 'Orthopedic Surgery', origin: 'Jubail Hospital', priority: 'Normal', status: 'Booked', statusVariant: 'success', created: '2026-11-11' },
    { number: '2026-000179', patient: 'Huda Al-Anazi', specialty: 'Neurology', origin: 'Al Kharj General Hospital', priority: 'Urgent', status: 'Rejected', statusVariant: 'error', created: '2026-11-10' },
  ];

  protected open(id: string): void {
    this.page.set(id);
    // this.router.navigate(['/', id]);
  }
}
`;
