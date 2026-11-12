import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModStatusTag,
  ModStatusTagVariant,
  ModTable,
  ModTableCell,
  ModTableCellType,
  ModTableColumn,
  ModTableDensity,
  ModTableSort,
  ModTag,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

interface Member {
  name: string;
  role: string;
  team: string;
  status: string;
  joined: string;
}

type SortKey = 'name' | 'role' | 'team';
type RoleCell = 'text' | 'link' | 'tag' | 'status' | 'action' | 'checkbox';

interface CellExample {
  kind: RoleCell;
  type: string;
}

interface HeaderExample {
  plain: string;
  sortable: string;
  asc: string;
  desc: string;
}

interface TableLabels {
  name: string;
  role: string;
  team: string;
  status: string;
  joined: string;
  rows: Member[];
}

const LABELS: Record<'en' | 'ar', TableLabels> = {
  en: {
    name: 'Name',
    role: 'Role',
    team: 'Team',
    status: 'Status',
    joined: 'Joined',
    rows: [
      { name: 'Sara Al-Otaibi', role: 'Admin', team: 'Platform', status: 'Active', joined: 'Jan 12, 2026' },
      { name: 'Khalid Al-Subaie', role: 'Editor', team: 'Content', status: 'Pending', joined: 'Feb 04, 2026' },
      { name: 'Maya Hassan', role: 'Reviewer', team: 'QA', status: 'Active', joined: 'Mar 18, 2026' },
      { name: 'Omar Al-Harbi', role: 'Viewer', team: 'Analytics', status: 'Inactive', joined: 'Apr 02, 2026' },
    ],
  },
  ar: {
    name: 'الاسم',
    role: 'الدور',
    team: 'الفريق',
    status: 'الحالة',
    joined: 'تاريخ الانضمام',
    rows: [
      { name: 'سارة العتيبي', role: 'مدير', team: 'المنصة', status: 'نشط', joined: '12 يناير 2026' },
      { name: 'خالد السبيعي', role: 'محرر', team: 'المحتوى', status: 'قيد المراجعة', joined: '04 فبراير 2026' },
      { name: 'مايا حسن', role: 'مراجع', team: 'الجودة', status: 'نشط', joined: '18 مارس 2026' },
      { name: 'عمر الحربي', role: 'مشاهد', team: 'التحليلات', status: 'غير نشط', joined: '02 أبريل 2026' },
    ],
  },
};

