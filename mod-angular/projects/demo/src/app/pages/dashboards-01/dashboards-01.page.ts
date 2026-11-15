import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { DASHBOARDS_01_CODE, Dashboards01Example } from './dashboards-01.example';

@Component({
  selector: 'demo-dashboards-01-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, Dashboards01Example],
  template: `
    <div class="content-header">
      <h1 class="content-title">Dashboards 01</h1>
      <p class="content-description">
        A reporting dashboard inside the application shell: KPI tiles with their change against the previous
        period, a column chart, ranked breakdowns and a table of the latest records. Adapted from the dashboard
        of the General Directorate of Medical Services in a hospital referral portal, and built only from library
        components. It works in English and Arabic, adapts from desktop to mobile, and can be copied from the
        Code tab.
      </p>
    </div>

    <demo-example
      heading="Reports dashboard"
      badge="Directorate"
      description="Change the period to reload the figures, sort the table by its headers, collapse the side bar with the button beside the logo, and switch to the tablet or mobile width to get the side bar as a drawer. The language button in the top bar works too."
      minHeight="900px"
      [code]="code"
      [(rtl)]="rtl"
    >
      <demo-dashboards-01 [lang]="rtl() ? 'ar' : 'en'" (languageToggle)="rtl.set(!rtl())" />
    </demo-example>
  `,
})
export class Dashboards01Page {
  protected readonly code = DASHBOARDS_01_CODE;
  protected readonly rtl = signal(false);
}
