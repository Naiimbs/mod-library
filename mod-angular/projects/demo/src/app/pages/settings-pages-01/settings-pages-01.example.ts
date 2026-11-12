import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ModAppShellItem,
  ModAvatar,
  ModButton,
  ModDescriptionItem,
  ModDescriptionList,
  ModDropdown,
  ModDropdownOption,
  ModEmptyState,
  ModEmptyStateActions,
  ModIcon,
  ModInlineAlert,
  ModMenuSwitch,
  ModModal,
  ModModalActions,
  ModPageHeader,
  ModTab,
  ModTable,
  ModTableCell,
  ModTableColumn,
  ModTabs,
  ModTextInput,
} from '@mod-internal/ui';
import { APP_USERS, AppLang, AppNavId, HOSPITALS, appNavLabel } from '../../shared/app-example/app-example-data';
import { AppExampleShell } from '../../shared/app-example/app-example-shell';

/** Minimum password length of the real system (APP_CONFIG.passwordMinLength). */
const PASSWORD_MIN = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The real rule of the user form: 8 to 15 digits, may start with +. */
const MOBILE = /^\+?\d{8,15}$/;
const PHOTO_MAX_BYTES = 1024 * 1024;

const TEXT = {
  en: {
    title: 'Account settings',
    subtitle: 'Your profile, password and notification preferences.',
    tabsLabel: 'Account settings sections',
    tabProfile: 'Profile',
    tabPassword: 'Password',
    tabNotifications: 'Notifications',
    details: 'User details',
    photo: 'Photo',
    photoHint: 'JPG or PNG, up to 1 MB.',
    upload: 'Upload photo',
    removePhoto: 'Remove',
    photoInvalid: 'Choose a JPG or PNG image of up to 1 MB.',
    fullName: 'Full name',
    userName: 'Username',
    userNameHint: 'The username cannot be changed.',
    contact: 'Contact details',
    email: 'Email',
    mobile: 'Mobile',
    language: 'Language',
    languageHint: 'The language of the screens and of the notices sent to you.',
    langAr: 'Arabic',
    langEn: 'English',
    scope: 'Roles and hospital scope',
    scopeNote: 'Roles are assigned by the general admin.',
    role: 'Role at the hospital',
    hospital: 'Hospital',
    userType: 'User type',
    mainCenter: 'Main center',
    required: 'This field is required.',
    emailInvalid: 'Enter a valid email address.',
    mobileInvalid: 'Enter a phone number of 8 to 15 digits; it may start with +.',
    passwordTitle: 'Change password',
    current: 'Current password',
    next: 'New password',
    confirm: 'Confirm new password',
    hintMin: `Minimum length is ${PASSWORD_MIN} characters. The server checks the final rules.`,
    minLength: `The length must be at least ${PASSWORD_MIN} characters.`,
    mismatch: 'The two passwords do not match.',
    sameAsCurrent: 'The new password must be different from the current password.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    rulesTitle: 'Password rules',
    ruleLength: `At least ${PASSWORD_MIN} characters`,
    ruleDifferent: 'Different from the current password',
    ruleMatch: 'The two passwords match',
    met: 'Met',
    notMet: 'Not met',
    passwordChanged: 'Password changed',
    ntfTitle: 'Notification settings',
    ntfNote: 'In-app notices are always sent. Choose which notices also reach you by email or SMS.',
    ntfType: 'Notification type',
    inApp: 'In-app',
    emailChannel: 'Email',
    sms: 'SMS',
    on: 'On',
    off: 'Off',
    always: 'Always sent',
    inAppFor: (type: string) => `In-app for ${type}`,
    emailFor: (type: string) => `Email for ${type}`,
    smsFor: (type: string) => `SMS for ${type}`,
    resetDefaults: 'Reset to defaults',
    defaultsRestored: 'The default settings were restored. Save to apply them.',
    unsaved: 'You have unsaved changes.',
    noChanges: 'No unsaved changes.',
    fixErrors: 'Check the highlighted fields.',
    save: 'Save',
    cancel: 'Cancel',
    saved: 'Saved',
    close: 'Close',
    discardTitle: 'Discard unsaved changes?',
    discardText: 'Your changes on this page will be lost.',
    discard: 'Discard',
    keep: 'Keep editing',
    otherTitle: 'This screen is not part of the example',
    otherText: 'The example shows the account settings only. The side bar still works: go back to continue.',
    back: 'Back to the account settings',
  },
  ar: {
    title: 'إعدادات الحساب',
    subtitle: 'ملفك الشخصي وكلمة المرور وتفضيلات الإشعارات.',
    tabsLabel: 'أقسام إعدادات الحساب',
    tabProfile: 'الملف الشخصي',
    tabPassword: 'كلمة المرور',
    tabNotifications: 'الإشعارات',
    details: 'بيانات المستخدم',
    photo: 'الصورة الشخصية',
    photoHint: 'بصيغة JPG أو PNG، وبحجم لا يتجاوز 1 ميغابايت.',
    upload: 'رفع صورة',
    removePhoto: 'إزالة',
    photoInvalid: 'اختر صورة بصيغة JPG أو PNG لا يتجاوز حجمها 1 ميغابايت.',
    fullName: 'الاسم الكامل',
    userName: 'اسم المستخدم',
    userNameHint: 'لا يمكن تغيير اسم المستخدم.',
    contact: 'بيانات الاتصال',
    email: 'البريد الإلكتروني',
    mobile: 'الجوال',
    language: 'اللغة',
    languageHint: 'لغة الشاشات والإشعارات المرسلة إليك.',
    langAr: 'العربية',
    langEn: 'الإنجليزية',
    scope: 'الأدوار ونطاق المستشفى',
    scopeNote: 'يُسند مدير النظام الأدوار.',
    role: 'الدور في المستشفى',
    hospital: 'المستشفى',
    userType: 'نوع المستخدم',
    mainCenter: 'المركز الرئيسي',
    required: 'هذا الحقل مطلوب.',
    emailInvalid: 'أدخل عنوان بريد إلكتروني صحيحاً.',
    mobileInvalid: 'أدخل رقم هاتف من 8 إلى 15 رقمًا، ويمكن أن يبدأ بعلامة +.',
    passwordTitle: 'تغيير كلمة المرور',
    current: 'كلمة المرور الحالية',
    next: 'كلمة المرور الجديدة',
    confirm: 'تأكيد كلمة المرور الجديدة',
    hintMin: `الحد الأدنى للطول ${PASSWORD_MIN} أحرف. تتحقق الخدمة من القواعد النهائية.`,
    minLength: `يجب ألا يقل الطول عن ${PASSWORD_MIN} أحرف.`,
    mismatch: 'كلمتا المرور غير متطابقتين.',
    sameAsCurrent: 'يجب أن تختلف كلمة المرور الجديدة عن كلمة المرور الحالية.',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    rulesTitle: 'قواعد كلمة المرور',
    ruleLength: `${PASSWORD_MIN} أحرف على الأقل`,
    ruleDifferent: 'مختلفة عن كلمة المرور الحالية',
    ruleMatch: 'كلمتا المرور متطابقتان',
    met: 'مستوفاة',
    notMet: 'غير مستوفاة',
    passwordChanged: 'تم تغيير كلمة المرور',
    ntfTitle: 'إعدادات الإشعارات',
    ntfNote: 'تُرسل الإشعارات داخل النظام دائمًا. اختر الإشعارات التي تصلك أيضًا بالبريد الإلكتروني أو الرسائل النصية.',
    ntfType: 'نوع الإشعار',
    inApp: 'داخل النظام',
    emailChannel: 'البريد الإلكتروني',
    sms: 'رسالة نصية',
    on: 'مفعّل',
    off: 'متوقف',
    always: 'تُرسل دائمًا',
    inAppFor: (type: string) => `داخل النظام لـ ${type}`,
    emailFor: (type: string) => `البريد الإلكتروني لـ ${type}`,
    smsFor: (type: string) => `الرسائل النصية لـ ${type}`,
    resetDefaults: 'استعادة الإعدادات الافتراضية',
    defaultsRestored: 'تمت استعادة الإعدادات الافتراضية. احفظ لتطبيقها.',
    unsaved: 'لديك تغييرات غير محفوظة.',
    noChanges: 'لا توجد تغييرات غير محفوظة.',
    fixErrors: 'راجع الحقول المحددة.',
    save: 'حفظ',
    cancel: 'إلغاء',
    saved: 'تم الحفظ',
    close: 'إغلاق',
    discardTitle: 'تجاهل التغييرات غير المحفوظة؟',
    discardText: 'ستفقد التغييرات التي أجريتها في هذه الصفحة.',
    discard: 'تجاهل',
    keep: 'متابعة التعديل',
    otherTitle: 'هذه الشاشة ليست ضمن المثال',
    otherText: 'يعرض المثال إعدادات الحساب فقط. القائمة الجانبية تعمل: عُد للمتابعة.',
    back: 'العودة إلى إعدادات الحساب',
  },
} as const;

