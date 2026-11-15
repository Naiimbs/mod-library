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
import { injectCountdown } from './countdown';

const MASKED_EMAIL = 'm•••••••d@example.org';

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    language: 'عربي',
    switchLabel: 'Page state',
    switchSent: 'Link sent',
    switchVerified: 'Email verified',
    sentTitle: 'We sent a verification link',
    sentTo: 'Open the link we sent to',
    sentNote: 'to confirm your email address. The link is valid for 30 minutes.',
    openMail: 'Open email app',
    resent: 'A new link has been sent. Check your inbox and the junk folder.',
    noLink: 'Didn’t receive the email?',
    resend: 'Resend link',
    wait: (seconds: number) => `(available in ${seconds} s)`,
    back: 'Back to log in',
    verifiedTitle: 'Email verified',
    verifiedText: 'Your email address has been confirmed. You can now continue to the system.',
    continue: 'Continue',
    copyright: '© Organization name 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    language: 'English',
    switchLabel: 'حالة الصفحة',
    switchSent: 'تم إرسال الرابط',
    switchVerified: 'تم التحقق',
    sentTitle: 'أرسلنا إليك رابط التحقق',
    sentTo: 'افتح الرابط المرسل إلى',
    sentNote: 'لتأكيد بريدك الإلكتروني. الرابط صالح لمدة 30 دقيقة.',
    openMail: 'فتح تطبيق البريد',
    resent: 'تم إرسال رابط جديد. تحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.',
    noLink: 'لم تصلك الرسالة؟',
    resend: 'إعادة إرسال الرابط',
    wait: (seconds: number) => `(متاحة بعد ${seconds} ثانية)`,
    back: 'العودة إلى تسجيل الدخول',
    verifiedTitle: 'تم التحقق من البريد الإلكتروني',
    verifiedText: 'تم تأكيد بريدك الإلكتروني. يمكنك الآن المتابعة إلى النظام.',
    continue: 'متابعة',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
  },
} as const;

/**
 * Verification by link, in its two states: "link sent" (open the email app,
 * resend with a 30-second countdown) and "email verified" (the page the link
 * opens). The switch above the page belongs to the demo only: in an app the
 * two states are two routes.
 */
@Component({
  selector: 'demo-verify-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter, ModButton, ModLink, ModIcon],
  template: `
    <div class="switch" role="group" [attr.aria-label]="t().switchLabel">
      <span class="switch__label" aria-hidden="true">{{ t().switchLabel }}</span>
      <button
        mod-button
        type="button"
        variant="secondary-outline"
        size="small"
        [selected]="view() === 'sent'"
        (click)="view.set('sent')"
      >
        {{ t().switchSent }}
      </button>
      <button
        mod-button
        type="button"
        variant="secondary-outline"
        size="small"
        [selected]="view() === 'verified'"
        (click)="view.set('verified')"
      >
        {{ t().switchVerified }}
      </button>
    </div>

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

      @if (view() === 'sent') {
        <mod-auth-header icon="mail-open-01" [heading]="t().sentTitle">
          <p class="auth-header__text">
            {{ t().sentTo }} <strong class="target" dir="ltr">{{ email }}</strong> {{ t().sentNote }}
          </p>
        </mod-auth-header>

        <a mod-button href="#" style="width: 100%;" (click)="$event.preventDefault()">{{ t().openMail }}</a>

        <div class="resend">
          <p class="hint">
            {{ t().noLink }}
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
      } @else {
        <mod-auth-header
          icon="checkmark-circle-02"
          [heading]="t().verifiedTitle"
          [description]="t().verifiedText"
        />

        <a mod-button href="#" style="width: 100%;" (click)="$event.preventDefault()">{{ t().continue }}</a>
      }

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .switch {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-2xl);
      border-block-end: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .switch__label {
      margin-inline-end: var(--spacing-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--gray-600);
    }

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
export class VerifyLinkExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
  /** The back arrow points to the start side of the page. */
  protected readonly backIcon = computed(() => (this.lang() === 'ar' ? 'arrow-right-01' : 'arrow-left-01'));

  protected readonly email = MASKED_EMAIL;
  protected readonly view = signal<'sent' | 'verified'>('sent');
  protected readonly resent = signal(false);
  protected readonly countdown = injectCountdown();

  constructor() {
    // The page opens right after the link was sent.
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
export const VERIFY_LINK_CODE = `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModButton, ModLink,
} from '@mod-internal/ui';

const RESEND_SECONDS = 30;

/** Page shown after the verification link was sent. */
@Component({
  selector: 'app-verify-link-sent',
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter, ModButton, ModLink],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header icon="mail-open-01" heading="We sent a verification link">
        <p class="auth-header__text">
          Open the link we sent to <strong dir="ltr">{{ maskedEmail }}</strong>
          to confirm your email address. The link is valid for 30 minutes.
        </p>
      </mod-auth-header>

      <a mod-button href="mailto:" style="width: 100%;">Open email app</a>

      <div style="display: grid; gap: var(--spacing-md); text-align: center; font-size: var(--font-size-sm);">
        <p style="margin: 0; color: var(--gray-600);">
          Didn’t receive the email?
          <a mod-link href="#" [disabled]="waiting()" (click)="resend($event)">Resend link</a>
          @if (waiting()) {
            <span>(available in {{ remaining() }} s)</span>
          }
        </p>
        <p role="status" style="margin: 0; color: var(--success-700);">
          {{ resent() ? 'A new link has been sent. Check your inbox and the junk folder.' : '' }}
        </p>
      </div>

      <p style="margin: 0; text-align: center; font-size: var(--font-size-sm);">
        <a mod-link variant="secondary" href="/login">Back to log in</a>
      </p>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class VerifyLinkSent {
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
    // this.auth.resendVerificationLink();
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

/** Page the verification link opens once the address is confirmed. */
@Component({
  selector: 'app-email-verified',
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter, ModButton],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header
        icon="checkmark-circle-02"
        heading="Email verified"
        description="Your email address has been confirmed. You can now continue to the system."
      />

      <a mod-button href="/" style="width: 100%;">Continue</a>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class EmailVerified {}
`;
