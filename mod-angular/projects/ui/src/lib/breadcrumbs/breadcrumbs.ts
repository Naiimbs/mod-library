import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { listenOnDocumentWhile } from '../internal/listen-while';
import { overlayStack, registerOverlayWhile } from '../internal/overlay-stack';

export interface ModBreadcrumbItem {
  label: string;
  /** Link target. Without it the crumb is still focusable and emits `itemSelected`. */
  href?: string;
  /** Free-form identifier passed back in `itemSelected`. */
  id?: string;
}

export interface ModBreadcrumbSelectEvent {
  item: ModBreadcrumbItem;
  index: number;
  /** The originating DOM event; call `preventDefault()` to handle navigation yourself. */
  event: Event;
}

type Segment =
  | { kind: 'link'; item: ModBreadcrumbItem; index: number }
  | { kind: 'current'; item: ModBreadcrumbItem; index: number }
  | { kind: 'overflow'; hidden: { item: ModBreadcrumbItem; index: number }[] };

let nextBreadcrumbId = 0;

/**
 * DGA breadcrumb trail. The last item is rendered as the current page.
 *
 *   <mod-breadcrumbs [items]="trail" collapse (itemSelected)="go($event)" />
 *
 * With `collapse`, a trail longer than three items keeps the root, the last
 * middle link and the current page, and moves the rest into an overflow (…)
 * dropdown. The component does not depend on a router: handle `itemSelected`
 * (and `event.preventDefault()`) to navigate in a single-page app.
 */
@Component({
  selector: 'mod-breadcrumbs',
  templateUrl: './breadcrumbs.html',
  // The overflow dropdown reuses the menu styles.
  styleUrls: ['./breadcrumbs.css', '../menus/menus.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModBreadcrumbs {
  readonly items = input.required<ModBreadcrumbItem[]>();
  /** Collapse the middle of a long trail (more than three items) into an overflow dropdown. */
  readonly collapse = input(false, { transform: booleanAttribute });
  /** Forces the RTL layout (`breadcrumb--rtl`) regardless of the page direction. */
  readonly rtl = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Breadcrumb', { alias: 'aria-label' });
  /** Accessible label of the overflow (…) button. */
  readonly moreLabel = input('Show more links');

  readonly itemSelected = output<ModBreadcrumbSelectEvent>();

  protected readonly overflowOpen = signal(false);
  protected readonly menuId = `mod-breadcrumb-menu-${nextBreadcrumbId++}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  constructor() {
    listenOnDocumentWhile(() => this.overflowOpen(), 'click', (event) => this.onDocumentClick(event));
    // While open the overflow menu is the topmost layer: an enclosing modal ignores Escape.
    registerOverlayWhile(() => this.overflowOpen(), this);
    listenOnDocumentWhile(() => this.overflowOpen(), 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && overlayStack.isTop(this)) this.onEscape();
    });
  }

  protected readonly segments = computed<Segment[]>(() => {
    const entries = this.items().map((item, index) => ({ item, index }));
    const last = entries.length - 1;
    const toSegment = (entry: { item: ModBreadcrumbItem; index: number }): Segment => ({
      kind: entry.index === last ? 'current' : 'link',
      ...entry,
    });
    if (this.collapse() && entries.length > 3) {
      // Root + overflow(…) + last middle + current
      return [
        toSegment(entries[0]),
        { kind: 'overflow', hidden: entries.slice(1, last - 1) },
        toSegment(entries[last - 1]),
        toSegment(entries[last]),
      ];
    }
    return entries.map(toSegment);
  });

  protected select(item: ModBreadcrumbItem, index: number, event: Event): void {
    this.overflowOpen.set(false);
    this.itemSelected.emit({ item, index, event });
  }

  /** Enter on a crumb without an href (it has no native activation). */
  protected onEnter(item: ModBreadcrumbItem, index: number, event: Event): void {
    if (!item.href) this.select(item, index, event);
  }

  protected toggleOverflow(): void {
    this.overflowOpen.update((open) => !open);
  }

  private onDocumentClick(event: Event): void {
    if (!this.overflowOpen()) return;
    const target = event.target;
    const overflow = this.host.nativeElement.querySelector('.breadcrumb-overflow');
    if (target instanceof Node && overflow?.contains(target)) return;
    this.overflowOpen.set(false);
  }

  private onEscape(): void {
    if (!this.overflowOpen()) return;
    const overflow = this.host.nativeElement.querySelector('.breadcrumb-overflow');
    const hadFocus = !!overflow?.contains(this.host.nativeElement.ownerDocument.activeElement);
    this.overflowOpen.set(false);
    if (hadFocus) this.toggle()?.nativeElement.focus();
  }
}
