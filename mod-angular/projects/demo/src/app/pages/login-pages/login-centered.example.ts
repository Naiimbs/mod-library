import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModButton, ModIcon } from '@mod-internal/ui';
import { LoginForm, loginCode } from './login-form';

const TEXT = {
  en: {
    emblemAlt: 'Ministry of Defense',
    title: 'Sign in to your account',
    subtitle: 'Welcome back. Enter your details to continue.',
    copyright: '© Ministry of Defense 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    emblemAlt: 'وزارة الدفاع',
    title: 'تسجيل الدخول إلى حسابك',
    subtitle: 'مرحبًا بعودتك. أدخل بياناتك للمتابعة.',
    copyright: '© وزارة الدفاع 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

/**
 * Centered sign-in: the emblem above the heading, then the credentials form,
 * in one narrow column on the page.
 */
@Component({
  selector: 'demo-login-centered',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModAuthLayout, ModAuthHeader, ModAuthActions, ModAuthFooter, ModButton, LoginForm, ModIcon],
  template: `
    <mod-auth-layout variant="centered">
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button">
        <mod-icon name="language-square" /> {{ t().language }}
      </button>

      <img class="login-emblem" src="examples/mod-emblem@2x.png" width="64" height="66" [alt]="t().emblemAlt" />
      <mod-auth-header [heading]="t().title" [description]="t().subtitle" />

      <demo-login-form [lang]="lang()" />

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .login-emblem {
      display: block;
      width: 64px;
      height: auto;
      margin-inline: auto;
    }
  `,
})
export class LoginCenteredExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const LOGIN_CENTERED_CODE = loginCode({
  authImports: 'ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout',
  open: '    <mod-auth-layout variant="centered">',
  slots: `      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <img class="sign-in__emblem" src="assets/img/mod-emblem@2x.png" width="64" height="66" alt="Ministry of Defense" />
      <mod-auth-header
        heading="Sign in to your account"
        description="Welcome back. Enter your details to continue."
      />`,
  styles: `    .sign-in__emblem {
      display: block;
      width: 64px;
      height: auto;
      margin-inline: auto;
    }`,
});
