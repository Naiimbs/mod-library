import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModLink,
  ModOtpInput,
  ModIcon,
} from '@mod-internal/ui';
import { injectCodeFlow } from './code-flow';

const MASKED_MOBILE = '+966 5• ••• ••12';

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    language: 'عربي',
    title: 'Verify your mobile number',
    sentTo: 'Enter the 4-digit code sent by SMS to',
    change: 'Change number',
    codeLabel: 'Verification code',
    digitLabel: (position: number, length: number) => `Digit ${position} of ${length}`,
    auto: 'The code is checked automatically when you enter the last digit.',
    incorrect: 'The code is incorrect. Enter it again.',
    verifying: 'Verifying the code...',
    success: 'Mobile number verified. (This is a demo: nothing was sent.)',
    resent: 'A new code has been sent by SMS.',
    noCode: 'Didn’t receive the code?',
    resend: 'Resend',
    wait: (seconds: number) => `(available in ${seconds} s)`,
    copyright: '© Organization name 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    language: 'English',
    title: 'تحقق من رقم جوالك',
    sentTo: 'أدخل الرمز المكوّن من 4 أرقام المرسل برسالة نصية إلى',
    change: 'تغيير الرقم',
    codeLabel: 'رمز التحقق',
    digitLabel: (position: number, length: number) => `الخانة ${position} من ${length}`,
    auto: 'يتم التحقق من الرمز تلقائيًا عند إدخال الرقم الأخير.',
    incorrect: 'الرمز غير صحيح. أدخله مرة أخرى.',
    verifying: 'جارٍ التحقق من الرمز...',
    success: 'تم التحقق من رقم الجوال. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    resent: 'تم إرسال رمز جديد برسالة نصية.',
    noCode: 'لم يصلك الرمز؟',
    resend: 'إعادة الإرسال',
    wait: (seconds: number) => `(متاحة بعد ${seconds} ثانية)`,
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
  },
} as const;

/**
 * Mobile verification with a 4-digit SMS code, in a card.
 *
 * There is no submit button: the code is checked as soon as the fourth digit
 * is entered (the `completed` output). Demo behaviour: 0000 is "incorrect",
 * any other code succeeds; editing the code cancels a running check.
 */
