import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { INFORMATIONAL_PAGES_01_CODE, InformationalPages01Example } from './informational-pages-01.example';

@Component({
  selector: 'demo-informational-pages-01-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, InformationalPages01Example],
  template: `
    <div class="content-header">
      <h1 class="content-title">Informational pages 01</h1>
      <p class="content-description">
        A record page inside the application shell: breadcrumb, page header with status and actions, a progress
        indicator of the case steps, read-only details in description lists, an attachments table and a side rail
        with the key facts and the activity timeline. Adapted from the referral page of the MODHS Referral Portal,
        and built only from library components. It works in English and Arabic, adapts from desktop to mobile,
        and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="Referral case"
      badge="Coordinator"
      description="Use the primary action in the header to take the current step: the path moves on, the status changes and the decision is added to the timeline. The More menu and the download buttons report in the status region under the header. On the tablet and mobile widths the side rail moves below the details."
      minHeight="900px"
      [code]="code"
      [(rtl)]="rtl"
    >
      <demo-informational-pages-01 [lang]="rtl() ? 'ar' : 'en'" (languageToggle)="rtl.set(!rtl())" />
    </demo-example>
  `,
})
export class InformationalPages01Page {
  protected readonly code = INFORMATIONAL_PAGES_01_CODE;
  protected readonly rtl = signal(false);
}
