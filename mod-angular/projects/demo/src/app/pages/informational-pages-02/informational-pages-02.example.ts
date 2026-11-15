import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import {
  ModAccordion,
  ModAccordionItem,
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
  ModModal,
  ModModalActions,
  ModModalClose,
  ModPageHeader,
  ModPageHeaderActions,
  ModPageHeaderMeta,
  ModStatusTag,
  ModTable,
  ModTableColumn,
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
  SPECIALTIES,
  appNavLabel,
} from '../../shared/app-example/app-example-data';
import { AppExampleShell } from '../../shared/app-example/app-example-shell';

/** Texts of the page. Wording follows the user page and the role profile of a hospital referral portal (en.json / ar.json). */
const TEXT = {
  en: {
    crumb: 'Breadcrumb',
    users: 'Users',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    mustChange: 'Must change password',
    edit: 'Edit',
    reset: 'Reset password',
    deactivate: 'Deactivate',
    activate: 'Activate',
    close: 'Close',
    back: 'Back',
    saved: 'Saved',
    resetDone: 'The password was reset.',
    editInfo: 'The edit panel is not part of this example.',
    listOnly: 'The example shows the user page only.',
    detailTitle: 'User details',
    userName: 'Username',
    fullName: 'Full name',
    nationalId: 'National ID',
    employeeNumber: 'Employee number',
    userType: 'User type',
    mainCenter: 'Main center',
    hospital: 'Hospital',
    language: 'Language',
    arabic: 'Arabic',
    email: 'Email',
    mobile: 'Mobile',
    lastSignIn: 'Last sign-in',
    yes: 'Yes',
    no: 'No',
    rolesTitle: 'Roles and hospital scope',
    role: 'Role',
    department: 'Department',
    assignedAt: 'Assigned on',
    assignedBy: 'Assigned by',
    noRoles: 'No roles assigned.',
    permissionsTitle: 'Roles and permissions',
    permissionsMeta: 'What the roles do on the referral route, and the screens they manage or view.',
    inRoute: 'On the referral route',
    manages: 'Manages',
    viewsOnly: 'Views only',
    activityTitle: 'Account log',
    newestFirst: 'Newest first',
    logTitle: 'Notification log',
    logEmpty: 'No notices.',
    logEmptyText: 'Notices sent to this user by SMS or email will appear here.',
    deactivateConfirm: (name: string) =>
      `Deactivate ${name}? The user is signed out at once and can no longer sign in. Running requests continue as they are. No data is deleted.`,
    lastHolderWarning:
      'This user is the only active holder of these roles at the hospital. After this change nobody holds them until you assign them to another user:',
    deactivateYes: 'Yes, deactivate',
    otherTitle: 'This screen is not part of the example',
    otherText: 'The example shows the user page only. The side bar still works: choose Users to go back.',
    backToUser: 'Back to the user',
  },
  ar: {
    crumb: 'مسار التنقل',
    users: 'المستخدمون',
    status: 'الحالة',
    active: 'فعّال',
    inactive: 'غير فعّال',
    mustChange: 'يجب تغيير كلمة المرور',
    edit: 'تعديل',
    reset: 'إعادة تعيين كلمة المرور',
    deactivate: 'إلغاء التفعيل',
    activate: 'تفعيل',
    close: 'إغلاق',
    back: 'رجوع',
    saved: 'تم الحفظ',
    resetDone: 'تمت إعادة تعيين كلمة المرور.',
    editInfo: 'لوحة التعديل ليست ضمن هذا المثال.',
    listOnly: 'يعرض المثال صفحة المستخدم فقط.',
    detailTitle: 'بيانات المستخدم',
    userName: 'اسم المستخدم',
    fullName: 'الاسم الكامل',
    nationalId: 'الرقم الوطني',
    employeeNumber: 'الرقم الوظيفي',
    userType: 'نوع المستخدم',
    mainCenter: 'المركز الرئيسي',
    hospital: 'المستشفى',
    language: 'اللغة',
    arabic: 'العربية',
    email: 'البريد الإلكتروني',
    mobile: 'الجوال',
    lastSignIn: 'آخر تسجيل دخول',
    yes: 'نعم',
    no: 'لا',
    rolesTitle: 'الأدوار ونطاق المستشفى',
    role: 'الدور',
    department: 'القسم',
    assignedAt: 'تاريخ الإسناد',
    assignedBy: 'أسنده',
    noRoles: 'لا توجد أدوار مسندة.',
    permissionsTitle: 'الأدوار والصلاحيات',
    permissionsMeta: 'ما تفعله الأدوار في مسار الإحالة والشاشات التي تديرها أو تراها.',
    inRoute: 'في مسار الإحالة',
    manages: 'يدير',
    viewsOnly: 'يرى فقط',
    activityTitle: 'سجل الحساب',
    newestFirst: 'الأحدث أولاً',
    logTitle: 'سجل الإشعارات',
    logEmpty: 'لا توجد إشعارات.',
    logEmptyText: 'تظهر هنا الإشعارات المرسلة إلى هذا المستخدم بالرسائل النصية أو البريد الإلكتروني.',
    deactivateConfirm: (name: string) =>
      `هل تريد إلغاء تفعيل ${name}؟ يُسجَّل خروج المستخدم فورًا ولن يتمكن من تسجيل الدخول. تستمر الطلبات الجارية كما هي. لا يتم حذف أي بيانات.`,
    lastHolderWarning:
      'هذا المستخدم هو الوحيد النشط الذي يحمل هذه الأدوار في المستشفى. بعد هذا التغيير لن يحملها أحد حتى تُسندها إلى مستخدم آخر:',
    deactivateYes: 'نعم، إلغاء التفعيل',
    otherTitle: 'هذه الشاشة ليست ضمن المثال',
    otherText: 'يعرض المثال صفحة المستخدم فقط. القائمة الجانبية تعمل: اختر «المستخدمون» للعودة.',
    backToUser: 'العودة إلى المستخدم',
  },
} as const;

