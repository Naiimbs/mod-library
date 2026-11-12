import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModBreadcrumbItem, ModBreadcrumbSelectEvent, ModBreadcrumbs } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const LABELS = {
  en: ['Home', 'Services', 'Category', 'Subcategory', 'Current Page'],
  ar: ['الرئيسية', 'الخدمات', 'الفئة', 'الفئة الفرعية', 'الصفحة الحالية'],
};

function trail(...labels: string[]): ModBreadcrumbItem[] {
  return labels.map((label) => ({ label, href: '#' }));
}

@Component({
  selector: 'demo-breadcrumbs-page',
  imports: [ModBreadcrumbs, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Breadcrumb</h1>
      <p class="content-description">
        A navigation aid that shows the current page's position within the site hierarchy and lets users backtrack to
        ancestor pages. Links use the neutral link color; the current page is a muted, non-interactive label; and a
        chevron separates each level. When the trail gets long it collapses the middle into an overflow (…) that opens
        a dropdown of the hidden links. Full RTL support. Modeled on Figma frames 5698:2597 (Breadcrumb) and 5698:2585
        (Breadcrumb Item).
      </p>
    </div>

    <demo-live
      heading="Breadcrumb"
      description="Adjust the depth and toggle overflow to see the trail collapse into a dropdown."
      [rtl]="rtl()"
    >
      <mod-breadcrumbs
        [items]="liveItems()"
        [collapse]="overflow()"
        [rtl]="rtl()"
        moreLabel="Show more"
        (itemSelected)="stay($event)"
      />

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Levels" [options]="depths" [(value)]="depth" />
      <demo-switch label="Overflow (…)" [(checked)]="overflow" />
    </demo-live>

    <demo-props description="Inputs and outputs of the mod-breadcrumbs component." [props]="props" />

    <demo-showcase
      heading="Anatomy"
      description="Root link → middle links separated by chevrons → the current page as a muted label."
    >
      <mod-breadcrumbs [items]="anatomy" (itemSelected)="stay($event)" />
    </demo-showcase>

    <demo-showcase
      heading="Levels"
      description="The trail grows one level at a time. The last item is always the current page."
      align="flex-start"
    >
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-3xl);">
        <mod-breadcrumbs [items]="twoLevels" (itemSelected)="stay($event)" />
        <mod-breadcrumbs [items]="fourLevels" (itemSelected)="stay($event)" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Overflow Dropdown"
      description='A long trail collapses its middle into an overflow … that opens a dropdown of the hidden links (Figma "Middle-overflow open"). Click the … below.'
      align="flex-start"
    >
      <div style="min-height: 172px;">
        <mod-breadcrumbs [items]="longTrail" collapse (itemSelected)="stay($event)" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="For Arabic, the trail reads right-to-left and the chevron separators flip direction automatically."
      subtle
    >
      <div dir="rtl">
        <mod-breadcrumbs [items]="rtlTrail" rtl (itemSelected)="stay($event)" />
      </div>
    </demo-showcase>
  `,
})
export class BreadcrumbsPage {
  protected readonly depths: DemoOption<number>[] = [2, 3, 4, 5].map((value) => ({ value, label: String(value) }));

  protected readonly rtl = signal(false);
  protected readonly depth = signal(4);
  protected readonly overflow = signal(false);

  /** A trail of `depth` crumbs: the first labels, then the current page. */
  protected readonly liveItems = computed<ModBreadcrumbItem[]>(() => {
    const all = this.rtl() ? LABELS.ar : LABELS.en;
    const labels: string[] = [];
    for (let i = 0; i < this.depth() - 1; i++) labels.push(all[i % (all.length - 1)]);
    labels.push(all[all.length - 1]);
    return trail(...labels);
  });

  protected readonly anatomy = trail('Home', 'Services', 'Current Page');
  protected readonly twoLevels = trail('Home', 'Services');
  protected readonly fourLevels = trail('Home', 'Services', 'Category', 'Subcategory');
  protected readonly longTrail = trail('Home', 'Services', 'Category', 'Subcategory', 'Details', 'Current Page');
  protected readonly rtlTrail = trail('الرئيسية', 'الخدمات', 'تفاصيل الخدمة');

  /** The demo links point to "#": keep the docs page where it is. */
  protected stay(selection: ModBreadcrumbSelectEvent): void {
    selection.event.preventDefault();
  }

  protected readonly props: DemoProp[] = [
    { name: 'items', type: 'ModBreadcrumbItem[]', default: 'required', description: 'The trail as { label, href?, id? }. The last item is rendered as the current page (muted, aria-current="page").' },
    { name: 'collapse', type: 'boolean', default: 'false', description: 'Collapse the middle of a trail longer than three items into an overflow (…) dropdown of the hidden links.' },
    { name: 'rtl', type: 'boolean', default: 'false', description: 'Forces the RTL layout (breadcrumb--rtl) regardless of the page direction. Chevrons flip automatically.' },
    { name: 'aria-label', type: 'string', default: "'Breadcrumb'", description: 'Accessible name of the nav element.' },
    { name: 'moreLabel', type: 'string', default: "'Show more links'", description: 'Accessible label of the overflow (…) button.' },
    { name: '(itemSelected)', type: 'output<ModBreadcrumbSelectEvent>', description: 'Emitted when a link is activated, with { item, index, event }. Call event.preventDefault() to navigate yourself.' },
  ];
}