@Component({
  selector: 'demo-tables-page',
  imports: [ModTable, ModTableCell, ModStatusTag, ModTag, NgTemplateOutlet, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tables.page.html',
})
export class TablesPage {
  // ----- Live demo -----
  protected readonly densities: DemoOption<ModTableDensity>[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'regular', label: 'Regular' },
    { value: 'relaxed', label: 'Relaxed' },
  ];
  protected readonly sortColumns: DemoOption<SortKey>[] = [
    { value: 'name', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'team', label: 'Team' },
  ];
  protected readonly cellTypes: DemoOption<RoleCell>[] = [
    { value: 'text', label: 'Text' },
    { value: 'link', label: 'Link' },
    { value: 'tag', label: 'Tag' },
    { value: 'status', label: 'Status tag' },
    { value: 'action', label: 'Action arrow' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  protected readonly rtl = signal(false);
  protected readonly density = signal<ModTableDensity>('regular');
  protected readonly striped = signal(false);
  protected readonly bordered = signal(false);
  protected readonly selection = signal(false);
  protected readonly sortable = signal(false);
  protected readonly filter = signal(false);
  protected readonly cellType = signal<RoleCell>('text');
  protected readonly sortState = signal<ModTableSort>({ key: 'name', direction: 'asc' });
  protected readonly liveSelected = signal<Member[]>([]);
  protected readonly sortKey = computed(() => this.sortState().key as SortKey);

  private readonly t = computed(() => (this.rtl() ? LABELS.ar : LABELS.en));
  protected readonly liveRows = computed(() => this.t().rows);

  /** The sort only applies while the Sortable switch is on. */
  protected readonly liveSort = computed(() => (this.sortable() ? this.sortState() : null));

  protected readonly liveColumns = computed<ModTableColumn<Member>[]>(() => {
    const t = this.t();
    const sortable = this.sortable();
    const cell = this.cellType();
    const roleType: ModTableCellType = cell === 'link' ? 'link' : cell === 'action' ? 'action' : 'text';
    // The original demo always compares with the English collation.
    const by = (key: SortKey) => (a: Member, b: Member) => a[key].localeCompare(b[key], 'en');
    return [
      { key: 'name', header: t.name, type: 'link', sortable, compare: by('name') },
      { key: 'role', header: t.role, type: roleType, sortable, compare: by('role') },
      { key: 'team', header: t.team, sortable, compare: by('team') },
      { key: 'status', header: t.status },
      { key: 'joined', header: t.joined },
    ];
  });

  /** Header clicks toggle ascending / descending only, as in the original live demo. */
  protected onLiveSort(sort: ModTableSort | null): void {
    this.sortState.update((current) => sort ?? { key: current.key, direction: 'asc' });
  }

  protected setSortColumn(key: SortKey): void {
    this.sortState.update((current) => ({ key, direction: current.direction }));
  }

  /** Status-tag variant for the "Status tag" role cell. */
  protected roleVariant(role: string): ModStatusTagVariant {
    const r = role.toLowerCase();
    if (r.includes('admin') || role.includes('مدير')) return 'success';
    if (r.includes('editor') || role.includes('محرر')) return 'info';
    if (r.includes('reviewer') || role.includes('مراجع')) return 'warning';
    return 'neutral';
  }

  protected statusVariant(status: string): ModStatusTagVariant {
    const s = status.toLowerCase();
    if (s.includes('inactive') || s.includes('غير')) return 'neutral';
    if (s.includes('active') || s === 'نشط') return 'success';
    if (s.includes('pending') || s.includes('review') || s.includes('مراجع')) return 'warning';
    return 'neutral';
  }

  // ----- Showcase data -----
  protected readonly allRows: Member[] = LABELS.en.rows;
  protected readonly basicRows: Member[] = LABELS.en.rows.slice(0, 3);

  protected readonly basicColumns: ModTableColumn<Member>[] = [
    { key: 'name', header: 'Name', type: 'link' },
    { key: 'role', header: 'Role' },
    { key: 'team', header: 'Team' },
    { key: 'status', header: 'Status' },
  ];
  protected readonly teamColumns: ModTableColumn<Member>[] = [
    { key: 'name', header: 'Name', type: 'link' },
    { key: 'role', header: 'Role' },
    { key: 'team', header: 'Team' },
  ];
  protected readonly stripedColumns: ModTableColumn<Member>[] = [
    { key: 'name', header: 'Name', type: 'link' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ];

  // Header cell types
  protected readonly headerColumns: ModTableColumn<HeaderExample>[] = [
    { key: 'plain', header: 'Plain header' },
    { key: 'sortable', header: 'Sortable', sortable: true },
    { key: 'asc', header: 'Active ASC', sortable: true, sortIndicator: 'asc' },
    { key: 'desc', header: 'Active DESC', sortable: true, sortIndicator: 'desc' },
  ];
  protected readonly headerRows: HeaderExample[] = [{ plain: '—', sortable: '—', asc: '—', desc: '—' }];
  protected readonly headerSelected = signal<HeaderExample[]>([]);
  protected readonly headerSort = signal<ModTableSort | null>(null);

  // Body cell types
  protected readonly cellColumns: ModTableColumn<CellExample>[] = [
    { key: 'type', header: 'Type' },
    { key: 'example', header: 'Example', cellClass: (row) => (row.kind === 'link' ? 'table__cell--link' : '') },
  ];
  protected readonly cellRows: CellExample[] = [
    { kind: 'text', type: 'Text' },
    { kind: 'link', type: 'Link' },
    { kind: 'status', type: 'Status tag' },
    { kind: 'tag', type: 'Tag' },
    { kind: 'action', type: 'Action arrow' },
    { kind: 'checkbox', type: 'Checkbox' },
  ];

  // Row states
  protected readonly stateColumns: ModTableColumn<Member>[] = [
    { key: 'row', header: 'Row', value: (member) => member.team },
    { key: 'name', header: 'Name', type: 'link' },
    { key: 'status', header: 'Status' },
  ];
  protected readonly stateRows: Member[] = [
    { name: 'Sara Al-Otaibi', role: '', team: 'Default', status: 'Active', joined: '' },
    { name: 'Maya Hassan', role: '', team: 'Selected', status: 'Active', joined: '' },
    { name: 'Omar Al-Harbi', role: '', team: 'Hover this row →', status: 'Inactive', joined: '' },
  ];
  protected readonly stateSelected: Member[] = [this.stateRows[1]];

  // With selection (second row checked initially)
  protected readonly selectionSelected = signal<Member[]>([this.basicRows[1]]);

  // With sorting
  protected readonly sortingColumns: ModTableColumn<Member>[] = [
    { key: 'name', header: 'Name', type: 'link', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'team', header: 'Team', sortable: true },
  ];
  protected readonly sortingRows: Member[] = [
    LABELS.en.rows[1],
    LABELS.en.rows[2],
    LABELS.en.rows[3],
    LABELS.en.rows[0],
  ];
  protected readonly sortingSort = signal<ModTableSort | null>({ key: 'name', direction: 'asc' });

  // RTL
  protected readonly arabicColumns: ModTableColumn<Member>[] = [
    { key: 'name', header: 'الاسم', type: 'link', sortable: true },
    { key: 'role', header: 'الدور' },
    { key: 'team', header: 'الفريق' },
    { key: 'status', header: 'الحالة' },
  ];
  protected readonly arabicRows: Member[] = LABELS.ar.rows.slice(0, 2);
  protected readonly arabicSelected = signal<Member[]>([this.arabicRows[1]]);
  protected readonly arabicSort = signal<ModTableSort | null>({ key: 'name', direction: 'asc' });

  protected readonly props: DemoProp[] = [
    { name: 'columns', type: 'ModTableColumn<T>[]', description: 'Required. Column definitions: key, header, sortable, type (text | link | action), value, compare, headerClass, cellClass (string or per-row function), sortIndicator.' },
    { name: 'rows', type: 'T[]', description: 'Required. Row objects.' },
    { name: 'rowKey', type: '(row: T) => unknown', description: 'Row identity used for tracking. Defaults to the row object.' },
    { name: 'density', type: "'regular' | 'compact' | 'relaxed'", default: "'regular'", description: 'Cell padding: compact 4×12, regular 8×16, relaxed 16×24.' },
    { name: 'striped', type: 'boolean', default: 'false', description: 'Alternate row background tint.' },
    { name: 'bordered', type: 'boolean', default: 'false', description: 'Vertical borders between columns in addition to the row dividers.' },
    { name: 'sharp', type: 'boolean', default: 'false', description: "Drops the wrapper's rounded corners." },
    { name: 'selectable', type: 'boolean', default: 'false', description: 'Adds the leading checkbox column with select-all (indeterminate when partially selected).' },
    { name: '[(selected)]', type: 'T[]', default: '[]', description: 'Selected row objects; selected rows are highlighted.' },
    { name: '[(sort)]', type: 'ModTableSort | null', default: 'null', description: 'Active sort ({ key, direction }). Header clicks cycle ascending → descending → unsorted.' },
    { name: 'manualSort', type: 'boolean', default: 'false', description: 'Do not reorder rows locally; only update sort (server-side sorting).' },
    { name: 'filterable', type: 'boolean', default: 'false', description: 'Shows the filter (funnel) toggle button in a trailing header cell.' },
    { name: '[(filterActive)]', type: 'boolean', default: 'false', description: 'Pressed state of the filter button.' },
    { name: 'rowAction', type: 'boolean', default: 'false', description: 'Adds a trailing arrow action button to every row (auto-flips in RTL).' },
    { name: 'label', type: 'string', default: "''", description: 'Accessible name of the table.' },
    { name: 'selectAllLabel', type: 'string', default: "'Select all rows'", description: 'Accessible label of the select-all checkbox.' },
    { name: 'selectRowLabel', type: 'string', default: "'Select row'", description: 'Accessible label of each row checkbox.' },
    { name: 'filterLabel', type: 'string', default: "'Filter'", description: 'Accessible label of the filter button.' },
    { name: 'rowActionLabel', type: 'string', default: "'Open row'", description: 'Accessible label of the row action button.' },
    { name: 'emptyText', type: 'string', default: "'No data available'", description: 'Text shown when rows is empty.' },
    { name: '(cellClick)', type: '{ row, column }', description: 'A link-type cell was clicked.' },
    { name: '(rowActionClick)', type: 'T', description: 'The trailing row action button was clicked.' },
  ];
}
