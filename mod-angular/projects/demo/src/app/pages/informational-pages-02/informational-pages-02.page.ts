import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { INFORMATIONAL_PAGES_02_CODE, InformationalPages02Example } from './informational-pages-02.example';

@Component({
  selector: 'demo-informational-pages-02-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, InformationalPages02Example],
  template: `
    <div class="content-header">
      <h1 class="content-title">Informational pages 02</h1>
      <p class="content-description">
        A profile page inside the application shell: header with avatar, status and actions, the details in a
        description list, a table of roles with their hospital scope, a permissions summary in an accordion, an
        activity timeline, an empty state and a confirm dialog. Adapted from the user page of the hospital referral
        Portal, and built only from library components. It works in English and Arabic, adapts from desktop to
        mobile, and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="User profile"
      badge="General admin"
      description="Deactivate asks for confirmation and warns about the roles nobody else holds; after it the status changes and the action becomes Activate. Reset password marks the user as “Must change password”. Every action is added to the account log and announced in the status region under the header."
      minHeight="900px"
      [code]="code"
      [(rtl)]="rtl"
    >
      <demo-informational-pages-02 [lang]="rtl() ? 'ar' : 'en'" (languageToggle)="rtl.set(!rtl())" />
    </demo-example>
  `,
})
export class InformationalPages02Page {
  protected readonly code = INFORMATIONAL_PAGES_02_CODE;
  protected readonly rtl = signal(false);
}
