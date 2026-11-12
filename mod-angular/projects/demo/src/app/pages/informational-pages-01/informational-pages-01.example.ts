import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import {
  ModAvatar,
  ModBreadcrumbItem,
  ModBreadcrumbSelectEvent,
  ModBreadcrumbs,
  ModButton,
  ModDescriptionItem,
  ModDescriptionList,
  ModEmptyState,
  ModEmptyStateActions,
  ModIcon,
  ModInlineAlert,
  ModInlineAlertVariant,
  ModMenu,
  ModMenuAnchor,
  ModMenuDivider,
  ModMenuItem,
  ModMenuTrigger,
  ModPageHeader,
  ModPageHeaderActions,
  ModPageHeaderBreadcrumb,
  ModPageHeaderMeta,
  ModProgressIndicator,
  ModProgressStep,
  ModStatusTag,
  ModTable,
  ModTableCell,
  ModTableColumn,
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
  REFERRAL_STATUS,
  ReferralStatus,
  SERVICES,
  SPECIALTIES,
  appNavLabel,
} from '../../shared/app-example/app-example-data';
import { AppExampleShell } from '../../shared/app-example/app-example-shell';

/** Texts of the page. Wording follows the referral page of the MODHS Referral Portal (en.json / ar.json). */
const TEXT = {
  en: {
    crumb: 'Breadcrumb',
    referrals: 'Referrals',
    referral: 'Referral',
    from: (name: string) => `From: ${name}`,
    status: 'Status',
    print: 'Print',
    more: 'More',
    notificationLog: 'Notification log',
    copyNumber: 'Copy the referral number',
    restart: 'Restart the example',
    close: 'Close',
    saved: 'The decision was saved.',
    printing: 'The print view is being prepared.',
    copied: 'The referral number was copied.',
    copyFailed: 'The number could not be copied. Select it and copy it yourself.',
    restarted: 'The example is back at the department step.',
    logInfo: 'The notification log is not part of this example.',
    listOnly: 'The example shows the referral page only.',
    downloadStarted: (name: string) => `The download of ${name} has started.`,
    doneTitle: 'Referral completed:',
    doneText: 'The patient attended the appointment.',
    path: 'Referral path',
    yourAction: 'Your action now',
    waitingYou: 'Waiting for you now',
    step: 'Step',
    stepDone: 'Done',
    stepCurrent: 'current',
    stepUpcoming: 'upcoming',
    steps: [
      'Request submitted',
      'Medical need',
      'Eligibility',
      'Department',
      'Accept or reject',
      'Appointment booking',
      'Attendance and invoice',
    ],
    main: 'Referral data',
    requiredService: 'Required service',
    mainSpecialty: 'Main specialty',
    subSpecialty: 'Sub-specialty',
    priority: 'Priority',
    caseType: 'Case type',
    outpatient: 'Outpatient',
    condition: 'Patient condition',
    stable: 'Stable',
    origin: 'Referring hospital',
    receiving: 'Receiving hospital',
    currentStep: 'Current step',
    submittedAt: 'Submitted',
    airEvacuation: 'Air evacuation requested',
    no: 'No',
    diagnosis: 'Preliminary diagnosis',
    reason: 'Referral reason',
    patientData: 'Patient data',
    patient: 'Patient',
    nationalId: 'National ID',
    mrn: 'Medical record number',
    gender: 'Gender',
    male: 'Male',
    birthDate: 'Birth date',
    age: 'Age',
    ageYears: (n: number) => `${n} years`,
    mobile: 'Mobile',
    nationality: 'Nationality',
    eligibility: 'Eligibility',
    medical: 'Medical information',
    doctorName: 'Doctor name',
    doctorSpecialty: 'Doctor specialty',
    medicalHistory: 'Medical history',
    conditionNote: 'Condition note',
    attachments: 'Attachments',
    type: 'Type',
    fileName: 'File name',
    size: 'Size',
    uploadedBy: 'Uploaded by',
    uploadedAt: 'Uploaded at',
    actions: 'Actions',
    download: 'Download',
    downloading: 'Downloading...',
    downloadLabel: (name: string) => `Download the file ${name}`,
    noAttachments: 'This referral has no attachments.',
    kb: 'KB',
    mb: 'MB',
    keyFacts: 'Key facts',
    number: 'Referral number',
    booking: 'Appointment or bed',
    coordinator: 'Assigned coordinator',
    timeline: 'Timeline',
    newestFirst: 'Newest first',
    otherTitle: 'This screen is not part of the example',
    otherText: 'The example shows the referral page only. The side bar still works: choose Referrals to go back.',
    back: 'Back to the referral',
  },
  ar: {
    crumb: 'مسار التنقل',
    referrals: 'الإحالات',
    referral: 'الإحالة',
    from: (name: string) => `من: ${name}`,
    status: 'الحالة',
    print: 'طباعة',
    more: 'المزيد',
    notificationLog: 'سجل الإشعارات',
    copyNumber: 'نسخ رقم الإحالة',
    restart: 'إعادة المثال إلى بدايته',
    close: 'إغلاق',
    saved: 'تم حفظ القرار.',
    printing: 'جارٍ تجهيز نسخة الطباعة.',
    copied: 'تم نسخ رقم الإحالة.',
    copyFailed: 'تعذّر نسخ الرقم. حدّده وانسخه يدويًا.',
    restarted: 'أُعيد المثال إلى مرحلة تحديد القسم.',
    logInfo: 'سجل الإشعارات ليس ضمن هذا المثال.',
    listOnly: 'يعرض المثال صفحة الإحالة فقط.',
    downloadStarted: (name: string) => `بدأ تنزيل الملف ${name}.`,
    doneTitle: 'اكتملت الإحالة:',
    doneText: 'حضر المريض الموعد.',
    path: 'مسار الإحالة',
    yourAction: 'إجراؤك الآن',
    waitingYou: 'بانتظارك الآن',
    step: 'المرحلة',
    stepDone: 'تمت',
    stepCurrent: 'الحالية',
    stepUpcoming: 'قادمة',
    steps: [
      'تقديم الطلب',
      'تقييم الحاجة للتحويل',
      'أحقية العلاج',
      'تحديد القسم',
      'القبول أو الرفض',
      'حجز الموعد',
      'الحضور والفاتورة',
    ],
    main: 'بيانات الإحالة',
    requiredService: 'الخدمة المطلوبة',
    mainSpecialty: 'التخصص الرئيسي',
    subSpecialty: 'التخصص الفرعي',
    priority: 'الأولوية',
    caseType: 'نوع الحالة',
    outpatient: 'عيادات خارجية',
    condition: 'حالة المريض',
    stable: 'مستقرة',
    origin: 'المستشفى المُحيل',
    receiving: 'المستشفى المستقبل',
    currentStep: 'المرحلة الحالية',
    submittedAt: 'تاريخ التقديم',
    airEvacuation: 'طلب إخلاء جوي',
    no: 'لا',
    diagnosis: 'التشخيص المبدئي',
    reason: 'سبب الإحالة',
    patientData: 'بيانات المريض',
    patient: 'المريض',
    nationalId: 'رقم الهوية',
    mrn: 'رقم الملف الطبي',
    gender: 'الجنس',
    male: 'ذكر',
    birthDate: 'تاريخ الميلاد',
    age: 'العمر',
    ageYears: (n: number) => `${n} سنة`,
    mobile: 'الجوال',
    nationality: 'الجنسية',
    eligibility: 'الاستحقاق',
    medical: 'معلومات طبية',
    doctorName: 'اسم الطبيب',
    doctorSpecialty: 'تخصص الطبيب',
    medicalHistory: 'التاريخ المرضي',
    conditionNote: 'ملاحظة على حالة المريض',
    attachments: 'المرفقات',
    type: 'النوع',
    fileName: 'اسم الملف',
    size: 'الحجم',
    uploadedBy: 'رفعه',
    uploadedAt: 'تاريخ الرفع',
    actions: 'الإجراءات',
    download: 'تنزيل',
    downloading: 'جارٍ التنزيل...',
    downloadLabel: (name: string) => `تنزيل الملف ${name}`,
    noAttachments: 'لا توجد مرفقات لهذه الإحالة.',
    kb: 'ك.ب',
    mb: 'م.ب',
    keyFacts: 'أبرز البيانات',
    number: 'رقم الإحالة',
    booking: 'الموعد أو السرير',
    coordinator: 'المنسق المسؤول',
    timeline: 'السجل الزمني',
    newestFirst: 'الأحدث أولاً',
    otherTitle: 'هذه الشاشة ليست ضمن المثال',
    otherText: 'يعرض المثال صفحة الإحالة فقط. القائمة الجانبية تعمل: اختر «الإحالات» للعودة.',
    back: 'العودة إلى الإحالة',
  },
} as const;

