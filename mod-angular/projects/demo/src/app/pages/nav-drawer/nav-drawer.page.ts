import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModNavDrawer, ModNavDrawerBackground, ModNavDrawerItem } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

/** Preview 1: every item type (LTR). */
const ALL_ITEMS: ModNavDrawerItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home-05', active: true },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'file-01',
    expanded: true,
    children: [
      { id: 'all-documents', label: 'All Documents' },
      { id: 'pending', label: 'Pending Review', badge: '+99' },
      { id: 'external', label: 'External Portal', external: true },
      { id: 'shared', label: 'Shared with Me', active: true },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings-01',
    children: [
      { id: 'account', label: 'Account' },
      { id: 'security', label: 'Security' },
      { id: 'preferences', label: 'Preferences' },
    ],
  },
  { id: 'divider-1', divider: true },
  { id: 'notifications', label: 'Notifications', icon: 'notification-01', badge: '+99' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics-01' },
  { id: 'help', label: 'Help Center' },
  { id: 'reports', label: 'Reports', icon: 'dashboard-square-01', children: [] },
  { id: 'divider-2', divider: true },
  { id: 'restricted', label: 'Restricted Area', icon: 'lock', disabled: true },
  { id: 'advanced', label: 'Advanced Reports', disabled: true },
];

/** Preview 2: green "on color" drawer (LTR). */
const GREEN_ITEMS: ModNavDrawerItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home-05', active: true },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'file-01',
    expanded: true,
    children: [
      { id: 'all-documents', label: 'All Documents' },
      { id: 'pending', label: 'Pending Review', badge: '+99' },
      { id: 'external', label: 'External Portal', external: true },
      { id: 'shared', label: 'Shared with Me', active: true },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings-01',
    children: [
      { id: 'account', label: 'Account' },
      { id: 'security', label: 'Security' },
    ],
  },
  { id: 'divider-1', divider: true },
  { id: 'notifications', label: 'Notifications', icon: 'notification-01', badge: '+99' },
  { id: 'help', label: 'Help Center' },
  { id: 'reports', label: 'Reports', icon: 'dashboard-square-01', children: [] },
  { id: 'divider-2', divider: true },
  { id: 'restricted', label: 'Restricted Area', icon: 'lock', disabled: true },
];

/** Preview 3: RTL gray. */
const AR_ITEMS: ModNavDrawerItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: 'home-05', active: true },
  {
    id: 'documents',
    label: 'المستندات',
    icon: 'file-01',
    expanded: true,
    children: [
      { id: 'all-documents', label: 'جميع المستندات' },
      { id: 'pending', label: 'قيد المراجعة', badge: '+99' },
      { id: 'shared', label: 'مشترك معي', active: true },
    ],
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'settings-01',
    children: [
      { id: 'account', label: 'الحساب' },
      { id: 'security', label: 'الأمان' },
    ],
  },
  { id: 'divider-1', divider: true },
  { id: 'notifications', label: 'الإشعارات', icon: 'notification-01', badge: '+99' },
  { id: 'help', label: 'مركز المساعدة' },
  { id: 'reports', label: 'التقارير', icon: 'dashboard-square-01', children: [] },
  { id: 'divider-2', divider: true },
  { id: 'restricted', label: 'منطقة مقيدة', icon: 'lock', disabled: true },
];

/** Preview 4: RTL green. */
const AR_GREEN_ITEMS: ModNavDrawerItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: 'home-05', active: true },
  {
    id: 'documents',
    label: 'المستندات',
    icon: 'file-01',
    expanded: true,
    children: [
      { id: 'all-documents', label: 'جميع المستندات' },
      { id: 'pending', label: 'قيد المراجعة', badge: '+99' },
      { id: 'shared', label: 'مشترك معي', active: true },
    ],
  },
  { id: 'settings', label: 'الإعدادات', icon: 'settings-01', children: [{ id: 'account', label: 'الحساب' }] },
  { id: 'divider-1', divider: true },
  { id: 'notifications', label: 'الإشعارات', icon: 'notification-01', badge: '+99' },
  { id: 'restricted', label: 'منطقة مقيدة', icon: 'lock', disabled: true },
];

/** Preview 5: without header. */
const NO_HEADER_ITEMS: ModNavDrawerItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home-05', active: true },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'file-01',
    expanded: true,
    children: [
      { id: 'all-documents', label: 'All Documents' },
      { id: 'shared', label: 'Shared with Me' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: 'settings-01', children: [{ id: 'account', label: 'Account' }] },
  { id: 'divider-1', divider: true },
  { id: 'notifications', label: 'Notifications', icon: 'notification-01', badge: '+99' },
];

