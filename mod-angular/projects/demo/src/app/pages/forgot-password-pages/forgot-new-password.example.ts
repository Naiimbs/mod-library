import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModInlineAlert,
  ModProgressBar,
  ModTextInput,
  ModIcon,
} from '@mod-internal/ui';
import type { ModProgressVariant } from '@mod-internal/ui';

/** Bar colour for 0 to 4 character rules met. */
const STRENGTH_VARIANTS: readonly ModProgressVariant[] = ['neutral', 'error', 'error', 'primary', 'success'];

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    language: 'عربي',
    title: 'Set a new password',
    subtitle: 'Choose a password you have not used before in this system.',
    password: 'New password',
    confirm: 'Confirm new password',
    show: 'Show password',
    hide: 'Hide password',
    strength: 'Password strength',
    strengthLevels: ['Not entered', 'Weak', 'Fair', 'Good', 'Strong'],
    rulesLabel: 'Password requirements',
    ruleLength: 'At least 8 characters',
    ruleNumber: 'A number',
    ruleUpper: 'An upper-case letter',
    ruleSpecial: 'A special character, such as ! # $ %',
    ruleMatch: 'Both passwords match',
    met: '(met)',
    notMet: '(not met)',
    passwordInvalid: 'The password does not meet all the requirements',
    mismatch: 'The two passwords do not match',
    submit: 'Change password',
    submitting: 'Saving...',
    success: 'Password changed. (This is a demo: nothing was sent.)',
    copyright: '© Organization name 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    language: 'English',
    title: 'تعيين كلمة مرور جديدة',
    subtitle: 'اختر كلمة مرور لم يسبق لك استخدامها في هذا النظام.',
    password: 'كلمة المرور الجديدة',
    confirm: 'تأكيد كلمة المرور الجديدة',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    strength: 'قوة كلمة المرور',
    strengthLevels: ['لم تُدخل', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'],
    rulesLabel: 'متطلبات كلمة المرور',
    ruleLength: '8 أحرف على الأقل',
    ruleNumber: 'رقم واحد على الأقل',
    ruleUpper: 'حرف إنجليزي كبير واحد على الأقل',
    ruleSpecial: 'رمز خاص واحد على الأقل، مثل ! # $ %',
    ruleMatch: 'تطابق كلمتي المرور',
    met: '(مستوفى)',
    notMet: '(غير مستوفى)',
    passwordInvalid: 'كلمة المرور لا تستوفي جميع المتطلبات',
    mismatch: 'كلمتا المرور غير متطابقتين',
    submit: 'تغيير كلمة المرور',
    submitting: 'جارٍ الحفظ...',
    success: 'تم تغيير كلمة المرور. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
  },
} as const;

/**
 * Third step of the password reset, opened from the link in the email: new
 * password and confirmation, both with a reveal button, a strength bar and a
 * checklist that updates while typing. The submit button is enabled only when
 * every rule is met.
 */
