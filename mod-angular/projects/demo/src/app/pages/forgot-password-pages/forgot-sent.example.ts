import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModLink,
  ModIcon,
} from '@mod-internal/ui';
import { injectCountdown } from '../verification-pages/countdown';

const MASKED_EMAIL = 'm•••••••d@example.org';

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    language: 'عربي',
    title: 'Check your email',
    sentTo: 'We sent the password reset instructions to',
    note: 'The link in the message is valid for 30 minutes and can be used once.',
    openMail: 'Open email app',
    resent: 'The instructions have been sent again. Check your inbox and the junk folder.',
    noMail: 'Didn’t receive the email?',
    resend: 'Resend',
    wait: (seconds: number) => `(available in ${seconds} s)`,
    back: 'Back to log in',
    copyright: '© Organization name 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    language: 'English',
    title: 'تحقق من بريدك الإلكتروني',
    sentTo: 'أرسلنا تعليمات إعادة تعيين كلمة المرور إلى',
    note: 'الرابط الوارد في الرسالة صالح لمدة 30 دقيقة ويُستخدم مرة واحدة فقط.',
    openMail: 'فتح تطبيق البريد',
    resent: 'تمت إعادة إرسال التعليمات. تحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.',
    noMail: 'لم تصلك الرسالة؟',
    resend: 'إعادة الإرسال',
    wait: (seconds: number) => `(متاحة بعد ${seconds} ثانية)`,
    back: 'العودة إلى تسجيل الدخول',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
  },
} as const;

/**
 * Second step of the password reset: the instructions were sent to a masked
 * address. Resend is disabled for 30 seconds after each send.
 */
@Component({
  selector: 'demo-forgot-sent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter, ModButton, ModLink, ModIcon],
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
        <p class="auth-header__text">{{ t().note }}</p>
      </mod-auth-header>

      <a mod-button href="#" style="width: 100%;" (click)="$event.preventDefault()">{{ t().openMail }}</a>

      <div class="resend">
        <p class="hint">
          {{ t().noMail }}
          <a mod-link href="#" [disabled]="countdown.running()" (click)="resend($event)">{{ t().resend }}</a>
          @if (countdown.running()) {
            <span class="hint__wait">{{ t().wait(countdown.remaining()) }}</span>
          }
        </p>
        <p class="resend__status" role="status">{{ resent() ? t().resent : '' }}</p>
      </div>

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
    .target {
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
      white-space: nowrap;
    }

    .resend {
      display: grid;
      gap: var(--spacing-md);
      font-size: var(--font-size-sm);
      line-height: 22px;
      text-align: center;
    }

    .hint {
      margin: 0;
      color: var(--gray-600);
    }

    .hint__wait {
      color: var(--gray-500);
      white-space: nowrap;
    }

    .resend__status {
      margin: 0;
      color: var(--success-700);
    }

    .resend__status:empty {
      display: none;
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
export class ForgotSentExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
  /** The back arrow points to the start side of the page. */
  protected readonly backIcon = computed(() => (this.lang() === 'ar' ? 'arrow-right-01' : 'arrow-left-01'));

  protected readonly email = MASKED_EMAIL;
  protected readonly resent = signal(false);
  protected readonly countdown = injectCountdown();

  constructor() {
    // The page opens right after the instructions were sent.
    this.countdown.start();
  }

  protected resend(event: Event): void {
    event.preventDefault();
    if (this.countdown.running()) return;
    // Stand-in for the real resend request.
    this.resent.set(true);
    this.countdown.start();
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const FORGOT_SENT_CODE = `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModButton, ModLink,
} from '@mod-internal/ui';

const RESEND_SECONDS = 30;

@Component({
  selector: 'app-forgot-password-sent',
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter, ModButton, ModLink],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header icon="mail-01" heading="Check your email">
        <p class="auth-header__text">
          We sent the password reset instructions to <strong dir="ltr">{{ maskedEmail }}</strong>
        </p>
        <p class="auth-header__text">The link in the message is valid for 30 minutes and can be used once.</p>
      </mod-auth-header>

      <a mod-button href="mailto:" style="width: 100%;">Open email app</a>

      <div style="display: grid; gap: var(--spacing-md); text-align: center; font-size: var(--font-size-sm);">
        <p style="margin: 0; color: var(--gray-600);">
          Didn’t receive the email?
          <a mod-link href="#" [disabled]="waiting()" (click)="resend($event)">Resend</a>
          @if (waiting()) {
            <span>(available in {{ remaining() }} s)</span>
          }
        </p>
        <p role="status" style="margin: 0; color: var(--success-700);">
          {{ resent() ? 'The instructions have been sent again. Check your inbox and the junk folder.' : '' }}
        </p>
      </div>

      <p style="margin: 0; text-align: center; font-size: var(--font-size-sm);">
        <a mod-link variant="secondary" href="/login">Back to log in</a>
      </p>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class ForgotPasswordSent {
  private readonly destroyRef = inject(DestroyRef);
  private interval: ReturnType<typeof setInterval> | undefined;

  // Mask the address on the server; never send the full address to this page.
  protected readonly maskedEmail = 'm•••••••d@example.org';
  protected readonly resent = signal(false);
  protected readonly remaining = signal(0);
  protected readonly waiting = computed(() => this.remaining() > 0);

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.interval));
    this.startCountdown();
  }

  protected resend(event: Event): void {
    event.preventDefault();
    if (this.waiting()) return;
    // this.auth.requestPasswordReset(account);
    this.resent.set(true);
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
