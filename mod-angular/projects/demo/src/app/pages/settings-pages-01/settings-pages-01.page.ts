import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { SETTINGS_PAGES_01_CODE, SettingsPages01Example } from './settings-pages-01.example';

@Component({
  selector: 'demo-settings-pages-01-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample, SettingsPages01Example],
  template: `
    <div class="content-header">
      <h1 class="content-title">Settings pages 01</h1>
      <p class="content-description">
        Account settings of the signed-in user inside the application shell: tabs under the page header, each
        form in one readable column with section headings, and a sticky action bar. Adapted from the user
        form, the password change and the notification settings of the MODHS Referral Portal, and built only
        from library components. It works in English and Arabic, adapts from desktop to mobile, and can be
        copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="Account settings"
      badge="Coordinator"
      description="Edit the profile, change the password against the live rules, and switch the email and SMS notices per notification type. The bar at the bottom saves or cancels the current tab; choosing a side bar item with unsaved changes asks before leaving. The language button in the top bar works too."
      minHeight="900px"
      [code]="code"
      [(rtl)]="rtl"
    >
      <demo-settings-pages-01 [lang]="rtl() ? 'ar' : 'en'" (languageToggle)="rtl.set(!rtl())" />
    </demo-example>
  `,
})
export class SettingsPages01Page {
  protected readonly code = SETTINGS_PAGES_01_CODE;
  protected readonly rtl = signal(false);
}
