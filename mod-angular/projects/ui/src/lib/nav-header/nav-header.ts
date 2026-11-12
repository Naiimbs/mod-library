import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ModIcon } from '../icon/icon';
import { listenOnDocumentWhile } from '../internal/listen-while';
import { overlayStack, registerOverlayWhile } from '../internal/overlay-stack';

/** A link inside a sub-menu dropdown panel. */
export interface ModNavHeaderSubItem {
  id?: string;
  label: string;
  /** Second line under the label. */
  helper?: string;
  href?: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
}

/** A column of links inside a sub-menu dropdown panel. */
export interface ModNavHeaderGroup {
  label?: string;
  items: ModNavHeaderSubItem[];
}

/** A top-level menu item. */
export interface ModNavHeaderItem {
  /** Stable key used for `activeId`. Falls back to `label`. */
  id?: string;
  label: string;
  /** Plain href. When omitted the click is not navigated, only emitted. */
  href?: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
  /** Initial selected state; ignored once `activeId` is set. */
  active?: boolean;
  disabled?: boolean;
  /** Pins a visual interaction state (docs / static previews). */
  state?: ModNavHeaderVisualState;
  /** Shows the dropdown chevron even when the item has no sub-menu. */
  arrow?: boolean;
  /** Sub-menu links rendered as a single unlabeled group. */
  children?: ModNavHeaderSubItem[];
  /** Sub-menu links rendered as labeled columns. Takes precedence over `children`. */
  groups?: ModNavHeaderGroup[];
}

/** Visual interaction state that can be pinned on a menu item or action. */
export type ModNavHeaderVisualState = 'default' | 'hovered' | 'pressed' | 'focused';

export type ModHeaderActionVariant = 'outline' | 'primary';
export type ModHeaderActionIconPosition = 'side' | 'top';

/** An action button on the trailing side of the header. */
export interface ModNavHeaderAction {
  id?: string;
  /** Visible label; used as the accessible name when `iconOnly` is set. */
  label: string;
  href?: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
  variant?: ModHeaderActionVariant;
  iconOnly?: boolean;
  iconPosition?: ModHeaderActionIconPosition;
  selected?: boolean;
  disabled?: boolean;
  /** Pins a visual interaction state (docs / static previews). */
  state?: ModNavHeaderVisualState;
}

export type ModNavHeaderLogoSize = 'small' | 'medium' | 'large';
export type ModNavHeaderLogoPosition = 'side' | 'top';
export type ModNavHeaderSubmenuVariant = 'default' | 'brand';
export type ModNavHeaderSubmenuIconStyle = 'plain' | 'boxed';
/**
 * `auto` follows the viewport (960px / 600px breakpoints); the others force a
 * layout regardless of the viewport width.
 */
export type ModNavHeaderLayout = 'auto' | 'desktop' | 'tablet' | 'mobile';

function headerActionClasses(
  variant: ModHeaderActionVariant,
  iconOnly: boolean,
  iconPosition: ModHeaderActionIconPosition,
  selected: boolean,
  disabled: boolean,
  state: ModNavHeaderVisualState = 'default',
): string {
  const list = ['header-action', `header-action--${variant}`];
  if (iconOnly) list.push('header-action--icon-only');
  if (iconPosition === 'top') list.push('header-action--top');
  if (selected) list.push('header-action--selected');
  if (disabled) list.push('header-action--disabled');
  if (state !== 'default') list.push(`demo-${state}`);
  return list.join(' ');
}

let nextId = 0;

/**
 * Header action for projected content:
 *
 *   <mod-nav-header [items]="items">
 *     <a mod-header-action variant="primary" href="/ar">عربي</a>
 *   </mod-nav-header>
 *
 * Give icons the `header-action__icon` class; wrap the label in a `<span>` so
 * it can be hidden by the icon-only / tablet rules.
 */
@Component({
  selector: 'a[mod-header-action], button[mod-header-action]',
  template: '<ng-content />',
  styleUrls: ['./navigation.css', './nav-header.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-pressed]': 'selected() ? "true" : null',
  },
})
export class ModHeaderAction {
  readonly variant = input<ModHeaderActionVariant>('outline');
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly iconPosition = input<ModHeaderActionIconPosition>('side');
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    headerActionClasses(
      this.variant(),
      this.iconOnly(),
      this.iconPosition(),
      this.selected(),
      this.disabled(),
    ),
  );
}

