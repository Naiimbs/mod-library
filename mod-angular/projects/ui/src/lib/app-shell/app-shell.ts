import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
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
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ModIcon } from '../icon/icon';
import { listenOnDocumentWhile } from '../internal/listen-while';
import { overlayStack } from '../internal/overlay-stack';
import { lockBodyScroll } from '../internal/scroll-lock';

/** One entry of the side navigation of a `<mod-app-shell>`. */
export interface ModAppShellItem {
  /** Unique id; compared with `activeId`. */
  id: string;
  label: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
  /** Short counter or text shown at the end of the item (e.g. pending count). */
  badge?: string | number;
  /** Accessible text of the badge, e.g. "7 waiting for you". Defaults to the badge itself. */
  badgeLabel?: string;
  /** Renders the item as a link. Without it the item is a button. */
  href?: string;
  disabled?: boolean;
}

/** A titled group of side navigation items. */
export interface ModAppShellGroup {
  /** Optional stable id (used for `track` and for the title id). */
  id?: string;
  /** Group title. Leave empty for an untitled group. */
  label?: string;
  items: readonly ModAppShellItem[];
}

/** Width (px) of the shell under which the side bar becomes an off-canvas drawer. Matches the CSS container query. */
const NARROW_BELOW = 900;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let nextShellId = 0;

/** Marks the logo shown at the top of the side bar of a `<mod-app-shell>`. */
@Directive({ selector: '[modAppShellLogo]' })
export class ModAppShellLogo {}

/** Marks the compact logo (emblem) shown instead of the logo while the side bar is collapsed. Optional. */
@Directive({ selector: '[modAppShellLogoMark]' })
export class ModAppShellLogoMark {}

/** Marks content pinned to the bottom of the side bar (current user, version, help link). */
@Directive({ selector: '[modAppShellFooter]' })
export class ModAppShellFooter {}

/** Marks the start content of the top bar: system name, page title or breadcrumbs. */
@Directive({ selector: '[modAppShellTitle]' })
export class ModAppShellTitle {}

/** Marks the search field of the top bar (hidden on narrow containers). */
@Directive({ selector: '[modAppShellSearch]' })
export class ModAppShellSearch {}

/** Marks the end actions of the top bar: language switch, notifications, user menu. */
@Directive({ selector: '[modAppShellActions]' })
export class ModAppShellActions {}

/**
 * Application frame: a side bar with grouped navigation, a top bar and the
 * scrolling main content area.
 *
 *   <mod-app-shell [groups]="groups" [(activeId)]="page" [(collapsed)]="collapsed" (itemSelect)="go($event)">
 *     <img modAppShellLogo src="assets/logo.png" alt="Ministry of Defense" />
 *     <img modAppShellLogoMark src="assets/emblem.png" alt="Ministry of Defense" />
 *     <span modAppShellFooter>Version 1.4</span>
 *
 *     <strong modAppShellTitle>Referral system</strong>
 *     <mod-search-box modAppShellSearch placeholder="Search" />
 *     <button modAppShellActions mod-button variant="subtle" iconOnly aria-label="Notifications">
 *       <mod-icon name="notification-03" />
 *     </button>
 *
 *     …page content (rendered inside <main>)…
 *   </mod-app-shell>
 *
 * Navigation comes from `groups`; an item is a link when it has an `href`,
 * otherwise a button. Selecting an item sets `activeId` (marked with
 * `aria-current="page"`) and emits `itemSelect`, so the application can
 * navigate with its own router.
 *
 * Wide containers: the side bar is always visible and can be collapsed to an
 * icon rail (`collapsed`). Under 900px of ITS OWN width (container query) the
 * side bar becomes an off-canvas drawer opened by the menu button of the top
 * bar: modal, with a backdrop, focus kept inside, and closed by Escape, the
 * backdrop, the close button or selecting an item.
 *
 * The shell is `--mod-app-shell-height` tall (default `100vh`); only the main
 * area scrolls. The main area is a query container named `mod-app-content`,
 * so page content can use `@container mod-app-content (max-width: …)`.
 * `--mod-app-shell-side-width` (default 272px) sets the side bar width.
 */