/** The referral of the example (invented patient and staff; hospitals, specialties and lists are those of the real system). */
const CASE = {
  number: '2026-000184',
  patient: { en: 'Fahad Al-Otaibi', ar: 'فهد العتيبي' } as Bi,
  nationalId: '1•••••••27',
  mrn: '48213',
  birthDate: '1984-03-17T00:00:00',
  age: 42,
  mobile: '+966 5• ••• ••14',
  nationality: { en: 'Saudi', ar: 'سعودي' } as Bi,
  eligibility: { en: 'Military personnel', ar: 'منسوب عسكري' } as Bi,
  subSpecialty: { en: 'Interventional cardiology', ar: 'قسطرة القلب' } as Bi,
  submittedAt: '2026-11-12T08:10:00',
  appointmentAt: '2026-11-19T09:30:00',
  diagnosis: {
    en: 'Unstable angina with suspected multi-vessel coronary artery disease.',
    ar: 'ذبحة صدرية غير مستقرة مع اشتباه في إصابة عدة شرايين تاجية.',
  } as Bi,
  reason: {
    en: 'The service is not available at the referring hospital',
    ar: 'الخدمة غير متوفرة في المستشفى المُحيل',
  } as Bi,
  doctor: { en: 'Dr. Yousef Al-Amri', ar: 'د. يوسف العمري' } as Bi,
  history: {
    en: 'Hypertension for eight years and type 2 diabetes, on regular medication. Chest pain on exertion for three weeks; the stress ECG was positive.',
    ar: 'ارتفاع ضغط الدم منذ ثماني سنوات وسكري من النوع الثاني، مع انتظام على العلاج. ألم في الصدر عند المجهود منذ ثلاثة أسابيع، وتخطيط القلب بالمجهود إيجابي.',
  } as Bi,
  conditionNote: {
    en: 'Stable on medical treatment. Needs diagnostic cardiac catheterisation.',
    ar: 'مستقر على العلاج الدوائي. يحتاج إلى قسطرة قلبية تشخيصية.',
  } as Bi,
};

type EventType =
  | 'REFERRAL_CREATED'
  | 'ATTACHMENT_UPLOADED'
  | 'MEDICAL_NEED_DECIDED'
  | 'ELIGIBILITY_DECIDED'
  | 'DEPARTMENT_ACTION_SET'
  | 'REFERRAL_ACCEPTED'
  | 'OUTPATIENT_BOOKED'
  | 'ATTENDANCE_CONFIRMED';

/** Event names of the real timeline. */
const EVENT_LABEL: Record<EventType, Bi> = {
  REFERRAL_CREATED: { en: 'Create the referral', ar: 'رفع الإحالة' },
  ATTACHMENT_UPLOADED: { en: 'Upload an attachment', ar: 'إرفاق مستند' },
  MEDICAL_NEED_DECIDED: { en: 'Decide the need for transfer', ar: 'تقييم الحاجة للتحويل' },
  ELIGIBILITY_DECIDED: { en: 'Confirm the entitlement to treatment', ar: 'التحقق من أحقية العلاج' },
  DEPARTMENT_ACTION_SET: { en: 'Review the referral data and determine the department', ar: 'مراجعة البيانات وتحديد القسم' },
  REFERRAL_ACCEPTED: { en: 'Accept the referral', ar: 'قبول الإحالة' },
  OUTPATIENT_BOOKED: { en: 'Book the outpatient appointment', ar: 'حجز موعد عيادة خارجية' },
  ATTENDANCE_CONFIRMED: { en: "Confirm the patient's attendance", ar: 'تأكيد الحضور' },
};

const ROLE = {
  doctor: { en: 'Doctor', ar: 'الطبيب' },
  director: { en: 'Medical director', ar: 'المدير الطبي' },
  coordinator: { en: 'Medical coordinator', ar: 'المنسق الطبي' },
} as const satisfies Record<string, Bi>;

interface CaseEvent {
  id: number;
  type: EventType;
  /** ISO date and time. */
  at: string;
  actor: Bi;
  role: Bi;
  tone: ModTimelineTone;
  icon: string;
  /** Hidden text read before the title when the tone carries the outcome. */
  toneLabel?: Bi;
  note?: Bi;
}

