import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { FORGOT_CHANGED_CODE, ForgotChangedExample } from './forgot-changed.example';
import { FORGOT_NEW_PASSWORD_CODE, ForgotNewPasswordExample } from './forgot-new-password.example';
import { FORGOT_REQUEST_CODE, ForgotRequestExample } from './forgot-request.example';
import { FORGOT_SENT_CODE, ForgotSentExample } from './forgot-sent.example';

@Component({
  selector: 'demo-forgot-password-pages-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, ForgotRequestExample, ForgotSentExample, ForgotNewPasswordExample, ForgotChangedExample],
  template: `
    <div class="content-header">
      <h1 class="content-title">Forgot password pages</h1>
      <p class="content-description">
        The whole password reset flow in four pages: request the reset, check your email, set a new password, and
        the confirmation. Each example works in English and Arabic, adapts from desktop to mobile, and can be
        copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="1. Request reset"
      description="Asks for the email address or user name of the account. Try an empty submit, or a value such as “a b”, to see the validation. The confirmation does not reveal whether the account exists."
      [code]="requestCode"
      [(rtl)]="requestRtl"
    >
      <demo-forgot-request [lang]="requestRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="2. Check your email"
      description="Confirms that the instructions were sent to a masked address. Resend is disabled for 30 seconds after each send."
      [code]="sentCode"
      [(rtl)]="sentRtl"
    >
      <demo-forgot-sent [lang]="sentRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="3. Set new password"
      description="The page the emailed link opens, shown as a card. The strength bar and the checklist update while typing, and the button is enabled only when every rule is met. Try “Referral#2026”."
      minHeight="960px"
      [code]="newPasswordCode"
      [(rtl)]="newPasswordRtl"
    >
      <demo-forgot-new-password [lang]="newPasswordRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="4. Password changed"
      description="The success state that ends the flow and leads back to the log in page."
      [code]="changedCode"
      [(rtl)]="changedRtl"
    >
      <demo-forgot-changed [lang]="changedRtl() ? 'ar' : 'en'" />
    </demo-example>
  `,
})
export class ForgotPasswordPagesPage {
  protected readonly requestCode = FORGOT_REQUEST_CODE;
  protected readonly requestRtl = signal(false);
  protected readonly sentCode = FORGOT_SENT_CODE;
  protected readonly sentRtl = signal(false);
  protected readonly newPasswordCode = FORGOT_NEW_PASSWORD_CODE;
  protected readonly newPasswordRtl = signal(false);
  protected readonly changedCode = FORGOT_CHANGED_CODE;
  protected readonly changedRtl = signal(false);
}
