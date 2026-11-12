import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { listenOnDocumentWhile } from '../internal/listen-while';
import { ModButton } from '../button/button';
import { ModChip } from '../chips/chips';

export type ModFilterBlockType = 'checkbox' | 'chips' | 'range';

export interface ModFilterOption {
  id: string;
  label: string;
}

export interface ModFilterBlock {
  /** Key of this block in the filters value. */
  id: string;
  title: string;
  type: ModFilterBlockType;
  /** Options of a `checkbox` or `chips` block. */
  options?: readonly ModFilterOption[];
  /** `checkbox` blocks: show a search box that filters the options. */
  searchable?: boolean;
  /** `checkbox` blocks: options shown while collapsed (default 3). */
  visibleCount?: number;
  /** `range` blocks: placeholders and accessible names of the two inputs. */
  minPlaceholder?: string;
  maxPlaceholder?: string;
  minLabel?: string;
  maxLabel?: string;
}

export interface ModFilterRange {
  min: string;
  max: string;
}

/** Applied filters keyed by block id: option ids, or a range for `range` blocks. */
export type ModFiltersValue = Record<string, string[] | ModFilterRange>;

export interface ModAppliedFilter {
  blockId: string;
  /** Option id, or `null` for a range block. */
  optionId: string | null;
  label: string;
}

interface BlockView {
  block: ModFilterBlock;
  options: readonly ModFilterOption[];
  selected: ReadonlySet<string>;
  range: ModFilterRange;
  query: string;
  expanded: boolean;
  /** Number of options behind "Show more"; 0 hides the action. */
  hiddenCount: number;
}

const DEFAULT_VISIBLE_COUNT = 3;
const EMPTY_RANGE: ModFilterRange = { min: '', max: '' };

let nextId = 0;

function isRange(entry: string[] | ModFilterRange | undefined): entry is ModFilterRange {
  return !!entry && !Array.isArray(entry);
}

/**
 * DGA filters ("filteration") — a trigger button, the row of applied filters
 * and a floating panel of filter blocks. Choices are staged in the panel and
 * only take effect on "Apply filters".
 *
 *   <mod-filters triggerLabel="Filter Products" [blocks]="blocks" [(value)]="filters" />
 */