/** History of the case before the example starts, newest first. */
const INITIAL_EVENTS: readonly CaseEvent[] = [
  {
    id: 4,
    type: 'ELIGIBILITY_DECIDED',
    at: '2026-11-12T10:20:00',
    actor: { en: 'Salem Al-Qarni', ar: 'سالم القرني' },
    role: ROLE.coordinator,
    tone: 'success',
    icon: 'checkmark-circle-02',
    toneLabel: { en: 'Eligible', ar: 'مستحق' },
    note: { en: 'Eligible', ar: 'مستحق' },
  },
  {
    id: 3,
    type: 'MEDICAL_NEED_DECIDED',
    at: '2026-11-12T09:05:00',
    actor: { en: 'Dr. Majed Al-Shammari', ar: 'د. ماجد الشمري' },
    role: ROLE.director,
    tone: 'success',
    icon: 'checkmark-circle-02',
    toneLabel: { en: 'Yes, transfer needed', ar: 'نعم، يحتاج إلى التحويل' },
    note: { en: 'Yes, transfer needed', ar: 'نعم، يحتاج إلى التحويل' },
  },
  {
    id: 2,
    type: 'ATTACHMENT_UPLOADED',
    at: '2026-11-12T08:12:00',
    actor: CASE.doctor,
    role: ROLE.doctor,
    tone: 'default',
    icon: 'attachment-01',
    note: { en: 'referral-2026-000184.pdf', ar: 'referral-2026-000184.pdf' },
  },
  {
    id: 1,
    type: 'REFERRAL_CREATED',
    at: CASE.submittedAt,
    actor: CASE.doctor,
    role: ROLE.doctor,
    tone: 'info',
    icon: 'medical-file',
  },
];

/**
 * What the primary action does at each step (the action names are those of the pending actions list).
 * Step numbers are 1-based positions in the referral path. In the real system some of these steps
 * belong to other roles; the example lets the signed-in coordinator take them all.
 */
interface StepAction {
  action: Bi;
  event: EventType;
  icon: string;
  tone: ModTimelineTone;
  note: Bi;
}

const FIRST_STEP = 4;
const LAST_STEP = 7;

const STEP_ACTIONS: Record<number, StepAction> = {
  4: {
    action: { en: 'Choose the department and action', ar: 'تحديد القسم والإجراء' },
    event: 'DEPARTMENT_ACTION_SET',
    icon: 'stethoscope',
    tone: 'info',
    note: { en: 'Department: Cardiology', ar: 'القسم: أمراض القلب' },
  },
  5: {
    action: { en: 'Accept or reject the referral', ar: 'قبول أو رفض الإحالة' },
    event: 'REFERRAL_ACCEPTED',
    icon: 'checkmark-circle-02',
    tone: 'success',
    note: { en: 'Route: Outpatient clinic', ar: 'المسار: العيادات الخارجية' },
  },
  6: {
    action: { en: 'Book the clinic appointment', ar: 'حجز موعد العيادة' },
    event: 'OUTPATIENT_BOOKED',
    icon: 'calendar-03',
    tone: 'success',
    note: { en: 'Clinic appointment booked', ar: 'تم حجز موعد العيادة' },
  },
  7: {
    action: { en: 'Confirm the patient attendance', ar: 'تأكيد حضور المريض' },
    event: 'ATTENDANCE_CONFIRMED',
    icon: 'user-check-01',
    tone: 'success',
    note: { en: 'Attended', ar: 'حضر' },
  },
};

/** Status of the referral while it waits at each step (8 = every step done). */
const STATUS_AT: Record<number, ReferralStatus> = {
  4: 'IN_RECEIVING_REVIEW',
  5: 'IN_RECEIVING_REVIEW',
  6: 'ACCEPTED',
  7: 'BOOKED',
  8: 'ENDED',
};

type DocumentType = 'REFERRAL_DOCUMENT' | 'DETAILED_MEDICAL_REPORT' | 'MEDICAL_REPORTS_ECG' | 'ID';

const DOCUMENT_TYPE: Record<DocumentType, Bi> = {
  REFERRAL_DOCUMENT: { en: 'Referral document', ar: 'مستند الإحالة' },
  DETAILED_MEDICAL_REPORT: { en: 'Detailed Medical Report', ar: 'التقرير الطبي المفصل' },
  MEDICAL_REPORTS_ECG: { en: 'Medical Reports / ECG', ar: 'التقارير الطبية / تخطيط القلب' },
  ID: { en: 'ID document', ar: 'الهوية' },
};

interface Attachment {
  id: string;
  type: DocumentType;
  name: string;
  bytes: number;
  by: Bi;
  at: string;
}

const ATTACHMENTS: readonly Attachment[] = [
  { id: 'a1', type: 'REFERRAL_DOCUMENT', name: 'referral-2026-000184.pdf', bytes: 254_259, by: CASE.doctor, at: '2026-11-12T08:12:00' },
  { id: 'a2', type: 'DETAILED_MEDICAL_REPORT', name: 'medical-report.pdf', bytes: 1_258_291, by: CASE.doctor, at: '2026-11-12T08:14:00' },
  { id: 'a3', type: 'MEDICAL_REPORTS_ECG', name: 'ecg-2026-11-10.png', bytes: 700_416, by: CASE.doctor, at: '2026-11-12T08:15:00' },
  { id: 'a4', type: 'ID', name: 'id-copy.pdf', bytes: 320_000, by: { en: 'Salem Al-Qarni', ar: 'سالم القرني' }, at: '2026-11-12T10:18:00' },
];

/** An attachment with its texts in the current language (a table row). */
interface AttachmentRow {
  id: string;
  type: string;
  name: string;
  icon: string;
  size: string;
  by: string;
  at: string;
  downloadLabel: string;
}

interface Notice {
  variant: ModInlineAlertVariant;
  text: Bi;
}

function dateTime(iso: string, lang: AppLang, withTime = true): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(new Date(iso));
}

/**
 * Informational pages 01: the referral (case) page of the MODHS Referral
 * Portal (referral-detail with referral-rail, case-attachments and
 * referral-timeline): breadcrumb, page header with the number, status,
 * priority and actions, the referral path as a progress indicator, the
 * referral, patient and medical details in description lists, the
 * attachments, and a side rail with the key facts, the coordinator and the
 * timeline. The real page has no tabs, so the example has none.
 *
 * Demo behaviour: the primary action takes the current step (the path moves
 * on, the status changes, an event is added to the timeline and a message is
 * shown in the status region); "More" holds the notification log, copy and
 * restart; the download buttons show a message instead of downloading.
 */