type NoticeKey = 'saved' | 'passwordChanged' | 'fixErrors' | 'defaultsRestored' | 'photoInvalid';

interface Notice {
  variant: 'success' | 'error' | 'info';
  key: NoticeKey;
}

/** The signed-in user of the example: the medical coordinator (invented person). */
const USER = APP_USERS.coordinator;
const USER_NAME = 'n.alqahtani';

interface Profile {
  /** null = the name as stored (shown in the current language). */
  fullName: string | null;
  email: string;
  mobile: string;
  language: AppLang;
  /** Object URL of the chosen photo; empty = initials. */
  photo: string;
}

const PROFILE: Profile = {
  fullName: null,
  email: 'noura.alqahtani@psmmc.example',
  mobile: '0555550142',
  language: 'ar',
  photo: '',
};

interface Passwords {
  current: string;
  next: string;
  confirm: string;
}

const NO_PASSWORDS: Passwords = { current: '', next: '', confirm: '' };

/** Notification types of the real system (ntf.type.*). */
const NTF_TYPES = [
  { code: 'SUBMITTED', en: 'Referral submitted', ar: 'تقديم طلب الإحالة', inAppOnly: false },
  { code: 'REFERRAL_ACCEPTED', en: 'Referral accepted', ar: 'قبول الإحالة', inAppOnly: false },
  { code: 'REFERRAL_REJECTED', en: 'Referral rejected', ar: 'رفض الإحالة', inAppOnly: false },
  { code: 'NOT_ELIGIBLE', en: 'Not eligible', ar: 'غير مستحق', inAppOnly: false },
  { code: 'APPOINTMENT_BOOKED', en: 'Appointment booked', ar: 'حجز الموعد', inAppOnly: false },
  { code: 'BED_BOOKED', en: 'Bed booked (admission)', ar: 'حجز السرير (التنويم)', inAppOnly: false },
  { code: 'ATTENDANCE_DUE', en: 'Attendance due (in-app only)', ar: 'استحقاق تأكيد الحضور (داخل النظام فقط)', inAppOnly: true },
] as const;

type NtfCode = (typeof NTF_TYPES)[number]['code'];
type Channel = 'email' | 'sms';
type Channels = Record<Channel, boolean>;
type Prefs = Record<NtfCode, Channels>;

const DEFAULT_PREFS: Prefs = {
  SUBMITTED: { email: true, sms: false },
  REFERRAL_ACCEPTED: { email: true, sms: false },
  REFERRAL_REJECTED: { email: true, sms: false },
  NOT_ELIGIBLE: { email: true, sms: false },
  APPOINTMENT_BOOKED: { email: true, sms: true },
  BED_BOOKED: { email: true, sms: true },
  ATTENDANCE_DUE: { email: false, sms: false },
};

/** What the user had saved before (differs from the defaults, so "Reset to defaults" changes something). */
const STORED_PREFS: Prefs = {
  ...DEFAULT_PREFS,
  SUBMITTED: { email: false, sms: false },
  REFERRAL_REJECTED: { email: true, sms: true },
};

interface NtfRow {
  code: NtfCode;
  label: string;
  inAppOnly: boolean;
}

function samePrefs(a: Prefs, b: Prefs): boolean {
  return NTF_TYPES.every(({ code }) => a[code].email === b[code].email && a[code].sms === b[code].sms);
}

