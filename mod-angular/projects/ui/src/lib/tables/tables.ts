import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';

export type ModTableDensity = 'regular' | 'compact' | 'relaxed';
export type ModTableSortDirection = 'asc' | 'desc';
export type ModTableCellType = 'text' | 'link' | 'action';

export interface ModTableSort {
  /** `key` of the sorted column. */
  key: string;
  direction: ModTableSortDirection;
}

export interface ModTableColumn<T = unknown> {
  /** Unique column id. Also the row property read when `value` is omitted. */
  key: string;
  /** Header text. */
  header: string;
  /** Renders the header as a sort button. */
  sortable?: boolean;
  /**
   * Body cell flavour: `text` (default), `link` (`.table__cell--link`, emits
   * `cellClick`) or `action` (`.table__cell--action`, narrow centred cell).
   */
  type?: ModTableCellType;
  /** Cell value accessor. Defaults to `row[key]`. */
  value?: (row: T) => unknown;
  /** Custom ascending comparator used when sorting by this column. */
  compare?: (a: T, b: T) => number;
  /** Extra class(es) for the `<th>`. */
  headerClass?: string;
  /** Extra class(es) for every `<td>` of the column, fixed or computed per row. */
  cellClass?: string | ((row: T) => string);
  /**
   * Arrow shown on a sortable header while the table has no active sort
   * (static previews of the ascending / descending states).
   */
  sortIndicator?: ModTableSortDirection;
}

export interface ModTableCellContext<T = unknown> {
  /** The row object (`let-row`). */
  $implicit: T;
  row: T;
  value: unknown;
  column: ModTableColumn<T>;
  index: number;
}

export interface ModTableCellClick<T = unknown> {
  row: T;
  column: ModTableColumn<T>;
}

/**
 * Cell template override for one column:
 *
 *   <ng-template modTableCell="status" let-row let-value="value">…</ng-template>
 */
@Directive({ selector: 'ng-template[modTableCell]' })
export class ModTableCell<T = unknown> {
  /** `key` of the column this template renders. */
  readonly key = input.required<string>({ alias: 'modTableCell' });
  readonly template = inject<TemplateRef<ModTableCellContext<T>>>(TemplateRef);
}

/**
 * DGA data table.
 *
 *   <mod-table [columns]="columns" [rows]="rows" selectable [(selected)]="picked" [(sort)]="sort">
 *     <ng-template modTableCell="status" let-row>…</ng-template>
 *   </mod-table>
 */