/** The user of the example (an invented person; identifiers are masked). */
const USER = {
  name: { en: 'Salem Al-Qarni', ar: 'سالم القرني' } as Bi,
  initials: { en: 'SQ', ar: 'س ق' } as Bi,
  userName: 's.alqarni',
  nationalId: '1•••••••63',
  employeeNumber: 'EMP-20417',
  email: 's.alqarni@hospital.example',
  mobile: '+966 5• ••• ••82',
  lastSignIn: '2026-11-12T08:02:00',
};

const ROLE = {
  coordinator: { en: 'Medical coordinator', ar: 'المنسق الطبي' },
  head: { en: 'Head of medical department', ar: 'رئيس القسم الطبي' },
} as const satisfies Record<string, Bi>;

interface RoleGrant {
  id: string;
  role: Bi;
  department: Bi | null;
  /** ISO date. */
  assignedAt: string;
}

/**
 * A user of the real system holds one role; a user from before that rule may
 * still hold several at the own hospital, as here.
 */
const GRANTS: readonly RoleGrant[] = [
  { id: 'g1', role: ROLE.coordinator, department: null, assignedAt: '2026-03-02T00:00:00' },
  { id: 'g2', role: ROLE.head, department: SPECIALTIES.CARD, assignedAt: '2025-09-14T00:00:00' },
];

/** A role with its texts in the current language (a table row). */
interface GrantRow {
  id: string;
  role: string;
  hospital: string;
  department: string;
  assignedAt: string;
  assignedBy: string;
}

/** What the roles do at each station of the referral route (names of the real role profile). */
const ROUTE_ACTS: readonly { station: Bi; acts: readonly Bi[] }[] = [
  {
    station: { en: 'Check eligibility', ar: 'التحقق من الأحقية' },
    acts: [{ en: "Checks the patient's eligibility for treatment", ar: 'يتحقق من أحقية المريض للعلاج' }],
  },
  {
    station: { en: 'Set the department and action', ar: 'تحديد القسم والإجراء' },
    acts: [{ en: 'Sets the receiving department and the action', ar: 'يحدد القسم المستقبِل والإجراء' }],
  },
  {
    station: { en: 'Accept or reject', ar: 'القبول أو الرفض' },
    acts: [
      { en: 'Accepts or rejects the request', ar: 'يقبل الطلب أو يرفضه' },
      { en: 'Sets the attending doctor and the route', ar: 'يحدد الطبيب المعالج والمسار' },
    ],
  },
  {
    station: { en: 'Book the appointment or bed', ar: 'حجز الموعد أو السرير' },
    acts: [{ en: 'Books the clinic appointment', ar: 'يحجز موعد العيادة' }],
  },
  {
    station: { en: 'Attendance and expenses', ar: 'الحضور والمصروفات' },
    acts: [
      { en: 'Confirms the attendance', ar: 'يؤكد حضور الموعد' },
      { en: 'Enters the expenses and issues the invoice', ar: 'يدخل المصروفات ويصدر الفاتورة' },
    ],
  },
];

const MANAGED_SCREENS: readonly Bi[] = [{ en: 'Referrals', ar: 'الإحالات' }];

const VIEWED_SCREENS: readonly Bi[] = [
  { en: 'Reports and dashboard', ar: 'التقارير ولوحة المؤشرات' },
  { en: 'Hospitals', ar: 'المستشفيات' },
  { en: 'Departments', ar: 'الأقسام' },
  { en: 'Medical procedures', ar: 'الإجراءات الطبية' },
  { en: 'Wards', ar: 'الأجنحة' },
  { en: 'Hospital specialties', ar: 'تخصصات المستشفى' },
];