@Component({
  selector: 'demo-informational-pages-01',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppExampleShell,
    ModPageHeader,
    ModPageHeaderActions,
    ModPageHeaderBreadcrumb,
    ModPageHeaderMeta,
    ModBreadcrumbs,
    ModStatusTag,
    ModTag,
    ModButton,
    ModIcon,
    ModMenuAnchor,
    ModMenuTrigger,
    ModMenu,
    ModMenuItem,
    ModMenuDivider,
    ModInlineAlert,
    ModProgressIndicator,
    ModDescriptionList,
    ModDescriptionItem,
    ModTable,
    ModTableCell,
    ModAvatar,
    ModTimeline,
    ModTimelineItem,
    ModEmptyState,
    ModEmptyStateActions,
  ],
  template: `
    <demo-app-example-shell
      [lang]="lang()"
      role="coordinator"
      [pending]="3"
      [(activeId)]="page"
      (languageToggle)="languageToggle.emit()"
    >
      @if (page() === 'referrals') {
        <mod-page-header [heading]="t().referral + ' ' + number" [description]="summary()">
          <mod-breadcrumbs modPageHeaderBreadcrumb [items]="crumbs()" [aria-label]="t().crumb" (itemSelected)="onCrumb($event)" />
          <mod-status-tag modPageHeaderMeta [variant]="statusVariant()" [statusLabel]="t().status + ':'">{{ statusLabel() }}</mod-status-tag>
          <mod-tag modPageHeaderMeta size="sm" [variant]="priority.variant">
            <span class="app-ex-sr">{{ t().priority }}: </span>{{ priority[lang()] }}
          </mod-tag>

          <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="notify('info', 'printing')">
            <mod-icon name="printer" /> {{ t().print }}
          </button>
          <mod-menu-anchor modPageHeaderActions [(open)]="moreOpen">
            <button mod-button modMenuTrigger variant="secondary-outline" size="medium" type="button">
              {{ t().more }} <mod-icon name="arrow-down-01" />
            </button>
            <mod-menu class="app-ex-menu-end" [aria-label]="t().more">
              <mod-menu-item icon="note-01" (activated)="notify('info', 'logInfo')">{{ t().notificationLog }}</mod-menu-item>
              <mod-menu-item icon="copy-01" (activated)="copyNumber()">{{ t().copyNumber }}</mod-menu-item>
              <mod-menu-divider />
              <mod-menu-item icon="refresh" (activated)="restart()">{{ t().restart }}</mod-menu-item>
            </mod-menu>
          </mod-menu-anchor>
          @if (action(); as current) {
            <button modPageHeaderActions mod-button size="medium" type="button" (click)="advance()">{{ current.action[lang()] }}</button>
          }
        </mod-page-header>

        <div class="app-ex-stack">
          <!-- Status region: the result of every action is announced here. -->
          <div class="info01-status" role="status" aria-live="polite">
            @if (notice(); as n) {
              <mod-inline-alert
                colored
                dismissible
                [variant]="n.variant"
                [heading]="n.text[lang()]"
                [closeLabel]="t().close"
                (dismissed)="notice.set(null)"
              />
            }
          </div>

          @if (completed()) {
            <mod-inline-alert colored variant="success" [heading]="t().doneTitle" [message]="t().doneText" />
          }

          <section class="app-ex-panel" aria-labelledby="info01-path">
            <div class="app-ex-panel__head">
              <h2 class="app-ex-panel__title" id="info01-path">{{ t().path }}</h2>
              @if (action(); as current) {
                <p class="app-ex-panel__meta">{{ t().yourAction }}: {{ current.action[lang()] }}</p>
              }
            </div>
            <div class="app-ex-panel__body">
              <mod-progress-indicator
                class="info01-steps info01-steps--wide"
                [steps]="steps()"
                [current]="step()"
                [ariaLabel]="t().path"
                [stepLabel]="t().step"
                [completedLabel]="t().stepDone"
                [currentLabel]="t().stepCurrent"
                [upcomingLabel]="t().stepUpcoming"
              />
              <mod-progress-indicator
                class="info01-steps info01-steps--narrow"
                orientation="vertical"
                [steps]="steps()"
                [current]="step()"
                [ariaLabel]="t().path"
                [stepLabel]="t().step"
                [completedLabel]="t().stepDone"
                [currentLabel]="t().stepCurrent"
                [upcomingLabel]="t().stepUpcoming"
              />
            </div>
          </section>

          <div class="info01-cols">
            <div class="info01-col">
              <section class="app-ex-panel" aria-labelledby="info01-main">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info01-main">{{ t().main }}</h2>
                </div>
                <div class="app-ex-panel__body">
                  <mod-description-list columns="3" [aria-label]="t().main">
                    <mod-description-item [label]="t().requiredService" [value]="service()" />
                    <mod-description-item [label]="t().mainSpecialty" [value]="specialty()" />
                    <mod-description-item [label]="t().priority">
                      <mod-tag size="xs" [variant]="priority.variant">{{ priority[lang()] }}</mod-tag>
                    </mod-description-item>
                    <mod-description-item [label]="t().subSpecialty" [value]="data.subSpecialty[lang()]" />
                    <mod-description-item [label]="t().caseType" [value]="t().outpatient" />
                    <mod-description-item [label]="t().condition" [value]="t().stable" />
                    <mod-description-item [label]="t().origin" [value]="origin()" />
                    <mod-description-item [label]="t().receiving" [value]="receiving()" />
                    <mod-description-item [label]="t().airEvacuation" [value]="t().no" />
                    <mod-description-item [label]="t().diagnosis" [value]="data.diagnosis[lang()]" span="full" />
                    <mod-description-item [label]="t().reason" [value]="data.reason[lang()]" span="full" />
                  </mod-description-list>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="info01-patient">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info01-patient">{{ t().patientData }}</h2>
                </div>
                <div class="app-ex-panel__body">
                  <mod-description-list columns="3" [aria-label]="t().patientData">
                    <mod-description-item [label]="t().patient" [value]="data.patient[lang()]" />
                    <mod-description-item [label]="t().nationalId"><bdi dir="ltr">{{ data.nationalId }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().mrn"><bdi dir="ltr">{{ data.mrn }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().gender" [value]="t().male" />
                    <mod-description-item [label]="t().birthDate" [value]="birthDate()" />
                    <mod-description-item [label]="t().age" [value]="t().ageYears(data.age)" />
                    <mod-description-item [label]="t().mobile"><bdi dir="ltr">{{ data.mobile }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().nationality" [value]="data.nationality[lang()]" />
                    <mod-description-item [label]="t().eligibility" [value]="data.eligibility[lang()]" />
                  </mod-description-list>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="info01-medical">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info01-medical">{{ t().medical }}</h2>
                </div>
                <div class="app-ex-panel__body">
                  <mod-description-list columns="2" [aria-label]="t().medical">
                    <mod-description-item [label]="t().doctorName" [value]="data.doctor[lang()]" />
                    <mod-description-item [label]="t().doctorSpecialty" [value]="specialty()" />
                    <mod-description-item [label]="t().medicalHistory" [value]="data.history[lang()]" span="full" />
                    <mod-description-item [label]="t().conditionNote" [value]="data.conditionNote[lang()]" span="full" />
                  </mod-description-list>
                </div>
              </section>

              <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="info01-attachments">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info01-attachments">{{ t().attachments }}</h2>
                  <p class="app-ex-panel__meta">{{ attachments().length }}</p>
                </div>
                <div class="app-ex-panel__body">
                  <mod-table
                    density="compact"
                    [label]="t().attachments"
                    [columns]="attachmentColumns()"
                    [rows]="attachments()"
                    [rowKey]="attachmentKey"
                    [emptyText]="t().noAttachments"
                  >
                    <ng-template modTableCell="name" let-row>
                      <span class="info01-file"><mod-icon [name]="row.icon" /><bdi dir="ltr">{{ row.name }}</bdi></span>
                    </ng-template>
                    <ng-template modTableCell="download" let-row>
                      <button
                        mod-button
                        variant="secondary-outline"
                        size="small"
                        type="button"
                        [disabled]="downloading() === row.id"
                        [attr.aria-label]="row.downloadLabel"
                        (click)="download(row)"
                      >
                        <mod-icon name="download-01" />
                        {{ downloading() === row.id ? t().downloading : t().download }}
                      </button>
                    </ng-template>
                  </mod-table>
                </div>
              </section>
            </div>

            <aside class="info01-col" [attr.aria-label]="t().keyFacts">
              <section class="app-ex-panel" aria-labelledby="info01-facts">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info01-facts">{{ t().keyFacts }}</h2>
                </div>
                <div class="app-ex-panel__body">
                  <mod-description-list dividers [aria-label]="t().keyFacts">
                    <mod-description-item [label]="t().number"><bdi dir="ltr">{{ number }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().currentStep" [value]="currentStepName()" />
                    <mod-description-item [label]="t().submittedAt" [value]="submittedAt()" />
                    <mod-description-item [label]="t().booking" [value]="appointment()" />
                    <mod-description-item [label]="t().coordinator">
                      <span class="info01-person">
                        <mod-avatar size="40" [initials]="coordinator().initials" />
                        <span class="info01-person__text">
                          <span class="info01-person__name">{{ coordinator().name }}</span>
                          <span class="info01-person__role">{{ coordinator().role }} · {{ receiving() }}</span>
                        </span>
                      </span>
                    </mod-description-item>
                  </mod-description-list>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="info01-timeline">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info01-timeline">{{ t().timeline }}</h2>
                  <p class="app-ex-panel__meta">{{ t().newestFirst }}</p>
                </div>
                <div class="app-ex-panel__body">
                  <mod-timeline compact [aria-label]="t().timeline">
                    @for (event of timeline(); track event.id) {
                      <mod-timeline-item
                        [heading]="event.heading"
                        [time]="event.time"
                        [actor]="event.actor"
                        [tone]="event.tone"
                        [icon]="event.icon"
                        [toneLabel]="event.toneLabel"
                      >@if (event.note) {<span class="info01-note">{{ event.note }}</span>}</mod-timeline-item>
                    }
                  </mod-timeline>
                </div>
              </section>
            </aside>
          </div>
        </div>
      } @else {
        <mod-page-header [heading]="otherTitle()" />
        <mod-empty-state bordered icon="left-to-right-list-bullet" [level]="2" [heading]="t().otherTitle" [text]="t().otherText">
          <button modEmptyStateActions mod-button size="medium" type="button" (click)="page.set('referrals')">
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

    /* Keeps no gap in the stack while there is no message. */
    .info01-status:empty {
      display: none;
    }

    .info01-steps--narrow {
      display: none;
    }

    /* Main column and side rail. The rail moves below on narrow containers. */
    .info01-cols {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: var(--spacing-3xl);
      align-items: start;
    }

    .info01-col {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-3xl);
      min-width: 0;
    }

    .info01-file {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-md);
      color: var(--gray-900);
    }

    .info01-file mod-icon {
      font-size: 18px;
      color: var(--sa-600);
    }

    .info01-person {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      margin-block-start: var(--spacing-xs);
    }

    .info01-person__text {
      display: grid;
      min-width: 0;
    }

    .info01-person__name {
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .info01-person__role,
    .info01-note {
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
    }

    @container mod-app-content (max-width: 799px) {
      .info01-cols {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @container mod-app-content (max-width: 719px) {
      .info01-steps--wide {
        display: none;
      }

      .info01-steps--narrow {
        display: flex;
      }
    }
  `,
})
export class InformationalPages01Example {
  private readonly destroyRef = inject(DestroyRef);
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;
  private downloadTimer: ReturnType<typeof setTimeout> | undefined;
  private nextEventId = INITIAL_EVENTS.length + 1;