function hasError(errors: Record<string, string>): boolean {
  return Object.values(errors).some((message) => message !== '');
}

/**
 * Settings pages 01: the account settings of the signed-in user, adapted from
 * the MODHS Referral Portal: the profile fields of the user form, the password
 * change (minimum length, confirmation) and the notification settings matrix
 * (in-app is always sent; email and SMS per notification type).
 *
 * Demo behaviour: each tab keeps its own draft; the sticky bar saves or
 * cancels the current tab (a short busy state, then a status message); leaving
 * through the side bar with unsaved changes asks first.
 */
@Component({
  selector: 'demo-settings-pages-01',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AppExampleShell,
    ModPageHeader,
    ModTabs,
    ModTab,
    ModTextInput,
    ModDropdown,
    ModAvatar,
    ModButton,
    ModIcon,
    ModInlineAlert,
    ModDescriptionList,
    ModDescriptionItem,
    ModTable,
    ModTableCell,
    ModMenuSwitch,
    ModModal,
    ModModalActions,
    ModEmptyState,
    ModEmptyStateActions,
  ],
  template: `
    <demo-app-example-shell
      [lang]="lang()"
      role="coordinator"
      [(activeId)]="page"
      (languageToggle)="languageToggle.emit()"
      (itemSelect)="onNavigate($event)"
    >
      @if (page() === '') {
        <mod-page-header [heading]="t().title" [description]="t().subtitle" />

        @if (notice(); as message) {
          <mod-inline-alert
            class="set01-notice"
            colored
            dismissible
            [variant]="message.variant"
            [heading]="t()[message.key]"
            [closeLabel]="t().close"
            (dismissed)="notice.set(null)"
          />
        }

        <mod-tabs [(selectedIndex)]="tab" [aria-label]="t().tabsLabel" (selectionChange)="notice.set(null)">
          <mod-tab [label]="t().tabProfile" icon="user">
            <div class="set01-column">
              <section class="app-ex-panel" aria-labelledby="set01-details">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="set01-details">{{ t().details }}</h2>
                </div>
                <div class="app-ex-panel__body set01-fields">
                  <div class="set01-photo">
                    <mod-avatar size="80" [src]="profile().photo" [alt]="fullName()" [initials]="initials()" [label]="fullName()" />
                    <div class="set01-photo__text">
                      <span class="set01-photo__title">{{ t().photo }}</span>
                      <span class="set01-hint">{{ t().photoHint }}</span>
                      <div class="set01-photo__actions">
                        <input
                          #file
                          class="app-ex-sr"
                          type="file"
                          accept="image/png,image/jpeg"
                          tabindex="-1"
                          aria-hidden="true"
                          (change)="onPhoto(file)"
                        />
                        <button mod-button variant="secondary-outline" size="small" type="button" (click)="file.click()">
                          <mod-icon name="upload-04" /> {{ t().upload }}
                        </button>
                        @if (profile().photo) {
                          <button mod-button variant="subtle" size="small" type="button" (click)="patchProfile('photo', '')">
                            <mod-icon name="delete-02" /> {{ t().removePhoto }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="set01-grid">
                    <mod-text-input
                      required
                      name="fullName"
                      autocomplete="name"
                      [label]="t().fullName"
                      [value]="fullName()"
                      [error]="!!profileErrors().fullName"
                      [helperText]="profileErrors().fullName"
                      (valueChange)="patchProfile('fullName', $event)"
                    />
                    <mod-text-input readonly name="userName" [label]="t().userName" [value]="userName" [helperText]="t().userNameHint" />
                  </div>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="set01-contact">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="set01-contact">{{ t().contact }}</h2>
                </div>
                <div class="app-ex-panel__body set01-fields">
                  <div class="set01-grid">
                    <mod-text-input
                      required
                      type="email"
                      name="email"
                      autocomplete="email"
                      leadingIcon="mail-01"
                      [label]="t().email"
                      [value]="profile().email"
                      [error]="!!profileErrors().email"
                      [helperText]="profileErrors().email"
                      (valueChange)="patchProfile('email', $event)"
                    />
                    <mod-text-input
                      optional
                      type="tel"
                      name="mobile"
                      autocomplete="tel"
                      inputMode="tel"
                      placeholder="05XXXXXXXX"
                      leadingIcon="smart-phone-01"
                      [label]="t().mobile"
                      [value]="profile().mobile"
                      [error]="!!profileErrors().mobile"
                      [helperText]="profileErrors().mobile"
                      (valueChange)="patchProfile('mobile', $event)"
                    />
                  </div>
                  <div class="set01-grid">
                    <div>
                      <mod-dropdown
                        [label]="t().language"
                        [options]="languageOptions()"
                        [value]="profile().language"
                        (valueChange)="setLanguage($event)"
                      />
                      <p class="set01-hint set01-hint--field">{{ t().languageHint }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section class="app-ex-panel" aria-labelledby="set01-scope">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="set01-scope">{{ t().scope }}</h2>
                  <p class="app-ex-panel__meta">{{ t().scopeNote }}</p>
                </div>
                <div class="app-ex-panel__body">
                  <mod-description-list columns="3" [aria-label]="t().scope">
                    <mod-description-item [label]="t().role" [value]="roleName()" />
                    <mod-description-item [label]="t().hospital" [value]="hospitalName()" />
                    <mod-description-item [label]="t().userType" [value]="t().mainCenter" />
                  </mod-description-list>
                </div>
              </section>
            </div>
          </mod-tab>

          <mod-tab [label]="t().tabPassword" icon="square-lock-02">
            <div class="set01-column">
              <section class="app-ex-panel" aria-labelledby="set01-password">
                <div class="app-ex-panel__head">
                  <h2 class="app-ex-panel__title" id="set01-password">{{ t().passwordTitle }}</h2>
                </div>
                <div class="app-ex-panel__body set01-fields">
                  <div class="set01-narrow">
                    <mod-text-input
                      required
                      passwordToggle
                      type="password"
                      name="currentPassword"
                      autocomplete="current-password"
                      [label]="t().current"
                      [value]="passwords().current"
                      [showPasswordLabel]="t().showPassword"
                      [hidePasswordLabel]="t().hidePassword"
                      [error]="!!passwordErrors().current"
                      [helperText]="passwordErrors().current"
                      (valueChange)="patchPassword('current', $event)"
                    />
                    <mod-text-input
                      required
                      passwordToggle
                      type="password"
                      name="newPassword"
                      autocomplete="new-password"
                      [label]="t().next"
                      [value]="passwords().next"
                      [showPasswordLabel]="t().showPassword"
                      [hidePasswordLabel]="t().hidePassword"
                      [error]="!!passwordErrors().next"
                      [helperText]="passwordErrors().next || t().hintMin"
                      (valueChange)="patchPassword('next', $event)"
                    />
                    <mod-text-input
                      required
                      passwordToggle
                      type="password"
                      name="confirmPassword"
                      autocomplete="new-password"
                      [label]="t().confirm"
                      [value]="passwords().confirm"
                      [showPasswordLabel]="t().showPassword"
                      [hidePasswordLabel]="t().hidePassword"
                      [error]="!!passwordErrors().confirm"
                      [helperText]="passwordErrors().confirm"
                      (valueChange)="patchPassword('confirm', $event)"
                    />
                  </div>

                  <div class="set01-rules">
                    <h3 class="set01-rules__title" id="set01-rules">{{ t().rulesTitle }}</h3>
                    <ul class="set01-rules__list" aria-labelledby="set01-rules">
                      @for (rule of rules(); track rule.id) {
                        <li class="set01-rule" [class.is-met]="rule.met">
                          <mod-icon [name]="rule.met ? 'checkmark-circle-02' : 'circle'" />
                          <span>{{ rule.label }}</span>
                          <span class="app-ex-sr">: {{ rule.met ? t().met : t().notMet }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </mod-tab>

          <mod-tab [label]="t().tabNotifications" icon="notification-03">
            <div class="set01-column set01-column--wide">
              <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="set01-ntf">
                <div class="app-ex-panel__head">
                  <div>
                    <h2 class="app-ex-panel__title" id="set01-ntf">{{ t().ntfTitle }}</h2>
                    <p class="app-ex-panel__meta">{{ t().ntfNote }}</p>
                  </div>
                  <button mod-button variant="secondary-outline" size="small" type="button" [disabled]="isDefault() || busy()" (click)="resetDefaults()">
                    <mod-icon name="refresh" /> {{ t().resetDefaults }}
                  </button>
                </div>
                <div class="app-ex-panel__body">
                  <mod-table [label]="t().ntfTitle" [columns]="ntfColumns()" [rows]="ntfRows()" [rowKey]="ntfKey">
                    <ng-template modTableCell="inApp" let-row>
                      <span class="set01-switch">
                        <mod-menu-switch disabled [checked]="true" [aria-label]="t().inAppFor(row.label)" />
                        <span aria-hidden="true">{{ t().always }}</span>
                      </span>
                    </ng-template>
                    <ng-template modTableCell="email" let-row>
                      <span class="set01-switch">
                        <mod-menu-switch
                          [checked]="channel(row.code, 'email')"
                          [disabled]="row.inAppOnly || busy()"
                          [aria-label]="t().emailFor(row.label)"
                          (checkedChange)="setChannel(row.code, 'email', $event)"
                        />
                        <span aria-hidden="true">{{ channel(row.code, 'email') ? t().on : t().off }}</span>
                      </span>
                    </ng-template>
                    <ng-template modTableCell="sms" let-row>
                      <span class="set01-switch">
                        <mod-menu-switch
                          [checked]="channel(row.code, 'sms')"
                          [disabled]="row.inAppOnly || busy()"
                          [aria-label]="t().smsFor(row.label)"
                          (checkedChange)="setChannel(row.code, 'sms', $event)"
                        />
                        <span aria-hidden="true">{{ channel(row.code, 'sms') ? t().on : t().off }}</span>
                      </span>
                    </ng-template>
                  </mod-table>
                </div>
              </section>
            </div>
          </mod-tab>
        </mod-tabs>

        <div class="set01-footer">
          <p class="set01-footer__state" role="status">
            @if (dirty()) {
              <mod-icon name="alert-02" /> {{ t().unsaved }}
            } @else {
              {{ t().noChanges }}
            }
          </p>
          <div class="set01-footer__actions">
            <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="!dirty() || busy()" (click)="cancel()">
              {{ t().cancel }}
            </button>
            <button mod-button size="medium" type="button" [loading]="busy()" [disabled]="!dirty() || busy()" (click)="save()">
              {{ t().save }}
            </button>
          </div>
        </div>
      } @else {
        <mod-page-header [heading]="otherTitle()" />
        <mod-empty-state bordered icon="settings-01" [level]="2" [heading]="t().otherTitle" [text]="t().otherText">
          <button modEmptyStateActions mod-button size="medium" type="button" (click)="page.set('')">
            {{ t().back }}
          </button>
        </mod-empty-state>
      }
    </demo-app-example-shell>

    <mod-modal
      icon="alert-02"
      iconColor="warning"
      [(open)]="leaveOpen"
      [heading]="t().discardTitle"
      [description]="t().discardText"
      [closeLabel]="t().close"
    >
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" size="medium" type="button" (click)="leaveOpen.set(false)">
          {{ t().keep }}
        </button>
        <button mod-button destructive size="medium" type="button" (click)="discardAndLeave()">{{ t().discard }}</button>
      </mod-modal-actions>
    </mod-modal>
  `,
  styles: `
    demo-settings-pages-01 {
      display: block;
    }

    .set01-notice {
      margin-block-end: var(--spacing-2xl);
    }

    /* One readable column under the tabs. */
    .set01-column {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-3xl);
      max-width: 760px;
      padding-block-start: var(--spacing-3xl);
    }

    .set01-column--wide {
      max-width: 920px;
    }

    .set01-fields {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-2xl);
    }

    .set01-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--spacing-2xl);
      align-items: start;
    }

    .set01-narrow {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-2xl);
      max-width: 360px;
    }

    .set01-photo {
      display: flex;
      align-items: center;
      gap: var(--spacing-2xl);
    }

    .set01-photo__text {
      display: grid;
      gap: var(--spacing-xs);
      min-width: 0;
    }

    .set01-photo__title {
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .set01-photo__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      margin-block-start: var(--spacing-md);
    }

    .set01-hint {
      margin: 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
    }

    .set01-hint--field {
      margin-block-start: var(--spacing-sm);
    }

    .set01-rules {
      padding: var(--spacing-xl) var(--spacing-2xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--gray-50);
    }

    .set01-rules__title {
      margin: 0 0 var(--spacing-md);
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .set01-rules__list {
      display: grid;
      gap: var(--spacing-md);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .set01-rule {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: 14px;
      line-height: 20px;
      color: var(--gray-600);
    }

    .set01-rule mod-icon {
      font-size: 18px;
      color: var(--gray-400);
    }

    .set01-rule.is-met {
      color: var(--gray-900);
    }

    .set01-rule.is-met mod-icon {
      color: var(--sa-600);
    }

    .set01-switch {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
      white-space: nowrap;
    }

    /* Sticky action bar: stays at the bottom edge of the shell's main area. */
    .set01-footer {
      position: sticky;
      /* Stick to the outer edge of the main area, past its padding. */
      inset-block-end: calc(var(--mod-app-shell-main-padding, 24px) * -1);
      z-index: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md) var(--spacing-2xl);
      margin: var(--spacing-3xl) calc(var(--mod-app-shell-main-padding, 24px) * -1) calc(var(--mod-app-shell-main-padding, 24px) * -1);
      padding: var(--spacing-xl) var(--spacing-3xl);
      border-block-start: 1px solid var(--gray-200);
      background: var(--alpha-white);
    }

    .set01-footer__state {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin: 0;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray-700);
    }

    .set01-footer__state mod-icon {
      font-size: 18px;
      color: var(--warning-600);
    }

    .set01-footer__actions {
      display: flex;
      gap: var(--spacing-md);
    }

    @container mod-app-content (max-width: 599px) {
      .set01-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .set01-narrow {
        max-width: none;
      }

      .set01-photo {
        align-items: flex-start;
      }

      .set01-footer__actions {
        flex: 1;
      }

      .set01-footer__actions .btn {
        flex: 1;
      }
    }
  `,
})
export class SettingsPages01Example {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;
  /** Object URLs created for chosen photos (released when the example is destroyed). */
  private readonly photoUrls: string[] = [];

