import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModButton, ModScreen, ModScreenGrid, ModScreenPlaceholder } from '@mod-internal/ui';

@Component({
  selector: 'demo-screens-page',
  imports: [ModScreen, ModScreenGrid, ModScreenPlaceholder, ModButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Screens</h1>
      <p class="content-description">Full page screen templates and layouts.</p>
    </div>

    <div class="component-preview">
      <div class="component-preview-title">Service Page Template</div>
      <div
        style="display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-xl); padding: var(--spacing-3xl); background: var(--sa-25); border: 1px solid var(--sa-200); border-radius: var(--radius-lg);"
      >
        <div style="min-width: 0;">
          <div
            style="font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--text-default); margin-bottom: var(--spacing-xs);"
          >
            Government Service Page
          </div>
          <div style="font-size: var(--font-size-sm); color: var(--gray-700); line-height: 20px;">
            Full service-details template: government bar, navigation header, breadcrumb, service info aside, steps
            tabs, related services carousel, rating and footer — responsive and bilingual.
          </div>
        </div>
        <a mod-button href="#/service-page" style="flex-shrink: 0;">Open template</a>
      </div>
    </div>

    <div class="component-preview">
      <div class="component-preview-title">Dashboard Screen</div>
      <mod-screen dashboard>
        <mod-screen-grid [columns]="2">
          <mod-screen-placeholder size="sm" />
          <mod-screen-placeholder size="sm" />
          <mod-screen-placeholder size="lg" full />
        </mod-screen-grid>
      </mod-screen>
    </div>
  `,
})
export class ScreensPage {}
