import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModAuthPanel,
  ModButton,
  ModDropdown,
  ModDropdownOption,
  ModInlineAlert,
  ModLink,
  ModTextInput,
  ModTextarea,
  ModIcon,
} from '@mod-internal/ui';
import { EMAIL_PATTERN } from './signup-form';

const DEPARTMENTS = [
  { id: 'referrals', en: 'Medical referrals', ar: 'الإحالات الطبية' },
  { id: 'patients', en: 'Patient affairs', ar: 'شؤون المرضى' },
  { id: 'beds', en: 'Bed management', ar: 'إدارة الأسرّة' },
  { id: 'finance', en: 'Finance and expenses', ar: 'المالية والمصروفات' },
  { id: 'it', en: 'Information technology', ar: 'تقنية المعلومات' },
] as const;

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    system: 'Medical Referrals and Patient Transfer System',
    panelText: 'Accounts are opened by the system administrator after your identity and role are verified.',
    how: [
      'Send the request with your official details',
      'The system administrator reviews it, usually within two working days',
      'You receive an email with a link to set your password',
    ],
    title: 'Request access',
    subtitle:
      'Self sign-up is not available on this system. Fill in the request and the system administrator will review it.',
    nationalId: 'National ID number',
    nationalIdHelp: '10 digits',
    employeeNo: 'Employee number',
    email: 'Work email',
    emailPlaceholder: 'name@example.gov.sa',
    emailHelp: 'Use your official email address',
    department: 'Department',
    departmentPlaceholder: 'Select a department',
    reason: 'Reason for the request',
    reasonPlaceholder: 'Describe the tasks you need the system for',
    reasonHelp: 'At least 20 characters',
    noteTitle: 'Administrator approval is required',
    noteText:
      'Sending the request does not create an account. You can sign in only after the system administrator approves it.',
    submit: 'Send request',
    submitting: 'Sending request...',
    required: 'This field is required',
    nationalIdInvalid: 'Enter the 10-digit national ID number',
    employeeNoInvalid: 'Enter the employee number using digits only',
    emailInvalid: 'Enter a valid email address, for example name@example.gov.sa',
    departmentRequired: 'Select a department',
    reasonShort: 'Write at least 20 characters',
    success: 'Request sent',
    successText:
      'Reference number: REQ-2026-00418. You will be notified by email once the request is reviewed. (This is a demo: nothing was sent.)',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    copyright: '© Organization name 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    system: 'النظام الخاص بإدارة الإحالات الطبية وتحويل المرضى',
    panelText: 'يفتح مدير النظام الحسابات بعد التحقق من هويتك ودورك الوظيفي.',
    how: [
      'أرسل الطلب ببياناتك الرسمية',
      'يراجع مدير النظام الطلب، وغالبًا خلال يومي عمل',
      'تصلك رسالة بريد إلكتروني تتضمن رابط تعيين كلمة المرور',
    ],
    title: 'طلب صلاحية الدخول',
    subtitle: 'التسجيل الذاتي غير متاح في هذا النظام. عبّئ الطلب وسيراجعه مدير النظام.',
    nationalId: 'رقم الهوية الوطنية',
    nationalIdHelp: '10 أرقام',
    employeeNo: 'الرقم الوظيفي',
    email: 'البريد الإلكتروني الرسمي',
    emailPlaceholder: 'name@example.gov.sa',
    emailHelp: 'استخدم بريدك الإلكتروني الرسمي',
    department: 'الإدارة',
    departmentPlaceholder: 'اختر الإدارة',
    reason: 'سبب الطلب',
    reasonPlaceholder: 'اذكر المهام التي تحتاج النظام لأدائها',
    reasonHelp: '20 حرفًا على الأقل',
    noteTitle: 'يتطلب الطلب موافقة مدير النظام',
    noteText: 'إرسال الطلب لا يُنشئ حسابًا. لن تتمكن من الدخول إلا بعد موافقة مدير النظام على الطلب.',
    submit: 'إرسال الطلب',
    submitting: 'جارٍ إرسال الطلب...',
    required: 'هذا الحقل مطلوب',
    nationalIdInvalid: 'أدخل رقم الهوية الوطنية المكوّن من 10 أرقام',
    employeeNoInvalid: 'أدخل الرقم الوظيفي بالأرقام فقط',
    emailInvalid: 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.gov.sa',
    departmentRequired: 'اختر الإدارة',
    reasonShort: 'اكتب 20 حرفًا على الأقل',
    success: 'تم إرسال الطلب',
    successText:
      'الرقم المرجعي: REQ-2026-00418. سيصلك إشعار بالبريد الإلكتروني بعد مراجعة الطلب. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    haveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

type RequestField = 'nationalId' | 'employeeNo' | 'email' | 'department' | 'reason';

/**
 * Request access: the government-internal alternative to self sign-up. The
 * employee identifies themselves (national ID, employee number, work email),
 * picks a department and gives a reason; an administrator approves the
 * request. The dark-green panel explains what happens next.
 */