  readonly lang = input<AppLang>('en');
  /** The language button of the shell was pressed. */
  readonly languageToggle = output<void>();

  protected readonly t = computed(() => TEXT[this.lang()]);
  protected readonly userName = USER_NAME;

  /** '' = the account settings; anything else is a side bar item outside the example. */
  protected readonly page = signal<string>('');
  protected readonly tab = signal(0);
  protected readonly busy = signal(false);
  protected readonly notice = signal<Notice | null>(null);
  protected readonly leaveOpen = signal(false);
  private readonly pendingPage = signal('');

  // --- Profile ---
  private readonly profileSaved = signal<Profile>(PROFILE);
  protected readonly profile = signal<Profile>(PROFILE);
  private readonly profileTried = signal(false);

  private readonly storedName = computed(() => USER.name[this.lang()]);
  protected readonly fullName = computed(() => this.profile().fullName ?? this.storedName());
  protected readonly initials = computed(() => USER.initials[this.lang()]);
  protected readonly roleName = computed(() => USER.role[this.lang()]);
  protected readonly hospitalName = computed(() => (USER.hospital ? HOSPITALS[USER.hospital][this.lang()] : ''));

  protected readonly languageOptions = computed<ModDropdownOption<AppLang>[]>(() => [
    { value: 'ar', label: this.t().langAr },
    { value: 'en', label: this.t().langEn },
  ]);

