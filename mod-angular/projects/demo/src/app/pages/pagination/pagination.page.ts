import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModPagination, ModPaginationSize } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-pagination-page',
  imports: [ModPagination, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Pagination</h1>
      <p class="content-description">
        Horizontal navigation between chunks (pages) of a dataset. Shows the first and last page plus the current page
        and a configurable number of sibling pages on each side, collapsing the rest into ellipses. Includes
        previous/next controls (disabled at the bounds), three sizes, optional text labels, and full RTL support.
        Modeled on Figma frames 7936:8133 (Pagination) and 7936:16660 (Pagination Item).
      </p>
    </div>

    <demo-live
      heading="Pagination"
      description="Click pages or prev/next to navigate. Adjust total pages and sibling count to see the ellipsis truncation respond."
      [rtl]="rtl()"
    >
      <mod-pagination
        [(page)]="page"
        [totalPages]="total()"
        [siblingCount]="siblings()"
        [size]="size()"
        [showLabels]="labels()"
        [previousLabel]="rtl() ? 'السابق' : 'Previous'"
        [nextLabel]="rtl() ? 'التالي' : 'Next'"
        [attr.dir]="rtl() ? 'rtl' : null"
      />

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Total pages" [options]="totals" [value]="total()" (valueChange)="setTotal($event)" />
      <demo-select label="Sibling count" [options]="siblingCounts" [(value)]="siblings" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-switch label="Prev/Next labels" [(checked)]="labels" />
    </demo-live>

    <demo-props
      description="Inputs and models of the mod-pagination component, plus the exported range helper."
      [props]="props"
    />

    <demo-showcase
      heading="Page Item States"
      description="Default, hover (gray fill), active (filled primary), and the non-interactive ellipsis. Prev/Next become disabled at the bounds."
    >
      <mod-pagination aria-label="States" [showControls]="false" [totalPages]="10" [siblingCount]="0" [(page)]="statesPage" />
    </demo-showcase>

    <demo-showcase heading="Sizes" description="Small (32px), Medium (40px, default), and Large (48px).">
      <span class="showcase-label">Small</span>
      <mod-pagination aria-label="Small" size="sm" [totalPages]="3" [(page)]="smPage" />
      <span class="showcase-label">Medium</span>
      <mod-pagination aria-label="Medium" [totalPages]="3" [(page)]="mdPage" />
      <span class="showcase-label">Large</span>
      <mod-pagination aria-label="Large" size="lg" [totalPages]="3" [(page)]="lgPage" />
    </demo-showcase>

    <demo-showcase
      heading="Truncation"
      description="With many pages, the sequence keeps the first and last page and the current page ± the sibling count, collapsing the rest into ellipses — shown here near the start, middle, and end of a 20-page set."
    >
      <span class="showcase-label">Near the start (page 2 of 20)</span>
      <mod-pagination aria-label="Start" [showControls]="false" [totalPages]="20" [(page)]="startPage" />
      <span class="showcase-label">In the middle (page 10 of 20)</span>
      <mod-pagination aria-label="Middle" [showControls]="false" [totalPages]="20" [(page)]="middlePage" />
      <span class="showcase-label">Near the end (page 19 of 20)</span>
      <mod-pagination aria-label="End" [showControls]="false" [totalPages]="20" [(page)]="endPage" />
    </demo-showcase>

    <demo-showcase
      heading="Boundary States"
      description="On the first page the Previous control is disabled; on the last page the Next control is disabled."
    >
      <span class="showcase-label">First page — Previous disabled</span>
      <mod-pagination aria-label="First" [totalPages]="3" [(page)]="firstPage" />
      <span class="showcase-label">Last page — Next disabled</span>
      <mod-pagination aria-label="Last" [totalPages]="3" [(page)]="lastPage" />
    </demo-showcase>

    <demo-showcase
      heading="Labels & RTL"
      description="Prev/Next can show text labels alongside the arrow. In RTL the whole control mirrors and the arrows flip."
    >
      <span class="showcase-label">With labels (LTR)</span>
      <mod-pagination aria-label="Labels" showLabels [totalPages]="3" [(page)]="labelsPage" />
      <span class="showcase-label">RTL with labels</span>
      <div
        class="showcase-preview--subtle"
        style="width: 100%; padding: var(--spacing-xl); border-radius: var(--radius-md);"
        dir="rtl"
      >
        <mod-pagination
          dir="rtl"
          aria-label="RTL"
          showLabels
          previousLabel="السابق"
          nextLabel="التالي"
          pageLabel="صفحة"
          [formatPage]="arabicDigits"
          [totalPages]="10"
          [siblingCount]="0"
          [(page)]="rtlPage"
        />
      </div>
    </demo-showcase>
  `,
})
export class PaginationPage {
  protected readonly totals: DemoOption<number>[] = [5, 10, 25, 100].map((value) => ({ value, label: String(value) }));
  protected readonly siblingCounts: DemoOption<number>[] = [0, 1, 2].map((value) => ({ value, label: String(value) }));
  protected readonly sizes: DemoOption<ModPaginationSize>[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ];

  protected readonly rtl = signal(false);
  protected readonly total = signal(10);
  protected readonly siblings = signal(1);
  protected readonly size = signal<ModPaginationSize>('md');
  protected readonly labels = signal(false);
  protected readonly page = signal(1);

  // Clamp the current page when the total shrinks, as the original demo does.
  protected setTotal(total: number): void {
    this.total.set(total);
    if (this.page() > total) this.page.set(total);
  }

  // Showcase state
  protected readonly statesPage = signal(2);
  protected readonly smPage = signal(2);
  protected readonly mdPage = signal(2);
  protected readonly lgPage = signal(2);
  protected readonly startPage = signal(2);
  protected readonly middlePage = signal(10);
  protected readonly endPage = signal(19);
  protected readonly firstPage = signal(1);
  protected readonly lastPage = signal(3);
  protected readonly labelsPage = signal(2);
  protected readonly rtlPage = signal(2);

  private readonly arabicFormat = new Intl.NumberFormat('ar-SA-u-nu-arab', { useGrouping: false });
  protected readonly arabicDigits = (page: number): string => this.arabicFormat.format(page);

  protected readonly props: DemoProp[] = [
    { name: 'page', type: 'model<number>', default: '1', description: 'Current page, 1-based. Rendered filled with the primary token and aria-current="page".' },
    { name: 'totalPages', type: 'number', default: '1', description: 'Total number of pages. The first and last page always stay visible.' },
    { name: 'siblingCount', type: 'number', default: '1', description: 'Pages shown on each side of the current page; the rest collapses into "…".' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Item size: 32px, 40px or 48px.' },
    { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show the Previous / Next text next to the arrows.' },
    { name: 'showControls', type: 'boolean', default: 'true', description: 'Show the Previous / Next controls (disabled at the first / last page).' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every page and prev/next control.' },
    { name: 'formatPage', type: '(page: number) => string', default: 'String', description: 'Formats a page number for display, e.g. Arabic-Indic digits.' },
    { name: 'aria-label', type: 'string', default: "'Pagination'", description: 'Accessible name of the nav element.' },
    { name: 'previousLabel', type: 'string', default: "'Previous'", description: 'Label / accessible name of the previous control.' },
    { name: 'nextLabel', type: 'string', default: "'Next'", description: 'Label / accessible name of the next control.' },
    { name: 'pageLabel', type: 'string', default: "'Page'", description: 'Prefix of each page button accessible name, e.g. "Page 3".' },
    { name: 'modPaginationRange(total, current, siblings)', type: 'function', description: 'Returns the token sequence (page numbers + "…") to render, per the ModPagination algorithm.' },
  ];
}
