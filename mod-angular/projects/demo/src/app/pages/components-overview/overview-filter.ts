import { computed, contentChildren, Directive, HostAttributeToken, inject, Injectable, signal } from '@angular/core';

/** Search + category state shared by the overview page and its card / category directives. */
@Injectable()
export class OverviewFilter {
  /** Trimmed, lower-cased search text (debounced by the page). */
  readonly query = signal('');
  /** Active category chip id, or 'all'. */
  readonly category = signal('all');
}

/** A category section. Hides itself when none of its cards match. */
@Directive({
  selector: '.overview-category',
  host: { '[class.overview-category--hidden]': 'visibleCount() === 0' },
})
export class OverviewCategory {
  private readonly filter = inject(OverviewFilter);

  readonly id = inject(new HostAttributeToken('data-category'));
  private readonly totalCount = inject(new HostAttributeToken('data-total-count'));
  private readonly cards = contentChildren(OverviewCard, { descendants: true });

  readonly active = computed(() => {
    const category = this.filter.category();
    return category === 'all' || category === this.id;
  });

  readonly visibleCount = computed(() => this.cards().filter((card) => card.visible()).length);

  /** Count badge: the declared total, or the number of matches while searching. */
  readonly badge = computed(() => (this.filter.query() ? String(this.visibleCount()) : this.totalCount));
}

/** A component card. Matches on its `data-name` keywords, as the original page does. */
@Directive({
  selector: '.overview-card',
  host: { '[class.overview-card--hidden]': '!visible()' },
})
export class OverviewCard {
  private readonly filter = inject(OverviewFilter);
  private readonly category = inject(OverviewCategory);
  private readonly name = (inject(new HostAttributeToken('data-name'), { optional: true }) ?? '').toLowerCase();

  readonly visible = computed(() => {
    const query = this.filter.query();
    return this.category.active() && (!query || this.name.includes(query));
  });
}

/** The count badge in a category header. */
@Directive({
  selector: '.overview-category-count',
  host: { '[textContent]': 'category.badge()' },
})
export class OverviewCategoryCount {
  protected readonly category = inject(OverviewCategory);
}
