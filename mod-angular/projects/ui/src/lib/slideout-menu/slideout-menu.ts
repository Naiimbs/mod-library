import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { overlayStack } from '../internal/overlay-stack';
import { lockBodyScroll } from '../internal/scroll-lock';

export type ModSlideoutSide = 'left' | 'right';

/** Menu row rendered in the slideout body (uses the Menu component's classes). */
export interface ModSlideoutMenuItem {
  id?: string;
  label: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
  /** Selected rows get the trailing check mark. */
  selected?: boolean;
  disabled?: boolean;
}

export interface ModSlideoutMenuGroup {
  label?: string;
  items: ModSlideoutMenuItem[];
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let nextId = 0;

/**
 * Footer row of a slideout (equal-width action buttons):
 *
 *   <div modSlideoutFooter>
 *     <button mod-button variant="secondary-outline">Cancel</button>
 *     <button mod-button>Confirm</button>
 *   </div>
 */
@Directive({
  selector: '[modSlideoutFooter]',
  host: { class: 'slideout__footer' },
})
export class ModSlideoutFooter {}

/**
 * DGA slideout menu: a 346px side panel that slides over the page with a
 * dimmed backdrop, or sits inline in the page flow.
 *
 *   <mod-slideout-menu [(open)]="open" heading="Filters" description="Refine the list"
 *                      icon="filter" side="right">
 *     …body content…
 *     <div modSlideoutFooter>…buttons…</div>
 *   </mod-slideout-menu>
 *
 * The body is projected content; alternatively pass `groups` to render a
 * menu (requires the Menu component styles). While open as an overlay the
 * page scroll is locked, focus moves into the panel and is kept there, and
 * Escape or a backdrop click closes it and restores focus.
 */
@Component({
  selector: 'mod-slideout-menu',
  templateUrl: './slideout-menu.html',
  // menus.css: the optional `groups` body renders .menu / .menu-item markup.
  styleUrls: ['./slideout-menu.css', '../menus/menus.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ModSlideoutMenu {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  /** Open state of the overlay panel. Ignored when `inline`. */
  readonly open = model(false);
  /** Edge the panel is anchored to (mirrored automatically under `dir="rtl"`). */
  readonly side = input<ModSlideoutSide>('left');
  /** Gray background variant. */
  readonly gray = input(false, { transform: booleanAttribute });
  /** Render in normal flow (no backdrop, no fixed positioning). */
  readonly inline = input(false, { transform: booleanAttribute });

  readonly heading = input('');
  readonly description = input('');
  /** Featured icon name without the `dga-icon-` prefix. */
  readonly icon = input('');
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly closeLabel = input('Close');
  /** Accessible name when there is no `heading`. */
  readonly ariaLabel = input('');
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  /** Optional menu rendered at the top of the body. */
  readonly groups = input<ModSlideoutMenuGroup[]>([]);
  /** A row from `groups` was activated. */
  readonly itemSelect = output<ModSlideoutMenuItem>();

  protected readonly titleId = `mod-slideout-title-${nextId++}`;
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  private lastFocused: HTMLElement | null = null;
  private releaseScroll: (() => void) | null = null;
  private locked = false;

  protected readonly panelClasses = computed(() => {
    const list = ['slideout'];
    if (this.inline()) list.push('slideout--inline');
    if (this.side() === 'right') list.push('slideout--right');
    if (this.gray()) list.push('slideout--gray');
    if (!this.inline() && this.open()) list.push('is-open');
    return list.join(' ');
  });

  protected readonly hasHeader = computed(
    () => !!(this.heading() || this.description() || this.icon() || this.showClose()),
  );

  /** The closed overlay panel stays in the DOM off-screen; keep it out of the tab order. */
  protected readonly hidden = computed(() => !this.inline() && !this.open());

  constructor() {
    effect(() => {
      const active = this.open() && !this.inline();
      untracked(() => (active ? this.activate() : this.deactivate()));
    });
    inject(DestroyRef).onDestroy(() => this.unlockScroll());
  }

  /** Closes the overlay panel. */
  close(): void {
    this.open.set(false);
  }

  protected onEscape(): void {
    // Only the topmost overlay reacts: a modal opened over the panel closes first.
    if (!this.open() || this.inline() || !this.closeOnEscape()) return;
    if (!overlayStack.isTop(this)) return;
    this.close();
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) this.close();
  }

  protected selectItem(item: ModSlideoutMenuItem): void {
    if (item.disabled) return;
    this.itemSelect.emit(item);
  }

  /** Keeps Tab focus inside the open overlay panel. */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || this.inline() || !this.open()) return;
    const focusable = this.focusableElements();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = this.document.activeElement;
    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    return Array.from(this.panel().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
  }

  private activate(): void {
    if (this.locked) return;
    const current = this.document.activeElement;
    this.lastFocused = current instanceof HTMLElement ? current : null;
    this.releaseScroll = lockBodyScroll(this.document);
    overlayStack.push(this);
    this.locked = true;
    // Focus after the template has dropped `inert` from the panel.
    afterNextRender(
      () => {
        if (!this.locked) return;
        const target = this.focusableElements()[0] ?? this.panel().nativeElement;
        target.focus();
      },
      { injector: this.injector },
    );
  }

  private deactivate(): void {
    if (!this.locked) return;
    this.unlockScroll();
    const previous = this.lastFocused;
    this.lastFocused = null;
    previous?.focus();
  }

  private unlockScroll(): void {
    if (!this.locked) return;
    this.releaseScroll?.();
    this.releaseScroll = null;
    overlayStack.remove(this);
    this.locked = false;
  }
}
