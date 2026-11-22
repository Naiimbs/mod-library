import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { listenOnDocumentWhile } from '../internal/listen-while';
import { overlayStack, registerOverlayWhile } from '../internal/overlay-stack';

let nextMenuId = 0;

/**
 * Wrapper that anchors a dropdown `<mod-menu>` to its trigger.
 *
 *   <mod-menu-anchor [(open)]="open">
 *     <button mod-button modMenuTrigger>Options</button>
 *     <mod-menu>
 *       <mod-menu-item icon="edit-01" (activated)="edit()">Edit</mod-menu-item>
 *     </mod-menu>
 *   </mod-menu-anchor>
 *
 * Closes on outside click and on Escape (focus returns to the trigger).
 */
@Component({
  selector: 'mod-menu-anchor',
  template: '<ng-content />',
  styleUrl: './menus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'menu-anchor',
  },
})
export class ModMenuAnchor {
  /** Whether the anchored menu is open. */
  readonly open = model(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private trigger: HTMLElement | null = null;

  constructor() {
    listenOnDocumentWhile(() => this.open(), 'click', (event) => this.onDocumentClick(event));
    // While open the menu is the topmost layer: an enclosing modal ignores Escape.
    registerOverlayWhile(() => this.open(), this);
    listenOnDocumentWhile(() => this.open(), 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && overlayStack.isTop(this)) this.onEscape();
    });
  }

  /** @internal id of the anchored menu, used for the trigger's aria-controls. */
  readonly menuId = signal<string | null>(null);

  /** @internal */
  registerTrigger(element: HTMLElement | null): void {
    this.trigger = element;
  }

  toggle(): void {
    this.open.update((value) => !value);
  }

  /** Closes the menu. Pass `true` to move focus back to the trigger. */
  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (restoreFocus) this.trigger?.focus();
  }

  private onDocumentClick(event: Event): void {
    if (!this.open()) return;
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) return;
    this.open.set(false);
  }

  private onEscape(): void {
    if (!this.open()) return;
    const hadFocus = this.host.nativeElement.contains(
      this.host.nativeElement.ownerDocument.activeElement,
    );
    this.close(hadFocus);
  }
}

/**
 * Turns a button inside `<mod-menu-anchor>` into the menu trigger: click
 * toggles, ArrowDown opens, and aria-haspopup / aria-expanded are kept in sync.
 */
@Directive({
  selector: '[modMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'anchor.open()',
    '[attr.aria-controls]': 'anchor.menuId()',
    '(click)': 'anchor.toggle()',
    '(keydown.arrowdown)': 'onArrowDown($event)',
  },
})
export class ModMenuTrigger {
  protected readonly anchor = inject(ModMenuAnchor);

  constructor() {
    this.anchor.registerTrigger(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
  }

  protected onArrowDown(event: Event): void {
    event.preventDefault();
    this.anchor.open.set(true);
  }
}

/**
 * DGA menu: a list of actions/options. Use it inline, or inside
 * `<mod-menu-anchor>` to get dropdown behaviour.
 *
 * Keyboard: ArrowUp/ArrowDown move between enabled items (wrapping),
 * Home/End jump to the first/last item, Enter/Space activate.
 */
@Component({
  selector: 'mod-menu',
  template: '<ng-content />',
  styleUrl: './menus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    '[class]': 'classes()',
    '[attr.id]': 'id()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(keydown)': 'onKeydown($event)',
  },
})
export class ModMenu {
  readonly id = input<string>(`mod-menu-${nextMenuId++}`);
  readonly ariaLabel = input('', { alias: 'aria-label' });
  /** Forces the RTL layout (`menu--rtl`) regardless of the page direction. */
  readonly rtl = input(false, { transform: booleanAttribute });
  /** When anchored: close the menu after an item is activated. */
  readonly closeOnSelect = input(true, { transform: booleanAttribute });