  private readonly profileDirty = computed(() => {
    const draft = this.profile();
    const saved = this.profileSaved();
    return (
      this.fullName() !== (saved.fullName ?? this.storedName()) ||
      draft.email !== saved.email ||
      draft.mobile !== saved.mobile ||
      draft.language !== saved.language ||
      draft.photo !== saved.photo
    );
  });

  /** Messages of the profile fields; empty until the first save attempt. */
  protected readonly profileErrors = computed(() => {
    const t = this.t();
    const errors = { fullName: '', email: '', mobile: '' };
    if (!this.profileTried()) return errors;
    const draft = this.profile();
    if (!this.fullName().trim()) errors.fullName = t.required;
    if (!draft.email.trim()) errors.email = t.required;
    else if (!EMAIL.test(draft.email.trim())) errors.email = t.emailInvalid;
    if (draft.mobile.trim() && !MOBILE.test(draft.mobile.trim())) errors.mobile = t.mobileInvalid;
    return errors;
  });

  // --- Password ---
  protected readonly passwords = signal<Passwords>(NO_PASSWORDS);
  private readonly passwordTried = signal(false);

  private readonly passwordDirty = computed(() => {
    const value = this.passwords();
    return value.current !== '' || value.next !== '' || value.confirm !== '';
  });

  /** The live checklist under the fields. */
  protected readonly rules = computed(() => {
    const t = this.t();
    const { current, next, confirm } = this.passwords();
    return [
      { id: 'length', label: t.ruleLength, met: next.length >= PASSWORD_MIN },
      { id: 'different', label: t.ruleDifferent, met: next !== '' && next !== current },
      { id: 'match', label: t.ruleMatch, met: next !== '' && next === confirm },
    ];
  });

  protected readonly passwordErrors = computed(() => {
    const t = this.t();
    const errors = { current: '', next: '', confirm: '' };
    if (!this.passwordTried()) return errors;
    const { current, next, confirm } = this.passwords();
    if (!current) errors.current = t.required;
    if (!next) errors.next = t.required;
    else if (next.length < PASSWORD_MIN) errors.next = t.minLength;
    else if (next === current) errors.next = t.sameAsCurrent;
    if (!confirm) errors.confirm = t.required;
    else if (confirm !== next) errors.confirm = t.mismatch;
    return errors;
  });

