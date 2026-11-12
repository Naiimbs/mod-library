import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';
import { ModIcon } from '../icon/icon';

export interface ModSidebarItem {
  /** Stable key used for `activeId`. Falls back to `label`. */
  id?: string;
  label: string;
  /** Plain href. When omitted the click is not navigated, only emitted. */
  href?: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
  /** Small trailing badge, e.g. `New` (`mod-sidebar` only). */
  badge?: string;
  /** Initial selected state; ignored once `activeId` is set. */
  active?: boolean;
}

/** A titled group of items (`mod-sidebar-nav` only). */
export interface ModSidebarGroup {
  title?: string;
  items: ModSidebarItem[];
}

function sidebarItemKey(item: ModSidebarItem): string {
  return item.id ?? item.label;
}

/**
 * DGA docs-shell sidebar: sticky 220px column of `.sidebar-link`s.
 *
 *   <mod-sidebar [items]="items" [(activeId)]="current" (itemSelect)="go($event)" />
 *
 * The source positions it for a 72px fixed header (`top: 72px`,
 * `height: calc(100vh - 72px)`), and hides it below 768px.
 */
@Component({
  selector: 'mod-sidebar',
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav" [attr.aria-label]="ariaLabel()">
        @for (item of items(); track key(item)) {
          <a
            class="sidebar-link"
            [class.active]="isActive(item)"
            [attr.href]="item.href || '#'"
            [attr.aria-current]="isActive(item) ? 'page' : null"
            (click)="select(item, $event)"
          >
            @if (item.icon) {
              <span
                class="icon sidebar-link__icon dga-icon-{{ item.icon }}"
                aria-hidden="true"
              ></span>
            }
            {{ item.label }}
            @if (item.badge) {
              <span class="sidebar-link__badge">{{ item.badge }}</span>
            }
          </a>
        }
        <ng-content />
      </nav>
    </aside>
  `,
  styleUrl: './sidebar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModSidebar {
  readonly items = input<ModSidebarItem[]>([]);
  /** Key (`id`, or `label` when no id) of the active link. */
  readonly activeId = model<string | null>(null);
  readonly ariaLabel = input('Sidebar');

  readonly itemSelect = output<ModSidebarItem>();

  protected readonly key = sidebarItemKey;

  protected isActive(item: ModSidebarItem): boolean {
    const active = this.activeId();
    return active === null ? !!item.active : active === sidebarItemKey(item);
  }

  protected select(item: ModSidebarItem, event: Event): void {
    if (!item.href) event.preventDefault();
    this.activeId.set(sidebarItemKey(item));
    this.itemSelect.emit(item);
  }
}

/**
 * DGA sidebar navigation: bordered 200px vertical nav with optional group
 * titles and a collapsed (icon-only, 64px) mode.
 *
 *   <mod-sidebar-nav [items]="items" [(activeId)]="current" [collapsed]="mini" />
 */
@Component({
  selector: 'mod-sidebar-nav',
  imports: [ModIcon],
  template: `
    <nav
      class="sidebar-nav-demo"
      [class.sidebar-nav--collapsed]="collapsed()"
      [attr.aria-label]="ariaLabel()"
    >
      @for (item of items(); track key(item)) {
        <a
          class="sidebar-nav-item"
          [class.active]="isActive(item)"
          [attr.href]="item.href || '#'"
          [attr.aria-current]="isActive(item) ? 'page' : null"
          [attr.aria-label]="collapsed() ? item.label : null"
          [attr.title]="collapsed() ? item.label : null"
          (click)="select(item, $event)"
        >
          @if (item.icon) {
            <mod-icon class="sidebar-nav-icon" [name]="item.icon" />
          }
          <span>{{ item.label }}</span>
        </a>
      }
      @for (group of groups(); track $index) {
        <div class="sidebar-nav-group">
          @if (group.title && !collapsed()) {
            <div class="sidebar-nav-group-title">{{ group.title }}</div>
          }
          @for (item of group.items; track key(item)) {
            <a
              class="sidebar-nav-item"
              [class.active]="isActive(item)"
              [attr.href]="item.href || '#'"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.aria-label]="collapsed() ? item.label : null"
              [attr.title]="collapsed() ? item.label : null"
              (click)="select(item, $event)"
            >
              @if (item.icon) {
                <mod-icon class="sidebar-nav-icon" [name]="item.icon" />
              }
              <span>{{ item.label }}</span>
            </a>
          }
        </div>
      }
      <ng-content />
    </nav>
  `,
  styleUrl: './sidebar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModSidebarNav {
  /** Ungrouped items, rendered first. */
  readonly items = input<ModSidebarItem[]>([]);
  /** Titled groups, rendered after `items`. */
  readonly groups = input<ModSidebarGroup[]>([]);
  /** Key (`id`, or `label` when no id) of the active item. */
  readonly activeId = model<string | null>(null);
  /** Icon-only 64px mode. */
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Sidebar');

  readonly itemSelect = output<ModSidebarItem>();

  protected readonly key = sidebarItemKey;

  protected isActive(item: ModSidebarItem): boolean {
    const active = this.activeId();
    return active === null ? !!item.active : active === sidebarItemKey(item);
  }

  protected select(item: ModSidebarItem, event: Event): void {
    if (!item.href) event.preventDefault();
    this.activeId.set(sidebarItemKey(item));
    this.itemSelect.emit(item);
  }
}
