import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';

/** A link, a collapsible parent (when `children` is set) or a divider. */
export interface ModNavDrawerItem {
  /** Stable key used for `activeId`. Falls back to `label`. */
  id?: string;
  label?: string;
  /** Plain href. When omitted the click is not navigated, only emitted. */
  href?: string;
  /** Icon name without the `dga-icon-` prefix (level 1 only). */
  icon?: string;
  /** Badge pill text, e.g. `+99`. */
  badge?: string;
  /** Shows the external-link glyph; with an `href` the link opens in a new tab. */
  external?: boolean;
  /** Initial selected state; ignored once `activeId` is set. */
  active?: boolean;
  disabled?: boolean;
  /** Renders a horizontal divider instead of an item. */
  divider?: boolean;
  /** Level 2 links. Makes this item a collapsible parent (an empty array renders a parent with nothing to reveal). */
  children?: ModNavDrawerItem[];
  /** Initial expanded state of a parent. */
  expanded?: boolean;
}

export type ModNavDrawerBackground = 'white' | 'gray' | 'green';

/**
 * DGA navigation drawer: 256px vertical navigation with an optional logo
 * header, two item levels, badges, dividers and arrow-key navigation.
 *
 *   <mod-nav-drawer [items]="items" background="gray" [(activeId)]="current"
 *                   (itemSelect)="go($event)" />
 *
 * Project an element marked `modNavDrawerLogo` to replace the logo placeholder.
 * The drawer fills the height of its container.
 */
@Component({
  selector: 'mod-nav-drawer',
  templateUrl: './nav-drawer.html',
  styleUrl: './nav-drawer.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModNavDrawer {
  readonly items = input<ModNavDrawerItem[]>([]);
  /** Key (`id`, or `label` when no id) of the selected item. */
  readonly activeId = model<string | null>(null);
  readonly background = input<ModNavDrawerBackground>('white');
  /** Show the 72px logo header. */
  readonly header = input(true, { transform: booleanAttribute });
  /** Line under the header. */
  readonly headerDivider = input(true, { transform: booleanAttribute });
  /** Text of the built-in logo placeholder (shown when no logo is projected). */
  readonly logoText = input('Platform Logo');
  readonly ariaLabel = input('Main navigation');

  /** A link (level 1 or 2) was activated. */
  readonly itemSelect = output<ModNavDrawerItem>();
  /** A parent item was expanded or collapsed. */
  readonly expandedChange = output<{ item: ModNavDrawerItem; expanded: boolean }>();

  /** User overrides of the items' initial `expanded` flag, by item key. */
  private readonly toggled = signal<Readonly<Record<string, boolean>>>({});

  protected readonly drawerClasses = computed(
    () => `nav-drawer nav-drawer--bg-${this.background()}`,
  );

  protected readonly headerClasses = computed(() => {
    const list = ['nav-drawer__header'];
    const bg = this.background();
    if (bg !== 'white') list.push(`nav-drawer__header--bg-${bg}`);
    if (this.headerDivider()) list.push('nav-drawer__header--divider');
    return list.join(' ');
  });

  protected itemKey(item: ModNavDrawerItem, index: number): string {
    return item.id ?? item.label ?? `item-${index}`;
  }

  protected isSelected(item: ModNavDrawerItem, index: number): boolean {
    const active = this.activeId();
    return active === null ? !!item.active : active === this.itemKey(item, index);
  }

  protected isExpanded(item: ModNavDrawerItem, index: number): boolean {
    const override = this.toggled()[this.itemKey(item, index)];
    return override ?? !!item.expanded;
  }

  protected toggleParent(item: ModNavDrawerItem, index: number): void {
    if (item.disabled) return;
    const expanded = !this.isExpanded(item, index);
    this.toggled.update((state) => ({ ...state, [this.itemKey(item, index)]: expanded }));
    this.expandedChange.emit({ item, expanded });
  }

  protected selectItem(item: ModNavDrawerItem, index: number, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (!item.href) event.preventDefault();
    this.activeId.set(this.itemKey(item, index));
    this.itemSelect.emit(item);
  }

  /** Arrow / Home / End roving focus over the visible, enabled items. */
  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
    const drawer = event.currentTarget;
    if (!(drawer instanceof HTMLElement)) return;

    const visible = Array.from(drawer.querySelectorAll<HTMLElement>('.nav-drawer-item')).filter(
      (el) => {
        if (
          el.classList.contains('nav-drawer-item--divider') ||
          el.classList.contains('nav-drawer-item--disabled')
        ) {
          return false;
        }
        const children = el.closest('.nav-drawer-item__children');
        return !children || children.classList.contains('nav-drawer-item__children--open');
      },
    );
    if (!visible.length) return;
    event.preventDefault();

    const target = event.target;
    const current = target instanceof HTMLElement ? visible.indexOf(target) : -1;
    const last = visible.length - 1;
    let next: number;
    if (key === 'Home') next = 0;
    else if (key === 'End') next = last;
    else if (key === 'ArrowDown') next = current < last ? current + 1 : 0;
    else next = current > 0 ? current - 1 : last;
    visible[next].focus();
  }
}