  // --- Notifications ---
  private readonly prefsSaved = signal<Prefs>(STORED_PREFS);
  private readonly prefs = signal<Prefs>(STORED_PREFS);
  private readonly prefsDirty = computed(() => !samePrefs(this.prefs(), this.prefsSaved()));
  protected readonly isDefault = computed(() => samePrefs(this.prefs(), DEFAULT_PREFS));

  protected readonly ntfRows = computed<NtfRow[]>(() => {
    const lang = this.lang();
    return NTF_TYPES.map((type) => ({ code: type.code, label: type[lang], inAppOnly: type.inAppOnly }));
  });

  protected readonly ntfColumns = computed<ModTableColumn<NtfRow>[]>(() => {
    const t = this.t();
    return [
      { key: 'label', header: t.ntfType },
      { key: 'inApp', header: t.inApp },
      { key: 'email', header: t.emailChannel },
      { key: 'sms', header: t.sms },
    ];
  });

  protected readonly ntfKey = (row: NtfRow): string => row.code;

  // --- The sticky bar works on the current tab ---
  protected readonly dirty = computed(() => {
    switch (this.tab()) {
      case 1:
        return this.passwordDirty();
      case 2:
        return this.prefsDirty();
      default:
        return this.profileDirty();
    }
  });

  private readonly anyDirty = computed(() => this.profileDirty() || this.passwordDirty() || this.prefsDirty());

