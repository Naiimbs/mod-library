import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type ModSkeletonShape = 'line' | 'rectangle' | 'circle' | 'square';
export type ModSkeletonSize = 'sm' | 'md' | 'lg';
export type ModSkeletonGradient = 'type1' | 'type2';

function toCssLength(value: string | number | undefined): string | null {
  if (value === undefined || value === '') return null;
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

/**
 * DGA skeleton placeholder.
 *
 *   <mod-skeleton shape="line" size="sm" width="160" />
 *   <mod-skeleton shape="circle" width="64" height="64" />
 *
 * Decorative by default (`aria-hidden`). Put `aria-busy="true"` and a
 * visually-hidden loading message on the region that is loading. The
 * composite layout helpers from the source (`.skeleton-pattern*`) are plain
 * CSS classes shipped with this component.
 */
@Component({
  selector: 'mod-skeleton',
  template: '',
  styleUrl: './skeleton.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.width]': 'cssWidth()',
    '[style.height]': 'cssHeight()',
    '[style.animation]': 'animated() ? null : "none"',
    'aria-hidden': 'true',
  },
})
export class ModSkeleton {
  readonly shape = input<ModSkeletonShape>('line');
  /** Height step. Lines support sm | lg, rectangles sm | md | lg. */
  readonly size = input<ModSkeletonSize | undefined>(undefined);
  /** Gradient direction; alternate type1/type2 between adjacent lines. */
  readonly gradient = input<ModSkeletonGradient>('type1');
  /** Short rectangle (button-sized). Requires a `size`. */
  readonly short = input(false, { transform: booleanAttribute });
  /** Larger corner radius for squares. */
  readonly rounded = input(false, { transform: booleanAttribute });
  /** Pulse animation. */
  readonly animated = input(true, { transform: booleanAttribute });
  /** Width override. A number (or numeric string) is treated as pixels. */
  readonly width = input<string | number | undefined>(undefined);
  /** Height override. A number (or numeric string) is treated as pixels. */
  readonly height = input<string | number | undefined>(undefined);

  protected readonly cssWidth = computed(() => toCssLength(this.width()));
  protected readonly cssHeight = computed(() => toCssLength(this.height()));

  protected readonly classes = computed(() => {
    const list = ['skeleton', `skeleton--${this.shape()}`];
    const size = this.size();
    if (this.gradient() === 'type2') list.push('skeleton--type2');
    if (size) list.push(`skeleton--${size}`);
    if (this.short()) list.push('skeleton--short');
    if (this.rounded()) list.push('skeleton--rounded');
    return list.join(' ');
  });
}