  readonly lang = input<AppLang>('en');
  /** The language button of the shell was pressed. */
  readonly languageToggle = output<void>();

  protected readonly t = computed(() => TEXT[this.lang()]);
  protected readonly data = CASE;
  protected readonly number = CASE.number;
  protected readonly priority = PRIORITY.URGENT;

  protected readonly page = signal<string>('referrals');
  protected readonly moreOpen = signal(false);
  /** 1-based number of the current step of the path; LAST_STEP + 1 once every step is done. */
  protected readonly step = signal(FIRST_STEP);
  protected readonly events = signal<readonly CaseEvent[]>(INITIAL_EVENTS);
  protected readonly notice = signal<Notice | null>(null);
  /** Id of the attachment being "downloaded" (one at a time). */
  protected readonly downloading = signal<string | null>(null);

  protected readonly completed = computed(() => this.step() > LAST_STEP);
  /** The action of the current step; null once the case is complete. */
  protected readonly action = computed<StepAction | null>(() => STEP_ACTIONS[this.step()] ?? null);

  protected readonly statusLabel = computed(() => REFERRAL_STATUS[STATUS_AT[this.step()]][this.lang()]);
  protected readonly statusVariant = computed(() => REFERRAL_STATUS[STATUS_AT[this.step()]].variant);

  protected readonly origin = computed(() => HOSPITALS.KAFH[this.lang()]);
  protected readonly receiving = computed(() => HOSPITALS.PSMMC[this.lang()]);
  protected readonly specialty = computed(() => SPECIALTIES.CARD[this.lang()]);
  protected readonly service = computed(() => SERVICES.OUTPATIENT_CLINIC[this.lang()]);
  protected readonly birthDate = computed(() => dateTime(CASE.birthDate, this.lang(), false));
  protected readonly submittedAt = computed(() => dateTime(CASE.submittedAt, this.lang()));
  /** The appointment, known once the booking step is done. */
  protected readonly appointment = computed(() => (this.step() > 6 ? dateTime(CASE.appointmentAt, this.lang()) : '—'));