  protected readonly otherTitle = computed(() => appNavLabel(this.page() as AppNavId, this.lang()));

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.timer);
      for (const url of this.photoUrls) URL.revokeObjectURL(url);
    });
  }

  protected patchProfile<K extends keyof Profile>(key: K, value: Profile[K]): void {
    this.profile.update((profile) => ({ ...profile, [key]: value }));
  }

  protected setLanguage(value: AppLang | AppLang[] | null): void {
    if (value === 'ar' || value === 'en') this.patchProfile('language', value);
  }

  protected onPhoto(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > PHOTO_MAX_BYTES) {
      this.notice.set({ variant: 'error', key: 'photoInvalid' });
      return;
    }
    const url = URL.createObjectURL(file);
    this.photoUrls.push(url);
    this.notice.set(null);
    this.patchProfile('photo', url);
  }

  protected patchPassword(key: keyof Passwords, value: string): void {
    this.passwords.update((passwords) => ({ ...passwords, [key]: value }));
  }

  protected channel(code: NtfCode, channel: Channel): boolean {
    return this.prefs()[code][channel];
  }

  protected setChannel(code: NtfCode, channel: Channel, value: boolean): void {
    this.prefs.update((prefs) => ({ ...prefs, [code]: { ...prefs[code], [channel]: value } }));
  }

  protected resetDefaults(): void {
    this.prefs.set(DEFAULT_PREFS);
    this.notice.set({ variant: 'info', key: 'defaultsRestored' });
  }

  /** Puts the current tab back to what is stored. */
  protected cancel(): void {
    this.notice.set(null);
    this.resetTab(this.tab());
  }

  /** Stand-in for the save request of the current tab: validation, a short busy state, then the status message. */
  protected save(): void {
    if (this.busy()) return;
    const tab = this.tab();
    if (tab === 0) {
      this.profileTried.set(true);
      if (hasError(this.profileErrors())) return this.notice.set({ variant: 'error', key: 'fixErrors' });
    } else if (tab === 1) {
      this.passwordTried.set(true);
      if (hasError(this.passwordErrors())) return this.notice.set({ variant: 'error', key: 'fixErrors' });
    }
    this.notice.set(null);
    this.busy.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (tab === 0) {
        this.profileSaved.set({ ...this.profile(), fullName: this.fullName().trim() });
        this.profile.set(this.profileSaved());
        this.profileTried.set(false);
      } else if (tab === 1) {
        this.resetTab(1);
      } else {
        this.prefsSaved.set(this.prefs());
      }
      this.busy.set(false);
      this.notice.set({ variant: 'success', key: tab === 1 ? 'passwordChanged' : 'saved' });
    }, 700);
  }

  /** A side bar item was chosen: with unsaved changes, stay and ask first. */
  protected onNavigate(item: ModAppShellItem): void {
    if (!this.anyDirty()) return;
    this.pendingPage.set(item.id);
    this.page.set('');
    this.leaveOpen.set(true);
  }

  protected discardAndLeave(): void {
    this.resetTab(0);
    this.resetTab(1);
    this.resetTab(2);
    this.notice.set(null);
    this.leaveOpen.set(false);
    this.page.set(this.pendingPage());
  }

  private resetTab(tab: number): void {
    if (tab === 0) {
      this.profile.set(this.profileSaved());
      this.profileTried.set(false);
    } else if (tab === 1) {
      this.passwords.set(NO_PASSWORDS);
      this.passwordTried.set(false);
    } else {
      this.prefs.set(this.prefsSaved());
    }
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const SETTINGS_PAGES_01_CODE = `import { Component, computed, signal } from '@angular/core';
import {
  ModAppShell, ModAppShellActions, ModAppShellGroup, ModAppShellLogo, ModAppShellTitle, ModAvatar, ModButton,
  ModDropdown, ModDropdownOption, ModIcon, ModInlineAlert, ModMenuSwitch, ModPageHeader, ModTab, ModTable,
  ModTableCell, ModTableColumn, ModTabs, ModTextInput,
} from '@mod-internal/ui';

const PASSWORD_MIN = 8;
const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const MOBILE = /^\\+?\\d{8,15}$/;

interface Profile { fullName: string; email: string; mobile: string; language: string; }
interface Channels { email: boolean; sms: boolean; }
interface NoticeType { code: string; label: string; inAppOnly?: boolean; }

@Component({
  selector: 'app-account-settings',
  imports: [
    ModAppShell, ModAppShellLogo, ModAppShellTitle, ModAppShellActions, ModPageHeader, ModTabs, ModTab,
    ModTextInput, ModDropdown, ModAvatar, ModButton, ModIcon, ModInlineAlert, ModTable, ModTableCell, ModMenuSwitch,
  ],
  template: \`
    <mod-app-shell [groups]="menu" [(activeId)]="page">
      <img modAppShellLogo src="assets/img/mod-emblem.png" width="40" height="41" alt="Ministry logo" />
      <span modAppShellTitle>Medical Referral and Patient Transfer Management System</span>
      <mod-avatar modAppShellActions size="32" initials="NQ" label="Noura Al-Qahtani" />

      <mod-page-header heading="Account settings" description="Your profile, password and notification preferences." />

      @if (message(); as text) {
        <mod-inline-alert variant="success" colored dismissible [heading]="text" (dismissed)="message.set('')" />
      }

      <mod-tabs [(selectedIndex)]="tab" aria-label="Account settings sections">
        <mod-tab label="Profile" icon="user">
          <div class="column">
            <section class="panel" aria-labelledby="details-title">
              <h2 id="details-title">User details</h2>
              <div class="photo">
                <mod-avatar size="80" initials="NQ" label="Noura Al-Qahtani" />
                <button mod-button variant="secondary-outline" size="small" type="button">
                  <mod-icon name="upload-04" /> Upload photo
                </button>
              </div>
              <div class="grid">
                <mod-text-input
                  required label="Full name" autocomplete="name"
                  [value]="profile().fullName" (valueChange)="patch('fullName', $event)"
                  [error]="!!errors().fullName" [helperText]="errors().fullName"
                />
                <mod-text-input readonly label="Username" value="n.alqahtani" helperText="The username cannot be changed." />
              </div>
            </section>

            <section class="panel" aria-labelledby="contact-title">
              <h2 id="contact-title">Contact details</h2>
              <div class="grid">
                <mod-text-input
                  required type="email" label="Email" autocomplete="email" leadingIcon="mail-01"
                  [value]="profile().email" (valueChange)="patch('email', $event)"
                  [error]="!!errors().email" [helperText]="errors().email"
                />
                <mod-text-input
                  optional type="tel" label="Mobile" placeholder="05XXXXXXXX" leadingIcon="smart-phone-01"
                  [value]="profile().mobile" (valueChange)="patch('mobile', $event)"
                  [error]="!!errors().mobile" [helperText]="errors().mobile"
                />
                <mod-dropdown label="Language" [options]="languages" [value]="profile().language" (valueChange)="patch('language', '' + $event)" />
              </div>
            </section>
          </div>
        </mod-tab>

        <mod-tab label="Password" icon="square-lock-02">
          <div class="column">
            <section class="panel" aria-labelledby="password-title">
              <h2 id="password-title">Change password</h2>
              <div class="narrow">
                <mod-text-input required passwordToggle type="password" label="Current password" autocomplete="current-password" [(value)]="current" />
                <mod-text-input
                  required passwordToggle type="password" label="New password" autocomplete="new-password" [(value)]="next"
                  helperText="Minimum length is 8 characters. The server checks the final rules."
                />
                <mod-text-input required passwordToggle type="password" label="Confirm new password" autocomplete="new-password" [(value)]="confirm" />
              </div>
              <h3 id="rules-title">Password rules</h3>
              <ul class="rules" aria-labelledby="rules-title">
                @for (rule of rules(); track rule.label) {
                  <li [class.is-met]="rule.met">
                    <mod-icon [name]="rule.met ? 'checkmark-circle-02' : 'circle'" />
                    {{ rule.label }}
                    <span class="sr-only">: {{ rule.met ? 'Met' : 'Not met' }}</span>
                  </li>
                }
              </ul>
            </section>
          </div>
        </mod-tab>

        <mod-tab label="Notifications" icon="notification-03">
          <div class="column column--wide">
            <section class="panel panel--flush" aria-labelledby="ntf-title">
              <div class="panel__head">
                <h2 id="ntf-title">Notification settings</h2>
                <button mod-button variant="secondary-outline" size="small" type="button" (click)="prefs.set(defaults)">
                  <mod-icon name="refresh" /> Reset to defaults
                </button>
              </div>
              <mod-table label="Notification settings" [columns]="columns" [rows]="types">
                <ng-template modTableCell="inApp" let-row>
                  <mod-menu-switch disabled [checked]="true" [aria-label]="'In-app for ' + row.label" /> Always sent
                </ng-template>
                <ng-template modTableCell="email" let-row>
                  <mod-menu-switch
                    [checked]="prefs()[row.code].email" [disabled]="!!row.inAppOnly" [aria-label]="'Email for ' + row.label"
                    (checkedChange)="setChannel(row.code, 'email', $event)"
                  />
                  {{ prefs()[row.code].email ? 'On' : 'Off' }}
                </ng-template>
                <ng-template modTableCell="sms" let-row>
                  <mod-menu-switch
                    [checked]="prefs()[row.code].sms" [disabled]="!!row.inAppOnly" [aria-label]="'SMS for ' + row.label"
                    (checkedChange)="setChannel(row.code, 'sms', $event)"
                  />
                  {{ prefs()[row.code].sms ? 'On' : 'Off' }}
                </ng-template>
              </mod-table>
            </section>
          </div>
        </mod-tab>
      </mod-tabs>

      <div class="footer">
        <p role="status">{{ dirty() ? 'You have unsaved changes.' : 'No unsaved changes.' }}</p>
        <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="!dirty() || busy()" (click)="cancel()">Cancel</button>
        <button mod-button size="medium" type="button" [loading]="busy()" [disabled]="!dirty() || busy()" (click)="save()">Save</button>
      </div>
    </mod-app-shell>
  \`,
  styles: \`
    /* The widths are those of the shell's main area (container "mod-app-content"), not of the window. */
    .column { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-3xl); max-width: 760px; padding-block-start: var(--spacing-3xl); }
    .column--wide { max-width: 920px; }
    .panel {
      display: grid; gap: var(--spacing-2xl); min-width: 0; padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--alpha-white);
    }
    .panel h2 { margin: 0; font-size: 16px; line-height: 24px; font-weight: var(--font-weight-semibold); color: var(--gray-900); }
    .panel h3 { margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--font-weight-semibold); color: var(--gray-900); }
    .panel--flush { padding: 0; gap: 0; }
    .panel__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--spacing-md); padding: var(--spacing-xl) var(--spacing-2xl); }
    .photo { display: flex; align-items: center; gap: var(--spacing-2xl); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-2xl); align-items: start; }
    .narrow { display: grid; gap: var(--spacing-2xl); max-width: 360px; }
    .rules { display: grid; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; color: var(--gray-600); }
    .rules li { display: flex; align-items: center; gap: var(--spacing-md); }
    .rules li.is-met { color: var(--gray-900); }
    .rules li.is-met mod-icon { color: var(--sa-600); }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
    .footer {
      position: sticky; inset-block-end: 0; z-index: 1;
      display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-md);
      margin: var(--spacing-3xl) calc(var(--mod-app-shell-main-padding, 24px) * -1) calc(var(--mod-app-shell-main-padding, 24px) * -1);
      padding: var(--spacing-xl) var(--spacing-3xl);
      border-block-start: 1px solid var(--gray-200); background: var(--alpha-white);
    }
    .footer p { flex: 1; margin: 0; font-size: 14px; color: var(--gray-700); }
    @container mod-app-content (max-width: 599px) {
      .grid { grid-template-columns: minmax(0, 1fr); }
      .narrow { max-width: none; }
    }
  \`,
})
export class AccountSettings {
  protected readonly page = signal('');
  protected readonly tab = signal(0);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  private readonly tried = signal(false);

  protected readonly menu: ModAppShellGroup[] = [
    {
      label: 'Work',
      items: [
        { id: 'home', label: 'Home', icon: 'home-01' },
        { id: 'referrals', label: 'Referrals', icon: 'left-to-right-list-bullet' },
      ],
    },
  ];

  // Profile: the stored values and the draft being edited.
  private readonly stored = signal<Profile>({ fullName: 'Noura Al-Qahtani', email: 'noura.alqahtani@psmmc.example', mobile: '0555550142', language: 'ar' });
  protected readonly profile = signal<Profile>(this.stored());
  protected readonly languages: ModDropdownOption<string>[] = [
    { value: 'ar', label: 'Arabic' },
    { value: 'en', label: 'English' },
  ];

  /** Field messages; empty until the first save attempt. */
  protected readonly errors = computed(() => {
    const errors = { fullName: '', email: '', mobile: '' };
    if (!this.tried()) return errors;
    const p = this.profile();
    if (!p.fullName.trim()) errors.fullName = 'This field is required.';
    if (!p.email.trim()) errors.email = 'This field is required.';
    else if (!EMAIL.test(p.email.trim())) errors.email = 'Enter a valid email address.';
    if (p.mobile.trim() && !MOBILE.test(p.mobile.trim())) errors.mobile = 'Enter a phone number of 8 to 15 digits; it may start with +.';
    return errors;
  });

  // Password
  protected readonly current = signal('');
  protected readonly next = signal('');
  protected readonly confirm = signal('');
  protected readonly rules = computed(() => [
    { label: 'At least 8 characters', met: this.next().length >= PASSWORD_MIN },
    { label: 'Different from the current password', met: this.next() !== '' && this.next() !== this.current() },
    { label: 'The two passwords match', met: this.next() !== '' && this.next() === this.confirm() },
  ]);

  // Notifications: in-app is always sent; email and SMS per notification type.
  protected readonly types: NoticeType[] = [
    { code: 'SUBMITTED', label: 'Referral submitted' },
    { code: 'REFERRAL_ACCEPTED', label: 'Referral accepted' },
    { code: 'REFERRAL_REJECTED', label: 'Referral rejected' },
    { code: 'APPOINTMENT_BOOKED', label: 'Appointment booked' },
    { code: 'BED_BOOKED', label: 'Bed booked (admission)' },
    { code: 'ATTENDANCE_DUE', label: 'Attendance due (in-app only)', inAppOnly: true },
  ];
  protected readonly columns: ModTableColumn<NoticeType>[] = [
    { key: 'label', header: 'Notification type' },
    { key: 'inApp', header: 'In-app' },
    { key: 'email', header: 'Email' },
    { key: 'sms', header: 'SMS' },
  ];
  protected readonly defaults: Record<string, Channels> = {
    SUBMITTED: { email: true, sms: false },
    REFERRAL_ACCEPTED: { email: true, sms: false },
    REFERRAL_REJECTED: { email: true, sms: false },
    APPOINTMENT_BOOKED: { email: true, sms: true },
    BED_BOOKED: { email: true, sms: true },
    ATTENDANCE_DUE: { email: false, sms: false },
  };
  private readonly storedPrefs = signal(this.defaults);
  protected readonly prefs = signal(this.defaults);

  /** Unsaved changes of the current tab. */
  protected readonly dirty = computed(() => {
    if (this.tab() === 1) return this.current() !== '' || this.next() !== '' || this.confirm() !== '';
    if (this.tab() === 2) return JSON.stringify(this.prefs()) !== JSON.stringify(this.storedPrefs());
    return JSON.stringify(this.profile()) !== JSON.stringify(this.stored());
  });

  protected patch(key: keyof Profile, value: string): void {
    this.profile.update((profile) => ({ ...profile, [key]: value }));
  }

  protected setChannel(code: string, channel: keyof Channels, value: boolean): void {
    this.prefs.update((prefs) => ({ ...prefs, [code]: { ...prefs[code], [channel]: value } }));
  }

  protected cancel(): void {
    if (this.tab() === 0) this.profile.set(this.stored());
    else if (this.tab() === 1) this.clearPasswords();
    else this.prefs.set(this.storedPrefs());
    this.tried.set(false);
  }

  protected save(): void {
    const tab = this.tab();
    if (tab === 0) {
      this.tried.set(true);
      if (Object.values(this.errors()).some(Boolean)) return;
    }
    if (tab === 1 && !this.rules().every((rule) => rule.met)) return;
    this.busy.set(true);
    // Replace the timer with the request of the tab (profile, password or notification settings).
    setTimeout(() => {
      if (tab === 0) this.stored.set(this.profile());
      else if (tab === 1) this.clearPasswords();
      else this.storedPrefs.set(this.prefs());
      this.tried.set(false);
      this.busy.set(false);
      this.message.set(tab === 1 ? 'Password changed' : 'Saved');
    }, 700);
  }

  private clearPasswords(): void {
    this.current.set('');
    this.next.set('');
    this.confirm.set('');
  }
}
`;