@Component({
  selector: 'demo-forgot-new-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModButton,
    ModInlineAlert,
    ModProgressBar,
    ModTextInput,
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

      <mod-auth-header icon="key-01" [heading]="t().title" [description]="t().subtitle" />

      <form class="form" novalidate (submit)="submit($event)">
        @if (done()) {
          <mod-inline-alert variant="success" colored [heading]="t().success" />
        }

        <div class="field">
          <mod-text-input
            type="password"
            autocomplete="new-password"
            passwordToggle
            required
            [(value)]="password"
            [label]="t().password"
            [showPasswordLabel]="t().show"
            [hidePasswordLabel]="t().hide"
            [error]="passwordError()"
            [helperText]="passwordError() ? t().passwordInvalid : ''"
            (blurred)="passwordTouched.set(true)"
          />
          <div class="strength">
            <mod-progress-bar
              size="sm"
              [value]="strength().value"
              [variant]="strength().variant"
              [ariaLabel]="t().strength"
              [valueText]="strength().label"
            />
            <p class="strength__text" aria-hidden="true">
              {{ t().strength }}: <strong>{{ strength().label }}</strong>
            </p>
          </div>
        </div>

        <mod-text-input
          type="password"
          autocomplete="new-password"
          passwordToggle
          required
          [(value)]="confirm"
          [label]="t().confirm"
          [showPasswordLabel]="t().show"
          [hidePasswordLabel]="t().hide"
          [error]="confirmError()"
          [helperText]="confirmError() ? t().mismatch : ''"
          (blurred)="confirmTouched.set(true)"
        />

        <ul class="rules" [attr.aria-label]="t().rulesLabel">
          @for (rule of rules(); track rule.key) {
            <li class="rules__item" [class.rules__item--met]="rule.met">
              <span class="rules__mark" aria-hidden="true">
                @if (rule.met) {
                  <mod-icon name="checkmark-circle-02" />
                }
              </span>
              <span>
                {{ rule.label }}
                <span class="visually-hidden">{{ rule.met ? t().met : t().notMet }}</span>
              </span>
            </li>
          }
        </ul>

        <button mod-button type="submit" style="width: 100%;" [disabled]="!valid() || busy()">
          {{ busy() ? t().submitting : t().submit }}
        </button>
      </form>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-3xl);
    }

    .field,
    .strength {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-md);
    }

    .strength__text {
      margin: 0;
      font-size: var(--font-size-xs);
      line-height: 18px;
      color: var(--gray-600);
    }

    .strength__text strong {
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .rules {
      display: grid;
      gap: var(--spacing-md);
      margin: 0;
      padding: var(--spacing-xl);
      list-style: none;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--gray-50);
    }

    .rules__item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: var(--font-size-sm);
      line-height: 20px;
      color: var(--gray-600);
    }

    .rules__item--met {
      color: var(--gray-900);
    }

    /* Empty ring until the rule is met, then the check icon. */
    .rules__mark {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      font-size: 20px;
      color: var(--success-600);
    }

    .rules__item:not(.rules__item--met) .rules__mark::before {
      content: '';
      width: 14px;
      height: 14px;
      border: 2px solid var(--gray-400);
      border-radius: var(--radius-full);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class ForgotNewPasswordExample {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly password = signal('');
  protected readonly confirm = signal('');
  protected readonly passwordTouched = signal(false);
  protected readonly confirmTouched = signal(false);
  protected readonly busy = signal(false);
  protected readonly done = signal(false);

  /** The four rules about the characters of the password. */
  private readonly checks = computed(() => {
    const value = this.password();
    return {
      length: value.length >= 8,
      number: /[0-9]/.test(value),
      upper: /[A-Z]/.test(value),
      special: /[^A-Za-z0-9\s]/.test(value),
    };
  });

  private readonly matches = computed(() => this.password().length > 0 && this.password() === this.confirm());

  protected readonly rules = computed(() => {
    const t = this.t();
    const checks = this.checks();
    return [
      { key: 'length', label: t.ruleLength, met: checks.length },
      { key: 'number', label: t.ruleNumber, met: checks.number },
      { key: 'upper', label: t.ruleUpper, met: checks.upper },
      { key: 'special', label: t.ruleSpecial, met: checks.special },
      { key: 'match', label: t.ruleMatch, met: this.matches() },
    ];
  });

  protected readonly strength = computed(() => {
    const checks = this.checks();
    const score = [checks.length, checks.number, checks.upper, checks.special].filter(Boolean).length;
    // Empty field: empty bar. Anything typed is at least "weak".
    const level = this.password() ? Math.max(1, score) : 0;
    return { value: level * 25, variant: STRENGTH_VARIANTS[level], label: this.t().strengthLevels[level] };
  });

  protected readonly valid = computed(() => this.rules().every((rule) => rule.met));

  protected readonly passwordError = computed(() => {
    const checks = this.checks();
    return this.passwordTouched() && !(checks.length && checks.number && checks.upper && checks.special);
  });

  protected readonly confirmError = computed(() => this.confirmTouched() && !this.matches());

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    this.done.set(false);
    if (!this.valid()) {
      this.passwordTouched.set(true);
      this.confirmTouched.set(true);
      return;
    }
    this.busy.set(true);
    // Stand-in for the real request.
    this.timer = setTimeout(() => {
      this.busy.set(false);
      this.done.set(true);
    }, 800);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const FORGOT_NEW_PASSWORD_CODE = `import { Component, computed, signal } from '@angular/core';
import {
  ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo,
  ModButton, ModInlineAlert, ModProgressBar, ModTextInput,
  ModIcon,
} from '@mod-internal/ui';
import type { ModProgressVariant } from '@mod-internal/ui';

const STRENGTH_LABELS = ['Not entered', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_VARIANTS: readonly ModProgressVariant[] = ['neutral', 'error', 'error', 'primary', 'success'];

@Component({
  selector: 'app-new-password',
  imports: [
    ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter,
    ModButton, ModInlineAlert, ModProgressBar, ModTextInput,
    ModIcon,
  ],
  template: \`
    <mod-auth-layout variant="centered" card muted>
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header
        icon="key-01"
        heading="Set a new password"
        description="Choose a password you have not used before in this system."
      />

      <form (submit)="submit($event)" novalidate style="display: grid; gap: var(--spacing-3xl);">
        @if (failed()) {
          <mod-inline-alert
            variant="error"
            colored
            heading="The reset link has expired."
            message="Request new reset instructions and try again."
          />
        }

        <div style="display: grid; gap: var(--spacing-md);">
          <mod-text-input
            label="New password"
            type="password"
            autocomplete="new-password"
            passwordToggle
            required
            [(value)]="password"
            [error]="passwordError()"
            [helperText]="passwordError() ? 'The password does not meet all the requirements' : ''"
            (blurred)="passwordTouched.set(true)"
          />
          <mod-progress-bar
            size="sm"
            ariaLabel="Password strength"
            [value]="strength().value"
            [variant]="strength().variant"
            [valueText]="strength().label"
          />
          <p aria-hidden="true" style="margin: 0; font-size: var(--font-size-xs); color: var(--gray-600);">
            Password strength: <strong>{{ strength().label }}</strong>
          </p>
        </div>

        <mod-text-input
          label="Confirm new password"
          type="password"
          autocomplete="new-password"
          passwordToggle
          required
          [(value)]="confirm"
          [error]="confirmError()"
          [helperText]="confirmError() ? 'The two passwords do not match' : ''"
          (blurred)="confirmTouched.set(true)"
        />

        <ul class="rules" aria-label="Password requirements">
          @for (rule of rules(); track rule.label) {
            <li [class.met]="rule.met">
              <mod-icon [name]="rule.met ? 'checkmark-circle-02' : 'circle'" />
              {{ rule.label }}
              <span class="visually-hidden">{{ rule.met ? '(met)' : '(not met)' }}</span>
            </li>
          }
        </ul>

        <button mod-button type="submit" style="width: 100%;" [disabled]="!valid() || busy()">
          {{ busy() ? 'Saving...' : 'Change password' }}
        </button>
      </form>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
  styles: \`
    .rules {
      display: grid;
      gap: var(--spacing-md);
      margin: 0;
      padding: var(--spacing-xl);
      list-style: none;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--gray-50);
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }

    .rules li {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .rules li.met {
      color: var(--gray-900);
    }

    .rules .icon {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      font-size: 20px;
      color: var(--success-600);
    }

    /* Empty ring until the rule is met. */
    .rules li:not(.met) .icon::before {
      content: '';
      width: 14px;
      height: 14px;
      border: 2px solid var(--gray-400);
      border-radius: var(--radius-full);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  \`,
})
export class NewPassword {
  protected readonly password = signal('');
  protected readonly confirm = signal('');
  protected readonly passwordTouched = signal(false);
  protected readonly confirmTouched = signal(false);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  private readonly matches = computed(() => this.password().length > 0 && this.password() === this.confirm());

  /** The four rules about the characters of the password. */
  private readonly characterRules = computed(() => {
    const value = this.password();
    return [
      { label: 'At least 8 characters', met: value.length >= 8 },
      { label: 'A number', met: /[0-9]/.test(value) },
      { label: 'An upper-case letter', met: /[A-Z]/.test(value) },
      { label: 'A special character, such as ! # $ %', met: /[^A-Za-z0-9\\s]/.test(value) },
    ];
  });

  protected readonly rules = computed(() => [
    ...this.characterRules(),
    { label: 'Both passwords match', met: this.matches() },
  ]);

  protected readonly strength = computed(() => {
    const score = this.characterRules().filter((rule) => rule.met).length;
    const level = this.password() ? Math.max(1, score) : 0;
    return { value: level * 25, variant: STRENGTH_VARIANTS[level], label: STRENGTH_LABELS[level] };
  });

  protected readonly valid = computed(() => this.rules().every((rule) => rule.met));
  protected readonly passwordError = computed(
    () => this.passwordTouched() && !this.characterRules().every((rule) => rule.met),
  );
  protected readonly confirmError = computed(() => this.confirmTouched() && !this.matches());

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy() || !this.valid()) return;
    this.failed.set(false);
    this.busy.set(true);
    try {
      // The token comes from the link in the email.
      // await this.auth.resetPassword(token, this.password());
      // await this.router.navigate(['/forgot-password/done']);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
`;