/**
 * DGA navigation header: logo, menu items (with optional sub-menu dropdowns),
 * action buttons and the responsive hamburger panel.
 *
 *   <mod-nav-header [items]="items" [actions]="actions" [(activeId)]="current"
 *                   (itemSelect)="go($event)">
 *     <img modNavHeaderLogo src="logo.svg" alt="My platform" />
 *     <a mod-header-action variant="primary" href="/ar"><span>عربي</span></a>
 *   </mod-nav-header>
 *
 * The component does not depend on the router: listen to `itemSelect`,
 * `subItemSelect` and `actionSelect` and navigate yourself, or give items a
 * plain `href`.
 */
@Component({
  selector: 'mod-nav-header',
  imports: [ModIcon, NgTemplateOutlet],
  templateUrl: './nav-header.html',
  styleUrls: ['./navigation.css', './nav-header.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModNavHeader {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Outside click / Escape only matter while a sub-menu or the mobile panel is open.
    const anyOpen = (): boolean => this.openSubmenu() !== null || this.mobileOpen();
    listenOnDocumentWhile(anyOpen, 'click', (event) => this.onDocumentClick(event));
    registerOverlayWhile(anyOpen, this);
    listenOnDocumentWhile(anyOpen, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && overlayStack.isTop(this)) this.closeAll();
    });
  }

  readonly items = input<ModNavHeaderItem[]>([]);
  readonly actions = input<ModNavHeaderAction[]>([]);
  /** Key (`id`, or `label` when no id) of the selected menu item. */
  readonly activeId = model<string | null>(null);
  /** Open state of the mobile (hamburger) panel. */
  readonly mobileOpen = model(false);
  /** Collapse to the hamburger layout at the source breakpoints (960px / 600px). */
  readonly responsive = input(true, { transform: booleanAttribute });
  /** Forces the desktop, tablet or mobile layout; `auto` follows the viewport. */
  readonly layout = input<ModNavHeaderLayout>('auto');
  /** Span edge to edge. When false the header is centered in a 1280px container. */
  readonly fullWidth = input(true, { transform: booleanAttribute });
  /** Hides the logo slot (and the built-in placeholder). */
  readonly hideLogo = input(false, { transform: booleanAttribute });
  /**
   * Key of a menu item whose sub-menu is rendered permanently open as a
   * full-width panel under the header (mega-menu) instead of a dropdown.
   */
  readonly expandedSubmenuId = input<string | null>(null);
  /** Bottom border under the header. */
  readonly divider = input(false, { transform: booleanAttribute });
  readonly submenuVariant = input<ModNavHeaderSubmenuVariant>('default');
  readonly submenuIconStyle = input<ModNavHeaderSubmenuIconStyle>('plain');

  /** Text of the built-in logo placeholder (shown when no logo is projected). */
  readonly logoText = input('Platform Logo');
  readonly logoSize = input<ModNavHeaderLogoSize>('medium');
  readonly logoPosition = input<ModNavHeaderLogoPosition>('side');

  readonly menuLabel = input('Main menu');
  readonly openMenuLabel = input('Open menu');
  readonly closeMenuLabel = input('Close menu');

  /** A menu item without a sub-menu was activated. */
  readonly itemSelect = output<ModNavHeaderItem>();
  /** A link inside a sub-menu was activated. */
  readonly subItemSelect = output<{ item: ModNavHeaderItem; subItem: ModNavHeaderSubItem }>();
  /** An action from the `actions` input was activated. */
  readonly actionSelect = output<ModNavHeaderAction>();

  protected readonly mobileMenuId = `mod-nav-header-menu-${nextId++}`;
  /** `<scope>:<item key>` of the open sub-menu, or null. */
  protected readonly openSubmenu = signal<string | null>(null);

  protected readonly logoClasses = computed(() => {
    const list = ['logo-placeholder'];
    const size = this.logoSize();
    if (size !== 'medium') list.push(`logo-placeholder--${size}`);
    if (this.logoPosition() === 'top') list.push('logo-placeholder--top');
    return list.join(' ');
  });

  protected readonly logoPx = computed(() => {
    const size = this.logoSize();
    return size === 'small' ? 32 : size === 'large' ? 64 : 48;
  });

  protected readonly expandedItem = computed(() => {
    const id = this.expandedSubmenuId();
    if (id === null || this.layout() === 'tablet' || this.layout() === 'mobile') return null;
    return this.items().find((item) => this.itemKey(item) === id && this.hasSubmenu(item)) ?? null;
  });

  protected readonly headerClasses = computed(() => {
    const list = ['navigation-header'];
    const layout = this.layout();
    if (layout === 'auto') {
      if (this.responsive()) list.push('navigation-header--responsive');
    } else if (layout !== 'desktop') {
      list.push('navigation-header--tablet');
      if (layout === 'mobile') list.push('navigation-header--mobile');
    }
    if (this.divider()) list.push('navigation-header--divider');
    if (!this.fullWidth()) list.push('navigation-header--contained');
    return list.join(' ');
  });

  /** Outline actions fold into the mobile panel below 600px. */
  protected readonly mobileActions = computed(() =>
    this.actions().filter((a) => (a.variant ?? 'outline') === 'outline'),
  );

  protected itemKey(item: ModNavHeaderItem): string {
    return item.id ?? item.label;
  }

  protected groupsOf(item: ModNavHeaderItem): ModNavHeaderGroup[] {
    if (item.groups?.length) return item.groups;
    if (item.children?.length) return [{ items: item.children }];
    return [];
  }

  protected hasSubmenu(item: ModNavHeaderItem): boolean {
    return !!(item.groups?.length || item.children?.length);
  }

  protected isSelected(item: ModNavHeaderItem): boolean {
    const active = this.activeId();
    return active === null ? !!item.active : active === this.itemKey(item);
  }

  protected isExpanded(item: ModNavHeaderItem): boolean {
    return this.expandedItem() === item;
  }

  protected isSubmenuOpen(scope: string, item: ModNavHeaderItem): boolean {
    return this.openSubmenu() === `${scope}:${this.itemKey(item)}`;
  }

  protected actionClasses(action: ModNavHeaderAction): string {
    return headerActionClasses(
      action.variant ?? 'outline',
      !!action.iconOnly,
      action.iconPosition ?? 'side',
      !!action.selected,
      !!action.disabled,
      action.state ?? 'default',
    );
  }

  protected toggleMobile(): void {
    this.openSubmenu.set(null);
    this.mobileOpen.update((open) => !open);
  }

  protected selectItem(item: ModNavHeaderItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (!item.href) event.preventDefault();
    this.activeId.set(this.itemKey(item));
    this.closeAll();
    this.itemSelect.emit(item);
  }

  protected toggleSubmenu(scope: string, item: ModNavHeaderItem, event: Event): void {
    if (item.disabled) return;
    if (this.isExpanded(item)) {
      event.preventDefault();
      return;
    }
    const target = event.target;
    // Clicks on the dropdown's own links are handled by selectSubItem.
    if (target instanceof Element && target.closest('.header-sub-menu')) return;
    event.preventDefault();
    const key = `${scope}:${this.itemKey(item)}`;
    this.openSubmenu.update((open) => (open === key ? null : key));
  }

  protected onSubmenuTriggerKey(scope: string, item: ModNavHeaderItem, event: Event): void {
    // Only when the trigger itself is focused, not a link inside its panel.
    if (event.target !== event.currentTarget) return;
    this.toggleSubmenu(scope, item, event);
  }

  protected selectSubItem(
    item: ModNavHeaderItem,
    subItem: ModNavHeaderSubItem,
    event: Event,
  ): void {
    if (!subItem.href) event.preventDefault();
    this.closeAll();
    this.subItemSelect.emit({ item, subItem });
  }

  protected selectAction(action: ModNavHeaderAction, event: Event): void {
    if (action.disabled) {
      event.preventDefault();
      return;
    }
    if (!action.href) event.preventDefault();
    this.mobileOpen.set(false);
    this.actionSelect.emit(action);
  }

  private onDocumentClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const root = this.host.nativeElement;
    const inside = root.contains(target);
    if (!inside) {
      if (this.mobileOpen()) this.mobileOpen.set(false);
      this.openSubmenu.set(null);
      return;
    }
    if (
      this.openSubmenu() !== null &&
      !(target instanceof Element && target.closest('.header-menu-item[data-submenu]'))
    ) {
      this.openSubmenu.set(null);
    }
  }

  /** Closes any open sub-menu and the mobile panel. */
  closeAll(): void {
    this.openSubmenu.set(null);
    if (this.mobileOpen()) this.mobileOpen.set(false);
  }
}