interface AccountEvent {
  id: number;
  heading: Bi;
  /** ISO date and time. */
  at: string;
  /** Done by the general admin; false: by the user himself. */
  byAdmin: boolean;
  tone: ModTimelineTone;
  icon: string;
  note?: Bi;
}

const EVENT = {
  signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
  roleAssigned: { en: 'The role was assigned.', ar: 'تم إسناد الدور.' },
  resetDone: { en: 'The password was reset.', ar: 'تمت إعادة تعيين كلمة المرور.' },
  created: { en: 'Create user', ar: 'إنشاء المستخدم' },
  deactivated: { en: 'Deactivate', ar: 'إلغاء التفعيل' },
  activated: { en: 'Activate', ar: 'تفعيل' },
} as const satisfies Record<string, Bi>;

/** Account history before the example starts, newest first. */
const INITIAL_EVENTS: readonly AccountEvent[] = [
  { id: 5, heading: EVENT.signIn, at: USER.lastSignIn, byAdmin: false, tone: 'default', icon: 'login-03' },
  { id: 4, heading: EVENT.roleAssigned, at: '2026-03-02T10:15:00', byAdmin: true, tone: 'success', icon: 'user-check-01', note: ROLE.coordinator },
  { id: 3, heading: EVENT.resetDone, at: '2026-03-02T10:12:00', byAdmin: true, tone: 'warning', icon: 'key-01' },
  { id: 2, heading: EVENT.roleAssigned, at: '2025-09-14T09:40:00', byAdmin: true, tone: 'success', icon: 'user-check-01', note: ROLE.head },
  { id: 1, heading: EVENT.created, at: '2025-09-14T09:32:00', byAdmin: true, tone: 'info', icon: 'user' },
];

interface Notice {
  variant: ModInlineAlertVariant;
  text: Bi;
}

function formatDate(iso: string, lang: AppLang, withTime: boolean): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(new Date(iso));
}

/**
 * Informational pages 02: the user page of a hospital referral portal
 * (user-detail and user-scope, with the role profile for the permissions):
 * breadcrumb, header with the avatar, name, status and actions, the user
 * details, the roles with their hospital scope, what the roles may do
 * (accordion), the account log (timeline), an empty notification log and the
 * confirm dialog of "Deactivate" with the last-holder warning.
 *
 * Demo behaviour: Deactivate asks first, then the status changes and the
 * action becomes Activate; Reset password sets "Must change password"; every
 * action adds a line to the account log and a message to the status region.
 */