  /** "Patient · From: hospital · specialty · service", as in the head of the real page. */
  protected readonly summary = computed(() =>
    [CASE.patient[this.lang()], this.t().from(this.origin()), this.specialty(), this.service()].join(' · '),
  );

  protected readonly crumbs = computed<ModBreadcrumbItem[]>(() => [
    { id: 'referrals', label: this.t().referrals },
    { id: 'case', label: CASE.number },
  ]);

  protected readonly steps = computed<ModProgressStep[]>(() => {
    const t = this.t();
    const names: readonly string[] = t.steps;
    const current = this.step();
    return names.map((name, index) => (index + 1 === current ? { name, description: t.waitingYou } : { name }));
  });

  /** Name of the current step; the status once every step is done. */
  protected readonly currentStepName = computed(() => {
    const names: readonly string[] = this.t().steps;
    return this.completed() ? this.statusLabel() : names[this.step() - 1];
  });

  protected readonly coordinator = computed(() => {
    const lang = this.lang();
    const user = APP_USERS.coordinator;
    return { name: user.name[lang], initials: user.initials[lang], role: user.role[lang] };
  });

  protected readonly timeline = computed(() => {
    const lang = this.lang();
    return this.events().map((event) => ({
      id: event.id,
      heading: EVENT_LABEL[event.type][lang],
      time: dateTime(event.at, lang),
      actor: `${event.actor[lang]} · ${event.role[lang]}`,
      tone: event.tone,
      icon: event.icon,
      toneLabel: event.toneLabel?.[lang] ?? '',
      note: event.note?.[lang] ?? '',
    }));
  });

  protected readonly attachmentColumns = computed<ModTableColumn<AttachmentRow>[]>(() => {
    const t = this.t();
    return [
      { key: 'type', header: t.type },
      { key: 'name', header: t.fileName },
      { key: 'size', header: t.size },
      { key: 'by', header: t.uploadedBy },
      { key: 'at', header: t.uploadedAt },
      { key: 'download', header: t.actions },
    ];
  });

  protected readonly attachments = computed<AttachmentRow[]>(() => {
    const lang = this.lang();
    const t = this.t();
    return ATTACHMENTS.map((file) => ({
      id: file.id,
      type: DOCUMENT_TYPE[file.type][lang],
      name: file.name,
      icon: file.name.endsWith('.pdf') ? 'pdf-01' : 'image-01',
      size:
        file.bytes < 1024 * 1024
          ? `${(file.bytes / 1024).toFixed(1)} ${t.kb}`
          : `${(file.bytes / (1024 * 1024)).toFixed(1)} ${t.mb}`,
      by: file.by[lang],
      at: dateTime(file.at, lang),
      downloadLabel: t.downloadLabel(file.name),
    }));
  });

  protected readonly attachmentKey = (row: AttachmentRow): string => row.id;

