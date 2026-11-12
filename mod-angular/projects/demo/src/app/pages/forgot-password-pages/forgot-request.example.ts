import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_NAME = /^[A-Za-z0-9._-]{3,}$/;

/** Accepts an email address (when the value has an at sign) or a user name. */
function accountValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();
  if (!value) return { required: true };
  const valid = value.includes('@') ? EMAIL.test(value) : USER_NAME.test(value);
  return valid ? null : { format: true };
}

const TEXT = {
  en: {
    logoAlt: 'Ministry of Defense',
    language: 'عربي',
    title: 'Forgot password?',
    subtitle: 'Enter the email address or user name of your account and we will send you instructions to reset the password.',
    account: 'Email or user name',
    placeholder: 'name@mod.gov.sa',
    required: 'This field is required',
    format: 'Enter a valid email address or user name',
    submit: 'Send reset instructions',
    submitting: 'Sending...',
    success: 'If an account matches, the reset instructions are on their way.',
    successNote: 'This is a demo: nothing was sent.',
    back: 'Back to log in',
    copyright: '© Ministry of Defense 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'وزارة الدفاع',
    language: 'English',
    title: 'نسيت كلمة المرور؟',
    subtitle: 'أدخل البريد الإلكتروني أو اسم المستخدم الخاص بحسابك، وسنرسل إليك تعليمات إعادة تعيين كلمة المرور.',
    account: 'البريد الإلكتروني أو اسم المستخدم',
    placeholder: 'name@mod.gov.sa',
    required: 'هذا الحقل مطلوب',
    format: 'أدخل بريدًا إلكترونيًا أو اسم مستخدم صحيحًا',
    submit: 'إرسال تعليمات إعادة التعيين',
    submitting: 'جارٍ الإرسال...',
    success: 'إذا كان هناك حساب مطابق، فستصلك تعليمات إعادة التعيين قريبًا.',
    successNote: 'هذا عرض تجريبي: لم يُرسل أي شيء.',
    back: 'العودة إلى تسجيل الدخول',
    copyright: '© وزارة الدفاع 2026 — جميع الحقوق محفوظة',
  },
} as const;

/**
 * First step of the password reset: ask for the account.
 *
 * Demo behaviour: an empty field shows "required", a value that is neither
 * an email address nor a user name shows a format error; a valid value shows
 * the confirmation after a short busy state. The confirmation does not say
 * whether the account exists.
 */
@Component({
  selector: 'demo-forgot-request',
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
        src="examples/mod-logo-full.png"
        srcset="examples/mod-logo-full.png 1x, examples/mod-logo-full@2x.png 2x"
        width="132"
        height="136"
        [alt]="t().logoAlt"
      />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button">
        <mod-icon name="language-square" /> {{ t().language }}
      </button>

      <mod-auth-header icon="lock-key" [heading]="t().title" [description]="t().subtitle" />

      <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (sent()) {
          <mod-inline-alert variant="success" colored [heading]="t().success" [message]="t().successNote" />
        }

        <mod-text-input
          formControlName="account"
          autocomplete="username"
          leadingIcon="mail-01"
          required
          [label]="t().account"
          [placeholder]="t().placeholder"
          [error]="invalid()"
          [helperText]="errorText()"
        />

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? t().submitting : t().submit }}
        </button>
      </form>

      <div class="back">
        <a mod-link variant="secondary" href="#" (click)="$event.preventDefault()">
          <span class="back__inner">
            <mod-icon [name]="backIcon()" />
            {{ t().back }}
          </span>
        </a>
      </div>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-3xl);
    }

    .back {
      display: flex;
      justify-content: center;
      font-size: var(--font-size-sm);
    }

    .back__inner {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .back__inner .icon {
      font-size: 18px;
    }
  `,
})
export class ForgotRequestExample {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
  /** The back arrow points to the start side of the page. */
  protected readonly backIcon = computed(() => (this.lang() === 'ar' ? 'arrow-right-01' : 'arrow-left-01'));

  protected readonly form = new FormGroup({
    account: new FormControl('', { nonNullable: true, validators: accountValidator }),
  });
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected invalid(): boolean {
    const control = this.form.controls.account;
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorText(): string {
    if (!this.invalid()) return '';
    return this.form.controls.account.hasError('required') ? this.t().required : this.t().format;
  }

  protected submit(): void {
    if (this.busy()) return;
    this.sent.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    // Stand-in for the real request.
    this.timer = setTimeout(() => {
      this.busy.set(false);
      this.sent.set(true);
    }, 800);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const FORGOT_REQUEST_CODE = `import { Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import {
  ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo,
  ModButton, ModInlineAlert, ModLink, ModTextInput,
} from '@mod-internal/ui';

const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const USER_NAME = /^[A-Za-z0-9._-]{3,}$/;

/** Accepts an email address (when the value has an at sign) or a user name. */
function accountValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();
  if (!value) return { required: true };
  const valid = value.includes('@') ? EMAIL.test(value) : USER_NAME.test(value);
  return valid ? null : { format: true };
}

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule, ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter,
    ModButton, ModInlineAlert, ModLink, ModTextInput,
  ],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/mod-logo-full.png" width="132" height="136" alt="Ministry of Defense" />

      <mod-auth-header
        icon="lock-key"
        heading="Forgot password?"
        description="Enter the email address or user name of your account and we will send you instructions to reset the password."
      />

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate style="display: grid; gap: var(--spacing-3xl);">
        @if (failed()) {
          <mod-inline-alert variant="error" colored heading="The request could not be sent. Try again." />
        }

        <mod-text-input
          label="Email or user name"
          formControlName="account"
          autocomplete="username"
          leadingIcon="mail-01"
          required
          [error]="invalid()"
          [helperText]="errorText()"
        />

        <button mod-button type="submit" style="width: 100%;" [disabled]="busy()">
          {{ busy() ? 'Sending...' : 'Send reset instructions' }}
        </button>
      </form>

      <p style="margin: 0; text-align: center; font-size: var(--font-size-sm);">
        <a mod-link variant="secondary" href="/login">Back to log in</a>
      </p>

      <span modAuthFooter>© Ministry of Defense 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class ForgotPassword {
  protected readonly form = new FormGroup({
    account: new FormControl('', { nonNullable: true, validators: accountValidator }),
  });
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  protected invalid(): boolean {
    const control = this.form.controls.account;
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorText(): string {
    if (!this.invalid()) return '';
    return this.form.controls.account.hasError('required')
      ? 'This field is required'
      : 'Enter a valid email address or user name';
  }

  protected async submit(): Promise<void> {
    this.failed.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      const { account } = this.form.getRawValue();
      // await this.auth.requestPasswordReset(account.trim());
      // Always go to the "Check your email" page, whether or not the account
      // exists, so the page cannot be used to find out which accounts exist.
      // await this.router.navigate(['/forgot-password/sent']);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
`;