@Component({
  selector: 'demo-informational-pages-02',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppExampleShell,
    ModPageHeader,
    ModPageHeaderActions,
    ModPageHeaderMeta,
    ModBreadcrumbs,
    ModAvatar,
    ModStatusTag,
    ModButton,
    ModIcon,
    ModInlineAlert,
    ModDescriptionList,
    ModDescriptionItem,
    ModTable,
    ModAccordion,
    ModAccordionItem,
    ModTimeline,
    ModTimelineItem,
    ModEmptyState,
    ModEmptyStateActions,
    ModModal,
    ModModalActions,
    ModModalClose,
  ],
  template: `
    <demo-app-example-shell [lang]="lang()" role="admin" [(activeId)]="page" (languageToggle)="languageToggle.emit()">
      @if (page() === 'users') {
        <mod-breadcrumbs class="info02-crumb" [items]="crumbs()" [aria-label]="t().crumb" (itemSelected)="onCrumb($event)" />

        <div class="info02-head">
          <mod-avatar class="info02-head__avatar" size="68" aria-hidden="true" [initials]="user.initials[lang()]" />
          <mod-page-header class="info02-head__text" [heading]="user.name[lang()]" [description]="summary()">
            <mod-status-tag modPageHeaderMeta [variant]="active() ? 'success' : 'neutral'" [statusLabel]="t().status + ':'">
              {{ active() ? t().active : t().inactive }}
            </mod-status-tag>
            @if (mustChange()) {
              <mod-status-tag modPageHeaderMeta variant="warning">{{ t().mustChange }}</mod-status-tag>
            }

            <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="notify('info', 'editInfo')">
              <mod-icon name="edit-02" /> {{ t().edit }}
            </button>
            <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="resetPassword()">
              <mod-icon name="key-01" /> {{ t().reset }}
            </button>
            @if (active()) {
              <button modPageHeaderActions mod-button destructive size="medium" type="button" (click)="confirming.set(true)">
                {{ t().deactivate }}
              </button>
            } @else {
              <button modPageHeaderActions mod-button size="medium" type="button" (click)="setActive(true)">
                {{ t().activate }}
              </button>
            }
          </mod-page-header>
        </div>

        <div class="app-ex-stack">
          <!-- Status region: the result of every action is announced here. -->
          <div class="info02-status" role="status" aria-live="polite">
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

          <div class="app-ex-cols app-ex-cols--main">
            <div class="info02-col">
              <section class="app-ex-panel" aria-labelledby="info02-details">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info02-details">{{ t().detailTitle }}</h2>
                </div>
                <div class="app-ex-panel__body">
                  <mod-description-list columns="3" [aria-label]="t().detailTitle">
                    <mod-description-item [label]="t().userName"><bdi dir="ltr">{{ user.userName }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().fullName" [value]="user.name[lang()]" />
                    <mod-description-item [label]="t().nationalId"><bdi dir="ltr">{{ user.nationalId }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().employeeNumber"><bdi dir="ltr">{{ user.employeeNumber }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().userType" [value]="t().mainCenter" />
                    <mod-description-item [label]="t().hospital" [value]="hospital()" />
                    <mod-description-item [label]="t().email"><bdi dir="ltr">{{ user.email }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().mobile"><bdi dir="ltr">{{ user.mobile }}</bdi></mod-description-item>
                    <mod-description-item [label]="t().language" [value]="t().arabic" />
                    <mod-description-item [label]="t().lastSignIn" [value]="lastSignIn()" />
                    <mod-description-item [label]="t().mustChange" [value]="mustChange() ? t().yes : t().no" />
                  </mod-description-list>
                </div>
              </section>

              <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="info02-roles">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info02-roles">{{ t().rolesTitle }}</h2>
                  <p class="app-ex-panel__meta">{{ hospital() }}</p>
                </div>
                <div class="app-ex-panel__body">
                  <mod-table
                    density="compact"
                    [label]="t().rolesTitle"
                    [columns]="grantColumns()"
                    [rows]="grants()"
                    [rowKey]="grantKey"
                    [emptyText]="t().noRoles"
                  />
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="info02-permissions">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info02-permissions">{{ t().permissionsTitle }}</h2>
                  <p class="app-ex-panel__meta">{{ t().permissionsMeta }}</p>
                </div>
                <div class="app-ex-panel__body">
                  <mod-accordion size="sm">
                    <mod-accordion-item [heading]="t().inRoute + ' (' + routeActs().length + ')'" [expanded]="true">
                      <ul class="info02-list">
                        @for (entry of routeActs(); track entry.station) {
                          <li>
                            <strong>{{ entry.station }}</strong>
                            <span>{{ entry.acts }}</span>
                          </li>
                        }
                      </ul>
                    </mod-accordion-item>
                    <mod-accordion-item [heading]="t().manages + ' (' + managed().length + ')'">
                      <ul class="info02-list">
                        @for (screen of managed(); track screen) {
                          <li>{{ screen }}</li>
                        }
                      </ul>
                    </mod-accordion-item>
                    <mod-accordion-item [heading]="t().viewsOnly + ' (' + viewed().length + ')'">
                      <ul class="info02-list">
                        @for (screen of viewed(); track screen) {
                          <li>{{ screen }}</li>
                        }
                      </ul>
                    </mod-accordion-item>
                  </mod-accordion>
                </div>
              </section>
            </div>

            <aside class="info02-col" [attr.aria-label]="t().activityTitle">
              <section class="app-ex-panel" aria-labelledby="info02-activity">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info02-activity">{{ t().activityTitle }}</h2>
                  <p class="app-ex-panel__meta">{{ t().newestFirst }}</p>
                </div>
                <div class="app-ex-panel__body">
                  <mod-timeline compact [aria-label]="t().activityTitle">
                    @for (event of timeline(); track event.id) {
                      <mod-timeline-item
                        [heading]="event.heading"
                        [time]="event.time"
                        [actor]="event.actor"
                        [tone]="event.tone"
                        [icon]="event.icon"
                      >@if (event.note) {<span class="info02-note">{{ event.note }}</span>}</mod-timeline-item>
                    }
                  </mod-timeline>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="info02-log">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="info02-log">{{ t().logTitle }}</h2>
                </div>
                <div class="app-ex-panel__body">
                  <mod-empty-state compact icon="notification-03" [level]="3" [heading]="t().logEmpty" [text]="t().logEmptyText">
                    <button
                      modEmptyStateActions
                      mod-button
                      variant="secondary-outline"
                      size="small"
                      type="button"
                      (click)="page.set('notification-settings')"
                    >
                      {{ settingsLabel() }}
                    </button>
                  </mod-empty-state>
                </div>
              </section>
            </aside>
          </div>
        </div>
      } @else {
        <mod-page-header [heading]="otherTitle()" />
        <mod-empty-state bordered icon="user-group" [level]="2" [heading]="t().otherTitle" [text]="t().otherText">
          <button modEmptyStateActions mod-button size="medium" type="button" (click)="page.set('users')">
            {{ t().backToUser }}
          </button>
        </mod-empty-state>
      }
    </demo-app-example-shell>

    <!-- Outside the shell, so the dialog covers the whole window. -->
    <mod-modal
      [(open)]="confirming"
      icon="user-block-01"
      iconColor="error"
      [heading]="t().deactivate"
      [description]="t().deactivateConfirm(user.name[lang()])"
      [closeLabel]="t().close"
    >
      <mod-inline-alert colored variant="warning" [message]="t().lastHolderWarning">
        <ul class="info02-holders">
          @for (grant of grants(); track grant.id) {
            <li>{{ grant.role }} · {{ grant.hospital }}</li>
          }
        </ul>
      </mod-inline-alert>
      <mod-modal-actions>
        <button mod-button modModalClose variant="secondary-outline" size="medium" type="button">{{ t().back }}</button>
        <button mod-button destructive size="medium" type="button" (click)="setActive(false)">{{ t().deactivateYes }}</button>
      </mod-modal-actions>
    </mod-modal>
  `,
  styles: `
    :host {
      display: block;
    }

    .info02-crumb {
      display: block;
      margin-block-end: var(--spacing-lg);
    }

    /* Avatar beside the page header. */
    .info02-head {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-xl);
    }

    .info02-head__avatar {
      flex: none;
    }

    .info02-head__text {
      flex: 1;
      min-width: 0;
    }

    /* Keeps no gap in the stack while there is no message. */
    .info02-status:empty {
      display: none;
    }

    .info02-col {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-3xl);
      min-width: 0;
    }

    .info02-list,
    .info02-holders {
      display: grid;
      gap: var(--spacing-md);
      margin: 0;
      padding-inline-start: var(--spacing-2xl);
      font-size: 14px;
      line-height: 22px;
      color: var(--gray-700);
    }

    .info02-holders {
      margin-block-start: var(--spacing-md);
    }

    .info02-list strong {
      display: block;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .info02-note {
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
    }

    @container mod-app-content (max-width: 479px) {
      .info02-head {
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .info02-head__text {
        width: 100%;
      }
    }
  `,
})
export class InformationalPages02Example {
  private readonly destroyRef = inject(DestroyRef);
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;
  private nextEventId = INITIAL_EVENTS.length + 1;

