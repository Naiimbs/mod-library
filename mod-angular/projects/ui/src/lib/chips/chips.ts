import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';

export type ModChipVariant = 'primary' | 'neutral';
export type ModChipSize = 'large' | 'medium' | 'small';

/**
 * DGA chip. Applied to a native button so focus and keyboard stay native:
 *
 *   <button mod-chip>Item</button>
 *   <button mod-chip selectable [(selected)]="on">Filter</button>
 *   <button mod-chip removable (removed)="remove(item)">Item</button>
 *
 * Leading icons are projected content wrapped in `<span class="chip__icon">`.
 */
@Component({
  selector: 'button[mod-chip]',
  template: `
    <ng-content />
    @if (removable()) {
      <span class="chip__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    }
  `,
  styleUrl: './chips.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': '"button"',
    '[attr.aria-pressed]': 'pressed()',
    '(click)': 'onClick()',
  },
})
export class ModChip {
  readonly variant = input<ModChipVariant>('primary');
  readonly size = input<ModChipSize>('large');
  /** Fully rounded (pill) shape. */
  readonly rounded = input(false, { transform: booleanAttribute });
  /** For use on dark or brand-coloured backgrounds. */
  readonly onColor = input(false, { transform: booleanAttribute });
  /** Square chip that contains only an icon. Provide an aria-label. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Clicking the chip toggles `selected`. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Selected state (two-way bindable). */
  readonly selected = model(false);
  /** Adds the trailing remove icon; clicking the chip emits `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });
  /**
   * One of a group of toggle chips (a segmented filter): `aria-pressed` is always `true` or `false`, so screen readers announce
   * every chip as a toggle. Selection is left to the page (bind `selected`).
   */
  readonly toggle = input(false, { transform: booleanAttribute });

  readonly removed = output<void>();

  protected readonly pressed = computed(() =>
    this.selectable() || this.toggle() || this.selected() ? String(this.selected()) : null,
  );

  protected readonly classes = computed(() => {
    const size = this.size();
    const list = ['chip', `chip-${this.variant()}`];
    if (size !== 'large') list.push(`chip-${size}`);
    if (this.rounded()) list.push('chip-rounded');
    if (this.onColor()) list.push('chip-on-color');
    if (this.iconOnly()) list.push('chip-icon-only');
    if (this.selected()) list.push('selected');
    return list.join(' ');
  });

  protected onClick(): void {
    if (this.removable()) {
      this.removed.emit();
      return;
    }
    if (this.selectable()) this.selected.update((value) => !value);
  }
}