@Component({
  selector: 'mod-filters',
  imports: [ModButton, ModChip],
  templateUrl: './filters.html',
  // The panel renders checkbox, search-box and text-input markup directly.
  styleUrls: [
    './filters.css',
    '../checkbox/checkbox.css',
    '../search-box/search-box.css',
    '../text-input/text-input.css',
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class ModFilters {
  readonly blocks = input<readonly ModFilterBlock[]>([]);
  /** Applied filters (two-way bindable). */
  readonly value = model<ModFiltersValue>({});
  /** Panel open state (two-way bindable). */
  readonly open = model(false);
  /** Renders the panel in the page flow, always visible, instead of floating under the trigger. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Hides the trigger and applied-filters row (use with `inline` for a panel-only layout). */
  readonly hideToolbar = input(false, { transform: booleanAttribute });

  readonly triggerLabel = input('Filters');
  readonly applyLabel = input('Apply filters');
  readonly clearLabel = input('Clear filters');
  readonly searchLabel = input('Search');
  readonly showLessLabel = input('Show less');
  /** Builds the "Show N more" label. */
  readonly showMoreLabel = input<(count: number) => string>((count) => `Show ${count} more`);
  /** Accessible prefix of an applied-filter button ("Remove filter Electronics"). */
  readonly removeLabel = input('Remove filter');
  readonly rangeSeparator = input('—');

  /** Emitted with the new value when "Apply filters" is pressed. */
  readonly applied = output<ModFiltersValue>();
  /** Emitted when "Clear filters" is pressed. */
  readonly cleared = output<void>();
  /** Emitted when an applied filter is removed from the toolbar. */
  readonly filterRemoved = output<ModAppliedFilter>();

  protected readonly panelId = `mod-filters-${nextId++}`;

  private readonly staged = signal<ModFiltersValue>({});
  private readonly queries = signal<Record<string, string>>({});
  private readonly expanded = signal<Record<string, boolean>>({});
  private readonly trigger = viewChild('trigger', { read: ElementRef<HTMLElement> });
  private lastValue: ModFiltersValue | null = null;

  protected readonly blockViews = computed<BlockView[]>(() => {
    const staged = this.staged();
    const queries = this.queries();
    const expanded = this.expanded();
    return this.blocks().map((block) => {
      const all = block.options ?? [];
      const entry = staged[block.id];
      const query = (queries[block.id] ?? '').trim().toLowerCase();
      const isExpanded = !!expanded[block.id];
      let options = all;
      let hiddenCount = 0;
      if (block.type === 'checkbox') {
        const visibleCount = block.visibleCount ?? DEFAULT_VISIBLE_COUNT;
        if (query) {
          options = all.filter((option) => option.label.toLowerCase().includes(query));
        } else {
          hiddenCount = Math.max(0, all.length - visibleCount);
          if (!isExpanded) options = all.slice(0, visibleCount);
        }
      }
      return {
        block,
        options,
        selected: new Set(Array.isArray(entry) ? entry : []),
        range: isRange(entry) ? entry : EMPTY_RANGE,
        query: queries[block.id] ?? '',
        expanded: isExpanded,
        hiddenCount,
      };
    });
  });

  /** Applied filters as shown in the toolbar. */
  readonly appliedFilters = computed<ModAppliedFilter[]>(() => {
    const value = this.value();
    const separator = this.rangeSeparator();
    const list: ModAppliedFilter[] = [];
    for (const block of this.blocks()) {
      const entry = value[block.id];
      if (Array.isArray(entry)) {
        for (const id of entry) {
          const option = block.options?.find((candidate) => candidate.id === id);
          if (option) list.push({ blockId: block.id, optionId: id, label: option.label });
        }
      } else if (isRange(entry) && (entry.min || entry.max)) {
        list.push({
          blockId: block.id,
          optionId: null,
          label: `${block.title}: ${entry.min} ${separator} ${entry.max}`,
        });
      }
    }
    return list;
  });

  constructor() {
    // Value set from outside: restage it so the panel reflects what is applied.
    effect(() => {
      const value = this.value();
      if (value === this.lastValue) return;
      this.lastValue = value;
      untracked(() => this.staged.set(value));
    });

    // Opening the panel always starts from what is applied: choices that were
    // ticked and then abandoned (Escape, outside click, trigger) are dropped.
    effect(() => {
      if (this.open()) untracked(() => this.staged.set(this.value()));
    });

    // The floating panel closes on a click outside the component.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    listenOnDocumentWhile(
      () => this.open() && !this.inline(),
      'click',
      (event) => {
        if (!event.composedPath().includes(host)) this.open.set(false);
      },
    );
  }

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected onEscape(event: Event): void {
    if (!this.open()) return;
    event.stopPropagation();
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected toggleOption(blockId: string, optionId: string): void {
    this.staged.update((staged) => {
      const entry = staged[blockId];
      const current = Array.isArray(entry) ? entry : [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...staged, [blockId]: next };
    });
  }

  protected setRange(blockId: string, key: keyof ModFilterRange, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const text = target.value;
    this.staged.update((staged) => {
      const entry = staged[blockId];
      const current = isRange(entry) ? entry : EMPTY_RANGE;
      return { ...staged, [blockId]: { ...current, [key]: text } };
    });
  }

  protected setQuery(blockId: string, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const text = target.value;
    this.queries.update((queries) => ({ ...queries, [blockId]: text }));
  }

  protected toggleExpanded(blockId: string): void {
    this.expanded.update((expanded) => ({ ...expanded, [blockId]: !expanded[blockId] }));
  }

  protected apply(): void {
    const next = this.clean(this.staged());
    this.commit(next);
    this.open.set(false);
    this.applied.emit(next);
    this.trigger()?.nativeElement.focus();
  }

  protected clear(): void {
    this.commit({});
    this.cleared.emit();
  }

  protected removeFilter(filter: ModAppliedFilter): void {
    const value = { ...this.value() };
    const entry = value[filter.blockId];
    if (filter.optionId !== null && Array.isArray(entry)) {
      value[filter.blockId] = entry.filter((id) => id !== filter.optionId);
    } else {
      delete value[filter.blockId];
    }
    this.commit(this.clean(value));
    this.filterRemoved.emit(filter);
  }

  private commit(next: ModFiltersValue): void {
    this.lastValue = next;
    this.staged.set(next);
    this.value.set(next);
  }

  /** Drops empty selections and empty ranges. */
  private clean(value: ModFiltersValue): ModFiltersValue {
    const result: ModFiltersValue = {};
    for (const [key, entry] of Object.entries(value)) {
      if (Array.isArray(entry)) {
        if (entry.length) result[key] = [...entry];
      } else if (entry.min || entry.max) {
        result[key] = { ...entry };
      }
    }
    return result;
  }
}