  readonly lang = input<AppLang>('en');
  /** The language button of the shell was pressed. */
  readonly languageToggle = output<void>();

  protected readonly t = computed(() => TEXT[this.lang()]);
  protected readonly user = USER;

  protected readonly page = signal<string>('users');
  protected readonly active = signal(true);
  protected readonly mustChange = signal(false);
  /** The "Deactivate" confirm dialog is open. */
  protected readonly confirming = signal(false);
  protected readonly events = signal<readonly AccountEvent[]>(INITIAL_EVENTS);
  protected readonly notice = signal<Notice | null>(null);

  protected readonly hospital = computed(() => HOSPITALS.KGH[this.lang()]);
  protected readonly lastSignIn = computed(() => formatDate(USER.lastSignIn, this.lang(), true));

  /** "username · role · hospital" under the name. */
  protected readonly summary = computed(() => [USER.userName, ROLE.coordinator[this.lang()], this.hospital()].join(' · '));

  protected readonly crumbs = computed<ModBreadcrumbItem[]>(() => [
    { id: 'users', label: this.t().users },
    { id: 'user', label: USER.userName },
  ]);

  protected readonly grantColumns = computed<ModTableColumn<GrantRow>[]>(() => {
    const t = this.t();
    return [
      { key: 'role', header: t.role },
      { key: 'hospital', header: t.hospital },
      { key: 'department', header: t.department },
      { key: 'assignedAt', header: t.assignedAt },
      { key: 'assignedBy', header: t.assignedBy },
    ];
  });

  protected readonly grants = computed<GrantRow[]>(() => {
    const lang = this.lang();
    return GRANTS.map((grant) => ({
      id: grant.id,
      role: grant.role[lang],
      hospital: this.hospital(),
      department: grant.department ? grant.department[lang] : '—',
      assignedAt: formatDate(grant.assignedAt, lang, false),
      assignedBy: APP_USERS.admin.name[lang],
    }));
  });

  protected readonly grantKey = (row: GrantRow): string => row.id;

  protected readonly routeActs = computed(() => {
    const lang = this.lang();
    const separator = lang === 'ar' ? '، ' : '; ';
    return ROUTE_ACTS.map((entry) => ({
      station: entry.station[lang],
      acts: entry.acts.map((act) => act[lang]).join(separator),
    }));
  });

  protected readonly managed = computed(() => MANAGED_SCREENS.map((screen) => screen[this.lang()]));
  protected readonly viewed = computed(() => VIEWED_SCREENS.map((screen) => screen[this.lang()]));

  protected readonly timeline = computed(() => {
    const lang = this.lang();
    const admin = `${APP_USERS.admin.name[lang]} · ${APP_USERS.admin.role[lang]}`;
    return this.events().map((event) => ({
      id: event.id,
      heading: event.heading[lang],
      time: formatDate(event.at, lang, true),
      actor: event.byAdmin ? admin : USER.name[lang],
      tone: event.tone,
      icon: event.icon,
      note: event.note?.[lang] ?? '',
    }));
  });

