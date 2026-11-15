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
  ModTextInput,
  ModIcon,
} from '@mod-internal/ui';

const TEXT = {
  en: {
    system: 'Medical Referrals and Patient Transfer System',
    tagline:
      'Referral request and review, appointment or bed booking, attendance and expenses, in one path between hospitals.',
    logoAlt: 'Organization name',
    title: 'Sign in to the system',
    subtitle: 'Enter your user name and password to access the system',
    userName: 'User name',
    password: 'Password',
    show: 'Show password',
    hide: 'Hide password',
    submit: 'Sign in',
    submitting: 'Signing in...',
    required: 'This field is required',
    invalid: 'The user name or password is incorrect.',
    success: 'Signed in. (This is a demo: nothing was sent.)',
    copyright: '© Organization name 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    system: 'النظام الخاص بإدارة الإحالات الطبية وتحويل المرضى',
    tagline: 'طلب الإحالة ومراجعته، وحجز الموعد أو السرير، والحضور والمصروفات، في مسار واحد بين المستشفيات.',
    logoAlt: 'اسم الجهة',
    title: 'تسجيل الدخول للنظام',
    subtitle: 'أدخل اسم المستخدم وكلمة المرور للدخول إلى النظام',
    userName: 'اسم المستخدم',
    password: 'كلمة المرور',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    submit: 'دخول',
    submitting: 'جارٍ الدخول...',
    required: 'هذا الحقل مطلوب',
    invalid: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    success: 'تم تسجيل الدخول. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

/**
 * Default sign-in page: the two-column layout of the hospital referral
 * Portal. Form on the start side (logo, language switch, user name, password
 * with reveal, submit), brand panel on the end side (image under a
 * dark-green tint, ring of three process icons, system name and tagline).
 *
 * Demo behaviour: empty fields show "required"; the password `wrong` shows
 * the invalid-credentials notice; anything else shows the success notice.
 */
@Component({
  selector: 'demo-login-split',
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
    ModTextInput,
    ModIcon,
  ],
  template: `
    <mod-auth-layout
      panelImage="examples/panel-placeholder.svg"
      panelImagePosition="52% 40%"
      [panelTitle]="t().system"
      [panelText]="t().tagline"
      [panelIcons]="['medical-file', 'hospital-bed-01', 'patient']"
    >
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

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate style="display: grid; gap: var(--spacing-2xl);">
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

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? t().submitting : t().submit }}
        </button>
      </form>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
})
export class LoginSplitExample {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
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

/** Source shown in the Code tab. Keep in step with the component above. */
export const LOGIN_SPLIT_CODE = `import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo,
  ModButton, ModInlineAlert, ModTextInput,
  ModIcon,
} from '@mod-internal/ui';

@Component({
  selector: 'app-sign-in',
  imports: [
    ReactiveFormsModule, ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions,
    ModAuthFooter, ModButton, ModInlineAlert, ModTextInput,
    ModIcon,
  ],
  template: \`
    <mod-auth-layout
      panelImage="assets/img/panel-placeholder.svg"
      panelImagePosition="52% 40%"
      panelTitle="Medical Referrals and Patient Transfer System"
      panelText="Referral request and review, appointment or bed booking, attendance and expenses, in one path between hospitals."
      [panelIcons]="['medical-file', 'hospital-bed-01', 'patient']"
    >
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <mod-auth-header
        heading="Sign in to the system"
        description="Enter your user name and password to access the system"
        underline
      />

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate style="display: grid; gap: var(--spacing-2xl);">
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

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class SignIn {
  protected readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
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
      const { userName, password } = this.form.getRawValue();
      // await this.auth.login(userName, password);
    } catch {
      this.failed.set(true);
      this.form.controls.password.reset('');
    } finally {
      this.busy.set(false);
    }
  }
}
`;
