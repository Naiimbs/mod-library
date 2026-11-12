import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';

/** Marks the breadcrumbs shown above the title of a `<mod-page-header>`. */
@Directive({ selector: '[modPageHeaderBreadcrumb]' })
export class ModPageHeaderBreadcrumb {}

/** Marks tags or a status shown next to the title of a `<mod-page-header>`. */
@Directive({ selector: '[modPageHeaderMeta]' })
export class ModPageHeaderMeta {}

/** Marks the actions (buttons, filters) at the end of a `<mod-page-header>`. */
@Directive({ selector: '[modPageHeaderActions]' })
export class ModPageHeaderActions {}

/** Marks the tabs shown under the title row of a `<mod-page-header>`. */
@Directive({ selector: '[modPageHeaderTabs]' })
export class ModPageHeaderTabs {}

/**
 * Heading block of an application page: title, optional description,
 * breadcrumbs above, tags next to the title, actions at the end and tabs
 * underneath.
 *
 *   <mod-page-header heading="Referral 2026-000184" description="Cardiology · Outpatient clinic" divider>
 *     <mod-breadcrumbs modPageHeaderBreadcrumb [items]="crumbs" />
 *     <mod-status-tag modPageHeaderMeta variant="warning">Medical review</mod-status-tag>
 *     <button modPageHeaderActions mod-button size="medium">Take action</button>
 *     <mod-tabs modPageHeaderTabs flush [divider]="false">…</mod-tabs>
 *   </mod-page-header>
 *
 * The title is an `h1` by default (one per page); set `level` when the header
 * is used for a section. Default content is rendered under the description.
 * The actions move under the title on narrow containers.
 */
@Component({
  selector: 'mod-page-header',
  template: `
    <div class="page-header__crumb"><ng-content select="[modPageHeaderBreadcrumb]" /></div>
    <div class="page-header__row">
      <div class="page-header__text">
        <div class="page-header__title-row">
          @switch (level()) {
            @case (2) {
              <h2 class="page-header__title">{{ heading() }}</h2>
            }
            @case (3) {
              <h3 class="page-header__title">{{ heading() }}</h3>
            }
            @default {
              <h1 class="page-header__title">{{ heading() }}</h1>
            }
          }
          <div class="page-header__meta"><ng-content select="[modPageHeaderMeta]" /></div>
        </div>
        @if (description()) {
          <p class="page-header__description">{{ description() }}</p>
        }
        <ng-content />
      </div>
      <div class="page-header__actions"><ng-content select="[modPageHeaderActions]" /></div>
    </div>
    <div class="page-header__tabs"><ng-content select="[modPageHeaderTabs]" /></div>
  `,
  styleUrl: './page-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'page-header',
    '[class.page-header--divider]': 'divider()',
  },
})
export class ModPageHeader {
  /** Page title. */
  readonly heading = input.required<string>();
  /** One line of supporting text under the title. */
  readonly description = input('');
  /** Heading level of the title: 1 (default) for the page, 2 or 3 for a section. */
  readonly level = input<1 | 2 | 3>(1);
  /** Draws a line under the header. */
  readonly divider = input(false, { transform: booleanAttribute });
}
