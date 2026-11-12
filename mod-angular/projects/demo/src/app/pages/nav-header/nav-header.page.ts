import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModNavHeader,
  ModNavHeaderAction,
  ModNavHeaderGroup,
  ModNavHeaderItem,
  ModNavHeaderLayout,
  ModNavHeaderLogoPosition,
  ModNavHeaderLogoSize,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type PinnedState = 'default' | 'hovered' | 'pressed' | 'focused' | 'disabled';
type SubmenuMode = 'closed' | 'default' | 'brand';
type LinkStyle = 'text' | 'icon' | 'boxed';

interface Labels {
  logo: string;
  links: string[];
  action: string;
  groups: [string, [string, string][]][];
}

const ACTION_ICON = 'square-arrow-right-01';
const SUB_ICONS = ['user', 'file-01', 'building-01', 'analytics-01'];

const LABELS: { en: Labels; ar: Labels } = {
  en: {
    logo: 'Platform Logo',
    links: ['Home', 'Services', 'Reports', 'Settings'],
    action: 'Action',
    groups: [
      ['For individuals', [['Personal account', 'Manage your profile and requests'], ['Documents', 'Certificates and records']]],
      ['For business', [['Organizations', 'Register and manage entities'], ['Analytics', 'Usage and performance']]],
    ],
  },
  ar: {
    logo: 'شعار المنصة',
    links: ['الرئيسية', 'الخدمات', 'المقالات', 'الإعدادات'],
    action: 'إجراء',
    groups: [
      ['للأفراد', [['الحساب الشخصي', 'إدارة ملفك وطلباتك'], ['المستندات', 'الشهادات والسجلات']]],
      ['للأعمال', [['المنشآت', 'تسجيل الكيانات وإدارتها'], ['التحليلات', 'الاستخدام والأداء']]],
    ],
  },
};

function buildGroups(t: Labels, withIcons: boolean): ModNavHeaderGroup[] {
  let i = 0;
  return t.groups.map(([label, items]) => ({
    label,
    items: items.map(([itemLabel, helper]) => ({
      label: itemLabel,
      helper,
      icon: withIcons ? SUB_ICONS[i++ % SUB_ICONS.length] : undefined,
    })),
  }));
}

