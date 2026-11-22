import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';

export type ModTabsSize = 'sm' | 'md' | 'lg';

export interface ModTabChangeEvent {
  index: number;
  /** The `value` of the newly selected tab, when it has one. */
  value: string | undefined;
}

let nextTabId = 0;

/**
 * A single tab inside `<mod-tabs>`. The projected content is the panel.
 *
 *   <mod-tab label="Overview" icon="home-01">…panel…</mod-tab>
 */
@Component({
  selector: 'mod-tab',
  template: '<ng-template><ng-content /></ng-template>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModTab {
  readonly label = input.required<string>();
  /** Font icon name without the `dga-icon-` prefix. */
  readonly icon = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Optional identifier reported in `selectionChange` and usable with `selectByValue()`. Also set as `data-value` on the tab. */
  readonly value = input<string | undefined>(undefined);
  /** A count or short text after the label (for example the number of items in the tab). */
  readonly badge = input<string | number | null | undefined>(undefined);
  /** `data-testid` of the badge. */
  readonly badgeTestId = input<string>('');
  /** Id of the tab button (generated when empty), for a page that labels its own panel with it. */
  readonly buttonId = input<string>('');
  /** `data-testid` of the tab button. */
  readonly testId = input<string>('');
  /** With `externalPanels` on the tabs: the id of the page's panel this tab controls (`aria-controls`). */
  readonly controls = input<string>('');

  /** @internal */
  readonly content = viewChild.required(TemplateRef);
  /** @internal */
  readonly tabId = `mod-tab-${nextTabId}`;
  /** @internal */
  readonly panelId = `mod-tabpanel-${nextTabId++}`;
}

/**
 * DGA horizontal tabs.
 *
 *   <mod-tabs [(selectedIndex)]="index" size="md">
 *     <mod-tab label="First">…</mod-tab>
 *     <mod-tab label="Second" disabled>…</mod-tab>
 *   </mod-tabs>
 *
 * Keyboard (as in the source): ArrowLeft/ArrowRight move and activate the
 * previous/next enabled tab (mirrored inside `[dir="rtl"]`), Home/End jump to
 * the first/last tab. Only the selected tab is in the tab order.
 */
@Component({
  selector: 'mod-tabs',
  imports: [NgTemplateOutlet],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModTabs {
  /** Index of the selected tab. */
  readonly selectedIndex = model(0);
  readonly size = input<ModTabsSize>('md');
  /** Full-width line under the tab list. */
  readonly divider = input(true, { transform: booleanAttribute });
  /** Flush variant: tabs are pulled out by the tab padding so the first label aligns with the container edge. */
  readonly flush = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('', { alias: 'aria-label' });
  /**
   * The page draws the panel itself (one panel whose content follows the selected tab): no panel is rendered here, and each tab's
   * `aria-controls` is its `controls` id.
   */
  readonly externalPanels = input(false, { transform: booleanAttribute });

  /** Emitted when the user selects another tab (click or keyboard). */
  readonly selectionChange = output<ModTabChangeEvent>();

  protected readonly tabs = contentChildren(ModTab);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly activeIndex = computed(() => {
    const index = this.selectedIndex();
    return index >= 0 && index < this.tabs().length ? index : 0;
  });

  protected readonly listClasses = computed(() => {
    let list = 'tab-list';
    const size = this.size();
    if (size !== 'md') list += ` tab-list--${size}`;
    if (this.flush()) list += ' tab-list--flush';
    return list;
  });

  /** Selects the tab whose `value` matches. Returns false when there is none. */
  selectByValue(value: string): boolean {
    const index = this.tabs().findIndex((tab) => tab.value() === value);
    if (index < 0 || this.tabs()[index].disabled()) return false;
    this.selectedIndex.set(index);
    return true;
  }

  protected select(index: number, focus = false): void {
    const tab = this.tabs()[index];
    if (!tab || tab.disabled()) return;
    if (focus) this.buttons()[index]?.nativeElement.focus();
    if (index === this.activeIndex()) return;
    this.selectedIndex.set(index);
    this.selectionChange.emit({ index, value: tab.value() });
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabs = this.tabs();
    const count = tabs.length;
    if (!count) return;
    const isRtl = this.host.nativeElement.closest('[dir="rtl"]') !== null;
    let forward: boolean;
    let newIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        forward = isRtl;
        newIndex = currentIndex + (forward ? 1 : -1);
        break;
      case 'ArrowRight':
        forward = !isRtl;
        newIndex = currentIndex + (forward ? 1 : -1);
        break;
      case 'Home':
        forward = true;
        newIndex = 0;
        break;
      case 'End':
        forward = false;
        newIndex = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();

    // Wrap around and skip disabled tabs.
    for (let attempts = 0; attempts < count; attempts++) {
      newIndex = (newIndex + count) % count;
      if (!tabs[newIndex].disabled()) {
        this.select(newIndex, true);
        return;
      }
      newIndex += forward ? 1 : -1;
    }
  }
}