@Component({
  selector: 'demo-nav-drawer-page',
  imports: [ModNavDrawer, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .nav-drawer-frame {
      border: 1px solid var(--color-border-secondary);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .nav-drawer-states-label {
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-md);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nav-drawer-states-block {
      margin-bottom: var(--spacing-xl);
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Navigation Drawer</h1>
      <p class="content-description">
        A navigation drawer appears as a side panel revealing navigation options such as links, collapsible
        sub-menus, badges, and dividers. Supports LTR/RTL, multiple background themes, and accessibility.
      </p>
    </div>

    <demo-live
      heading="Navigation Drawer"
      description="A side panel with links, collapsible sub-menus, badges and dividers, on white, gray or green backgrounds."
      [rtl]="rtl()"
    >
      <div class="nav-drawer-frame" style="height: 620px;">
        <mod-nav-drawer
          [items]="liveItems()"
          [background]="background()"
          [header]="header()"
          [headerDivider]="headerDivider()"
          [logoText]="rtl() ? 'شعار المنصة' : 'Platform Logo'"
          [ariaLabel]="rtl() ? 'التنقل الرئيسي' : 'Main navigation'"
          [(activeId)]="active"
        />
      </div>

      <demo-switch label="RTL" [checked]="rtl()" (checkedChange)="setRtl($event)" />
      <demo-select label="Background" [options]="backgrounds" [(value)]="background" />
      <demo-switch label="Header" [(checked)]="header" />
      <demo-switch label="Header divider" [(checked)]="headerDivider" />
      <demo-switch label="Icons" [(checked)]="icons" />
      <demo-switch label="Badges" [(checked)]="badges" />
      <demo-switch label="Dividers" [(checked)]="dividers" />
      <demo-switch label="Disabled items" [(checked)]="disabledItems" />
    </demo-live>

    <demo-props
      description="Inputs, outputs and content slots of mod-nav-drawer. The drawer is 256px wide and fills the height of its container."
      [props]="props"
    />

    <demo-showcase heading="Default (LTR) - Gray Background — All Item Types">
      <div class="nav-drawer-frame" style="height: 620px;">
        <mod-nav-drawer background="gray" ariaLabel="Main navigation (LTR Gray)" [items]="allItems" />
      </div>
    </demo-showcase>

    <demo-showcase heading='Green Background (LTR) — "On Color" Variant'>
      <div class="nav-drawer-frame" style="height: 620px;">
        <mod-nav-drawer background="green" ariaLabel="Main navigation (LTR Green)" [items]="greenItems" />
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL (Arabic) — Gray Background">
      <div class="nav-drawer-frame" style="height: 580px;" dir="rtl" lang="ar">
        <mod-nav-drawer background="gray" logoText="شعار المنصة" ariaLabel="التنقل الرئيسي" [items]="arItems" />
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL (Arabic) — Green Background">
      <div class="nav-drawer-frame" style="height: 520px;" dir="rtl" lang="ar">
        <mod-nav-drawer
          background="green"
          logoText="شعار المنصة"
          ariaLabel="التنقل الرئيسي (أخضر)"
          [items]="arGreenItems"
        />
      </div>
    </demo-showcase>

    <demo-showcase heading="Without Header — White Background">
      <div class="nav-drawer-frame" style="height: 400px;">
        <mod-nav-drawer
          background="white"
          ariaLabel="Navigation without header"
          [header]="false"
          [items]="noHeaderItems"
        />
      </div>
    </demo-showcase>

    <demo-showcase heading="Nav Drawer Item — All States & Variants" bare>
      <div bare>
        @for (group of stateGroups; track group.label) {
          <div class="nav-drawer-states-label">{{ group.label }}</div>
          <div class="nav-drawer-states-block">
            <mod-nav-drawer
              style="height: auto"
              [background]="group.background"
              [header]="false"
              [ariaLabel]="group.label"
              [items]="group.items"
            />
          </div>
        }
      </div>
    </demo-showcase>
  `,
})
export class NavDrawerPage {
  protected readonly backgrounds: DemoOption<ModNavDrawerBackground>[] = [
    { value: 'gray', label: 'Gray' },
    { value: 'white', label: 'White' },
    { value: 'green', label: 'Green' },
  ];

  protected readonly rtl = signal(false);
  protected readonly background = signal<ModNavDrawerBackground>('gray');
  protected readonly header = signal(true);
  protected readonly headerDivider = signal(true);
  protected readonly icons = signal(true);
  protected readonly badges = signal(true);
  protected readonly dividers = signal(true);
  protected readonly disabledItems = signal(true);
  protected readonly active = signal<string | null>(null);

  protected readonly liveItems = computed<ModNavDrawerItem[]>(() => {
    const strip = (item: ModNavDrawerItem): ModNavDrawerItem => ({
      ...item,
      icon: this.icons() ? item.icon : undefined,
      badge: this.badges() ? item.badge : undefined,
      children: item.children?.map(strip),
    });
    return (this.rtl() ? AR_ITEMS : ALL_ITEMS)
      .filter((item) => (this.dividers() || !item.divider) && (this.disabledItems() || !item.disabled))
      .map(strip);
  });

  protected setRtl(on: boolean): void {
    this.rtl.set(on);
    this.active.set(null);
  }

  protected readonly allItems = ALL_ITEMS;
  protected readonly greenItems = GREEN_ITEMS;
  protected readonly arItems = AR_ITEMS;
  protected readonly arGreenItems = AR_GREEN_ITEMS;
  protected readonly noHeaderItems = NO_HEADER_ITEMS;

  protected readonly stateGroups: {
    label: string;
    background: ModNavDrawerBackground;
    items: ModNavDrawerItem[];
  }[] = [
    {
      label: 'Level 1 Link — Default | Selected | Disabled',
      background: 'white',
      items: [
        { label: 'Default Link', icon: 'home-05' },
        { label: 'Selected Link', icon: 'home-05', active: true },
        { label: 'Disabled Link', icon: 'home-05', disabled: true },
      ],
    },
    {
      label: 'Level 1 Link with Badge',
      background: 'white',
      items: [
        { label: 'With Badge', icon: 'notification-01', badge: '+99' },
        { label: 'Selected + Badge', icon: 'notification-01', badge: '+99', active: true },
      ],
    },
    {
      label: 'Level 1 Link without Icon',
      background: 'white',
      items: [{ label: 'Text Only Link' }],
    },
    {
      label: 'Parent Item — Collapsed | Expanded',
      background: 'white',
      items: [
        { label: 'Collapsed', icon: 'file-01', children: [] },
        { label: 'Expanded', icon: 'file-01', expanded: true, children: [] },
      ],
    },
    {
      label: 'Level 2 Link — Default | With Badge | External Icon | Selected',
      background: 'white',
      items: [
        {
          label: 'Parent',
          icon: 'file-01',
          expanded: true,
          children: [
            { label: 'Child Link' },
            { label: 'With Badge', badge: '+99' },
            { label: 'External', external: true },
            { label: 'Selected Child', active: true },
          ],
        },
      ],
    },
    {
      label: 'Divider',
      background: 'white',
      items: [{ id: 'divider', divider: true }],
    },
    {
      label: 'On Color (Green Background) — All States',
      background: 'green',
      items: [
        { label: 'Default Link', icon: 'home-05' },
        { label: 'Selected Link', icon: 'home-05', active: true },
        { label: 'Disabled Link', icon: 'home-05', disabled: true },
        { label: 'With Badge', icon: 'notification-01', badge: '+99' },
        {
          label: 'Parent',
          icon: 'file-01',
          expanded: true,
          children: [{ label: 'Child Link' }, { label: 'Selected Child', active: true }],
        },
        { id: 'divider', divider: true },
      ],
    },
  ];

  protected readonly props: DemoProp[] = [
    { name: 'items', type: 'ModNavDrawerItem[]', default: '[]', description: 'Items: { id?, label?, href?, icon?, badge?, external?, active?, disabled?, divider?, children?, expanded? }. children makes a collapsible parent; divider renders a separator.' },
    { name: '[(activeId)]', type: 'string | null', default: 'null', description: 'Key (id, or label) of the selected item. When null, the items’ own active flags are used.' },
    { name: 'background', type: "'white' | 'gray' | 'green'", default: "'white'", description: 'Background theme. Green is the “on color” variant.' },
    { name: 'header', type: 'boolean', default: 'true', description: 'Show the 72px logo header.' },
    { name: 'headerDivider', type: 'boolean', default: 'true', description: 'Line under the header.' },
    { name: 'logoText', type: 'string', default: "'Platform Logo'", description: 'Text of the built-in logo placeholder (shown when no [modNavDrawerLogo] content is projected).' },
    { name: 'ariaLabel', type: 'string', default: "'Main navigation'", description: 'Accessible name of the nav landmark.' },
    { name: '(itemSelect)', type: 'ModNavDrawerItem', description: 'A link (level 1 or 2) was activated.' },
    { name: '(expandedChange)', type: '{ item, expanded }', description: 'A parent item was expanded or collapsed.' },
    { name: '[modNavDrawerLogo]', type: 'content slot', description: 'Projected logo replacing the placeholder.' },
  ];
}
