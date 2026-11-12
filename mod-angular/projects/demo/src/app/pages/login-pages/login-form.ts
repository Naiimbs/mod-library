import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModButton, ModCheckbox, ModInlineAlert, ModLink, ModTextInput } from '@mod-internal/ui';

const TEXT = {
  en: {
    userName: 'User name',
    password: 'Password',
    show: 'Show password',
    hide: 'Hide password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    submitting: 'Signing in...',
    required: 'This field is required',
    invalid: 'The user name or password is incorrect.',
    success: 'Signed in. (This is a demo: nothing was sent.)',
    noAccount: 'Do not have an account?',
    signUp: 'Create an account',
  },
  ar: {
    userName: 'اسم المستخدم',
    password: 'كلمة المرور',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    submit: 'دخول',
    submitting: 'جارٍ الدخول...',
    required: 'هذا الحقل مطلوب',
    invalid: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    success: 'تم تسجيل الدخول. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    noAccount: 'ليس لديك حساب؟',
    signUp: 'إنشاء حساب',
  },
} as const;

/**
 * Credentials form shared by the centered, card and start-panel sign-in
 * examples: user name, password with reveal, "Remember me" and "Forgot
 * password?" in one row, submit, and a link to sign up.
 *
 * Demo behaviour: empty fields show "required"; the password `wrong` shows
 * the invalid-credentials notice; anything else shows the success notice.
 */
@Component({
  selector: 'demo-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModButton, ModCheckbox, ModInlineAlert, ModLink, ModTextInput],
  template: `
    <form class="login-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (state() === 'invalid') {
        <mod-inline-alert variant="error" colored [heading]="t().invalid" />
      } @else if (state() === 'success') {
        <mod-inline-alert variant="success" colored [heading]="t().success" />
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

      <div class="login-form__row">
        <mod-checkbox formControlName="remember" size="small" [label]="t().remember" />
        <a mod-link href="#" (click)="$event.preventDefault()">{{ t().forgot }}</a>
      </div>

      <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
        {{ busy() ? t().submitting : t().submit }}
      </button>

      <p class="login-form__alt">
        {{ t().noAccount }}
        <a mod-link href="#" (click)="$event.preventDefault()">{{ t().signUp }}</a>
      </p>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }

    .login-form {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .login-form__row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md) var(--spacing-xl);
      font-size: var(--font-size-sm);
    }

    .login-form__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }
  `,
})
export class LoginForm {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
    remember: new FormControl(false, { nonNullable: true }),
  });
  protected readonly busy = signal(false);
  protected readonly state = signal<'idle' | 'invalid' | 'success'>('idle');

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected invalid(name: 'userName' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.busy()) return;
    this.state.set('idle');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    // Stand-in for the real sign-in request.
    this.timer = setTimeout(() => {
      this.busy.set(false);
      if (this.form.controls.password.value === 'wrong') {
        this.state.set('invalid');
        // After a failed attempt the user name stays and the password is cleared.
        this.form.controls.password.reset('');
      } else {
        this.state.set('success');
      }
    }, 800);
  }
}

/** Layout-specific parts of the Code tab source of a sign-in example. */
export interface LoginCodeParts {
  /** Auth-layout symbols imported from the library, comma separated. */
  authImports: string;
  /** Opening `<mod-auth-layout …>` tag, indented by 4 spaces. */
  open: string;
  /** Logo, actions, panel content and header, indented by 6 spaces. */
  slots: string;
  /** Extra CSS appended to the component styles, indented by 4 spaces. */
  styles?: string;
}

/**
 * Builds the source shown in the Code tab: a complete sign-in component with
 * the shared credentials form inside the given layout. Keep in step with
 * `LoginForm` above.
 */
export function loginCode(parts: LoginCodeParts): string {
  return `import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ${parts.authImports},
  ModButton, ModCheckbox, ModIcon, ModInlineAlert, ModLink, ModTextInput,
} from '@mod-internal/ui';

@Component({
  selector: 'app-sign-in',
  imports: [
    ReactiveFormsModule, ${parts.authImports},
    ModButton, ModCheckbox, ModIcon, ModInlineAlert, ModLink, ModTextInput,
  ],
  template: \`
${parts.open}
${parts.slots}

      <form class="sign-in" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (failed()) {
          <mod-inline-alert variant="error" colored heading="The user name or password is incorrect." />
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

        <div class="sign-in__row">
          <mod-checkbox label="Remember me" size="small" formControlName="remember" />
          <a mod-link href="/forgot-password">Forgot password?</a>
        </div>

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="sign-in__alt">
          Do not have an account?
          <a mod-link href="/sign-up">Create an account</a>
        </p>
      </form>

      <span modAuthFooter>© Ministry of Defense 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
  styles: \`
    .sign-in {
      display: grid;
      gap: var(--spacing-2xl);
    }

    .sign-in__row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md) var(--spacing-xl);
      font-size: var(--font-size-sm);
    }

    .sign-in__alt {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }${parts.styles ? '\n\n' + parts.styles : ''}
  \`,
})
export class SignIn {
  protected readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
    remember: new FormControl(false, { nonNullable: true }),
  });
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  protected invalid(name: 'userName' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
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
      const { userName, password, remember } = this.form.getRawValue();
      // await this.auth.login(userName, password, { remember });
    } catch {
      this.failed.set(true);
      this.form.controls.password.reset('');
    } finally {
      this.busy.set(false);
    }
  }
}
`;
}
