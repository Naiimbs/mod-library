import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModSidebar, ModSidebarGroup, ModSidebarItem, ModSidebarNav } from '@mod-internal/ui';
import { DEMO_KIT, DemoProp } from '../../shared/demo-kit';

const ICONS = ['home-05', 'user', 'analytics-01', 'settings-01'];
const IDS = ['dashboard', 'users', 'analytics', 'settings'];
const LABELS = {
  en: ['Dashboard', 'Users', 'Analytics', 'Settings'],
  ar: ['لوحة التحكم', 'المستخدمون', 'التحليلات', 'الإعدادات'],
};
const GROUP_TITLES = {
  en: ['Workspace', 'Account'],
  ar: ['مساحة العمل', 'الحساب'],
};

@Component({
  selector: 'demo-sidebar-page',
  imports: [ModSidebar, ModSidebarNav, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Sidebar Navigation</h1>
      <p class="content-description">Vertical sidebar navigation component.</p>
    </div>

    <demo-live
      heading="Sidebar Navigation"
      description="A bordered vertical navigation with icon links, optional group titles and a collapsed icon-only mode."
      [rtl]="rtl()"
    >
      <mod-sidebar-nav
        [items]="grouped() ? [] : liveItems()"
        [groups]="grouped() ? liveGroups() : []"
        [collapsed]="collapsed()"
        [ariaLabel]="rtl() ? 'الشريط الجانبي' : 'Sidebar'"
        [(activeId)]="active"
      />

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-switch label="Collapsed" [(checked)]="collapsed" />
      <demo-switch label="Groups" [(checked)]="grouped" />
      <demo-switch label="Icons" [checked]="icons()" (checkedChange)="setIcons($event)" />
    </demo-live>

    <demo-props
      heading="Props / Configuration — mod-sidebar-nav"
      description="The bordered sidebar navigation shown in the live demo."
      [props]="navProps"
    />

    <demo-props
      heading="Props / Configuration — mod-sidebar"
      description="The sticky docs-shell sidebar (220px column of links with icons and badges)."
      [props]="shellProps"
    />

    <demo-showcase heading="Default Sidebar" align="flex-start">
      <mod-sidebar-nav [items]="defaultItems" />
    </demo-showcase>

    <demo-showcase heading="Groups" description="Items organised under group titles." align="flex-start">
      <mod-sidebar-nav [groups]="groups" ariaLabel="Grouped sidebar" />
    </demo-showcase>

    <demo-showcase heading="Collapsed" description="Icon-only 64px mode; labels become tooltips." align="flex-start">
      <mod-sidebar-nav collapsed [items]="defaultItems" ariaLabel="Collapsed sidebar" />
    </demo-showcase>

    <demo-showcase heading="RTL Support" align="flex-start">
      <div dir="rtl" lang="ar">
        <mod-sidebar-nav [items]="rtlItems" ariaLabel="الشريط الجانبي" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Docs-shell Sidebar"
      description="mod-sidebar: sticky below a 72px header and hidden under 768px, as in the documentation shell. Shown here in a scrolling frame."
      align="flex-start"
    >
      <div style="height: 420px; overflow: auto; border: 1px solid var(--color-border-secondary); border-radius: var(--radius-md);">
        <mod-sidebar [items]="shellItems" [(activeId)]="shellActive" />
      </div>
    </demo-showcase>
  `,
})
export class SidebarPage {
  protected readonly rtl = signal(false);
  protected readonly collapsed = signal(false);
  protected readonly grouped = signal(false);
  protected readonly icons = signal(true);
  protected readonly active = signal<string | null>('dashboard');
  protected readonly shellActive = signal<string | null>('buttons');

  protected readonly liveItems = computed<ModSidebarItem[]>(() => {
    const labels = this.rtl() ? LABELS.ar : LABELS.en;
    return labels.map((label, i) => ({
      id: IDS[i],
      label,
      icon: this.icons() ? ICONS[i] : undefined,
    }));
  });

  protected readonly liveGroups = computed<ModSidebarGroup[]>(() => {
    const items = this.liveItems();
    const titles = this.rtl() ? GROUP_TITLES.ar : GROUP_TITLES.en;
    return [
      { title: titles[0], items: items.slice(0, 3) },
      { title: titles[1], items: items.slice(3) },
    ];
  });

  /** The collapsed mode is icon-only, so it cannot be combined with hidden icons. */
  protected setIcons(on: boolean): void {
    this.icons.set(on);
    if (!on) this.collapsed.set(false);
  }

  protected readonly defaultItems: ModSidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home-05', active: true },
    { id: 'users', label: 'Users', icon: 'user' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics-01' },
    { id: 'settings', label: 'Settings', icon: 'settings-01' },
  ];

  protected readonly groups: ModSidebarGroup[] = [
    {
      title: 'Workspace',
      items: [
        { label: 'Dashboard', icon: 'home-05', active: true },
        { label: 'Documents', icon: 'file-01' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: 'user' },
        { label: 'Settings', icon: 'settings-01' },
      ],
    },
  ];

  protected readonly rtlItems: ModSidebarItem[] = [
    { label: 'لوحة التحكم', icon: 'home-05', active: true },
    { label: 'المستخدمون', icon: 'user' },
    { label: 'التحليلات', icon: 'analytics-01' },
    { label: 'الإعدادات', icon: 'settings-01' },
  ];

  protected readonly shellItems: ModSidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard-square-01' },
    { id: 'buttons', label: 'Buttons', icon: 'cursor-pointer-01', badge: 'New' },
    { id: 'text-input', label: 'Text Input', icon: 'type-cursor' },
    { id: 'dropdown', label: 'Dropdown', icon: 'arrow-down-01', badge: 'New' },
    { id: 'search-box', label: 'Search Box', icon: 'search-01', badge: 'New' },
    { id: 'tags', label: 'Tags', icon: 'tag-01' },
    { id: 'tables', label: 'Tables', icon: 'grid-table' },
    { id: 'cards', label: 'Cards', icon: 'credit-card' },
    { id: 'menus', label: 'Menus', icon: 'menu-01' },
    { id: 'modal', label: 'Modal', icon: 'alert-02' },
    { id: 'footer', label: 'Footer', icon: 'layout-bottom' },
  ];

  protected readonly navProps: DemoProp[] = [
    { name: 'items', type: 'ModSidebarItem[]', default: '[]', description: 'Ungrouped items, rendered first: { id?, label, href?, icon?, active? }.' },
    { name: 'groups', type: 'ModSidebarGroup[]', default: '[]', description: 'Titled groups rendered after items: { title?, items }.' },
    { name: '[(activeId)]', type: 'string | null', default: 'null', description: 'Key (id, or label) of the active item. When null, the items’ own active flags are used.' },
    { name: 'collapsed', type: 'boolean', default: 'false', description: 'Icon-only 64px mode.' },
    { name: 'ariaLabel', type: 'string', default: "'Sidebar'", description: 'Accessible name of the nav landmark.' },
    { name: '(itemSelect)', type: 'ModSidebarItem', description: 'An item was activated.' },
  ];

  protected readonly shellProps: DemoProp[] = [
    { name: 'items', type: 'ModSidebarItem[]', default: '[]', description: 'Links: { id?, label, href?, icon?, badge?, active? }.' },
    { name: '[(activeId)]', type: 'string | null', default: 'null', description: 'Key (id, or label) of the active link.' },
    { name: 'ariaLabel', type: 'string', default: "'Sidebar'", description: 'Accessible name of the nav landmark.' },
    { name: '(itemSelect)', type: 'ModSidebarItem', description: 'A link was activated.' },
  ];
}
