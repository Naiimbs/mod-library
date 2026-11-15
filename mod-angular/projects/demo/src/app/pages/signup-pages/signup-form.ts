import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModButton, ModCheckbox, ModInlineAlert, ModLink, ModTextInput } from '@mod-internal/ui';
import { DemoPasswordRules, passwordRulesValidator } from './password-rules';

/** Something, an at sign, a domain with a dot. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TEXT = {
  en: {
    fullName: 'Full name',
    email: 'Email',
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
    agree: 'I agree to the',
    terms: 'terms of use and privacy policy',
    termsRequired: 'You must accept the terms to continue',
    submit: 'Create account',
    submitting: 'Creating account...',
    required: 'This field is required',
    emailInvalid: 'Enter a valid email address, for example name@example.gov.sa',
    passwordWeak: 'The password does not meet all the rules below',
    success: 'Account created',
    successText: 'A verification link was sent to your email. (This is a demo: nothing was sent.)',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  },
  ar: {
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
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
    agree: 'أوافق على',
    terms: 'شروط الاستخدام وسياسة الخصوصية',
    termsRequired: 'يجب الموافقة على الشروط للمتابعة',
    submit: 'إنشاء الحساب',
    submitting: 'جارٍ إنشاء الحساب...',
    required: 'هذا الحقل مطلوب',
    emailInvalid: 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.gov.sa',
    passwordWeak: 'كلمة المرور لا تستوفي جميع الشروط أدناه',
    success: 'تم إنشاء الحساب',
    successText: 'أُرسل رابط التحقق إلى بريدك الإلكتروني. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    haveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
  },
} as const;

type SignupField = 'fullName' | 'email' | 'password' | 'terms';

/**
 * Sign-up form shared by the centered and split examples: full name, email,
 * password with a live rules checklist, terms checkbox, submit and a link to
 * sign in.
 *
 * Demo behaviour: errors appear when a field is left or on submit; a valid
 * submit shows a busy state, then the success notice, and clears the form.
 */
@Component({
  selector: 'demo-signup-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ModButton,
    ModCheckbox,
    ModInlineAlert,
    ModLink,
    ModTextInput,
    DemoPasswordRules,
  ],
  template: `
    <form class="signup-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (done()) {
        <mod-inline-alert variant="success" colored [heading]="t().success" [message]="t().successText" />
      }

      <mod-text-input
        formControlName="fullName"
        autocomplete="name"
        required
        [label]="t().fullName"
        [error]="!!message('fullName')"
        [helperText]="message('fullName')"
      />
      <mod-text-input
        formControlName="email"
        type="email"
        autocomplete="email"
        required
        [label]="t().email"
        [placeholder]="t().emailPlaceholder"
        [error]="!!message('email')"
        [helperText]="message('email')"
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
        [error]="!!message('password')"
        [helperText]="message('password')"
      />
      <demo-password-rules
        [password]="form.controls.password.value"
        [heading]="t().rulesTitle"
        [labels]="t().rules"
        [metLabel]="t().met"
        [notMetLabel]="t().notMet"
      />

      <mod-checkbox formControlName="terms" size="small" required [alertText]="message('terms')">
        {{ t().agree }}
        <a mod-link underline="always" href="#" (click)="$event.preventDefault()">{{ t().terms }}</a>
      </mod-checkbox>

      <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
        {{ busy() ? t().submitting : t().submit }}
      </button>

      <p class="signup-form__alt">
        {{ t().haveAccount }}
        <a mod-link href="#" (click)="$event.preventDefault()">{{ t().signIn }}</a>
      </p>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }

    .signup-form {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .signup-form__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }
  `,
})
export class SignupForm {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, passwordRulesValidator],
    }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected readonly busy = signal(false);
  protected readonly done = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  /** Error text of a field, or '' while it is valid or not yet visited. */
  protected message(name: SignupField): string {
    const control = this.form.controls[name];
    if (control.valid || !control.touched) return '';
    const t = this.t();
    if (name === 'terms') return t.termsRequired;
    if (control.hasError('required')) return t.required;
    if (name === 'email') return t.emailInvalid;
    if (name === 'password') return t.passwordWeak;
    return t.required;
  }

  protected submit(): void {
    if (this.busy()) return;
    this.done.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    // Stand-in for the real registration request.
    this.timer = setTimeout(() => {
      this.busy.set(false);
      this.done.set(true);
      this.form.reset();
    }, 900);
  }
}

/** Layout-specific parts of the Code tab source of a sign-up example. */
export interface SignupCodeParts {
  /** Auth-layout symbols imported from the library, comma separated. */
  authImports: string;
  /** Opening `<mod-auth-layout …>` tag, indented by 4 spaces. */
  open: string;
  /** Logo, actions and header, indented by 6 spaces. */
  slots: string;
}

