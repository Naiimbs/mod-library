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
import { SignupForm, signupCode } from './signup-form';

const TEXT = {
  en: {
    logoAlt: 'Ministry of Defense',
    title: 'Create an account',
    subtitle: 'Enter your details to start using the system',
    copyright: '© Ministry of Defense 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    logoAlt: 'وزارة الدفاع',
    title: 'إنشاء حساب',
    subtitle: 'أدخل بياناتك للبدء في استخدام النظام',
    copyright: '© وزارة الدفاع 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

/**
 * Centered sign-up: logo and language switch on top, then the heading and the
 * form (full name, email, password with a live rules checklist, terms) in one
 * narrow column.
 */
@Component({
  selector: 'demo-signup-centered',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModAuthLayout, ModAuthHeader, ModAuthLogo, ModAuthActions, ModAuthFooter, ModButton, SignupForm, ModIcon],
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

      <mod-auth-header [heading]="t().title" [description]="t().subtitle" underline />

      <demo-signup-form [lang]="lang()" />

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
})
export class SignupCenteredExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const SIGNUP_CENTERED_CODE = signupCode({
  authImports: 'ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo',
  open: '    <mod-auth-layout variant="centered">',
  slots: `      <img modAuthLogo src="assets/img/mod-logo-full.png" width="132" height="136" alt="Ministry of Defense" />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <mod-auth-header
        heading="Create an account"
        description="Enter your details to start using the system"
        underline
      />`,
});
