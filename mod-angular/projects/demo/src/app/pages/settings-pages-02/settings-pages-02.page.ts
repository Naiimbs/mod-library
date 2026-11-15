import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { SETTINGS_PAGES_02_CODE, SettingsPages02Example } from './settings-pages-02.example';

@Component({
  selector: 'demo-settings-pages-02-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, SettingsPages02Example],
  template: `
    <div class="content-header">
      <h1 class="content-title">Settings pages 02</h1>
      <p class="content-description">
        System setup for an administrator inside the application shell: a secondary navigation of sections on
        the start side and the section on the end side. It holds the hospital data with a read-only view and
        an edit mode, the specialties, an editable table of expenses rates, the lookup lists and a danger zone.
        Adapted from the hospital, specialties, expenses rates and lookup screens of a hospital referral portal,
        and built only from library components. It works in English and Arabic, adapts from desktop to mobile,
        and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="System setup"
      badge="General admin"
      description="Move between the sections (they follow the side bar items too), edit the hospital data, switch the availability of a specialty or add one, edit a rate in the table and save, add a value to a managed list, and deactivate the hospital from the danger zone. On the tablet and mobile widths the sections list becomes a dropdown."
      minHeight="900px"
      [code]="code"
      [(rtl)]="rtl"
    >
      <demo-settings-pages-02 [lang]="rtl() ? 'ar' : 'en'" (languageToggle)="rtl.set(!rtl())" />
    </demo-example>
  `,
})
export class SettingsPages02Page {
  protected readonly code = SETTINGS_PAGES_02_CODE;
  protected readonly rtl = signal(false);
}