/**
 * Builds the source shown in the Code tab: a complete sign-up component with
 * the shared form inside the given layout. Keep in step with `SignupForm`.
 */
export function signupCode(parts: SignupCodeParts): string {
  return `import { Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  ${parts.authImports},
  ModButton, ModCheckbox, ModIcon, ModInlineAlert, ModLink, ModTextInput,
} from '@mod-internal/ui';

/** Which password rules the given text meets. */
function checkPassword(value: string) {
  return [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'At least one number', met: /[0-9]/.test(value) },
    { label: 'At least one upper-case letter', met: /[A-Z]/.test(value) },
    { label: 'At least one special character (such as ! # $ %)', met: /[^A-Za-z0-9 ]/.test(value) },
  ];
}

function passwordRules(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  return !value || checkPassword(value).every((rule) => rule.met) ? null : { passwordRules: true };
}

@Component({
  selector: 'app-sign-up',
  imports: [
    ReactiveFormsModule, ${parts.authImports},
    ModButton, ModCheckbox, ModIcon, ModInlineAlert, ModLink, ModTextInput,
  ],
  template: \`
${parts.open}
${parts.slots}

      <form class="sign-up" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (failed()) {
          <mod-inline-alert variant="error" colored heading="The account could not be created. Try again." />
        }

        <mod-text-input
          label="Full name"
          formControlName="fullName"
          autocomplete="name"
          required
          [error]="!!message('fullName')"
          [helperText]="message('fullName')"
        />
        <mod-text-input
          label="Email"
          type="email"
          formControlName="email"
          autocomplete="email"
          placeholder="name@example.gov.sa"
          required
          [error]="!!message('email')"
          [helperText]="message('email')"
        />
        <mod-text-input
          label="Password"
          type="password"
          formControlName="password"
          autocomplete="new-password"
          passwordToggle
          required
          [error]="!!message('password')"
          [helperText]="message('password')"
        />

        <div class="sign-up__rules">
          <p>The password must contain:</p>
          <ul aria-label="The password must contain">
            @for (rule of rules(); track rule.label) {
              <li [class.met]="rule.met">
                <mod-icon [name]="rule.met ? 'checkmark-circle-02' : 'circle'" />
                {{ rule.label }}
                <span class="sign-up__sr">({{ rule.met ? 'met' : 'not met' }})</span>
              </li>
            }
          </ul>
        </div>

        <mod-checkbox formControlName="terms" size="small" required [alertText]="message('terms')">
          I agree to the <a mod-link underline="always" href="/terms" target="_blank">terms of use and privacy policy</a>
        </mod-checkbox>

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? 'Creating account...' : 'Create account' }}
        </button>

        <p class="sign-up__alt">
          Already have an account?
          <a mod-link href="/sign-in">Sign in</a>
        </p>
      </form>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
  styles: \`
    .sign-up {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .sign-up__rules {
      padding: var(--spacing-lg) var(--spacing-xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--gray-50);
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }

    .sign-up__rules p {
      margin: 0 0 var(--spacing-md);
      font-weight: var(--font-weight-medium);
      color: var(--gray-700);
    }

    .sign-up__rules ul {
      display: grid;
      gap: var(--spacing-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .sign-up__rules li {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .sign-up__rules .icon {
      font-size: 18px;
      color: var(--gray-300);
    }

    .sign-up__rules li.met {
      color: var(--gray-900);
    }

    .sign-up__rules li.met .icon {
      color: var(--mod-primary-text);
    }

    .sign-up__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .sign-up__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }
  \`,
})
export class SignUp {
  protected readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, passwordRules] }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  /** Rules checklist for the password typed so far. */
  protected rules() {
    return checkPassword(this.form.controls.password.value);
  }

  /** Error text of a field, or '' while it is valid or not yet visited. */
  protected message(name: 'fullName' | 'email' | 'password' | 'terms'): string {
    const control = this.form.controls[name];
    if (control.valid || !control.touched) return '';
    if (name === 'terms') return 'You must accept the terms to continue';
    if (control.hasError('required')) return 'This field is required';
    if (name === 'email') return 'Enter a valid email address, for example name@example.gov.sa';
    return 'The password does not meet all the rules below';
  }

  protected toggleLanguage(): void {
    const root = document.documentElement;
    root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  protected async submit(): Promise<void> {
    this.failed.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      const { fullName, email, password } = this.form.getRawValue();
      // await this.accounts.register({ fullName, email, password });
      // then navigate to the "check your email" page
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
`;
}