@Component({
  selector: 'mod-app-shell',
  imports: [ModIcon, NgTemplateOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModAppShell {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Side navigation, in groups. */
  readonly groups = input<readonly ModAppShellGroup[]>([]);
  /** Id of the current item (two-way bindable). */
  readonly activeId = model<string>('');
  /** Side bar collapsed to an icon rail on wide containers (two-way bindable). */
  readonly collapsed = model(false);
  /** Shows the collapse / expand button of the side bar. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Off-canvas drawer open on narrow containers (two-way bindable). */
  readonly drawerOpen = model(false);

  /** Accessible name of the navigation landmark. */
  readonly navLabel = input('Main navigation');
  readonly collapseLabel = input('Collapse the side menu');
  readonly expandLabel = input('Expand the side menu');
  readonly openMenuLabel = input('Open the menu');
  readonly closeMenuLabel = input('Close the menu');
  /** Text of the skip link (first focusable element of the shell). */
  readonly skipLabel = input('Skip to main content');

  /** Emitted when an enabled item is chosen (after `activeId` was updated). */
  readonly itemSelect = output<ModAppShellItem>();

  protected readonly uid = `mod-app-shell-${nextShellId++}`;
  protected readonly mainId = `${this.uid}-main`;
  protected readonly sideId = `${this.uid}-side`;

  private readonly side = viewChild.required<ElementRef<HTMLElement>>('side');
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private readonly logoMark = contentChild(ModAppShellLogoMark);
  protected readonly hasLogoMark = computed(() => !!this.logoMark());

  /** The shell is narrower than 900px: the side bar is a drawer. */
  protected readonly narrow = signal(false);
  /** The width has been measured at least once. */
  private readonly measured = signal(false);
  /** The drawer is shown as a modal layer. */
  protected readonly drawerActive = computed(() => this.narrow() && this.drawerOpen());
  /** Icon rail: only on wide containers. */
  protected readonly rail = computed(() => this.collapsed() && !this.narrow());

  private lastFocused: HTMLElement | null = null;
  private releaseScroll: (() => void) | null = null;
  private locked = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Behaviour (modal drawer, inert side bar) follows the same width as the container query.
    afterNextRender(() => {
      const element = this.host.nativeElement;
      const update = (width: number): void => {
        const narrow = width > 0 && width < NARROW_BELOW;
        this.narrow.set(narrow);
        this.measured.set(true);
      };
      update(element.getBoundingClientRect().width);
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (entry) update(entry.contentRect.width);
      });
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // The drawer exists only on narrow containers: an "open" set while the shell is wide is dropped,
    // so it cannot pop open later when the container shrinks.
    effect(() => {
      if (this.measured() && !this.narrow() && this.drawerOpen()) this.drawerOpen.set(false);
    });

    effect(() => {
      const active = this.drawerActive();
      untracked(() => (active ? this.activate() : this.deactivate()));
    });

    listenOnDocumentWhile<KeyboardEvent>(
      () => this.drawerActive(),
      'keydown',
      (event) => {
        if (event.key !== 'Escape' || !overlayStack.isTop(this)) return;
        this.drawerOpen.set(false);
      },
    );

    destroyRef.onDestroy(() => this.unlock());
  }

  /** Opens the drawer (narrow containers). */
  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  /** Closes the drawer. */
  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected toggleCollapsed(): void {
    this.collapsed.set(!this.collapsed());
  }

  protected select(item: ModAppShellItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    this.activeId.set(item.id);
    this.itemSelect.emit(item);
    this.drawerOpen.set(false);
  }

  protected badgeText(item: ModAppShellItem): string {
    return item.badgeLabel ?? String(item.badge ?? '');
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }

  /** Keeps Tab focus inside the open drawer. */
  protected onSideKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.drawerActive()) return;
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
    return Array.from(this.side().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.offsetParent !== null,
    );
  }

  private activate(): void {
    if (this.locked) return;
    const current = this.document.activeElement;
    this.lastFocused = current instanceof HTMLElement ? current : null;
    this.releaseScroll = lockBodyScroll(this.document);
    overlayStack.push(this);
    this.locked = true;
    // Focus after the template has dropped `inert` from the side bar.
    afterNextRender(
      () => {
        if (!this.locked) return;
        const target = this.focusableElements()[0] ?? this.side().nativeElement;
        target.focus();
      },
      { injector: this.injector },
    );
  }

  private deactivate(): void {
    if (!this.locked) return;
    this.unlock();
    const previous = this.lastFocused;
    this.lastFocused = null;
    // Focus returns after the render that drops `inert` from the page column.
    afterNextRender(
      () => {
        if (previous?.isConnected) previous.focus();
      },
      { injector: this.injector },
    );
  }

  private unlock(): void {
    if (!this.locked) return;
    this.releaseScroll?.();
    this.releaseScroll = null;
    overlayStack.remove(this);
    this.locked = false;
  }
}