@Component({
  selector: 'demo-nav-header-page',
  imports: [ModNavHeader, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nav-header.page.html',
})
export class NavHeaderPage {
  // ---- Live demo controls (same order and defaults as the original page) ----
  protected readonly rtl = signal(false);
  protected readonly breakpoint = signal<ModNavHeaderLayout>('desktop');
  protected readonly fullWidth = signal(true);
  protected readonly divider = signal(true);
  protected readonly logoSize = signal<ModNavHeaderLogoSize>('medium');
  protected readonly logoPosition = signal<ModNavHeaderLogoPosition>('side');
  protected readonly itemState = signal<PinnedState>('default');
  protected readonly itemSelected = signal(true);
  protected readonly itemIcon = signal(false);
  protected readonly actionState = signal<PinnedState>('default');
  protected readonly actionSelected = signal(true);
  protected readonly actionIcon = signal<'side' | 'top'>('side');
  protected readonly actionIconOnly = signal(false);
  protected readonly submenu = signal<SubmenuMode>('closed');
  protected readonly linkStyle = signal<LinkStyle>('icon');

  protected readonly breakpoints: DemoOption<ModNavHeaderLayout>[] = [
    { value: 'desktop', label: 'Desktop (>960)' },
    { value: 'tablet', label: 'Tablet (600–960)' },
    { value: 'mobile', label: 'Mobile (<600)' },
  ];
  protected readonly logoSizes: DemoOption<ModNavHeaderLogoSize>[] = [
    { value: 'small', label: 'Small (32)' },
    { value: 'medium', label: 'Medium (48)' },
    { value: 'large', label: 'Large (64)' },
  ];
  protected readonly logoPositions: DemoOption<ModNavHeaderLogoPosition>[] = [
    { value: 'side', label: 'Side' },
    { value: 'top', label: 'Top' },
  ];
  protected readonly states: DemoOption<PinnedState>[] = [
    { value: 'default', label: 'Default' },
    { value: 'hovered', label: 'Hovered' },
    { value: 'pressed', label: 'Pressed' },
    { value: 'focused', label: 'Focused' },
    { value: 'disabled', label: 'Disabled' },
  ];
  protected readonly actionIconPositions: DemoOption<'side' | 'top'>[] = [
    { value: 'side', label: 'Inline' },
    { value: 'top', label: 'Top' },
  ];
  protected readonly submenuModes: DemoOption<SubmenuMode>[] = [
    { value: 'closed', label: 'Closed' },
    { value: 'default', label: 'Open — Default' },
    { value: 'brand', label: 'Open — Dark green' },
  ];
  protected readonly linkStyles: DemoOption<LinkStyle>[] = [
    { value: 'text', label: 'Text only' },
    { value: 'icon', label: 'Simple icon' },
    { value: 'boxed', label: 'Boxed icon' },
  ];

  private readonly t = computed(() => (this.rtl() ? LABELS.ar : LABELS.en));
  protected readonly logoText = computed(() => this.t().logo);

  /** Item 0 carries the Selected prop; item 1 carries the State prop and the sub-menu. */
  protected readonly liveItems = computed<ModNavHeaderItem[]>(() => {
    const t = this.t();
    const state = this.itemState();
    const icon = this.itemIcon() ? 'dashboard-square-01' : undefined;
    return t.links.map((label, i) => {
      const item: ModNavHeaderItem = { id: `item-${i}`, label, icon };
      if (i === 1) {
        item.groups = buildGroups(t, this.linkStyle() !== 'text');
        item.disabled = state === 'disabled';
        item.state = state === 'disabled' ? 'default' : state;
      }
      return item;
    });
  });

  protected readonly liveActiveId = computed(() => (this.itemSelected() ? 'item-0' : ''));

  protected readonly liveActions = computed<ModNavHeaderAction[]>(() => {
    const label = this.t().action;
    const bp = this.breakpoint();
    const state = this.actionState();
    const base: ModNavHeaderAction = {
      label,
      icon: ACTION_ICON,
      iconPosition: this.actionIcon(),
      iconOnly: this.actionIconOnly() || bp !== 'desktop',
    };
    const stated: ModNavHeaderAction = {
      ...base,
      id: 'a1',
      disabled: state === 'disabled',
      state: state === 'disabled' ? 'default' : state,
    };
    if (bp === 'mobile') return [{ ...base, id: 'a3', variant: 'primary' }];
    if (bp === 'tablet') return [stated, { ...base, id: 'a3', variant: 'primary' }];
    return [
      stated,
      { ...base, id: 'a2' },
      { ...base, id: 'a3', variant: this.actionSelected() ? 'primary' : 'outline' },
    ];
  });

  protected readonly canvasWidth = computed(() => {
    const bp = this.breakpoint();
    return bp === 'mobile' ? '560px' : bp === 'tablet' ? '900px' : null;
  });

  // ---- Showcase data ----
  protected readonly menuItemStates: ModNavHeaderItem[] = [
    { label: 'Selected', arrow: true, active: true },
    { label: 'Default', arrow: true },
    { label: 'Hover me', arrow: true },
    { label: 'Disabled', arrow: true, disabled: true },
  ];

  protected readonly outlineSelected = signal(false);
  protected readonly actionVariants = computed<ModNavHeaderAction[]>(() => [
    { id: 'outline', label: 'Outline', icon: ACTION_ICON, selected: this.outlineSelected() },
    { id: 'icon', label: 'Icon only', icon: ACTION_ICON, iconOnly: true },
    { id: 'primary', label: 'Primary', icon: ACTION_ICON, variant: 'primary' },
  ]);

  protected onActionVariant(action: ModNavHeaderAction): void {
    if (action.id === 'outline') this.outlineSelected.update((v) => !v);
  }

  protected readonly submenuItems: ModNavHeaderItem[] = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services', groups: buildGroups(LABELS.en, true) },
    { id: 'reports', label: 'Reports' },
  ];
  protected readonly signInAction: ModNavHeaderAction[] = [
    { label: 'Sign in', icon: ACTION_ICON, variant: 'primary' },
  ];

  protected readonly rtlItems: ModNavHeaderItem[] = [
    { label: 'الرئيسية', arrow: true, active: true },
    { label: 'الخدمات', arrow: true },
    { label: 'المقالات', arrow: true },
  ];
  protected readonly rtlActions: ModNavHeaderAction[] = [
    { id: 'a1', label: 'إجراء', icon: ACTION_ICON },
    { id: 'a2', label: 'إجراء', icon: ACTION_ICON, variant: 'primary' },
  ];

  protected readonly brandItems: ModNavHeaderItem[] = [
    { id: 'home', label: 'Home' },
    {
      id: 'services',
      label: 'Services',
      groups: [
        {
          label: 'For individuals',
          items: [
            { label: 'Personal account', helper: 'Manage your profile and requests', icon: 'user' },
            { label: 'Documents', helper: 'Certificates and records', icon: 'file-01' },
          ],
        },
        {
          label: 'For business',
          items: [{ label: 'Organizations', helper: 'Register and manage entities', icon: 'building-01' }],
        },
      ],
    },
    { id: 'reports', label: 'Reports' },
  ];

  protected readonly mobileOpen = signal(true);
  protected readonly mobileItems: ModNavHeaderItem[] = [
    { label: 'Home', active: true },
    { label: 'Styles' },
    { label: 'Components' },
  ];
  protected readonly mobileActions: ModNavHeaderAction[] = [
    { label: 'عربي', icon: 'globe-02', variant: 'primary' },
    { label: 'About Team', icon: 'user' },
    { label: 'Search', icon: 'search-01' },
  ];

  protected readonly props: DemoProp[] = [
    { name: 'items', type: 'ModNavHeaderItem[]', default: '[]', description: 'Menu items: { id?, label, href?, icon?, active?, disabled?, state?, arrow?, children?, groups? }. children / groups attach a sub-menu dropdown.' },
    { name: 'actions', type: 'ModNavHeaderAction[]', default: '[]', description: 'Action buttons on the trailing side: { id?, label, href?, icon?, variant?, iconOnly?, iconPosition?, selected?, disabled?, state? }.' },
    { name: '[(activeId)]', type: 'string | null', default: 'null', description: 'Key (id, or label) of the selected menu item. When null, the items’ own active flags are used.' },
    { name: '[(mobileOpen)]', type: 'boolean', default: 'false', description: 'Open state of the hamburger panel shown on the tablet / mobile layouts.' },
    { name: 'responsive', type: 'boolean', default: 'true', description: 'With layout="auto": collapse to the hamburger layout below 960px and to the mobile layout below 600px.' },
    { name: 'layout', type: "'auto' | 'desktop' | 'tablet' | 'mobile'", default: "'auto'", description: 'Forces a breakpoint layout regardless of the viewport width.' },
    { name: 'fullWidth', type: 'boolean', default: 'true', description: 'Span edge to edge. When false the header is centered in a 1280px container.' },
    { name: 'divider', type: 'boolean', default: 'false', description: 'Bottom border under the header.' },
    { name: 'hideLogo', type: 'boolean', default: 'false', description: 'Hides the logo slot and the built-in placeholder.' },
    { name: 'logoText', type: 'string', default: "'Platform Logo'", description: 'Text of the built-in logo placeholder (shown when no [modNavHeaderLogo] content is projected).' },
    { name: 'logoSize', type: "'small' | 'medium' | 'large'", default: "'medium'", description: 'Logo placeholder size: 32, 48 or 64px.' },
    { name: 'logoPosition', type: "'side' | 'top'", default: "'side'", description: 'Logo mark beside or above its label.' },
    { name: 'submenuVariant', type: "'default' | 'brand'", default: "'default'", description: 'White sub-menu panel or the deep-green brand panel.' },
    { name: 'submenuIconStyle', type: "'plain' | 'boxed'", default: "'plain'", description: 'Sub-menu link icons plain or in a tinted container.' },
    { name: 'expandedSubmenuId', type: 'string | null', default: 'null', description: 'Key of an item whose sub-menu is rendered permanently open as a full-width panel under the header.' },
    { name: 'menuLabel', type: 'string', default: "'Main menu'", description: 'Accessible name of the menu bar and the mobile panel.' },
    { name: 'openMenuLabel / closeMenuLabel', type: 'string', default: "'Open menu' / 'Close menu'", description: 'Accessible names of the hamburger button.' },
    { name: '(itemSelect)', type: 'ModNavHeaderItem', description: 'A menu item without a sub-menu was activated.' },
    { name: '(subItemSelect)', type: '{ item, subItem }', description: 'A link inside a sub-menu was activated.' },
    { name: '(actionSelect)', type: 'ModNavHeaderAction', description: 'An action from the actions input was activated.' },
    { name: '[modNavHeaderLogo]', type: 'content slot', description: 'Projected logo replacing the placeholder.' },
    { name: 'a[mod-header-action]', type: 'content slot', description: 'Projected action; inputs variant, iconOnly, iconPosition, selected, disabled.' },
  ];
}