  private readonly anchor = inject(ModMenuAnchor, { optional: true });
  private readonly injector = inject(Injector);
  // forwardRef: ModMenuItem is declared further down this file. A direct reference fails with
  // "Cannot access 'ModMenuItem' before initialization" where the package is loaded unlinked (unit tests).
  private readonly items = contentChildren(forwardRef(() => ModMenuItem), { descendants: true });
  private readonly active = signal<ModMenuItem | null>(null);

  private readonly enabledItems = computed(() => this.items().filter((item) => !item.disabled()));

  /** @internal The single item that sits in the tab order (roving tabindex). */
  readonly tabbable = computed<ModMenuItem | null>(() => {
    const items = this.enabledItems();
    const active = this.active();
    return active && items.includes(active) ? active : (items[0] ?? null);
  });

  protected readonly classes = computed(() => {
    let list = 'menu';
    if (this.rtl()) list += ' menu--rtl';
    if (this.anchor?.open()) list += ' is-open';
    return list;
  });

  constructor() {
    const anchor = this.anchor;
    if (anchor) {
      let wasOpen = false;
      effect(() => {
        const id = this.id();
        const open = anchor.open();
        untracked(() => anchor.menuId.set(id));
        if (open && !wasOpen) {
          afterNextRender(() => this.focusFirst(), { injector: this.injector });
        }
        wasOpen = open;
      });
    }
  }

  /** Moves focus to the first enabled item. */
  focusFirst(): void {
    this.enabledItems()[0]?.focus();
  }

  /** @internal */
  setActive(item: ModMenuItem): void {
    this.active.set(item);
  }

  /** @internal */
  itemActivated(): void {
    if (this.anchor && this.closeOnSelect()) this.anchor.close(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.anchor?.close();
      return;
    }
    const items = this.enabledItems();
    if (!items.length) return;
    const target = event.target;
    const current = items.findIndex(
      (item) => target instanceof Node && item.element.contains(target),
    );
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = current < items.length - 1 ? current + 1 : 0;
        break;
      case 'ArrowUp':
        next = current > 0 ? current - 1 : items.length - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next].focus();
  }
}

/**
 * Group of menu items with an optional uppercase label. Adjacent groups are
 * separated by a divider. With `selectable`, the group behaves as a
 * single-select list bound to `value` (items need a `value`).
 */
@Component({
  selector: 'mod-menu-group',
  template: `
    @if (label()) {
      <p class="menu-group__label" [id]="labelId">{{ label() }}</p>
    }
    <ng-content />
  `,
  styleUrl: './menus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'menu-group',
    role: 'group',
    '[attr.aria-labelledby]': 'label() ? labelId : null',
  },
})
export class ModMenuGroup {
  readonly label = input('');
  /** Single-select behaviour: activating an item sets `value` to the item's value. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Value of the selected item when `selectable`. */
  readonly value = model<unknown>(undefined);

  protected readonly labelId = `mod-menu-group-${nextMenuId++}`;
}

/** Standalone 1px divider between items. */
@Component({
  selector: 'mod-menu-divider',
  template: '',
  styleUrl: './menus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'menu-divider', role: 'separator' },
})
export class ModMenuDivider {}

/**
 * Marks projected content as the trailing element of a menu item
 * (e.g. a tag): `<span modMenuTrail><span class="tag tag--sm">New</span></span>`.
 */
@Directive({
  selector: '[modMenuTrail]',
  host: { class: 'menu-item__trail' },
})
export class ModMenuTrail {}

/**
 * Marks a projected inline SVG wrapper as the trailing icon of a menu item:
 * `<span modMenuTrailIcon><svg …/></span>`.
 */
@Directive({
  selector: '[modMenuTrailIcon]',
  host: { class: 'menu-item__trail-icon' },
})
export class ModMenuTrailIcon {}

/**
 * Menu item. The projected content is the label.
 *
 *   <mod-menu-item icon="file-01" trailText="+99">Inbox</mod-menu-item>
 *   <a mod-menu-item href="/profile">Profile</a>
 */