@Component({
  selector: 'mod-table',
  imports: [NgTemplateOutlet],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModTable<T = unknown> {
  readonly columns = input.required<ModTableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  /**
   * Row identity for `@for` tracking. Selection itself compares row object
   * references. Defaults to the row object.
   */
  readonly rowKey = input<((row: T) => unknown) | undefined>(undefined);

  readonly density = input<ModTableDensity>('regular');
  readonly striped = input(false, { transform: booleanAttribute });
  readonly bordered = input(false, { transform: booleanAttribute });
  /** Drops the wrapper's rounded corners. */
  readonly sharp = input(false, { transform: booleanAttribute });

  /** Adds the leading checkbox column with select-all. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Selected row objects. Selected rows are highlighted even without the checkbox column. */
  readonly selected = model<T[]>([]);

  /** Active sort, or `null` when unsorted. */
  readonly sort = model<ModTableSort | null>(null);
  /** Do not reorder rows locally; only update `sort` (server-side sorting). */
  readonly manualSort = input(false, { transform: booleanAttribute });

  /** Shows the filter (funnel) toggle button in a trailing header cell. */
  readonly filterable = input(false, { transform: booleanAttribute });
  /** Pressed state of the filter button. */
  readonly filterActive = model(false);

  /** Adds a trailing arrow action button to every row. */
  readonly rowAction = input(false, { transform: booleanAttribute });

  /** Accessible name of the table. */
  readonly label = input('');
  readonly selectAllLabel = input('Select all rows');
  readonly selectRowLabel = input('Select row');
  readonly filterLabel = input('Filter');
  readonly rowActionLabel = input('Open row');
  /** Text shown when `rows` is empty. */
  readonly emptyText = input('No data available');

  /** A `link`-type cell was clicked. */
  readonly cellClick = output<ModTableCellClick<T>>();
  /** The trailing row action button was clicked. */
  readonly rowActionClick = output<T>();

  private readonly cellTemplates = contentChildren<ModTableCell<T>>(ModTableCell);

  constructor() {
    // Keep the selection in step with the data: rows that are no longer in
    // `rows` leave `selected`. Rows are matched by `rowKey` when it is set
    // (so reloaded copies of the same record stay selected), else by reference.
    effect(() => {
      const rows = this.rows();
      const key = this.rowKey();
      untracked(() => {
        const selected = this.selected();
        if (!selected.length) return;
        const current = new Map<unknown, T>();
        for (const row of rows) current.set(key ? key(row) : row, row);
        const next: T[] = [];
        let changed = false;
        for (const row of selected) {
          const match = current.get(key ? key(row) : row);
          if (match === undefined) {
            changed = true;
            continue;
          }
          if (match !== row) changed = true;
          next.push(match);
        }
        if (changed) this.selected.set(next);
      });
    });
  }

  protected readonly templateMap = computed(() => {
    const map = new Map<string, TemplateRef<ModTableCellContext<T>>>();
    for (const cell of this.cellTemplates()) map.set(cell.key(), cell.template);
    return map;
  });

  protected readonly tableClasses = computed(() => {
    const list = ['table'];
    const density = this.density();
    if (density !== 'regular') list.push(`table--${density}`);
    if (this.striped()) list.push('table--striped');
    if (this.bordered()) list.push('table--bordered');
    if (this.sharp()) list.push('table--sharp');
    return list.join(' ');
  });

  protected readonly hasTrailingColumn = computed(() => this.filterable() || this.rowAction());

  protected readonly columnCount = computed(
    () => this.columns().length + (this.selectable() ? 1 : 0) + (this.hasTrailingColumn() ? 1 : 0),
  );

  protected readonly sortedRows = computed(() => {
    const rows = this.rows();
    const sort = this.sort();
    if (!sort || this.manualSort()) return rows;
    const column = this.columns().find((c) => c.key === sort.key);
    if (!column) return rows;
    const compare = column.compare ?? ((a: T, b: T) => this.defaultCompare(column, a, b));
    const sorted = [...rows].sort(compare);
    return sort.direction === 'desc' ? sorted.reverse() : sorted;
  });

  private readonly selectedSet = computed(() => new Set<T>(this.selected()));

  protected readonly selectedCount = computed(() => {
    const set = this.selectedSet();
    return this.rows().reduce((count, row) => count + (set.has(row) ? 1 : 0), 0);
  });

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.selectedCount() === this.rows().length,
  );

  protected readonly someSelected = computed(
    () => this.selectedCount() > 0 && this.selectedCount() < this.rows().length,
  );

  protected trackRow(row: T): unknown {
    const key = this.rowKey();
    return key ? key(row) : row;
  }

  protected cellValue(column: ModTableColumn<T>, row: T): unknown {
    if (column.value) return column.value(row);
    return (row as Record<string, unknown>)?.[column.key];
  }

  protected isSelected(row: T): boolean {
    return this.selectedSet().has(row);
  }

  protected sortDirection(column: ModTableColumn<T>): ModTableSortDirection | '' {
    const sort = this.sort();
    if (!sort) return column.sortIndicator ?? '';
    return sort.key === column.key ? sort.direction : '';
  }

  protected cellClassOf(column: ModTableColumn<T>, row: T): string {
    const cellClass = column.cellClass;
    return (typeof cellClass === 'function' ? cellClass(row) : cellClass) || '';
  }

  protected ariaSort(column: ModTableColumn<T>): string | null {
    if (!column.sortable) return null;
    const direction = this.sortDirection(column);
    return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
  }

  /** Cycles a column through ascending → descending → unsorted. */
  toggleSort(column: ModTableColumn<T>): void {
    // Use the real sort state; `sortIndicator` is only a static arrow.
    const sort = this.sort();
    const current = sort && sort.key === column.key ? sort.direction : '';
    if (current === '') this.sort.set({ key: column.key, direction: 'asc' });
    else if (current === 'asc') this.sort.set({ key: column.key, direction: 'desc' });
    else this.sort.set(null);
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selected.set(checked ? [...this.rows()] : []);
  }

  protected toggleRow(row: T, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const without = this.selected().filter((r) => r !== row);
    this.selected.set(checked ? [...without, row] : without);
  }

  protected onCellClick(column: ModTableColumn<T>, row: T): void {
    if (column.type === 'link') this.cellClick.emit({ row, column });
  }

  private defaultCompare(column: ModTableColumn<T>, a: T, b: T): number {
    const x = this.cellValue(column, a);
    const y = this.cellValue(column, b);
    if (x == null || y == null) return x == null ? (y == null ? 0 : 1) : -1;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    if (x instanceof Date && y instanceof Date) return x.getTime() - y.getTime();
    return String(x).localeCompare(String(y), undefined, { numeric: true });
  }
}
