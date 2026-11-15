import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModInlineAlert,
  ModLink,
  ModOtpInput,
  ModIcon,
} from '@mod-internal/ui';
import { injectCodeFlow } from './code-flow';

const MASKED_EMAIL = 'm•••••••d@example.org';

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    language: 'عربي',
    title: 'Check your email',
    sentTo: 'Enter the 6-digit code we sent to',
    codeLabel: 'Verification code',
    digitLabel: (position: number, length: number) => `Digit ${position} of ${length}`,
    incorrect: 'The code is incorrect. Check it and try again.',
    verify: 'Verify',
    verifying: 'Verifying...',
    success: 'Email verified. (This is a demo: nothing was sent.)',
    resent: 'A new code has been sent to your email.',
    noCode: 'Didn’t receive the code?',
    resend: 'Resend',
    wait: (seconds: number) => `(available in ${seconds} s)`,
    back: 'Back to log in',
    copyright: '© Organization name 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    language: 'English',
    title: 'تحقق من بريدك الإلكتروني',
    sentTo: 'أدخل الرمز المكوّن من 6 أرقام المرسل إلى',
    codeLabel: 'رمز التحقق',
    digitLabel: (position: number, length: number) => `الخانة ${position} من ${length}`,
    incorrect: 'الرمز غير صحيح. تأكد منه ثم حاول مرة أخرى.',
    verify: 'تحقق',
    verifying: 'جارٍ التحقق...',
    success: 'تم التحقق من البريد الإلكتروني. (هذا عرض تجريبي: لم يُرسل أي شيء.)',
    resent: 'تم إرسال رمز جديد إلى بريدك الإلكتروني.',
    noCode: 'لم يصلك الرمز؟',
    resend: 'إعادة الإرسال',
    wait: (seconds: number) => `(متاحة بعد ${seconds} ثانية)`,
    back: 'العودة إلى تسجيل الدخول',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
  },
} as const;

/**
 * Email verification with a 6-digit code, centred on the page.
 *
 * Demo behaviour: the Verify button is enabled when all six boxes are filled;
 * the code 000000 is "incorrect" (error state on the boxes and a message),
 * any other code succeeds. Resend is disabled for 30 seconds after each send.
 */
@Component({
  selector: 'demo-verify-email-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModButton,
    ModInlineAlert,
    ModLink,
    ModOtpInput,
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

      <mod-auth-header icon="mail-01" [heading]="t().title">
        <p class="auth-header__text">
          {{ t().sentTo }} <strong class="target" dir="ltr">{{ email }}</strong>
        </p>
      </mod-auth-header>

      <form class="form" novalidate (submit)="submit($event)">
        @if (flow.state() === 'success') {
          <mod-inline-alert variant="success" colored [heading]="t().success" />
        } @else if (flow.state() === 'resent') {
          <mod-inline-alert variant="info" colored [heading]="t().resent" />
        }

        <div class="code">
          <mod-otp-input
            [value]="flow.code()"
            [error]="flow.state() === 'error'"
            [disabled]="flow.busy()"
            [ariaLabel]="t().codeLabel"
            [digitLabel]="t().digitLabel"
            (valueChange)="flow.setCode($event)"
          />
          @if (flow.state() === 'error') {
            <p class="code__error" role="alert">{{ t().incorrect }}</p>
          }
        </div>

        <button mod-button type="submit" style="width: 100%;" [disabled]="!flow.complete() || flow.busy()">
          {{ flow.busy() ? t().verifying : t().verify }}
        </button>
      </form>

      <p class="hint">
        {{ t().noCode }}
        <a mod-link href="#" [disabled]="flow.waiting()" (click)="resend($event)">{{ t().resend }}</a>
        @if (flow.waiting()) {
          <span class="hint__wait">{{ t().wait(flow.remaining()) }}</span>
        }
      </p>

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

    .code {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      gap: var(--spacing-lg);
    }

    .code__error {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 20px;
      text-align: center;
      color: var(--error-700);
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
export class VerifyEmailCodeExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
  /** The back arrow points to the start side of the page. */
  protected readonly backIcon = computed(() => (this.lang() === 'ar' ? 'arrow-right-01' : 'arrow-left-01'));

  protected readonly email = MASKED_EMAIL;
  protected readonly flow = injectCodeFlow(6);

  protected submit(event: Event): void {
    event.preventDefault();
    this.flow.verify();
  }

  protected resend(event: Event): void {
    event.preventDefault();
    this.flow.resend();
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const VERIFY_EMAIL_CODE_CODE = `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo,
  ModButton, ModLink, ModOtpInput,
} from '@mod-internal/ui';

const RESEND_SECONDS = 30;

@Component({
  selector: 'app-verify-email',
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter, ModButton, ModLink, ModOtpInput],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header icon="mail-01" heading="Check your email">
        <p class="auth-header__text">
          Enter the 6-digit code we sent to <strong dir="ltr">{{ maskedEmail }}</strong>
        </p>
      </mod-auth-header>

      <form (submit)="verify($event)" novalidate style="display: grid; gap: var(--spacing-3xl);">
        <div style="display: grid; justify-items: center; gap: var(--spacing-lg);">
          <mod-otp-input [(value)]="code" [error]="incorrect()" [disabled]="busy()" />
          @if (incorrect()) {
            <p role="alert" style="margin: 0; font-size: var(--font-size-sm); color: var(--error-700);">
              The code is incorrect. Check it and try again.
            </p>
          }
        </div>

        <button mod-button type="submit" style="width: 100%;" [disabled]="code().length < 6 || busy()">
          {{ busy() ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <p style="margin: 0; text-align: center; font-size: var(--font-size-sm); color: var(--gray-600);">
        Didn’t receive the code?
        <a mod-link href="#" [disabled]="waiting()" (click)="resend($event)">Resend</a>
        @if (waiting()) {
          <span>(available in {{ remaining() }} s)</span>
        }
      </p>

      <p style="margin: 0; text-align: center; font-size: var(--font-size-sm);">
        <a mod-link variant="secondary" href="/login">Back to log in</a>
      </p>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class VerifyEmail {
  private readonly destroyRef = inject(DestroyRef);
  private interval: ReturnType<typeof setInterval> | undefined;

  // Mask the address on the server; never send the full address to this page.
  protected readonly maskedEmail = 'm•••••••d@example.org';
  protected readonly code = signal('');
  protected readonly busy = signal(false);
  protected readonly incorrect = signal(false);
  protected readonly remaining = signal(0);
  protected readonly waiting = computed(() => this.remaining() > 0);

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.interval));
    this.startCountdown();
  }

  protected async verify(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy() || this.code().length < 6) return;
    this.incorrect.set(false);
    this.busy.set(true);
    try {
      // await this.auth.verifyEmail(this.code());
      // then navigate to the next step
    } catch {
      this.incorrect.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  protected resend(event: Event): void {
    event.preventDefault();
    if (this.waiting()) return;
    // this.auth.resendEmailCode();
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