@Component({
  selector: 'demo-signup-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModAuthPanel,
    ModButton,
    ModDropdown,
    ModInlineAlert,
    ModLink,
    ModTextInput,
    ModTextarea,
    ModIcon,
  ],
  template: `
    <mod-auth-layout [panelTitle]="t().system" [panelText]="t().panelText">
      <ol modAuthPanel class="request-how">
        @for (item of t().how; track item) {
          <li class="request-how__item">
            <span class="request-how__number" aria-hidden="true">{{ $index + 1 }}</span>
            <span>{{ item }}</span>
          </li>
        }
      </ol>

      <img
        modAuthLogo
        src="examples/logo-placeholder.svg"
        width="132"
        height="136"
        [alt]="t().logoAlt"
      />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button">
        <mod-icon name="language-square" /> {{ t().language }}
      </button>

      <mod-auth-header [heading]="t().title" [description]="t().subtitle" underline />

      <form class="request-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (done()) {
          <mod-inline-alert variant="success" colored [heading]="t().success" [message]="t().successText" />
        } @else {
          <mod-inline-alert variant="info" colored [heading]="t().noteTitle" [message]="t().noteText" />
        }

        <mod-text-input
          formControlName="nationalId"
          inputMode="numeric"
          autocomplete="off"
          required
          [maxLength]="10"
          [label]="t().nationalId"
          [error]="!!message('nationalId')"
          [helperText]="message('nationalId') || t().nationalIdHelp"
        />
        <mod-text-input
          formControlName="employeeNo"
          inputMode="numeric"
          autocomplete="off"
          required
          [maxLength]="10"
          [label]="t().employeeNo"
          [error]="!!message('employeeNo')"
          [helperText]="message('employeeNo')"
        />
        <mod-text-input
          formControlName="email"
          type="email"
          autocomplete="email"
          required
          [label]="t().email"
          [placeholder]="t().emailPlaceholder"
          [error]="!!message('email')"
          [helperText]="message('email') || t().emailHelp"
        />
        <div class="request-form__field">
          <mod-dropdown
            formControlName="department"
            [label]="t().department"
            [placeholder]="t().departmentPlaceholder"
            [options]="departments()"
            [error]="!!message('department')"
          />
          @if (message('department'); as text) {
            <span class="request-form__error" role="alert">{{ text }}</span>
          }
        </div>
        <mod-textarea
          formControlName="reason"
          required
          [rows]="4"
          [maxLength]="300"
          [label]="t().reason"
          [placeholder]="t().reasonPlaceholder"
          [error]="!!message('reason')"
          [helperText]="message('reason') || t().reasonHelp"
        />

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? t().submitting : t().submit }}
        </button>

        <p class="request-form__alt">
          {{ t().haveAccount }}
          <a mod-link href="#" (click)="$event.preventDefault()">{{ t().signIn }}</a>
        </p>
      </form>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .request-how {
      display: grid;
      gap: var(--spacing-xl);
      margin: var(--spacing-md) 0 0;
      padding: 0;
      list-style: none;
    }

    .request-how__item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-lg);
      font-size: 15px;
      line-height: 1.7;
      color: var(--sad-100);
    }

    .request-how__number {
      flex-shrink: 0;
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border: 1px solid var(--sa-300);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--sa-300);
    }

    .request-form {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .request-form__field {
      display: grid;
      gap: var(--spacing-md);
    }

    .request-form__error {
      font-size: var(--font-size-xs);
      line-height: 18px;
      color: var(--color-error-700);
    }

    .request-form__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }
  `,
})
export class SignupRequestExample {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly departments = computed<ModDropdownOption<string>[]>(() => {
    const lang = this.lang();
    return DEPARTMENTS.map((department) => ({ value: department.id, label: department[lang] }));
  });