@Component({
  selector: 'mod-menu-item, a[mod-menu-item], button[mod-menu-item]',
  template: `
    @if (icon(); as name) {
      <span class="menu-item__icon"><span [class]="'dga-icon-' + name" aria-hidden="true"></span></span>
    }
    <span class="menu-item__label"><ng-content /></span>
    @if (trailText(); as text) {
      <span class="menu-item__trail menu-item__trail--text">{{ text }}</span>
    }
    @if (trailIcon(); as name) {
      <span class="menu-item__trail-icon"><span [class]="'dga-icon-' + name" aria-hidden="true"></span></span>
    } @else if (isSelected() && checkmark()) {
      <span class="menu-item__trail-icon"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M4 10l4 4 8-8" /></svg
      ></span>
    }
    <ng-content select="[modMenuTrail], [modMenuTrailIcon], mod-menu-switch" />
  `,
  styleUrl: './menus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'menu-item',
    '[class.menu-item--selected]': 'isSelected()',
    '[class.menu-item--disabled]': 'disabled()',
    '[attr.role]': 'role()',
    '[attr.aria-checked]': 'role() === "menuitemradio" ? isSelected() : null',
    '[attr.aria-current]': 'role() === "menuitem" && isSelected() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'tabIndex()',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
    '(focus)': 'onFocus()',
  },
})
export class ModMenuItem {
  /** Leading font icon name without the `dga-icon-` prefix. */
  readonly icon = input('');
  /** Trailing short text (count, shortcut…). */
  readonly trailText = input('');
  /** Trailing font icon name (e.g. a submenu arrow). Replaces the selected checkmark. */
  readonly trailIcon = input('');
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Show a trailing check icon while selected. */
  readonly checkmark = input(true, { transform: booleanAttribute });
  /** Value used by a `selectable` `<mod-menu-group>`. */
  readonly value = input<unknown>(undefined);

  /** Emitted on click / Enter / Space when the item is enabled. */
  readonly activated = output<void>();

  private readonly menu = inject(ModMenu, { optional: true });
  private readonly group = inject(ModMenuGroup, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  get element(): HTMLElement {
    return this.host.nativeElement;
  }

  protected readonly isSelected = computed(() => {
    if (this.selected()) return true;
    const group = this.group;
    const value = this.value();
    return !!group && group.selectable() && value !== undefined && group.value() === value;
  });

  protected readonly role = computed(() =>
    this.group?.selectable() ? 'menuitemradio' : 'menuitem',
  );

  protected readonly tabIndex = computed(() => {
    if (this.disabled()) return -1;
    if (!this.menu) return 0;
    return this.menu.tabbable() === this ? 0 : -1;
  });

  focus(): void {
    this.host.nativeElement.focus();
  }

  protected onFocus(): void {
    this.menu?.setActive(this);
  }

  protected onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const target = event.target;
    // The trailing switch handles its own clicks.
    if (target instanceof Element && target.closest('.menu-switch')) return;
    const group = this.group;
    if (group?.selectable() && this.value() !== undefined) group.value.set(this.value());
    this.activated.emit();
    this.menu?.itemActivated();
  }

  protected onKey(event: Event): void {
    if (event.target !== this.host.nativeElement) return;
    // Route through click so native <a>/<button> hosts do not fire twice.
    event.preventDefault();
    if (!this.disabled()) this.host.nativeElement.click();
  }
}

/** Trailing toggle for a menu item. */
@Component({
  selector: 'mod-menu-switch',
  template: '<span class="menu-switch__thumb"></span>',
  styleUrl: './menus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'menu-switch',
    role: 'switch',
    '[class.is-on]': 'checked()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '(click)': 'toggle($event)',
    '(keydown.enter)': 'toggle($event)',
    '(keydown.space)': 'toggle($event)',
  },
})
export class ModMenuSwitch {
  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('', { alias: 'aria-label' });

  protected toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) this.checked.update((value) => !value);
  }
}
