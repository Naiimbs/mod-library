import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { LOGIN_CARD_CODE, LoginCardExample } from './login-card.example';
import { LOGIN_CENTERED_CODE, LoginCenteredExample } from './login-centered.example';
import { LOGIN_PANEL_START_CODE, LoginPanelStartExample } from './login-panel-start.example';
import { LOGIN_SPLIT_CODE, LoginSplitExample } from './login-split.example';
import { LOGIN_SSO_CODE, LoginSsoExample } from './login-sso.example';

@Component({
  selector: 'demo-login-pages-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DemoExample,
    LoginSplitExample,
    LoginCenteredExample,
    LoginCardExample,
    LoginPanelStartExample,
    LoginSsoExample,
  ],
  template: `
    <div class="content-header">
      <h1 class="content-title">Log in pages</h1>
      <p class="content-description">
        Complete sign-in pages built from the library components. Each example works in English and Arabic,
        adapts from desktop to mobile, and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="Split with image"
      badge="Default"
      description="The default: the sign-in of a hospital referral portal. Form on the start side, brand panel with the image, process icons and system name on the end side. Try an empty submit, or the password “wrong”."
      [code]="splitCode"
      [(rtl)]="splitRtl"
    >
      <demo-login-split [lang]="splitRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Centered"
      description="One narrow column: the emblem, the heading and the form, with “Remember me” and “Forgot password?” in one row and a link to sign up. For systems that do not need a brand panel. Try an empty submit, or the password “wrong”."
      [code]="centeredCode"
      [(rtl)]="centeredRtl"
    >
      <demo-login-centered [lang]="centeredRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Centered card"
      description="The same content inside a bordered card on the gray page background (the card and muted options of the auth layout)."
      [code]="cardCode"
      [(rtl)]="cardRtl"
    >
      <demo-login-card [lang]="cardRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Split, panel on the start side"
      description="The brand panel comes first and has no photo: a solid dark-green panel with the system name and three points about what the system does. On narrow screens the panel becomes a banner above the form."
      [code]="panelStartCode"
      [(rtl)]="panelStartRtl"
    >
      <demo-login-panel-start [lang]="panelStartRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="With single sign-on"
      description="Credentials form as the primary action, then a divider and a secondary button for the national single sign-on, with a notice about the lockout rule. Use the password “wrong” to see the remaining attempts count down; the fifth failure locks the form."
      [code]="ssoCode"
      [(rtl)]="ssoRtl"
    >
      <demo-login-sso [lang]="ssoRtl() ? 'ar' : 'en'" />
    </demo-example>
  `,
})
export class LoginPagesPage {
  protected readonly splitCode = LOGIN_SPLIT_CODE;
  protected readonly splitRtl = signal(false);
  protected readonly centeredCode = LOGIN_CENTERED_CODE;
  protected readonly centeredRtl = signal(false);
  protected readonly cardCode = LOGIN_CARD_CODE;
  protected readonly cardRtl = signal(false);
  protected readonly panelStartCode = LOGIN_PANEL_START_CODE;
  protected readonly panelStartRtl = signal(false);
  protected readonly ssoCode = LOGIN_SSO_CODE;
  protected readonly ssoRtl = signal(false);
}
