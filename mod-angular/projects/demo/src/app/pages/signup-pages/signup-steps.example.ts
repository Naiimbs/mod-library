import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModDropdown,
  ModDropdownOption,
  ModInlineAlert,
  ModLink,
  ModProgressIndicator,
  ModProgressStep,
  ModRadio,
  ModRadioGroup,
  ModTextInput,
  ModIcon,
} from '@mod-internal/ui';
import { DemoPasswordRules, passwordRulesValidator } from './password-rules';
import { EMAIL_PATTERN } from './signup-form';

const REGIONS = [
  { id: 'riyadh', en: 'Riyadh', ar: 'الرياض' },
  { id: 'makkah', en: 'Makkah', ar: 'مكة المكرمة' },
  { id: 'madinah', en: 'Madinah', ar: 'المدينة المنورة' },
  { id: 'eastern', en: 'Eastern Province', ar: 'المنطقة الشرقية' },
  { id: 'qassim', en: 'Qassim', ar: 'القصيم' },
  { id: 'asir', en: 'Asir', ar: 'عسير' },
  { id: 'tabuk', en: 'Tabuk', ar: 'تبوك' },
  { id: 'hail', en: 'Hail', ar: 'حائل' },
  { id: 'northern', en: 'Northern Borders', ar: 'الحدود الشمالية' },
  { id: 'jazan', en: 'Jazan', ar: 'جازان' },
  { id: 'najran', en: 'Najran', ar: 'نجران' },
  { id: 'bahah', en: 'Al Bahah', ar: 'الباحة' },
  { id: 'jawf', en: 'Al Jawf', ar: 'الجوف' },
] as const;

const ROLES = [
  {
    id: 'coordinator',
    en: 'Referral coordinator',
    ar: 'منسق إحالات',
    helpEn: 'Creates referral requests and follows them',
    helpAr: 'ينشئ طلبات الإحالة ويتابعها',
  },
  {
    id: 'physician',
    en: 'Physician',
    ar: 'طبيب',
    helpEn: 'Reviews requests and gives the medical decision',
    helpAr: 'يراجع الطلبات ويصدر القرار الطبي',
  },
  {
    id: 'admin',
    en: 'Administrative officer',
    ar: 'موظف إداري',
    helpEn: 'Handles bookings, attendance and expenses',
    helpAr: 'يتولى الحجوزات والحضور والمصروفات',
  },
] as const;

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    title: 'Create your account',
    subtitle: 'Three short steps. You can go back at any time before submitting.',
    steps: ['Account', 'Organisation', 'Review'],
    stepTitles: ['Account details', 'Your organisation', 'Review and submit'],
    progressLabel: 'Registration steps',
    stepLabel: 'Step',
    completed: 'completed',
    current: 'current',
    upcoming: 'upcoming',
    fullName: 'Full name',
    email: 'Work email',
    emailPlaceholder: 'name@example.gov.sa',
    password: 'Password',
    show: 'Show password',
    hide: 'Hide password',
    rulesTitle: 'The password must contain:',
    rules: {
      length: 'At least 8 characters',
      number: 'At least one number',
      upper: 'At least one upper-case letter',
      special: 'At least one special character (such as ! # $ %)',
    },
    met: 'met',
    notMet: 'not met',
    region: 'Region',
    regionPlaceholder: 'Select a region',
    unit: 'Hospital or unit',
    role: 'Your role in the system',
    reviewIntro: 'Check your details before creating the account. Use Back to change anything.',
    back: 'Back',
    next: 'Next',
    create: 'Create account',
    creating: 'Creating account...',
    required: 'This field is required',
    emailInvalid: 'Enter a valid email address, for example name@example.gov.sa',
    passwordWeak: 'The password does not meet all the rules below',
    regionRequired: 'Select a region',
    roleRequired: 'Select your role',
    success: 'Account created',
    successText: 'A verification link was sent to your work email. (This is a demo: nothing was sent.)',
    goSignIn: 'Go to sign in',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    copyright: '© Organization name 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    title: 'إنشاء حسابك',
    subtitle: 'ثلاث خطوات قصيرة. يمكنك الرجوع في أي وقت قبل الإرسال.',
    steps: ['الحساب', 'جهة العمل', 'المراجعة'],
    stepTitles: ['بيانات الحساب', 'جهة العمل', 'المراجعة والإرسال'],
    progressLabel: 'خطوات التسجيل',
    stepLabel: 'الخطوة',
    completed: 'مكتملة',
    current: 'الحالية',
    upcoming: 'قادمة',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني الرسمي',
    emailPlaceholder: 'name@example.gov.sa',
    password: 'كلمة المرور',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    rulesTitle: 'يجب أن تحتوي كلمة المرور على:',
    rules: {
      length: '8 أحرف على الأقل',
      number: 'رقم واحد على الأقل',
      upper: 'حرف إنجليزي كبير واحد على الأقل',
      special: 'رمز خاص واحد على الأقل (مثل ! # $ %)',
    },
    met: 'مستوفى',
    notMet: 'غير مستوفى',
    region: 'المنطقة',
    regionPlaceholder: 'اختر المنطقة',
    unit: 'المستشفى أو الوحدة',
    role: 'دورك في النظام',
    reviewIntro: 'راجع بياناتك قبل إنشاء الحساب. استخدم زر «السابق» لتعديل أي بيان.',
    back: 'السابق',
    next: 'التالي',
    create: 'إنشاء الحساب',
    creating: 'جارٍ إنشاء الحساب...',
    required: 'هذا الحقل مطلوب',
    emailInvalid: 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.gov.sa',
    passwordWeak: 'كلمة المرور لا تستوفي جميع الشروط أدناه',
    regionRequired: 'اختر المنطقة',
    roleRequired: 'اختر دورك',
    success: 'تم إنشاء الحساب',
    successText: 'أُرسل رابط التحقق إلى بريدك الإلكتروني الرسمي. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    goSignIn: 'الانتقال إلى تسجيل الدخول',
    haveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

