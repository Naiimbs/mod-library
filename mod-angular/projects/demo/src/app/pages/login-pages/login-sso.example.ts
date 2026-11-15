import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModInlineAlert,
  ModLink,
  ModTextInput,
  ModIcon,
} from '@mod-internal/ui';

/** Failed attempts allowed before the account is locked. */
const MAX_ATTEMPTS = 5;

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    title: 'Sign in',
    subtitle: 'Use your system account or the national single sign-on',
    lockTitle: 'Account protection',
    lockText: 'For your security, the account is locked for 15 minutes after 5 failed sign-in attempts.',
    userName: 'User name',
    password: 'Password',
    show: 'Show password',
    hide: 'Hide password',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    submitting: 'Signing in...',
    or: 'or',
    sso: 'Sign in with the national single sign-on',
    ssoBusy: 'Redirecting...',
    ssoDone: 'You would now be redirected to the single sign-on service. (This is a demo.)',
    required: 'This field is required',
    invalid: 'The user name or password is incorrect.',
    attemptsLeft: 'Attempts remaining:',
    locked: 'The account is locked',
    lockedText: 'There were 5 failed sign-in attempts. Try again in 15 minutes or contact the system administrator.',
    success: 'Signed in. (This is a demo: nothing was sent.)',
    copyright: '© Organization name 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    title: 'تسجيل الدخول',
    subtitle: 'استخدم حسابك في النظام أو خدمة الدخول الموحد الوطنية',
    lockTitle: 'حماية الحساب',
    lockText: 'لحماية حسابك، يُقفل الحساب لمدة 15 دقيقة بعد 5 محاولات دخول غير ناجحة.',
    userName: 'اسم المستخدم',
    password: 'كلمة المرور',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    forgot: 'نسيت كلمة المرور؟',
    submit: 'دخول',
    submitting: 'جارٍ الدخول...',
    or: 'أو',
    sso: 'الدخول عبر خدمة الدخول الموحد الوطنية',
    ssoBusy: 'جارٍ التحويل...',
    ssoDone: 'سيتم الآن تحويلك إلى خدمة الدخول الموحد. (هذا عرض تجريبي.)',
    required: 'هذا الحقل مطلوب',
    invalid: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    attemptsLeft: 'المحاولات المتبقية:',
    locked: 'تم قفل الحساب',
    lockedText: 'سُجّلت 5 محاولات دخول غير ناجحة. حاول مرة أخرى بعد 15 دقيقة أو تواصل مع مدير النظام.',
    success: 'تم تسجيل الدخول. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

type SsoState = 'idle' | 'invalid' | 'locked' | 'success' | 'sso';

/**
 * Sign-in with single sign-on: the credentials form is the primary action; a
 * divider and a secondary button offer the national single sign-on. An info
 * notice explains the lockout rule.
 *
 * Demo behaviour: the password `wrong` fails and counts down the remaining
 * attempts; the fifth failure locks the form. Anything else signs in.
 */
