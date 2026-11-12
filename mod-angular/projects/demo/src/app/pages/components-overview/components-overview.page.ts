import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { OverviewCard, OverviewCategory, OverviewCategoryCount, OverviewFilter } from './overview-filter';

interface OverviewChip {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

/**
 * Components overview: search box, category chips and the card catalogue.
 * The card thumbnails are the original static markup (components-overview.page.html);
 * filtering is done by the directives in overview-filter.ts.
 *
 * The thumbnails use a few component classes (.btn, .tag, .status-tag, .breadcrumb,
 * .pagination, .text-input). Library CSS only loads when a component renders, so the
 * needed stylesheets are listed in styleUrls below.
 */
@Component({
  selector: 'demo-components-overview-page',
  imports: [OverviewCategory, OverviewCard, OverviewCategoryCount],
  providers: [OverviewFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './components-overview.page.html',
  styleUrls: [
    '../../../../../ui/src/lib/button/button.css',
    '../../../../../ui/src/lib/tags/tags.css',
    '../../../../../ui/src/lib/status-tag/status-tag.css',
    '../../../../../ui/src/lib/breadcrumbs/breadcrumbs.css',
    '../../../../../ui/src/lib/pagination/pagination.css',
    '../../../../../ui/src/lib/text-input/text-input.css',
    './components-overview.page.css',
  ],
  host: { '(document:keydown)': 'onDocumentKeydown($event)' },
})
export class ComponentsOverviewPage {
  private readonly document = inject(DOCUMENT);
  protected readonly filter = inject(OverviewFilter);

  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('search');
  private readonly categories = viewChildren(OverviewCategory);

  /** Category chips, in page order. Counts are the totals declared on each section. */
  protected readonly chips: readonly OverviewChip[] = [
    { id: 'all', label: 'All', count: 44 },
    { id: 'foundations', label: 'Foundations', count: 3 },
    { id: 'general', label: 'General', count: 6 },
    { id: 'navigation', label: 'Navigation', count: 9 },
    { id: 'data-entry', label: 'Data Entry', count: 10 },
    { id: 'data-display', label: 'Data Display', count: 7 },
    { id: 'layout', label: 'Layout', count: 2 },
    { id: 'feedback', label: 'Feedback', count: 7 },
  ];

  /** Raw text of the search field; `filter.query` follows it after a 200ms debounce. */
  protected readonly inputValue = signal('');

  protected readonly noResults = computed(() => {
    const categories = this.categories();
    return categories.length > 0 && categories.every((category) => category.visibleCount() === 0);
  });

  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.debounceTimer));
  }

  protected onInput(value: string): void {
    this.inputValue.set(value);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.filter.query.set(value.trim().toLowerCase()), 200);
  }

  protected clearSearch(): void {
    clearTimeout(this.debounceTimer);
    this.inputValue.set('');
    this.filter.query.set('');
    this.searchInput().nativeElement.focus();
  }

  protected resetFilters(): void {
    this.filter.category.set('all');
    this.clearSearch();
  }

  /** "/" focuses the search field, as on the token docs pages. */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== '/') return;
    const tag = this.document.activeElement?.tagName ?? '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    event.preventDefault();
    this.searchInput().nativeElement.focus();
  }
}
