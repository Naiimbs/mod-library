import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DemoExample } from '../../shared/demo-example';
import { NOT_FOUND_DARK_CODE, NotFoundDarkExample } from './not-found-dark.example';
import { NOT_FOUND_LARGE_CODE_CODE, NotFoundLargeCodeExample } from './not-found-large-code.example';
import { NOT_FOUND_SEARCH_CODE, NotFoundSearchExample } from './not-found-search.example';
import { NOT_FOUND_SIMPLE_CODE, NotFoundSimpleExample } from './not-found-simple.example';
import { NOT_FOUND_SPLIT_CODE, NotFoundSplitExample } from './not-found-split.example';
import { STATUS_PAGES_CODE, StatusPagesExample } from './status-pages.example';

@Component({
  selector: 'demo-not-found-sections-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DemoExample,
    NotFoundSimpleExample,
    NotFoundLargeCodeExample,
    NotFoundSearchExample,
    NotFoundSplitExample,
    NotFoundDarkExample,
    StatusPagesExample,
  ],
  template: `
    <div class="content-header">
      <h1 class="content-title">404 sections</h1>
      <p class="content-description">
        Error sections built on the error page component: page not found, no permission and server error. Each
        example works in English and Arabic, adapts from desktop to mobile, and can be copied from the Code tab.
      </p>
    </div>

    <demo-example
      heading="Simple centered"
      badge="Default"
      description="A small status label, the title, one sentence of help and two actions. Use it inside an existing page shell."
      [code]="simpleCode"
      [(rtl)]="simpleRtl"
    >
      <demo-not-found-simple [lang]="simpleRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Large code"
      description="The status code as a large watermark number above the title. The number scales with the width of the section."
      [code]="largeCode"
      [(rtl)]="largeRtl"
    >
      <demo-not-found-large-code [lang]="largeRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="With search and helpful links"
      description="Helps the user continue: a search box and the three most useful destinations. Type a query and press Enter to see the demo answer."
      [code]="searchCode"
      [(rtl)]="searchRtl"
    >
      <demo-not-found-search [lang]="searchRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Split with illustration"
      description="Text on the start side and an inline SVG illustration in the brand colours on the end side. Stacks into one column on narrow screens."
      minHeight="560px"
      [code]="splitCode"
      [(rtl)]="splitRtl"
    >
      <demo-not-found-split [lang]="splitRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Dark"
      description="The brand dark green as a full-height background, for standalone pages outside the application shell."
      minHeight="560px"
      [code]="darkCode"
      [(rtl)]="darkRtl"
    >
      <demo-not-found-dark [lang]="darkRtl() ? 'ar' : 'en'" />
    </demo-example>

    <demo-example
      heading="Other statuses"
      description="The same section for 403 (no permission) and 500 (something went wrong). Use the switch inside the preview to change the status."
      [code]="statusCode"
      [(rtl)]="statusRtl"
    >
      <demo-status-pages [lang]="statusRtl() ? 'ar' : 'en'" />
    </demo-example>
  `,
})
export class NotFoundSectionsPage {
  protected readonly simpleCode = NOT_FOUND_SIMPLE_CODE;
  protected readonly largeCode = NOT_FOUND_LARGE_CODE_CODE;
  protected readonly searchCode = NOT_FOUND_SEARCH_CODE;
  protected readonly splitCode = NOT_FOUND_SPLIT_CODE;
  protected readonly darkCode = NOT_FOUND_DARK_CODE;
  protected readonly statusCode = STATUS_PAGES_CODE;

  protected readonly simpleRtl = signal(false);
  protected readonly largeRtl = signal(false);
  protected readonly searchRtl = signal(false);
  protected readonly splitRtl = signal(false);
  protected readonly darkRtl = signal(false);
  protected readonly statusRtl = signal(false);
}
