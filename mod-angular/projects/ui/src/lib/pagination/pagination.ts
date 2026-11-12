import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

export type ModPaginationSize = 'sm' | 'md' | 'lg';

/** Gap marker used in the token sequence returned by `modPaginationRange`. */
export const MOD_PAGINATION_DOTS = '…';

export type ModPaginationToken = number | typeof MOD_PAGINATION_DOTS;

/**
 * Sequence of page tokens to render: page numbers and '…' gap markers.
 * Always shows the first and last page, the current page and `siblings`
 * neighbours either side; the rest collapses into ellipses.
 */
export function modPaginationRange(
  total: number,
  current: number,
  siblings: number,
): ModPaginationToken[] {
  // 5 = first + last + current + the two ellipsis slots.
  const totalToShow = siblings * 2 + 5;
  if (totalToShow >= total) {
    return Array.from({ length: Math.max(total, 0) }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const range: ModPaginationToken[] = [];

  if (!showLeftDots && showRightDots) {
    // Near the start: 1..(left block), …, last
    const leftCount = 3 + siblings * 2;
    for (let i = 1; i <= leftCount; i++) range.push(i);
    range.push(MOD_PAGINATION_DOTS, total);
  } else if (showLeftDots && !showRightDots) {
    // Near the end: 1, …, (right block)..last
    const rightCount = 3 + siblings * 2;
    range.push(1, MOD_PAGINATION_DOTS);
    for (let i = total - rightCount + 1; i <= total; i++) range.push(i);
  } else if (showLeftDots && showRightDots) {
    // Middle: 1, …, current±siblings, …, last
    range.push(1, MOD_PAGINATION_DOTS);
    for (let i = leftSibling; i <= rightSibling; i++) range.push(i);
    range.push(MOD_PAGINATION_DOTS, total);
  } else {
    for (let i = 1; i <= total; i++) range.push(i);
  }
  return range;
}

/**
 * DGA pagination.
 *
 *   <mod-pagination [(page)]="page" [totalPages]="20" />
 */
@Component({
  selector: 'mod-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModPagination {
  /** Current page, 1-based. */
  readonly page = model<number>(1);
  /** Total number of pages. */
  readonly totalPages = input(1, { transform: numberAttribute });
  /** Pages shown on each side of the current page. */
  readonly siblingCount = input(1, { transform: numberAttribute });
  readonly size = input<ModPaginationSize>('md');
  /** Show the Previous / Next text next to the arrows. */
  readonly showLabels = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Show the Previous / Next controls. */
  readonly showControls = input(true, { transform: booleanAttribute });
  /** Formats a page number for display (e.g. localized digits). */
  readonly formatPage = input<(page: number) => string>(String);

  readonly ariaLabel = input('Pagination', { alias: 'aria-label' });
  readonly previousLabel = input('Previous');
  readonly nextLabel = input('Next');
  /** Prefix of each page button's accessible name, e.g. "Page 3". */
  readonly pageLabel = input('Page');

  protected readonly dots = MOD_PAGINATION_DOTS;

  protected readonly total = computed(() => Math.max(1, Math.floor(this.totalPages()) || 1));

  /** Current page clamped to the valid range. */
  protected readonly current = computed(() =>
    Math.min(Math.max(1, Math.floor(this.page()) || 1), this.total()),
  );

  protected readonly tokens = computed(() =>
    modPaginationRange(this.total(), this.current(), Math.max(0, Math.floor(this.siblingCount()) || 0)),
  );

  protected readonly atStart = computed(() => this.disabled() || this.current() === 1);
  protected readonly atEnd = computed(() => this.disabled() || this.current() === this.total());

  protected goTo(page: number): void {
    if (this.disabled()) return;
    const next = Math.min(Math.max(1, page), this.total());
    if (next !== this.page()) this.page.set(next);
  }
}
