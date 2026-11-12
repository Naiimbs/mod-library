import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModFilterBlock, ModFilters, ModFiltersValue } from '@mod-internal/ui';
import { DEMO_KIT, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-filters-page',
  imports: [ModFilters, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Filters</h1>
      <p class="content-description">
        A filtration component that helps users refine content by selecting criteria. A neutral trigger button opens a
        floating panel of filter blocks (search, checkbox lists with show more, chips, ranges); applied filters appear
        as primary buttons with a remove action. Rebuilt to match the DGA library's <code>mod-filteration</code>
        anatomy, composed from the design-system button, checkbox, chip, search box, and text input components.
      </p>
    </div>

    <demo-live
      heading="Filters"
      description="This demo really works — open the panel, search and tick options, apply them, then remove the applied filters one by one or clear all."
      align="flex-start"
      justify="flex-start"
      [rtl]="rtl()"
    >
      <div style="width: 100%; max-width: 560px; min-height: 480px;">
        <mod-filters
          [triggerLabel]="t().trigger"
          [applyLabel]="t().apply"
          [clearLabel]="t().clear"
          [searchLabel]="t().search"
          [showLessLabel]="t().less"
          [showMoreLabel]="t().more"
          [removeLabel]="t().remove"
          [blocks]="t().blocks"
          [(value)]="demoValue"
        />
      </div>

      <demo-switch label="RTL" [(checked)]="rtl" />
    </demo-live>

    <demo-props
      description="Inputs, models and outputs of the mod-filters component, plus the ModFilterBlock fields that describe each panel block."
      [props]="props"
    />

    <demo-showcase
      heading="Trigger & Applied Filters"
      description="The neutral trigger with its filter icon and chevron, next to applied filters rendered as primary buttons with a remove ×."
      align="flex-start"
    >
      <mod-filters
        style="width: 100%; max-width: 640px;"
        triggerLabel="Filter Products"
        [blocks]="toolbarBlocks"
        [(value)]="toolbarValue"
      />
    </demo-showcase>

    <demo-showcase
      heading="Panel"
      description='The open panel: a search box, a checkbox block collapsed to three options with a "Show more" action, a divider, and the Apply / Clear actions.'
      align="flex-start"
    >
      <mod-filters style="width: 100%;" inline hideToolbar [blocks]="categoryBlocks" [(value)]="panelValue" />
    </demo-showcase>

    <demo-showcase
      heading="Block Types"
      description="Beyond checkboxes: chips blocks wrap design-system chips at a 20px gap, and range blocks join two 125px text inputs with a dash."
      align="flex-start"
    >
      <mod-filters style="width: 100%;" inline hideToolbar [blocks]="typeBlocks" [(value)]="typesValue" />
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="The trigger, applied filters, and panel blocks mirror in right-to-left layouts."
      align="flex-start"
    >
      <div dir="rtl" style="width: 100%; max-width: 640px;">
        <mod-filters
          triggerLabel="تصفية المنتجات"
          applyLabel="تطبيق التصفية"
          clearLabel="مسح التصفية"
          searchLabel="بحث"
          showLessLabel="عرض أقل"
          removeLabel="إزالة التصفية"
          [showMoreLabel]="moreAr"
          [blocks]="arabicBlocks"
          [(value)]="rtlValue"
        />
      </div>
    </demo-showcase>
  `,
})
export class FiltersPage {
  protected readonly rtl = signal(false);

  protected readonly moreEn = (count: number): string => `Show ${count} more`;
  protected readonly moreAr = (count: number): string => `عرض ${count} المزيد`;

  protected readonly categoryBlocks: ModFilterBlock[] = [
    {
      id: 'category',
      title: 'Category',
      type: 'checkbox',
      searchable: true,
      options: [
        { id: 'electronics', label: 'Electronics' },
        { id: 'clothing', label: 'Clothing' },
        { id: 'books', label: 'Books' },
        { id: 'home', label: 'Home & Kitchen' },
        { id: 'sports', label: 'Sports' },
        { id: 'beauty', label: 'Beauty & Care' },
      ],
    },
  ];

  protected readonly arabicBlocks: ModFilterBlock[] = [
    {
      id: 'category',
      title: 'الفئة',
      type: 'checkbox',
      searchable: true,
      options: [
        { id: 'electronics', label: 'إلكترونيات' },
        { id: 'clothing', label: 'ملابس' },
        { id: 'books', label: 'كتب' },
        { id: 'home', label: 'المنزل والمطبخ' },
        { id: 'sports', label: 'رياضة' },
        { id: 'beauty', label: 'الجمال والعناية' },
      ],
    },
  ];

  protected readonly toolbarBlocks: ModFilterBlock[] = [
    ...this.categoryBlocks,
    {
      id: 'availability',
      title: 'Availability',
      type: 'checkbox',
      options: [
        { id: 'in-stock', label: 'In stock' },
        { id: 'out-of-stock', label: 'Out of stock' },
      ],
    },
  ];

  protected readonly typeBlocks: ModFilterBlock[] = [
    {
      id: 'size',
      title: 'Size',
      type: 'chips',
      options: [
        { id: 'small', label: 'Small' },
        { id: 'medium', label: 'Medium' },
        { id: 'large', label: 'Large' },
      ],
    },
    {
      id: 'price',
      title: 'Price range',
      type: 'range',
      minPlaceholder: 'Min',
      maxPlaceholder: 'Max',
      minLabel: 'Minimum price',
      maxLabel: 'Maximum price',
    },
  ];

  /** Copy and blocks of the live demo: Arabic when RTL is on, as in the original. */
  protected readonly t = computed(() =>
    this.rtl()
      ? {
          trigger: 'تصفية المنتجات',
          search: 'بحث',
          apply: 'تطبيق التصفية',
          clear: 'مسح التصفية',
          less: 'عرض أقل',
          remove: 'إزالة التصفية',
          more: this.moreAr,
          blocks: this.arabicBlocks,
        }
      : {
          trigger: 'Filter Products',
          search: 'Search',
          apply: 'Apply filters',
          clear: 'Clear filters',
          less: 'Show less',
          remove: 'Remove filter',
          more: this.moreEn,
          blocks: this.categoryBlocks,
        },
  );

  protected readonly demoValue = signal<ModFiltersValue>({});
  protected readonly toolbarValue = signal<ModFiltersValue>({
    category: ['electronics'],
    availability: ['in-stock'],
  });
  protected readonly panelValue = signal<ModFiltersValue>({ category: ['electronics'] });
  protected readonly typesValue = signal<ModFiltersValue>({ size: ['medium'] });
  protected readonly rtlValue = signal<ModFiltersValue>({ category: ['electronics'] });

  protected readonly props: DemoProp[] = [
    { name: 'blocks', type: 'ModFilterBlock[]', default: '[]', description: 'The filter blocks rendered in the panel, in order.' },
    { name: '[(value)]', type: 'Record<string, string[] | { min, max }>', default: '{}', description: 'Applied filters keyed by block id: selected option ids, or a range for range blocks. Updated on Apply, Clear and remove.' },
    { name: '[(open)]', type: 'boolean', default: 'false', description: 'Whether the floating panel is open.' },
    { name: 'inline', type: 'boolean', default: 'false', description: 'Renders the panel in the page flow, always visible, instead of floating under the trigger.' },
    { name: 'hideToolbar', type: 'boolean', default: 'false', description: 'Hides the trigger and applied-filters row (use with inline for a panel-only layout).' },
    { name: 'triggerLabel', type: 'string', default: "'Filters'", description: 'Label of the neutral trigger button; also the accessible name of the panel.' },
    { name: 'applyLabel', type: 'string', default: "'Apply filters'", description: 'Label of the apply action.' },
    { name: 'clearLabel', type: 'string', default: "'Clear filters'", description: 'Label of the clear action.' },
    { name: 'searchLabel', type: 'string', default: "'Search'", description: 'Placeholder and accessible name of the search box in searchable checkbox blocks.' },
    { name: 'showMoreLabel', type: '(count: number) => string', default: "'Show N more'", description: 'Builds the label of the show-more action.' },
    { name: 'showLessLabel', type: 'string', default: "'Show less'", description: 'Label of the show-less action.' },
    { name: 'removeLabel', type: 'string', default: "'Remove filter'", description: 'Accessible prefix of an applied-filter button.' },
    { name: 'rangeSeparator', type: 'string', default: "'—'", description: 'Text between the two inputs of a range block.' },
    { name: '(applied)', type: 'ModFiltersValue', description: 'Emitted with the new value when Apply filters is pressed.' },
    { name: '(cleared)', type: 'void', description: 'Emitted when Clear filters is pressed.' },
    { name: '(filterRemoved)', type: 'ModAppliedFilter', description: 'Emitted when an applied filter is removed from the toolbar.' },
    { name: 'ModFilterBlock.id', type: 'string', description: 'Key of the block in the filters value.' },
    { name: 'ModFilterBlock.title', type: 'string', description: 'Block title (16px semibold, 1px underline).' },
    { name: 'ModFilterBlock.type', type: "'checkbox' | 'chips' | 'range'", description: 'Checkbox list, wrapping chips, or two text inputs joined by a dash.' },
    { name: 'ModFilterBlock.options', type: '{ id, label }[]', description: 'Options of a checkbox or chips block.' },
    { name: 'ModFilterBlock.searchable', type: 'boolean', default: 'false', description: 'Checkbox blocks: show a search box that filters the options.' },
    { name: 'ModFilterBlock.visibleCount', type: 'number', default: '3', description: 'Checkbox blocks: options shown while collapsed.' },
    { name: 'ModFilterBlock.minPlaceholder / maxPlaceholder / minLabel / maxLabel', type: 'string', description: 'Range blocks: placeholders and accessible names of the two inputs.' },
  ];
}