type AccountField = 'fullName' | 'email' | 'password';
type OrganisationField = 'region' | 'unit' | 'role';

/**
 * Multi-step sign-up in a card: Account, Organisation, Review. The progress
 * indicator shows the position; Next validates only the current step, Back
 * keeps what was typed, and the last step shows a summary before submitting.
 */
@Component({
  selector: 'demo-signup-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModButton,
    ModDropdown,
    ModInlineAlert,
    ModLink,
    ModProgressIndicator,
    ModRadio,
    ModRadioGroup,
    ModTextInput,
    DemoPasswordRules,
    ModIcon,
  ],
  template: `
    <mod-auth-layout variant="centered" card muted>
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

      <mod-auth-header [heading]="t().title" [description]="t().subtitle" />

      <mod-progress-indicator
        class="signup-steps__progress"
        [steps]="steps()"
        [current]="done() ? 4 : step()"
        [ariaLabel]="t().progressLabel"
        [stepLabel]="t().stepLabel"
        [completedLabel]="t().completed"
        [currentLabel]="t().current"
        [upcomingLabel]="t().upcoming"
      />

      @if (done()) {
        <mod-inline-alert variant="success" colored [heading]="t().success" [message]="t().successText" />
        <p class="signup-steps__alt">
          <a mod-link href="#" (click)="$event.preventDefault()">{{ t().goSignIn }}</a>
        </p>
      } @else {
        <form class="signup-steps" [formGroup]="form" (ngSubmit)="next()" novalidate>
          <h2 #stepHeading class="signup-steps__title" tabindex="-1">{{ t().stepTitles[step() - 1] }}</h2>

          @switch (step()) {
            @case (1) {
              <div class="signup-steps__fields" formGroupName="account">
                <mod-text-input
                  formControlName="fullName"
                  autocomplete="name"
                  required
                  [label]="t().fullName"
                  [error]="!!accountMessage('fullName')"
                  [helperText]="accountMessage('fullName')"
                />
                <mod-text-input
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  required
                  [label]="t().email"
                  [placeholder]="t().emailPlaceholder"
                  [error]="!!accountMessage('email')"
                  [helperText]="accountMessage('email')"
                />
                <mod-text-input
                  formControlName="password"
                  type="password"
                  autocomplete="new-password"
                  passwordToggle
                  required
                  [label]="t().password"
                  [showPasswordLabel]="t().show"
                  [hidePasswordLabel]="t().hide"
                  [error]="!!accountMessage('password')"
                  [helperText]="accountMessage('password')"
                />
                <demo-password-rules
                  [password]="form.controls.account.controls.password.value"
                  [heading]="t().rulesTitle"
                  [labels]="t().rules"
                  [metLabel]="t().met"
                  [notMetLabel]="t().notMet"
                />
              </div>
            }
            @case (2) {
              <div class="signup-steps__fields" formGroupName="organisation">
                <div class="signup-steps__field">
                  <mod-dropdown
                    formControlName="region"
                    [label]="t().region"
                    [placeholder]="t().regionPlaceholder"
                    [options]="regions()"
                    [error]="!!organisationMessage('region')"
                  />
                  @if (organisationMessage('region'); as message) {
                    <span class="signup-steps__error" role="alert">{{ message }}</span>
                  }
                </div>
                <mod-text-input
                  formControlName="unit"
                  autocomplete="organization"
                  required
                  [label]="t().unit"
                  [error]="!!organisationMessage('unit')"
                  [helperText]="organisationMessage('unit')"
                />
                <div class="signup-steps__field">
                  <span class="signup-steps__label" id="signup-steps-role-label">{{ t().role }}</span>
                  <mod-radio-group formControlName="role" required ariaLabelledby="signup-steps-role-label">
                    @for (role of roles(); track role.value) {
                      <mod-radio [value]="role.value" [label]="role.label" [helperText]="role.help" />
                    }
                  </mod-radio-group>
                  @if (organisationMessage('role'); as message) {
                    <span class="signup-steps__error" role="alert">{{ message }}</span>
                  }
                </div>
              </div>
            }
            @default {
              <p class="signup-steps__intro">{{ t().reviewIntro }}</p>
              <dl class="signup-steps__review">
                @for (row of review(); track row.label) {
                  <div class="signup-steps__review-row">
                    <dt>{{ row.label }}</dt>
                    <dd>{{ row.value }}</dd>
                  </div>
                }
              </dl>
            }
          }

          <div class="signup-steps__actions">
            @if (step() > 1) {
              <button mod-button type="button" variant="secondary-outline" [disabled]="busy()" (click)="back()">
                {{ t().back }}
              </button>
            }
            <button mod-button type="submit" style="margin-inline-start: auto;" [disabled]="busy()">
              @if (step() < 3) {
                {{ t().next }}
              } @else {
                {{ busy() ? t().creating : t().create }}
              }
            </button>
          </div>
        </form>

        <p class="signup-steps__alt">
          {{ t().haveAccount }}
          <a mod-link href="#" (click)="$event.preventDefault()">{{ t().signIn }}</a>
        </p>
      }

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .signup-steps__progress {
      width: 100%;
    }

    .signup-steps,
    .signup-steps__fields {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .signup-steps__title {
      margin: 0;
      font-size: var(--font-size-lg);
      line-height: 28px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .signup-steps__field {
      display: grid;
      gap: var(--spacing-md);
    }

    .signup-steps__label {
      font-size: var(--font-size-sm);
      line-height: 20px;
      color: var(--gray-900);
    }

    .signup-steps__error {
      font-size: var(--font-size-xs);
      line-height: 18px;
      color: var(--color-error-700);
    }

    .signup-steps__intro {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--gray-600);
    }

    .signup-steps__review {
      margin: 0;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
    }

    .signup-steps__review-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--spacing-xs) var(--spacing-xl);
      padding: var(--spacing-lg) var(--spacing-xl);
      font-size: var(--font-size-sm);
      line-height: 20px;
    }

    .signup-steps__review-row + .signup-steps__review-row {
      border-block-start: 1px solid var(--gray-200);
    }

    .signup-steps__review-row dt {
      color: var(--gray-500);
    }

    .signup-steps__review-row dd {
      margin: 0;
      font-weight: var(--font-weight-medium);
      color: var(--gray-900);
      overflow-wrap: anywhere;
    }

    .signup-steps__actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .signup-steps__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }
  `,
})
export class SignupStepsExample {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly stepHeading = viewChild<ElementRef<HTMLElement>>('stepHeading');
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly steps = computed<ModProgressStep[]>(() => {
    const names: readonly string[] = this.t().steps;
    return names.map((name) => ({ name }));
  });
  protected readonly regions = computed<ModDropdownOption<string>[]>(() => {
    const lang = this.lang();
    return REGIONS.map((region) => ({ value: region.id, label: region[lang] }));
  });
  protected readonly roles = computed(() => {
    const arabic = this.lang() === 'ar';
    return ROLES.map((role) => ({
      value: role.id as string,
      label: arabic ? role.ar : role.en,
      help: arabic ? role.helpAr : role.helpEn,
    }));
  });