  protected readonly settingsLabel = computed(() => appNavLabel('notification-settings', this.lang()));
  protected readonly otherTitle = computed(() => appNavLabel(this.page() as AppNavId, this.lang()));

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.noticeTimer));
  }

  /** Stand-in for the activate / deactivate request. */
  protected setActive(active: boolean): void {
    this.confirming.set(false);
    this.active.set(active);
    this.log(
      active
        ? { heading: EVENT.activated, tone: 'success', icon: 'user-check-01' }
        : { heading: EVENT.deactivated, tone: 'error', icon: 'user-block-01' },
    );
    this.notify('success', 'saved');
  }

  /** Stand-in for the reset request: the user must choose a new password at the next sign-in. */
  protected resetPassword(): void {
    this.mustChange.set(true);
    this.log({ heading: EVENT.resetDone, tone: 'warning', icon: 'key-01' });
    this.notify('success', 'resetDone');
  }

  protected onCrumb(selection: ModBreadcrumbSelectEvent): void {
    selection.event.preventDefault();
    if (selection.item.id === 'users') this.notify('info', 'listOnly');
  }

  protected notify(variant: ModInlineAlertVariant, key: 'saved' | 'resetDone' | 'editInfo' | 'listOnly'): void {
    this.notice.set({ variant, text: { en: TEXT.en[key], ar: TEXT.ar[key] } });
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice.set(null), 6000);
  }

  /** Adds an action of the signed-in admin to the account log. */
  private log(entry: Pick<AccountEvent, 'heading' | 'tone' | 'icon'>): void {
    const event: AccountEvent = { ...entry, id: this.nextEventId++, at: new Date().toISOString(), byAdmin: true };
    this.events.update((events) => [event, ...events]);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const INFORMATIONAL_PAGES_02_CODE = `import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  ModAccordion, ModAccordionItem, ModAppShell, ModAppShellActions, ModAppShellGroup, ModAppShellLogo, ModAppShellLogoMark,
  ModAppShellTitle, ModAvatar, ModBreadcrumbItem, ModBreadcrumbSelectEvent, ModBreadcrumbs, ModButton, ModDescriptionItem,
  ModDescriptionList, ModEmptyState, ModEmptyStateActions, ModIcon, ModInlineAlert, ModModal, ModModalActions, ModModalClose,
  ModPageHeader, ModPageHeaderActions, ModPageHeaderMeta, ModStatusTag, ModTable, ModTableColumn, ModTimeline, ModTimelineItem,
  ModTimelineTone,
} from '@mod-internal/ui';

interface RoleGrant {
  role: string;
  hospital: string;
  department: string;
  assignedAt: string;
  assignedBy: string;
}

interface AccountEvent {
  id: number;
  heading: string;
  time: string;
  actor: string;
  tone: ModTimelineTone;
  icon: string;
  note?: string;
}

@Component({
  selector: 'app-user-page',
  imports: [
    ModAppShell, ModAppShellLogo, ModAppShellLogoMark, ModAppShellTitle, ModAppShellActions,
    ModPageHeader, ModPageHeaderMeta, ModPageHeaderActions, ModBreadcrumbs, ModAvatar, ModStatusTag, ModButton, ModIcon,
    ModInlineAlert, ModDescriptionList, ModDescriptionItem, ModTable, ModAccordion, ModAccordionItem,
    ModTimeline, ModTimelineItem, ModEmptyState, ModEmptyStateActions, ModModal, ModModalActions, ModModalClose,
  ],
  template: \`
    <mod-app-shell [groups]="menu" [(activeId)]="page" [(collapsed)]="collapsed">
      <img modAppShellLogo src="assets/img/emblem-placeholder.svg" width="40" height="41" alt="Organization logo" />
      <img modAppShellLogoMark src="assets/img/emblem-placeholder.svg" width="36" height="37" alt="Organization logo" />
      <span modAppShellTitle>Medical Referral and Patient Transfer Management System</span>
      <mod-avatar modAppShellActions size="32" initials="SM" label="Saad Al-Mutairi" />

      <mod-breadcrumbs class="crumb" [items]="crumbs" (itemSelected)="openCrumb($event)" />

      <div class="head">
        <mod-avatar size="68" initials="SQ" aria-hidden="true" />
        <mod-page-header class="head__text" heading="Salem Al-Qarni" description="s.alqarni · Medical coordinator · Al Kharj General Hospital">
          <mod-status-tag modPageHeaderMeta [variant]="active() ? 'success' : 'neutral'" statusLabel="Status:">
            {{ active() ? 'Active' : 'Inactive' }}
          </mod-status-tag>
          @if (mustChange()) {
            <mod-status-tag modPageHeaderMeta variant="warning">Must change password</mod-status-tag>
          }

          <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="edit()">
            <mod-icon name="edit-02" /> Edit
          </button>
          <button modPageHeaderActions mod-button variant="secondary-outline" size="medium" type="button" (click)="resetPassword()">
            <mod-icon name="key-01" /> Reset password
          </button>
          @if (active()) {
            <button modPageHeaderActions mod-button destructive size="medium" type="button" (click)="confirming.set(true)">Deactivate</button>
          } @else {
            <button modPageHeaderActions mod-button size="medium" type="button" (click)="setActive(true)">Activate</button>
          }
        </mod-page-header>
      </div>

      <div class="stack">
        <!-- Status region: the result of every action is announced here. -->
        <div role="status" aria-live="polite">
          @if (message(); as text) {
            <mod-inline-alert colored dismissible variant="success" [heading]="text" (dismissed)="message.set('')" />
          }
        </div>

        <div class="cols">
          <div class="col">
            <section class="panel" aria-labelledby="details-title">
              <h2 id="details-title">User details</h2>
              <mod-description-list columns="3" aria-label="User details">
                <mod-description-item label="Username" value="s.alqarni" />
                <mod-description-item label="Full name" value="Salem Al-Qarni" />
                <!-- Mask identifiers unless the user holds the permission to read them. -->
                <mod-description-item label="National ID" value="1•••••••63" />
                <mod-description-item label="Employee number" value="EMP-20417" />
                <mod-description-item label="Hospital" value="Al Kharj General Hospital" />
                <mod-description-item label="Email" value="s.alqarni@hospital.example" />
                <mod-description-item label="Mobile" value="+966 5• ••• ••82" />
                <mod-description-item label="Last sign-in" value="12 Nov 2026, 08:02" />
                <mod-description-item label="Must change password" [value]="mustChange() ? 'Yes' : 'No'" />
              </mod-description-list>
            </section>

            <section class="panel panel--flush" aria-labelledby="roles-title">
              <h2 id="roles-title">Roles and hospital scope</h2>
              <mod-table density="compact" label="Roles and hospital scope" [columns]="roleColumns" [rows]="roles" emptyText="No roles assigned." />
            </section>

            <section class="panel" aria-labelledby="permissions-title">
              <h2 id="permissions-title">Roles and permissions</h2>
              <mod-accordion size="sm">
                <mod-accordion-item heading="On the referral route (3)" [expanded]="true">
                  <ul>
                    <li><strong>Check eligibility</strong> Checks the patient's eligibility for treatment</li>
                    <li><strong>Set the department and action</strong> Sets the receiving department and the action</li>
                    <li><strong>Book the appointment or bed</strong> Books the clinic appointment</li>
                  </ul>
                </mod-accordion-item>
                <mod-accordion-item heading="Manages (1)">
                  <ul><li>Referrals</li></ul>
                </mod-accordion-item>
                <mod-accordion-item heading="Views only (3)">
                  <ul><li>Reports and dashboard</li><li>Hospitals</li><li>Departments</li></ul>
                </mod-accordion-item>
              </mod-accordion>
            </section>
          </div>

          <aside class="col" aria-label="Account log">
            <section class="panel" aria-labelledby="activity-title">
              <h2 id="activity-title">Account log</h2>
              <mod-timeline compact aria-label="Account log">
                @for (event of events(); track event.id) {
                  <mod-timeline-item [heading]="event.heading" [time]="event.time" [actor]="event.actor" [tone]="event.tone" [icon]="event.icon">
                    {{ event.note }}
                  </mod-timeline-item>
                }
              </mod-timeline>
            </section>

            <section class="panel" aria-labelledby="log-title">
              <h2 id="log-title">Notification log</h2>
              <mod-empty-state compact icon="notification-03" heading="No notices." text="Notices sent to this user by SMS or email will appear here.">
                <button modEmptyStateActions mod-button variant="secondary-outline" size="small" type="button" (click)="page.set('notification-settings')">
                  Notification settings
                </button>
              </mod-empty-state>
            </section>
          </aside>
        </div>
      </div>
    </mod-app-shell>

    <mod-modal
      [(open)]="confirming"
      icon="user-block-01"
      iconColor="error"
      heading="Deactivate"
      description="Deactivate Salem Al-Qarni? The user is signed out at once and can no longer sign in. Running requests continue as they are. No data is deleted."
    >
      <mod-inline-alert
        colored
        variant="warning"
        message="This user is the only active holder of these roles at the hospital. After this change nobody holds them until you assign them to another user:"
      >
        <ul>
          @for (role of roles; track role.role) {
            <li>{{ role.role }} · {{ role.hospital }}</li>
          }
        </ul>
      </mod-inline-alert>
      <mod-modal-actions>
        <button mod-button modModalClose variant="secondary-outline" size="medium" type="button">Back</button>
        <button mod-button destructive size="medium" type="button" (click)="setActive(false)">Yes, deactivate</button>
      </mod-modal-actions>
    </mod-modal>
  \`,
  styles: \`
    /* The widths are those of the shell's main area (container "mod-app-content"), not of the window. */
    .crumb { display: block; margin-block-end: var(--spacing-lg); }
    .head { display: flex; align-items: flex-start; gap: var(--spacing-xl); }
    .head__text { flex: 1; min-width: 0; }
    .stack, .col { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-3xl); min-width: 0; }
    .cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--spacing-3xl); align-items: start; }
    .panel {
      min-width: 0; padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--alpha-white);
    }
    .panel h2 { margin: 0 0 var(--spacing-xl); font-size: 16px; line-height: 24px; font-weight: var(--font-weight-semibold); color: var(--gray-900); }
    .panel--flush { padding: 0; overflow-x: auto; }
    .panel--flush h2 { margin: 0; padding: var(--spacing-xl) var(--spacing-2xl); }
    .panel ul { display: grid; gap: var(--spacing-md); margin: 0; padding-inline-start: var(--spacing-2xl); color: var(--gray-700); }
    .panel li strong { display: block; color: var(--gray-900); }
    @container mod-app-content (max-width: 859px) {
      .cols { grid-template-columns: minmax(0, 1fr); }
    }
  \`,
})
export class UserPage {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly page = signal('users');
  protected readonly collapsed = signal(false);
  protected readonly active = signal(true);
  protected readonly mustChange = signal(false);
  protected readonly confirming = signal(false);
  protected readonly message = signal('');

  protected readonly menu: ModAppShellGroup[] = [
    { label: 'Monitoring', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'analytics-01' }] },
    { label: 'Work', items: [{ id: 'referrals', label: 'Referrals', icon: 'left-to-right-list-bullet' }] },
    { label: 'Access', items: [{ id: 'users', label: 'Users', icon: 'user-group' }] },
    { label: 'Notifications', items: [{ id: 'notification-settings', label: 'Notification settings', icon: 'settings-01' }] },
  ];

  protected readonly crumbs: ModBreadcrumbItem[] = [{ id: 'users', label: 'Users' }, { label: 's.alqarni' }];

  protected readonly roleColumns: ModTableColumn<RoleGrant>[] = [
    { key: 'role', header: 'Role' },
    { key: 'hospital', header: 'Hospital' },
    { key: 'department', header: 'Department' },
    { key: 'assignedAt', header: 'Assigned on' },
    { key: 'assignedBy', header: 'Assigned by' },
  ];

  /** Replace with the roles of the user. */
  protected readonly roles: RoleGrant[] = [
    { role: 'Medical coordinator', hospital: 'Al Kharj General Hospital', department: '—', assignedAt: '2 Mar 2026', assignedBy: 'Saad Al-Mutairi' },
    { role: 'Head of medical department', hospital: 'Al Kharj General Hospital', department: 'Cardiology', assignedAt: '14 Sep 2025', assignedBy: 'Saad Al-Mutairi' },
  ];

  /** Replace with the account log request (newest first). */
  protected readonly events = signal<AccountEvent[]>([
    { id: 3, heading: 'Sign in', time: '12 Nov 2026, 08:02', actor: 'Salem Al-Qarni', tone: 'default', icon: 'login-03' },
    { id: 2, heading: 'The role was assigned.', time: '2 Mar 2026, 10:15', actor: 'Saad Al-Mutairi · General admin', tone: 'success', icon: 'user-check-01', note: 'Medical coordinator' },
    { id: 1, heading: 'Create user', time: '14 Sep 2025, 09:32', actor: 'Saad Al-Mutairi · General admin', tone: 'info', icon: 'user' },
  ]);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  /** Replace with the activate / deactivate request. */
  protected setActive(active: boolean): void {
    this.confirming.set(false);
    this.active.set(active);
    this.log(active ? 'Activate' : 'Deactivate', active ? 'success' : 'error', active ? 'user-check-01' : 'user-block-01');
    this.say('Saved');
  }

  /** Replace with the reset request. */
  protected resetPassword(): void {
    this.mustChange.set(true);
    this.log('The password was reset.', 'warning', 'key-01');
    this.say('The password was reset.');
  }

  protected edit(): void {
    // this.router.navigate(['/users', id, 'edit']);
  }

  protected openCrumb(selection: ModBreadcrumbSelectEvent): void {
    selection.event.preventDefault();
    // this.router.navigate(['/', selection.item.id]);
  }

  private log(heading: string, tone: ModTimelineTone, icon: string): void {
    this.events.update((events) => [
      { id: events.length + 1, heading, time: 'Now', actor: 'Saad Al-Mutairi · General admin', tone, icon },
      ...events,
    ]);
  }

  /** Shows a message in the status region and clears it after a while. */
  private say(text: string): void {
    this.message.set(text);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.message.set(''), 6000);
  }
}
`;
