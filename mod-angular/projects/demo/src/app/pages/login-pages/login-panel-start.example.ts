import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ModAuthActions,
  ModAuthFooter,
  ModAuthHeader,
  ModAuthLayout,
  ModAuthLogo,
  ModAuthPanel,
  ModButton,
  ModIcon,
} from '@mod-internal/ui';
import { LoginForm, loginCode } from './login-form';

const TEXT = {
  en: {
    logoAlt: 'Organization name',
    system: 'Medical Referrals and Patient Transfer System',
    tagline: 'One system for the full referral path between hospitals.',
    points: [
      'Submit referral requests and follow their review step by step',
      'Book appointments and beds at the receiving hospital',
      'Record attendance and expenses for every transfer',
    ],
    title: 'Sign in to the system',
    subtitle: 'Enter your user name and password to continue',
    copyright: '© Organization name 2026 — All rights reserved',
    language: 'عربي',
  },
  ar: {
    logoAlt: 'اسم الجهة',
    system: 'النظام الخاص بإدارة الإحالات الطبية وتحويل المرضى',
    tagline: 'نظام واحد لمسار الإحالة كاملًا بين المستشفيات.',
    points: [
      'تقديم طلبات الإحالة ومتابعة مراجعتها خطوة بخطوة',
      'حجز المواعيد والأسرّة في المستشفى المستقبِل',
      'تسجيل الحضور والمصروفات لكل عملية تحويل',
    ],
    title: 'تسجيل الدخول للنظام',
    subtitle: 'أدخل اسم المستخدم وكلمة المرور للمتابعة',
    copyright: '© اسم الجهة 2026 — جميع الحقوق محفوظة',
    language: 'English',
  },
} as const;

/**
 * Split sign-in with the brand panel on the start side. No photo: the panel
 * is solid dark green and lists what the system does in three points.
 */
@Component({
  selector: 'demo-login-panel-start',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModAuthLayout,
    ModAuthHeader,
    ModAuthLogo,
    ModAuthActions,
    ModAuthFooter,
    ModAuthPanel,
    ModButton,
    LoginForm,
    ModIcon,
  ],
  template: `
    <mod-auth-layout panelStart [panelTitle]="t().system" [panelText]="t().tagline">
      <ul modAuthPanel class="login-points">
        @for (point of t().points; track point) {
          <li class="login-points__item">
            <mod-icon name="checkmark-circle-02" />
            <span>{{ point }}</span>
          </li>
        }
      </ul>

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

      <demo-login-form [lang]="lang()" />

      <span modAuthFooter>{{ t().copyright }}</span>
    </mod-auth-layout>
  `,
  styles: `
    .login-points {
      display: grid;
      gap: var(--spacing-lg);
      margin: var(--spacing-md) 0 0;
      padding: 0;
      list-style: none;
    }

    .login-points__item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-lg);
      font-size: 15px;
      line-height: 1.7;
      color: var(--sad-100);
    }

    .login-points__item .icon {
      flex-shrink: 0;
      margin-block-start: 2px;
      font-size: 20px;
      color: var(--sa-300);
    }
  `,
})
export class LoginPanelStartExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const LOGIN_PANEL_START_CODE = loginCode({
  authImports: 'ModAuthActions, ModAuthFooter, ModAuthHeader, ModAuthLayout, ModAuthLogo, ModAuthPanel',
  open: `    <mod-auth-layout
      panelStart
      panelTitle="Medical Referrals and Patient Transfer System"
      panelText="One system for the full referral path between hospitals."
    >`,
  slots: `      <ul modAuthPanel class="sign-in__points">
        <li><mod-icon name="checkmark-circle-02" /> Submit referral requests and follow their review step by step</li>
        <li><mod-icon name="checkmark-circle-02" /> Book appointments and beds at the receiving hospital</li>
        <li><mod-icon name="checkmark-circle-02" /> Record attendance and expenses for every transfer</li>
      </ul>

      <img modAuthLogo src="assets/img/logo.svg" width="132" height="136" alt="Organization name" />
      <button modAuthActions mod-button variant="secondary-outline" size="medium" type="button" (click)="toggleLanguage()">
        <mod-icon name="language-square" /> عربي
      </button>

      <mod-auth-header
        heading="Sign in to the system"
        description="Enter your user name and password to continue"
        underline
      />`,
  styles: `    .sign-in__points {
      display: grid;
      gap: var(--spacing-lg);
      margin: var(--spacing-md) 0 0;
      padding: 0;
      list-style: none;
    }

    .sign-in__points li {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-lg);
      line-height: 1.7;
      color: var(--sad-100);
    }

    .sign-in__points .icon {
      flex-shrink: 0;
      font-size: 20px;
      color: var(--sa-300);
    }`,
});
