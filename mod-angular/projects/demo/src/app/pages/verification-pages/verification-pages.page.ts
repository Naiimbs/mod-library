import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { VERIFY_EMAIL_CODE_CODE, VerifyEmailCodeExample } from './verify-email-code.example';
import { VERIFY_LINK_CODE, VerifyLinkExample } from './verify-link.example';
import { VERIFY_SMS_CODE_CODE, VerifySmsCodeExample } from './verify-sms-code.example';
import { VERIFY_SPLIT_CODE, VerifySplitExample } from './verify-split.example';

@Component({
  selector: 'demo-verification-pages-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, VerifyEmailCodeExample, VerifySmsCodeExample, VerifySplitExample, VerifyLinkExample],
  template: `
    <div class="content-header">
      <h1 class="content-title">Verification pages</h1>
      <p class="content-description">
        Pages that confirm an email address or a mobile number with a one-time code or a link. Each example works
        in English and Arabic, adapts from desktop to mobile, and can be copied from the Code tab. The code boxes
        always run left to right; the text around them follows the page direction.
      </p>
    </div>

    <demo-example
      heading="Email code"
      description="Centered page with a 6-digit code. Verify is enabled when all boxes are filled, and Resend is disabled for 30 seconds after each send. Try the code 000000 to see the error state; any other code succeeds."
      [code]="emailCode"
      [(rtl)]="emailRtl"
    >
      <demo-verify-email-code [lang]="emailRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="SMS code"
      description="Card with four large boxes and no submit button: the code is checked as soon as the fourth digit is entered. Try 0000 to see the error state; any other code succeeds."
      [code]="smsCode"
      [(rtl)]="smsRtl"
    >
      <demo-verify-sms-code [lang]="smsRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Split with image"
      description="The second step of the default MOD sign-in: the 6-digit code, grouped three and three, next to the facility photo panel. Try 000000 to see the error state."
      [code]="splitCode"
      [(rtl)]="splitRtl"
    >
      <demo-verify-split [lang]="splitRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Link sent and verified"
      description="Verification by link instead of a code. Use the switch above the page to see its two states: the link was sent (open the email app, resend), and the page the link opens once the address is confirmed."
      [code]="linkCode"
      [(rtl)]="linkRtl"
    >
      <demo-verify-link [lang]="linkRtl() ? 'ar' : 'en'" />
    </demo-example>
  `,
})
export class VerificationPagesPage {
  protected readonly emailCode = VERIFY_EMAIL_CODE_CODE;
  protected readonly emailRtl = signal(false);
  protected readonly smsCode = VERIFY_SMS_CODE_CODE;
  protected readonly smsRtl = signal(false);
  protected readonly splitCode = VERIFY_SPLIT_CODE;
  protected readonly splitRtl = signal(false);
  protected readonly linkCode = VERIFY_LINK_CODE;
  protected readonly linkRtl = signal(false);
}
