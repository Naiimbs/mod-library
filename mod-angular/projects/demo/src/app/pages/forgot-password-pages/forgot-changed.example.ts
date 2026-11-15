import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModButton,
  ModIcon,
} from '@mod-internal/ui';

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    language: 'عربي',
    title: 'Password changed',
    text: 'Your password has been updated. Use the new password the next time you log in.',
    note: 'For your security, you have been signed out of all other devices.',
    continue: 'Continue to log in',
    copyright: '© Organization name 2026 — All rights reserved',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    language: 'English',
    title: 'تم تغيير كلمة المرور',
    text: 'تم تحديث كلمة المرور. استخدم كلمة المرور الجديدة عند تسجيل الدخول في المرة القادمة.',
    note: 'حفاظًا على أمان حسابك، تم تسجيل خروجك من جميع الأجهزة الأخرى.',
    continue: 'المتابعة إلى تسجيل الدخول',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
  },
} as const;

/** Last step of the password reset: the success state. */
@Component({
  selector: 'demo-forgot-changed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter, ModButton, ModIcon],
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

      <mod-auth-header icon="checkmark-circle-02" [heading]="t().title" [description]="t().text">
        <p class="auth-header__text">{{ t().note }}</p>
      </mod-auth-header>

      <a mod-button href="#" style="width: 100%;" (click)="$event.preventDefault()">{{ t().continue }}</a>

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
})
export class ForgotChangedExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const FORGOT_CHANGED_CODE = `import { Component } from '@angular/core';
import { ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModButton } from '@mod-internal/ui';

@Component({
  selector: 'app-password-changed',
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthFooter, ModButton],
  template: \`
    <mod-auth-layout variant="centered">
      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />

      <mod-auth-header
        icon="checkmark-circle-02"
        heading="Password changed"
        description="Your password has been updated. Use the new password the next time you log in."
      >
        <p class="auth-header__text">For your security, you have been signed out of all other devices.</p>
      </mod-auth-header>

      <a mod-button href="/login" style="width: 100%;">Continue to log in</a>

      <span modAuthFooter>© Organization name 2026 — All rights reserved</span>
    </mod-auth-layout>
  \`,
})
export class PasswordChanged {}
`;
