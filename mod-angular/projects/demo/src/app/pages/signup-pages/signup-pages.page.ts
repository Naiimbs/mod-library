import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { SIGNUP_CENTERED_CODE, SignupCenteredExample } from './signup-centered.example';
import { SIGNUP_REQUEST_CODE, SignupRequestExample } from './signup-request.example';
import { SIGNUP_SPLIT_CODE, SignupSplitExample } from './signup-split.example';
import { SIGNUP_STEPS_CODE, SignupStepsExample } from './signup-steps.example';

@Component({
  selector: 'demo-signup-pages-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, SignupCenteredExample, SignupSplitExample, SignupStepsExample, SignupRequestExample],
  template: `
    <div class="content-header">
      <h1 class="content-title">Sign up pages</h1>
      <p class="content-description">
        Complete registration pages built from the library components: self sign-up, a multi-step form, and the
        request-access variant for internal systems. Each example works in English and Arabic, validates its
        fields, adapts from desktop to mobile, and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="Centered"
      description="Full name, email and password in one narrow column. The checklist under the password ticks each rule as it is met; the terms must be accepted. Leave a field or submit to see the errors."
      minHeight="980px"
      [code]="centeredCode"
      [(rtl)]="centeredRtl"
    >
      <demo-signup-centered [lang]="centeredRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Split with image"
      description="The same form next to the brand panel with the image, so sign-up matches the default sign-in page."
      minHeight="980px"
      [code]="splitCode"
      [(rtl)]="splitRtl"
    >
      <demo-signup-split [lang]="splitRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Multi-step"
      description="Three steps in a card with the progress indicator: Account, Organisation (region dropdown and role radio group) and Review. Next validates only the current step; Back keeps what was typed."
      minHeight="980px"
      [code]="stepsCode"
      [(rtl)]="stepsRtl"
    >
      <demo-signup-steps [lang]="stepsRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Request access"
      description="For internal systems without self sign-up: the employee sends national ID, employee number, work email, department and a reason, and an administrator approves the request. The panel explains what happens next."
      minHeight="1080px"
      [code]="requestCode"
      [(rtl)]="requestRtl"
    >
      <demo-signup-request [lang]="requestRtl() ? 'ar' : 'en'" />
    </demo-example>
  `,
})
export class SignupPagesPage {
  protected readonly centeredCode = SIGNUP_CENTERED_CODE;
  protected readonly centeredRtl = signal(false);
  protected readonly splitCode = SIGNUP_SPLIT_CODE;
  protected readonly splitRtl = signal(false);
  protected readonly stepsCode = SIGNUP_STEPS_CODE;
  protected readonly stepsRtl = signal(false);
  protected readonly requestCode = SIGNUP_REQUEST_CODE;
  protected readonly requestRtl = signal(false);
}