@Component({
  selector: 'demo-login-sso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModButton,
    ModInlineAlert,
    ModLink,
    ModTextInput,
    ModIcon,
  ],
  template: `
    <mod-auth-layout variant="centered">
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

      <form class="login-sso" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @switch (state()) {
          @case ('invalid') {
            <mod-inline-alert
              variant="error"
              colored
              [heading]="t().invalid"
              [message]="t().attemptsLeft + ' ' + attemptsLeft()"
            />
          }
          @case ('locked') {
            <mod-inline-alert variant="error" colored [heading]="t().locked" [message]="t().lockedText" />
          }
          @case ('success') {
            <mod-inline-alert variant="success" colored [heading]="t().success" />
          }
          @case ('sso') {
            <mod-inline-alert variant="success" colored [heading]="t().ssoDone" />
          }
          @default {
            <mod-inline-alert variant="info" colored [heading]="t().lockTitle" [message]="t().lockText" />
          }
        }

        <mod-text-input
          formControlName="userName"
          autocomplete="username"
          required
          [label]="t().userName"
          [error]="invalid('userName')"
          [helperText]="invalid('userName') ? t().required : ''"
        />
        <mod-text-input
          formControlName="password"
          type="password"
          autocomplete="current-password"
          passwordToggle
          required
          [label]="t().password"
          [showPasswordLabel]="t().show"
          [hidePasswordLabel]="t().hide"
          [error]="invalid('password')"
          [helperText]="invalid('password') ? t().required : ''"
        />

        <div class="login-sso__forgot">
          <a mod-link href="#" (click)="$event.preventDefault()">{{ t().forgot }}</a>
        </div>

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy() !== 'none' || locked()">
          {{ busy() === 'form' ? t().submitting : t().submit }}
        </button>

        <p class="login-sso__or"><span>{{ t().or }}</span></p>

        <button
          mod-button
          type="button"
          variant="secondary-outline"
          style="width: 100%;"
          [disabled]="busy() !== 'none'"
          (click)="singleSignOn()"
        >
          <mod-icon name="security-check" />
          {{ busy() === 'sso' ? t().ssoBusy : t().sso }}
        </button>
      </form>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .login-sso {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .login-sso__forgot {
      margin-block-start: calc(var(--spacing-md) * -1);
      text-align: end;
      font-size: var(--font-size-sm);
    }

    .login-sso__or {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--gray-500);
    }

    .login-sso__or::before,
    .login-sso__or::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--gray-200);
    }
  `,
})
export class LoginSsoExample {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  protected readonly busy = signal<'none' | 'form' | 'sso'>('none');
  protected readonly state = signal<SsoState>('idle');
  protected readonly attemptsLeft = signal(MAX_ATTEMPTS);
  protected readonly locked = computed(() => this.state() === 'locked');

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected invalid(name: 'userName' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.busy() !== 'none' || this.locked()) return;
    this.state.set('idle');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set('form');
    // Stand-in for the real sign-in request.
    this.timer = setTimeout(() => {
      this.busy.set('none');
      if (this.form.controls.password.value !== 'wrong') {
        this.attemptsLeft.set(MAX_ATTEMPTS);
        this.state.set('success');
        return;
      }
      const left = this.attemptsLeft() - 1;
      this.attemptsLeft.set(left);
      this.form.controls.password.reset('');
      if (left > 0) {
        this.state.set('invalid');
      } else {
        this.state.set('locked');
        this.form.disable();
      }
    }, 800);
  }

  protected singleSignOn(): void {
    if (this.busy() !== 'none') return;
    this.busy.set('sso');
    // Stand-in for the redirect to the identity provider.
    this.timer = setTimeout(() => {
      this.busy.set('none');
      this.state.set('sso');
    }, 800);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const LOGIN_SSO_CODE = `import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo,
  ModButton, ModInlineAlert, ModLink, ModTextInput,
  ModIcon,
} from '@mod-internal/ui';

@Component({
  selector: 'app-sign-in',
  imports: [
    ReactiveFormsModule, ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter,
    ModButton, ModInlineAlert, ModLink, ModTextInput,
    ModIcon,
  ],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <mod-auth-header
        heading="Sign in"
        description="Use your system account or the national single sign-on"
        underline
      />

      <form class="sign-in" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (locked()) {
          <mod-inline-alert
            variant="error"
            colored
            heading="The account is locked"
            message="There were 5 failed sign-in attempts. Try again in 15 minutes or contact the system administrator."
          />
        } @else if (attemptsLeft() !== null) {
          <mod-inline-alert
            variant="error"
            colored
            heading="The user name or password is incorrect."
            [message]="'Attempts remaining: ' + attemptsLeft()"
          />
        } @else {
          <mod-inline-alert
            variant="info"
            colored
            heading="Account protection"
            message="For your security, the account is locked for 15 minutes after 5 failed sign-in attempts."
          />
        }

        <mod-text-input
          label="User name"
          formControlName="userName"
          autocomplete="username"
          required
          [error]="invalid('userName')"
          [helperText]="invalid('userName') ? 'This field is required' : ''"
        />
        <mod-text-input
          label="Password"
          type="password"
          formControlName="password"
          autocomplete="current-password"
          passwordToggle
          required
          [error]="invalid('password')"
          [helperText]="invalid('password') ? 'This field is required' : ''"
        />

        <div class="sign-in__forgot">
          <a mod-link href="/forgot-password">Forgot password?</a>
        </div>

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy() || locked()">
          {{ busy() ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="sign-in__or"><span>or</span></p>

        <button mod-button type="button" variant="secondary-outline" style="width: 100%;" (click)="singleSignOn()">
          <mod-icon name="security-check" />
          Sign in with the national single sign-on
        </button>
      </form>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
  styles: \`
    .sign-in {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .sign-in__forgot {
      margin-block-start: calc(var(--spacing-md) * -1);
      text-align: end;
      font-size: var(--font-size-sm);
    }

    .sign-in__or {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--gray-500);
    }

    .sign-in__or::before,
    .sign-in__or::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--gray-200);
    }
  \`,
})
export class SignIn {
  protected readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  protected readonly busy = signal(false);
  /** Remaining attempts reported by the server after a failure; null before any failure. */
  protected readonly attemptsLeft = signal<number | null>(null);
  protected readonly locked = signal(false);

  protected invalid(name: 'userName' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected toggleLanguage(): void {
    const root = document.documentElement;
    root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  protected singleSignOn(): void {
    // Redirect to your identity provider, for example:
    // window.location.assign('/auth/sso/start');
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      const { userName, password } = this.form.getRawValue();
      // const result = await this.auth.login(userName, password);
      // On failure the server returns the remaining attempts:
      // this.attemptsLeft.set(result.attemptsLeft);
      // this.locked.set(result.attemptsLeft === 0);
      this.form.controls.password.reset('');
    } finally {
      this.busy.set(false);
    }
  }
}
`;