  protected readonly form = new FormGroup({
    nationalId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[12][0-9]{9}$/)],
    }),
    employeeNo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]{3,10}$/)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
    }),
    department: new FormControl('', { nonNullable: true, validators: Validators.required }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20)],
    }),
  });
  protected readonly busy = signal(false);
  protected readonly done = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  /** Error text of a field, or '' while it is valid or not yet visited. */
  protected message(name: RequestField): string {
    const control = this.form.controls[name];
    if (control.valid || !control.touched) return '';
    const t = this.t();
    if (name === 'department') return t.departmentRequired;
    if (control.hasError('required')) return t.required;
    switch (name) {
      case 'nationalId':
        return t.nationalIdInvalid;
      case 'employeeNo':
        return t.employeeNoInvalid;
      case 'email':
        return t.emailInvalid;
      default:
        return t.reasonShort;
    }
  }

  protected submit(): void {
    if (this.busy()) return;
    this.done.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    // Stand-in for the real request.
    this.timer = setTimeout(() => {
      this.busy.set(false);
      this.done.set(true);
      this.form.reset();
    }, 900);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const SIGNUP_REQUEST_CODE = `import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModAuthPanel, ModButton,
  ModDropdown, ModDropdownOption, ModInlineAlert, ModLink, ModTextInput, ModTextarea,
  ModIcon,
} from '@mod-internal/ui';

@Component({
  selector: 'app-request-access',
  imports: [
    ReactiveFormsModule, ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter,
    ModAuthPanel, ModButton, ModDropdown, ModInlineAlert, ModLink, ModTextInput, ModTextarea,
    ModIcon,
  ],
  template: \`
    <mod-auth-layout
      panelTitle="Medical Referrals and Patient Transfer System"
      panelText="Accounts are opened by the system administrator after your identity and role are verified."
    >
      <ol modAuthPanel class="request__how">
        <li>Send the request with your official details</li>
        <li>The system administrator reviews it, usually within two working days</li>
        <li>You receive an email with a link to set your password</li>
      </ol>

      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <mod-auth-header
        heading="Request access"
        description="Self sign-up is not available on this system. Fill in the request and the system administrator will review it."
        underline
      />

      <form class="request" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (reference()) {
          <mod-inline-alert
            variant="success"
            colored
            heading="Request sent"
            [message]="'Reference number: ' + reference() + '. You will be notified by email once the request is reviewed.'"
          />
        } @else if (failed()) {
          <mod-inline-alert variant="error" colored heading="The request could not be sent. Try again." />
        } @else {
          <mod-inline-alert
            variant="info"
            colored
            heading="Administrator approval is required"
            message="Sending the request does not create an account. You can sign in only after the system administrator approves it."
          />
        }

        <mod-text-input
          label="National ID number"
          formControlName="nationalId"
          inputMode="numeric"
          autocomplete="off"
          required
          [maxLength]="10"
          [error]="invalid('nationalId')"
          [helperText]="invalid('nationalId') ? 'Enter the 10-digit national ID number' : '10 digits'"
        />
        <mod-text-input
          label="Employee number"
          formControlName="employeeNo"
          inputMode="numeric"
          autocomplete="off"
          required
          [maxLength]="10"
          [error]="invalid('employeeNo')"
          [helperText]="invalid('employeeNo') ? 'Enter the employee number using digits only' : ''"
        />
        <mod-text-input
          label="Work email"
          type="email"
          formControlName="email"
          autocomplete="email"
          required
          [error]="invalid('email')"
          [helperText]="invalid('email') ? 'Enter a valid email address' : 'Use your official email address'"
        />
        <div>
          <mod-dropdown
            label="Department"
            placeholder="Select a department"
            formControlName="department"
            [options]="departments"
            [error]="invalid('department')"
          />
          @if (invalid('department')) {
            <span class="request__error" role="alert">Select a department</span>
          }
        </div>
        <mod-textarea
          label="Reason for the request"
          placeholder="Describe the tasks you need the system for"
          formControlName="reason"
          required
          [rows]="4"
          [maxLength]="300"
          [error]="invalid('reason')"
          [helperText]="invalid('reason') ? 'Write at least 20 characters' : 'At least 20 characters'"
        />

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? 'Sending request...' : 'Send request' }}
        </button>

        <p class="request__alt">
          Already have an account?
          <a mod-link href="/sign-in">Sign in</a>
        </p>
      </form>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
  styles: \`
    .request {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .request__how {
      display: grid;
      gap: var(--spacing-lg);
      margin: var(--spacing-md) 0 0;
      padding-inline-start: var(--spacing-2xl);
      line-height: 1.7;
      color: var(--sad-100);
    }

    .request__error {
      display: block;
      margin-block-start: var(--spacing-md);
      font-size: var(--font-size-xs);
      color: var(--color-error-700);
    }

    .request__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }
  \`,
})
export class RequestAccess {
  protected readonly departments: ModDropdownOption<string>[] = [
    { value: 'referrals', label: 'Medical referrals' },
    { value: 'patients', label: 'Patient affairs' },
    { value: 'beds', label: 'Bed management' },
    { value: 'finance', label: 'Finance and expenses' },
    { value: 'it', label: 'Information technology' },
  ];

  protected readonly form = new FormGroup({
    nationalId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[12][0-9]{9}$/)],
    }),
    employeeNo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]{3,10}$/)],
    }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    department: new FormControl('', { nonNullable: true, validators: Validators.required }),
    reason: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(20)] }),
  });
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  /** Reference number returned by the server once the request is stored. */
  protected readonly reference = signal('');

  protected invalid(name: 'nationalId' | 'employeeNo' | 'email' | 'department' | 'reason'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected toggleLanguage(): void {
    const root = document.documentElement;
    root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  protected async submit(): Promise<void> {
    this.failed.set(false);
    this.reference.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      const request = this.form.getRawValue();
      // const { reference } = await this.access.request(request);
      // this.reference.set(reference);
      this.form.reset();
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
`;