  protected readonly form = new FormGroup({
    account: new FormGroup({
      fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, passwordRulesValidator],
      }),
    }),
    organisation: new FormGroup({
      region: new FormControl('', { nonNullable: true, validators: Validators.required }),
      unit: new FormControl('', { nonNullable: true, validators: Validators.required }),
      role: new FormControl('', { nonNullable: true, validators: Validators.required }),
    }),
  });

  /** 1-based number of the step shown. */
  protected readonly step = signal(1);
  protected readonly busy = signal(false);
  protected readonly done = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected accountMessage(name: AccountField): string {
    const control = this.form.controls.account.controls[name];
    if (control.valid || !control.touched) return '';
    const t = this.t();
    if (control.hasError('required')) return t.required;
    return name === 'email' ? t.emailInvalid : t.passwordWeak;
  }

  protected organisationMessage(name: OrganisationField): string {
    const control = this.form.controls.organisation.controls[name];
    if (control.valid || !control.touched) return '';
    const t = this.t();
    if (name === 'region') return t.regionRequired;
    if (name === 'role') return t.roleRequired;
    return t.required;
  }

  /** Rows of the summary on the last step. The password is never shown. */
  protected review(): { label: string; value: string }[] {
    const t = this.t();
    const { account, organisation } = this.form.getRawValue();
    return [
      { label: t.fullName, value: account.fullName },
      { label: t.email, value: account.email },
      { label: t.region, value: this.regions().find((item) => item.value === organisation.region)?.label ?? '' },
      { label: t.unit, value: organisation.unit },
      { label: t.role, value: this.roles().find((item) => item.value === organisation.role)?.label ?? '' },
    ];
  }

  protected back(): void {
    if (this.busy() || this.step() === 1) return;
    this.goTo(this.step() - 1);
  }

  /** Form submit: validates the current step and moves on, or sends the request on the last step. */
  protected next(): void {
    if (this.busy()) return;
    const step = this.step();
    if (step < 3) {
      const group = step === 1 ? this.form.controls.account : this.form.controls.organisation;
      if (group.invalid) {
        group.markAllAsTouched();
        return;
      }
      this.goTo(step + 1);
      return;
    }
    this.busy.set(true);
    // Stand-in for the real registration request.
    this.timer = setTimeout(() => {
      this.busy.set(false);
      this.done.set(true);
    }, 900);
  }

  private goTo(step: number): void {
    this.step.set(step);
    // Move focus to the step title so keyboard and screen-reader users land on the new step.
    afterNextRender(() => this.stepHeading()?.nativeElement.focus(), { injector: this.injector });
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const SIGNUP_STEPS_CODE = `import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModButton, ModDropdown,
  ModDropdownOption, ModInlineAlert, ModLink, ModProgressIndicator, ModProgressStep, ModRadio,
  ModRadioGroup, ModTextInput,
  ModIcon,
} from '@mod-internal/ui';

/** At least 8 characters with a number, an upper-case letter and a special character. */
const PASSWORD = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[^A-Za-z0-9 ]).{8,}$/;

@Component({
  selector: 'app-sign-up',
  imports: [
    ReactiveFormsModule, ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter,
    ModButton, ModDropdown, ModInlineAlert, ModLink, ModProgressIndicator, ModRadio, ModRadioGroup,
    ModTextInput,
    ModIcon,
  ],
  template: \`
    <mod-auth-layout variant="centered" card muted>
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <mod-auth-header
        heading="Create your account"
        description="Three short steps. You can go back at any time before submitting."
      />

      <mod-progress-indicator [steps]="steps" [current]="step()" ariaLabel="Registration steps" style="width: 100%;" />

      <form class="sign-up" [formGroup]="form" (ngSubmit)="next()" novalidate>
        @if (failed()) {
          <mod-inline-alert variant="error" colored heading="The account could not be created. Try again." />
        }

        @switch (step()) {
          @case (1) {
            <div class="sign-up__fields" formGroupName="account">
              <mod-text-input
                label="Full name"
                formControlName="fullName"
                autocomplete="name"
                required
                [error]="invalid('account.fullName')"
                [helperText]="invalid('account.fullName') ? 'This field is required' : ''"
              />
              <mod-text-input
                label="Work email"
                type="email"
                formControlName="email"
                autocomplete="email"
                required
                [error]="invalid('account.email')"
                [helperText]="invalid('account.email') ? 'Enter a valid email address' : ''"
              />
              <mod-text-input
                label="Password"
                type="password"
                formControlName="password"
                autocomplete="new-password"
                passwordToggle
                required
                [error]="invalid('account.password')"
                helperText="At least 8 characters, with a number, an upper-case letter and a special character"
              />
            </div>
          }
          @case (2) {
            <div class="sign-up__fields" formGroupName="organisation">
              <div>
                <mod-dropdown
                  label="Region"
                  placeholder="Select a region"
                  formControlName="region"
                  [options]="regions"
                  [error]="invalid('organisation.region')"
                />
                @if (invalid('organisation.region')) {
                  <span class="sign-up__error" role="alert">Select a region</span>
                }
              </div>
              <mod-text-input
                label="Hospital or unit"
                formControlName="unit"
                required
                [error]="invalid('organisation.unit')"
                [helperText]="invalid('organisation.unit') ? 'This field is required' : ''"
              />
              <div>
                <span class="sign-up__label" id="role-label">Your role in the system</span>
                <mod-radio-group formControlName="role" required ariaLabelledby="role-label">
                  <mod-radio value="coordinator" label="Referral coordinator" helperText="Creates referral requests and follows them" />
                  <mod-radio value="physician" label="Physician" helperText="Reviews requests and gives the medical decision" />
                  <mod-radio value="admin" label="Administrative officer" helperText="Handles bookings, attendance and expenses" />
                </mod-radio-group>
                @if (invalid('organisation.role')) {
                  <span class="sign-up__error" role="alert">Select your role</span>
                }
              </div>
            </div>
          }
          @default {
            <dl class="sign-up__review">
              <div><dt>Full name</dt><dd>{{ form.controls.account.controls.fullName.value }}</dd></div>
              <div><dt>Work email</dt><dd>{{ form.controls.account.controls.email.value }}</dd></div>
              <div><dt>Region</dt><dd>{{ regionLabel() }}</dd></div>
              <div><dt>Hospital or unit</dt><dd>{{ form.controls.organisation.controls.unit.value }}</dd></div>
              <div><dt>Role</dt><dd>{{ form.controls.organisation.controls.role.value }}</dd></div>
            </dl>
          }
        }

        <div class="sign-up__actions">
          @if (step() > 1) {
            <button mod-button type="button" variant="secondary-outline" [disabled]="busy()" (click)="step.set(step() - 1)">
              Back
            </button>
          }
          <button mod-button type="submit" style="margin-inline-start: auto;" [disabled]="busy()">
            {{ step() < 3 ? 'Next' : busy() ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
  styles: \`
    .sign-up,
    .sign-up__fields {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .sign-up__label {
      display: block;
      margin-block-end: var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .sign-up__error {
      display: block;
      margin-block-start: var(--spacing-md);
      font-size: var(--font-size-xs);
      color: var(--color-error-700);
    }

    .sign-up__review {
      margin: 0;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
    }

    .sign-up__review div {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--spacing-xs) var(--spacing-xl);
      padding: var(--spacing-lg) var(--spacing-xl);
    }

    .sign-up__review div + div {
      border-block-start: 1px solid var(--gray-200);
    }

    .sign-up__review dt {
      color: var(--gray-500);
    }

    .sign-up__review dd {
      margin: 0;
      font-weight: var(--font-weight-medium);
    }

    .sign-up__actions {
      display: flex;
      gap: var(--spacing-lg);
    }
  \`,
})
export class SignUp {
  protected readonly steps: ModProgressStep[] = [{ name: 'Account' }, { name: 'Organisation' }, { name: 'Review' }];
  protected readonly regions: ModDropdownOption<string>[] = [
    { value: 'riyadh', label: 'Riyadh' },
    { value: 'makkah', label: 'Makkah' },
    { value: 'madinah', label: 'Madinah' },
    { value: 'eastern', label: 'Eastern Province' },
    // ...the remaining regions
  ];

  protected readonly form = new FormGroup({
    account: new FormGroup({
      fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(PASSWORD)] }),
    }),
    organisation: new FormGroup({
      region: new FormControl('', { nonNullable: true, validators: Validators.required }),
      unit: new FormControl('', { nonNullable: true, validators: Validators.required }),
      role: new FormControl('', { nonNullable: true, validators: Validators.required }),
    }),
  });

  /** 1-based number of the step shown. */
  protected readonly step = signal(1);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  /** path is "group.control", for example "account.email". */
  protected invalid(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && control.touched;
  }

  protected regionLabel(): string {
    const value = this.form.controls.organisation.controls.region.value;
    return this.regions.find((region) => region.value === value)?.label ?? '';
  }

  protected toggleLanguage(): void {
    const root = document.documentElement;
    root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  /** Validates the current step and moves on; the last step sends the request. */
  protected async next(): Promise<void> {
    const step = this.step();
    if (step < 3) {
      const group = step === 1 ? this.form.controls.account : this.form.controls.organisation;
      if (group.invalid) {
        group.markAllAsTouched();
        return;
      }
      this.step.set(step + 1);
      return;
    }
    this.failed.set(false);
    this.busy.set(true);
    try {
      const { account, organisation } = this.form.getRawValue();
      // await this.accounts.register({ ...account, ...organisation });
      // then navigate to the "check your email" page
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
`;