@Component({
  selector: 'demo-verify-sms-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModButton,
    ModLink,
    ModOtpInput,
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

      <mod-auth-header icon="smart-phone-01" [heading]="t().title">
        <p class="auth-header__text">
          {{ t().sentTo }} <strong class="target" dir="ltr">{{ mobile }}</strong>
        </p>
        <a mod-link size="sm" href="#" (click)="$event.preventDefault()">{{ t().change }}</a>
      </mod-auth-header>

      <div class="code">
        <mod-otp-input
          length="4"
          size="large"
          [value]="flow.code()"
          [error]="flow.state() === 'error'"
          [ariaLabel]="t().codeLabel"
          [digitLabel]="t().digitLabel"
          (valueChange)="flow.setCode($event)"
          (completed)="flow.verify()"
        />
        @if (flow.state() === 'error') {
          <p class="code__error" role="alert">{{ t().incorrect }}</p>
        }
        <p class="code__status" role="status" [class.code__status--success]="flow.state() === 'success'">
          @if (flow.state() === 'success') {
            <mod-icon name="checkmark-circle-02" />
          }
          {{ status() }}
        </p>
      </div>

      <p class="hint">
        {{ t().noCode }}
        <a mod-link href="#" [disabled]="flow.waiting()" (click)="resend($event)">{{ t().resend }}</a>
        @if (flow.waiting()) {
          <span class="hint__wait">{{ t().wait(flow.remaining()) }}</span>
        }
      </p>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .code {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      gap: var(--spacing-lg);
    }

    .code__error,
    .code__status {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 20px;
      text-align: center;
    }

    .code__error {
      color: var(--error-700);
    }

    .code__status {
      min-height: 20px;
      color: var(--gray-600);
    }

    .code__status--success {
      color: var(--success-700);
      font-weight: var(--font-weight-medium);
    }

    .code__status .icon {
      font-size: 18px;
      vertical-align: middle;
    }

    .target {
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
      white-space: nowrap;
    }

    .hint {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 22px;
      text-align: center;
      color: var(--gray-600);
    }

    .hint__wait {
      color: var(--gray-500);
      white-space: nowrap;
    }
  `,
})
export class VerifySmsCodeExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly mobile = MASKED_MOBILE;
  protected readonly flow = injectCodeFlow(4);

  /** Text of the live status line under the boxes. */
  protected readonly status = computed(() => {
    const t = this.t();
    switch (this.flow.state()) {
      case 'busy':
        return t.verifying;
      case 'success':
        return t.success;
      case 'resent':
        return t.resent;
      case 'error':
        return '';
      default:
        return t.auto;
    }
  });

  protected resend(event: Event): void {
    event.preventDefault();
    this.flow.resend();
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const VERIFY_SMS_CODE_CODE = `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModLink, ModOtpInput,
} from '@mod-internal/ui';

const RESEND_SECONDS = 30;

@Component({
  selector: 'app-verify-mobile',
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter, ModLink, ModOtpInput],
  template: \`
    <mod-auth-layout variant="centered" card muted>
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header icon="smart-phone-01" heading="Verify your mobile number">
        <p class="auth-header__text">
          Enter the 4-digit code sent by SMS to <strong dir="ltr">{{ maskedMobile }}</strong>
        </p>
        <a mod-link size="sm" href="/account/mobile">Change number</a>
      </mod-auth-header>

      <div style="display: grid; justify-items: center; gap: var(--spacing-lg);">
        <!-- No submit button: the code is checked when the last digit is entered. -->
        <mod-otp-input
          length="4"
          size="large"
          [(value)]="code"
          [error]="incorrect()"
          (completed)="verify($event)"
        />
        @if (incorrect()) {
          <p role="alert" style="margin: 0; font-size: var(--font-size-sm); color: var(--error-700);">
            The code is incorrect. Enter it again.
          </p>
        }
        <p role="status" style="margin: 0; min-height: 20px; font-size: var(--font-size-sm); color: var(--gray-600);">
          {{ busy() ? 'Verifying the code...' : '' }}
        </p>
      </div>

      <p style="margin: 0; text-align: center; font-size: var(--font-size-sm); color: var(--gray-600);">
        Didn’t receive the code?
        <a mod-link href="#" [disabled]="waiting()" (click)="resend($event)">Resend</a>
        @if (waiting()) {
          <span>(available in {{ remaining() }} s)</span>
        }
      </p>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class VerifyMobile {
  private readonly destroyRef = inject(DestroyRef);
  private interval: ReturnType<typeof setInterval> | undefined;

  // Mask the number on the server; never send the full number to this page.
  protected readonly maskedMobile = '+966 5• ••• ••12';
  protected readonly code = signal('');
  protected readonly busy = signal(false);
  protected readonly incorrect = signal(false);
  protected readonly remaining = signal(0);
  protected readonly waiting = computed(() => this.remaining() > 0);

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.interval));
    this.startCountdown();
  }

  protected async verify(code: string): Promise<void> {
    if (this.busy()) return;
    this.incorrect.set(false);
    this.busy.set(true);
    try {
      // await this.auth.verifyMobile(code);
      // then navigate to the next step
    } catch {
      this.incorrect.set(true);
      this.code.set('');
    } finally {
      this.busy.set(false);
    }
  }

  protected resend(event: Event): void {
    event.preventDefault();
    if (this.waiting()) return;
    // this.auth.resendSmsCode();
    this.code.set('');
    this.incorrect.set(false);
    this.startCountdown();
  }

  private startCountdown(): void {
    clearInterval(this.interval);
    this.remaining.set(RESEND_SECONDS);
    this.interval = setInterval(() => {
      this.remaining.update((value) => Math.max(0, value - 1));
      if (this.remaining() === 0) clearInterval(this.interval);
    }, 1000);
  }
}
`;