  protected readonly otherTitle = computed(() => appNavLabel(this.page() as AppNavId, this.lang()));

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.noticeTimer);
      clearTimeout(this.downloadTimer);
    });
  }

  /** Takes the current step: the path moves on and the decision is added to the timeline. */
  protected advance(): void {
    const current = this.action();
    if (!current) return;
    const user = APP_USERS.coordinator;
    const event: CaseEvent = {
      id: this.nextEventId++,
      type: current.event,
      at: new Date().toISOString(),
      actor: user.name,
      role: user.role,
      tone: current.tone,
      icon: current.icon,
      note: current.note,
    };
    this.events.update((events) => [event, ...events]);
    this.step.update((step) => step + 1);
    this.notify('success', 'saved');
  }

  protected restart(): void {
    this.events.set(INITIAL_EVENTS);
    this.step.set(FIRST_STEP);
    this.notify('info', 'restarted');
  }

  protected copyNumber(): void {
    // The clipboard is not available in an insecure context (http): say so instead of confirming.
    const clipboard: Clipboard | undefined = navigator.clipboard;
    if (!clipboard) return this.notify('error', 'copyFailed');
    clipboard.writeText(CASE.number).then(
      () => this.notify('success', 'copied'),
      () => this.notify('error', 'copyFailed'),
    );
  }

  protected onCrumb(selection: ModBreadcrumbSelectEvent): void {
    selection.event.preventDefault();
    if (selection.item.id === 'referrals') this.notify('info', 'listOnly');
  }

  /** Stand-in for the file request: a short busy state, then the message. No file is downloaded. */
  protected download(row: AttachmentRow): void {
    if (this.downloading()) return;
    this.downloading.set(row.id);
    clearTimeout(this.downloadTimer);
    this.downloadTimer = setTimeout(() => {
      this.downloading.set(null);
      this.show({
        variant: 'success',
        text: { en: TEXT.en.downloadStarted(row.name), ar: TEXT.ar.downloadStarted(row.name) },
      });
    }, 700);
  }

  protected notify(variant: ModInlineAlertVariant, key: 'saved' | 'printing' | 'copied' | 'copyFailed' | 'restarted' | 'logInfo' | 'listOnly'): void {
    this.show({ variant, text: { en: TEXT.en[key], ar: TEXT.ar[key] } });
  }

  /** Shows a message in the status region and clears it after a while. */
  private show(notice: Notice): void {
    this.notice.set(notice);
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice.set(null), 6000);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const INFORMATIONAL_PAGES_01_CODE = `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  ModAppShell, ModAppShellActions, ModAppShellGroup, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle,
  ModAvatar, ModBreadcrumbItem, ModBreadcrumbSelectEvent, ModBreadcrumbs, ModButton, ModDescriptionItem, ModDescriptionList,
  ModIcon, ModInlineAlert, ModMenu, ModMenuAnchor, ModMenuItem, ModMenuTrigger, ModPageHeader, ModPageHeaderActions,
  ModPageHeaderBreadcrumb, ModPageHeaderMeta, ModProgressIndicator, ModProgressStep, ModStatusTag, ModStatusTagVariant,
  ModTable, ModTableCell, ModTableColumn, ModTag, ModTimeline, ModTimelineItem, ModTimelineTone,
} from '@mod-internal/ui';

interface CaseEvent {
  id: number;
  heading: string;
  time: string;
  actor: string;
  tone: ModTimelineTone;
  icon: string;
  note?: string;
}

interface Attachment {
  id: string;
  type: string;
  name: string;
  size: string;
  by: string;
  at: string;
}

/** What the primary action does at each step of the path (1-based). */
const STEP_ACTIONS: Record<number, { action: string; event: string; icon: string; status: string; variant: ModStatusTagVariant }> = {
  4: { action: 'Choose the department and action', event: 'Review the referral data and determine the department', icon: 'stethoscope', status: 'Receiving hospital review', variant: 'warning' },
  5: { action: 'Accept or reject the referral', event: 'Accept the referral', icon: 'checkmark-circle-02', status: 'Accepted', variant: 'success' },
  6: { action: 'Book the clinic appointment', event: 'Book the outpatient appointment', icon: 'calendar-03', status: 'Booked', variant: 'success' },
  7: { action: 'Confirm the patient attendance', event: "Confirm the patient's attendance", icon: 'user-check-01', status: 'Booked', variant: 'success' },
};

@Component({
  selector: 'app-referral-page',
  imports: [
    ModAppShell, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle, ModAppShellActions,
    ModPageHeader, ModPageHeaderBreadcrumb, ModPageHeaderMeta, ModPageHeaderActions, ModBreadcrumbs,
    ModStatusTag, ModTag, ModButton, ModIcon, ModMenuAnchor, ModMenuTrigger, ModMenu, ModMenuItem,
    ModInlineAlert, ModProgressIndicator, ModDescriptionList, ModDescriptionItem, ModTable, ModTableCell,
    ModAvatar, ModTimeline, ModTimelineItem,
  ],
  template: \`
    <mod-app-shell [groups]="menu" [(activeId)]="page" [(collapsed)]="collapsed">
      <img modAppShellLogo src="assets/img/mod-emblem.png" width="40" height="41" alt="Ministry logo" />
      <img modAppShellLogoMark src="assets/img/mod-emblem.png" width="36" height="37" alt="Ministry logo" />
      <span modAppShellTitle>Medical Referral and Patient Transfer Management System</span>
      <mod-avatar modAppShellActions size="32" initials="NQ" label="Noura Al-Qahtani" />

      <mod-page-header
        heading="Referral 2026-000184"
        description="Fahad Al-Otaibi · From: Al Kharj Armed Forces Hospital · Cardiology · Outpatient clinic"
      >
        <mod-breadcrumbs modPageHeaderBreadcrumb [items]="crumbs" (itemSelected)="openCrumb($event)" />
        <mod-status-tag modPageHeaderMeta [variant]="status().variant" statusLabel="Status:">{{ status().label }}</mod-status-tag>
        <mod-tag modPageHeaderMeta variant="warning">Urgent</mod-tag>

        <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="print()">
          <mod-icon name="printer" /> Print
        </button>
        <mod-menu-anchor modPageHeaderActions [(open)]="moreOpen">
          <button mod-button modMenuTrigger variant="secondary-outline" size="medium" type="button">
            More <mod-icon name="arrow-down-01" />
          </button>
          <mod-menu aria-label="More">
            <mod-menu-item icon="note-01" (activated)="openLog()">Notification log</mod-menu-item>
            <mod-menu-item icon="copy-01" (activated)="copyNumber()">Copy the referral number</mod-menu-item>
          </mod-menu>
        </mod-menu-anchor>
        @if (action(); as current) {
          <button modPageHeaderActions mod-button size="medium" type="button" (click)="advance()">{{ current.action }}</button>
        }
      </mod-page-header>

      <div class="stack">
        <!-- Status region: the result of every action is announced here. -->
        <div role="status" aria-live="polite">
          @if (message(); as text) {
            <mod-inline-alert colored dismissible variant="success" [heading]="text" (dismissed)="message.set('')" />
          }
        </div>

        <section class="panel" aria-labelledby="path-title">
          <h2 id="path-title">Referral path</h2>
          <mod-progress-indicator [steps]="steps()" [current]="step()" ariaLabel="Referral path" completedLabel="done" />
        </section>

        <div class="cols">
          <div class="col">
            <section class="panel" aria-labelledby="main-title">
              <h2 id="main-title">Referral data</h2>
              <mod-description-list columns="3" aria-label="Referral data">
                <mod-description-item label="Required service" value="Outpatient clinic" />
                <mod-description-item label="Main specialty" value="Cardiology" />
                <mod-description-item label="Priority"><mod-tag size="xs" variant="warning">Urgent</mod-tag></mod-description-item>
                <mod-description-item label="Case type" value="Outpatient" />
                <mod-description-item label="Patient condition" value="Stable" />
                <mod-description-item label="Referring hospital" value="Al Kharj Armed Forces Hospital" />
                <mod-description-item label="Receiving hospital" value="Prince Sultan Military Medical City in Riyadh" />
                <mod-description-item
                  label="Preliminary diagnosis"
                  value="Unstable angina with suspected multi-vessel coronary artery disease."
                  span="full"
                />
                <mod-description-item label="Referral reason" value="The service is not available at the referring hospital" span="full" />
              </mod-description-list>
            </section>

            <section class="panel" aria-labelledby="patient-title">
              <h2 id="patient-title">Patient data</h2>
              <mod-description-list columns="3" aria-label="Patient data">
                <mod-description-item label="Patient" value="Fahad Al-Otaibi" />
                <!-- Mask identifiers unless the user holds the permission to read them. -->
                <mod-description-item label="National ID" value="1•••••••27" />
                <mod-description-item label="Medical record number" value="48213" />
                <mod-description-item label="Gender" value="Male" />
                <mod-description-item label="Birth date" value="17 Mar 1984" />
                <mod-description-item label="Age" value="42 years" />
              </mod-description-list>
            </section>

            <section class="panel panel--flush" aria-labelledby="files-title">
              <h2 id="files-title">Attachments</h2>
              <mod-table density="compact" label="Attachments" [columns]="fileColumns" [rows]="files" emptyText="This referral has no attachments.">
                <ng-template modTableCell="name" let-row>
                  <span class="file"><mod-icon [name]="row.name.endsWith('.pdf') ? 'pdf-01' : 'image-01'" /> {{ row.name }}</span>
                </ng-template>
                <ng-template modTableCell="download" let-row>
                  <button
                    mod-button variant="secondary-outline" size="small" type="button"
                    [attr.aria-label]="'Download the file ' + row.name"
                    (click)="download(row)"
                  >
                    <mod-icon name="download-01" /> Download
                  </button>
                </ng-template>
              </mod-table>
            </section>
          </div>

          <aside class="col" aria-label="Key facts">
            <section class="panel" aria-labelledby="facts-title">
              <h2 id="facts-title">Key facts</h2>
              <mod-description-list dividers aria-label="Key facts">
                <mod-description-item label="Referral number" value="2026-000184" />
                <mod-description-item label="Current step" [value]="stepNames[step() - 1] ?? status().label" />
                <mod-description-item label="Submitted" value="12 Nov 2026, 08:10" />
                <mod-description-item label="Assigned coordinator">
                  <span class="person"><mod-avatar size="40" initials="NQ" /> Noura Al-Qahtani</span>
                </mod-description-item>
              </mod-description-list>
            </section>

            <section class="panel" aria-labelledby="timeline-title">
              <h2 id="timeline-title">Timeline</h2>
              <mod-timeline compact aria-label="Timeline">
                @for (event of events(); track event.id) {
                  <mod-timeline-item [heading]="event.heading" [time]="event.time" [actor]="event.actor" [tone]="event.tone" [icon]="event.icon">
                    {{ event.note }}
                  </mod-timeline-item>
                }
              </mod-timeline>
            </section>
          </aside>
        </div>
      </div>
    </mod-app-shell>
  \`,
  styles: \`
    /* The widths are those of the shell's main area (container "mod-app-content"), not of the window. */
    .stack, .col { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-3xl); min-width: 0; }
    .cols { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: var(--spacing-3xl); align-items: start; }
    .panel {
      min-width: 0; padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--alpha-white);
    }
    .panel h2 { margin: 0 0 var(--spacing-xl); font-size: 16px; line-height: 24px; font-weight: var(--font-weight-semibold); color: var(--gray-900); }
    .panel--flush { padding: 0; overflow-x: auto; }
    .panel--flush h2 { margin: 0; padding: var(--spacing-xl) var(--spacing-2xl); }
    .file, .person { display: inline-flex; align-items: center; gap: var(--spacing-md); }
    .file mod-icon { color: var(--sa-600); }
    /* The side rail moves below the main column. */
    @container mod-app-content (max-width: 799px) {
      .cols { grid-template-columns: minmax(0, 1fr); }
    }
  \`,
})
export class ReferralPage {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly page = signal('referrals');
  protected readonly collapsed = signal(false);
  protected readonly moreOpen = signal(false);
  protected readonly message = signal('');
  /** 1-based number of the current step; 8 once every step is done. */
  protected readonly step = signal(4);

  protected readonly menu: ModAppShellGroup[] = [
    {
      label: 'Work',
      items: [
        { id: 'home', label: 'Home', icon: 'home-01' },
        { id: 'pending-actions', label: 'Pending actions', icon: 'inbox', badge: 3, badgeLabel: '3 waiting for you' },
        { id: 'referrals', label: 'Referrals', icon: 'left-to-right-list-bullet' },
        { id: 'appointments', label: 'Attendance', icon: 'calendar-03' },
      ],
    },
    { label: 'Setup', items: [{ id: 'my-hospital', label: 'My hospital', icon: 'hospital-01' }] },
  ];

  protected readonly crumbs: ModBreadcrumbItem[] = [{ id: 'referrals', label: 'Referrals' }, { label: '2026-000184' }];

  protected readonly stepNames = [
    'Request submitted', 'Medical need', 'Eligibility', 'Department', 'Accept or reject', 'Appointment booking', 'Attendance and invoice',
  ];
  protected readonly steps = computed<ModProgressStep[]>(() =>
    this.stepNames.map((name, index) => (index + 1 === this.step() ? { name, description: 'Waiting for you now' } : { name })),
  );

  /** The action of the current step; undefined once the case is complete. */
  protected readonly action = computed(() => STEP_ACTIONS[this.step()]);
  protected readonly status = computed(() => {
    const previous = STEP_ACTIONS[this.step() - 1];
    return previous ? { label: previous.status, variant: previous.variant } : { label: 'Receiving hospital review', variant: 'warning' as const };
  });

  /** Replace with the timeline request of the referral (newest first). */
  protected readonly events = signal<CaseEvent[]>([
    { id: 3, heading: 'Confirm the entitlement to treatment', time: '12 Nov 2026, 10:20', actor: 'Salem Al-Qarni · Medical coordinator', tone: 'success', icon: 'checkmark-circle-02', note: 'Eligible' },
    { id: 2, heading: 'Decide the need for transfer', time: '12 Nov 2026, 09:05', actor: 'Dr. Majed Al-Shammari · Medical director', tone: 'success', icon: 'checkmark-circle-02', note: 'Yes, transfer needed' },
    { id: 1, heading: 'Create the referral', time: '12 Nov 2026, 08:10', actor: 'Dr. Yousef Al-Amri · Doctor', tone: 'info', icon: 'medical-file' },
  ]);

  protected readonly fileColumns: ModTableColumn<Attachment>[] = [
    { key: 'type', header: 'Type' },
    { key: 'name', header: 'File name' },
    { key: 'size', header: 'Size' },
    { key: 'by', header: 'Uploaded by' },
    { key: 'at', header: 'Uploaded at' },
    { key: 'download', header: 'Actions' },
  ];

  protected readonly files: Attachment[] = [
    { id: 'a1', type: 'Referral document', name: 'referral-2026-000184.pdf', size: '248.3 KB', by: 'Dr. Yousef Al-Amri', at: '12 Nov 2026, 08:12' },
    { id: 'a2', type: 'Detailed Medical Report', name: 'medical-report.pdf', size: '1.2 MB', by: 'Dr. Yousef Al-Amri', at: '12 Nov 2026, 08:14' },
    { id: 'a3', type: 'Medical Reports / ECG', name: 'ecg-2026-11-10.png', size: '684.0 KB', by: 'Dr. Yousef Al-Amri', at: '12 Nov 2026, 08:15' },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  /** Takes the current step. Replace with the decision request, then reload the referral. */
  protected advance(): void {
    const current = this.action();
    if (!current) return;
    this.events.update((events) => [
      { id: events.length + 1, heading: current.event, time: 'Now', actor: 'Noura Al-Qahtani · Medical coordinator', tone: 'success', icon: current.icon },
      ...events,
    ]);
    this.step.update((step) => step + 1);
    this.say('The decision was saved.');
  }

  protected download(file: Attachment): void {
    // this.referrals.downloadAttachment(file.id)
    this.say(\`The download of \${file.name} has started.\`);
  }

  protected print(): void {
    window.print();
  }

  protected openLog(): void {
    // this.router.navigate(['/notification-log'], { queryParams: { referral: '2026-000184' } });
  }

  protected copyNumber(): void {
    // The clipboard needs a secure context (https): confirm only when the copy worked.
    navigator.clipboard?.writeText('2026-000184').then(
      () => this.say('The referral number was copied.'),
      () => this.say('The number could not be copied. Select it and copy it yourself.'),
    );
  }

  protected openCrumb(selection: ModBreadcrumbSelectEvent): void {
    selection.event.preventDefault();
    // this.router.navigate(['/', selection.item.id]);
  }

  /** Shows a message in the status region and clears it after a while. */
  private say(text: string): void {
    this.message.set(text);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.message.set(''), 6000);
  }
}
`;
