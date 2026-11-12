import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { DASHBOARDS_02_CODE, Dashboards02Example } from './dashboards-02.example';

@Component({
  selector: 'demo-dashboards-02-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, Dashboards02Example],
  template: `
    <div class="content-header">
      <h1 class="content-title">Dashboards 02</h1>
      <p class="content-description">
        A working dashboard for one user: what is waiting for them, what happens today and what happened
        recently. Adapted from the home page, the pending actions and the attendance screens of a hospital's
        medical coordinator in the MODHS Referral Portal, and built only from library components. It works in
        English and Arabic, adapts from desktop to mobile, and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="Coordinator home"
      badge="Hospital"
      description="Press “Take action” on a case: it leaves the queue, the saved message appears, the counters (tile, header button, side bar badge) go down and the activity gets a new entry. Filter the queue by required action, confirm an appointment's attendance, and switch to the mobile width to get the side bar as a drawer."
      minHeight="900px"
      [code]="code"
      [(rtl)]="rtl"
    >
      <demo-dashboards-02 [lang]="rtl() ? 'ar' : 'en'" (languageToggle)="rtl.set(!rtl())" />
    </demo-example>
  `,
})
export class Dashboards02Page {
  protected readonly code = DASHBOARDS_02_CODE;
  protected readonly rtl = signal(false);
}
