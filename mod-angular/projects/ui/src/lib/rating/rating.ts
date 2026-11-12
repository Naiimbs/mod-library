import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ModRatingSize = 'sm' | 'md' | 'lg';
export type ModRatingFill = 'none' | 'half' | 'full';

interface RatingStar {
  index: number;
  fill: ModRatingFill;
}

/**
 * DGA star rating. Click a star's start half for a half value (when
 * `allowHalf`), hover to preview, arrow keys to adjust.
 *
 *   <mod-rating [(value)]="score" />
 *   <mod-rating [value]="2.5" readonly brand size="sm" />
 */
@Component({
  selector: 'mod-rating',
  template: `
    <div
      [class]="classes()"
      [attr.role]="isInteractive() ? 'group' : 'img'"
      [attr.aria-label]="groupLabel()"
      (mouseleave)="hover.set(null)"
      (keydown)="onKeydown($event)"
    >
      @for (star of stars(); track star.index) {
        <button
          type="button"
          class="rating__star"
          [attr.data-star]="star.index"
          [attr.data-fill]="star.fill"
          [attr.aria-label]="starLabel()(star.index, max())"
          [attr.aria-pressed]="isInteractive() ? current() >= star.index : null"
          [attr.aria-hidden]="isInteractive() ? null : 'true'"
          [attr.tabindex]="isInteractive() ? null : -1"
          [disabled]="isDisabled()"
          (click)="onStarClick($event, star.index)"
          (mouseenter)="onStarEnter(star.index)"
        >
          <span class="icon dga-icon-star" aria-hidden="true"></span>
          <span class="rating__star-fill"><span class="icon dga-icon-star solid rounded" aria-hidden="true"></span></span>
        </button>
      }
    </div>
  `,
  styleUrl: './rating.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModRating), multi: true },
  ],
  host: {
    '(focusout)': 'onFocusOut()',
  },
})
export class ModRating implements ControlValueAccessor {
  /** Current rating (0…max, in 0.5 steps when `allowHalf`). Two-way bindable. */
  readonly value = model<number>(0);

  /** Number of stars. */
  readonly max = input(5, { transform: numberAttribute });
  readonly size = input<ModRatingSize>('md');
  /** Saudi green stars instead of gold. */
  readonly brand = input(false, { transform: booleanAttribute });
  /** Display only: no hover, click or keyboard interaction. */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Clicking the current rating again resets it to 0. */
  readonly clearable = input(true, { transform: booleanAttribute });
  /** Allows half-star values by clicking the start half of a star. */
  readonly allowHalf = input(true, { transform: booleanAttribute });
  /** Accessible label of the whole rating. */
  readonly label = input<(value: number, max: number) => string>(
    (value, max) => `${value} out of ${max} stars`,
  );
  /** Accessible label of each star button. */
  readonly starLabel = input<(star: number, max: number) => string>(
    (star, max) => `${star} of ${max}`,
  );

  private readonly document = inject(DOCUMENT);
  private readonly formDisabled = signal(false);
  /** Star being hovered (full-star preview), or null. */
  protected readonly hover = signal<number | null>(null);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly isInteractive = computed(() => !this.readonly() && !this.isDisabled());

  protected readonly classes = computed(() => {
    const list = ['rating', `rating--${this.size()}`];
    if (this.brand()) list.push('rating--brand');
    if (!this.isInteractive()) list.push('rating--readonly');
    return list.join(' ');
  });

  protected readonly stars = computed<RatingStar[]>(() => {
    const shown = this.hover() ?? this.current();
    const count = Math.max(0, Math.floor(this.max()));
    return Array.from({ length: count }, (_, i) => {
      const index = i + 1;
      const fill: ModRatingFill = shown >= index ? 'full' : shown >= index - 0.5 ? 'half' : 'none';
      return { index, fill };
    });
  });

  /** Value clamped to 0…max (covers `max` being lowered below the value). */
  protected readonly current = computed(() => Math.min(Math.max(0, this.value()), this.max()));

  protected readonly groupLabel = computed(() => this.label()(this.current(), this.max()));

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  protected onStarEnter(index: number): void {
    if (this.isInteractive()) this.hover.set(index);
  }

  protected onStarClick(event: MouseEvent, index: number): void {
    if (!this.isInteractive()) return;
    let value = index;
    // detail === 0 means the click came from the keyboard: always a full star.
    if (this.allowHalf() && event.detail !== 0) {
      const star = event.currentTarget as HTMLElement;
      const rect = star.getBoundingClientRect();
      const middle = rect.left + rect.width / 2;
      const inStartHalf = this.isRtl(star) ? event.clientX > middle : event.clientX < middle;
      if (inStartHalf) value -= 0.5;
    }
    // Show the committed value straight away instead of the full-star preview.
    this.hover.set(null);
    // Clicking the rating that is already set clears it.
    this.commit(this.clearable() && value === this.current() ? 0 : value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isInteractive()) return;
    const step = this.allowHalf() ? 0.5 : 1;
    const forward = this.isRtl(event.currentTarget as HTMLElement) ? 'ArrowLeft' : 'ArrowRight';
    const backward = forward === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
    let next: number;
    switch (event.key) {
      case forward:
      case 'ArrowUp':
        next = this.current() + step;
        break;
      case backward:
      case 'ArrowDown':
        next = this.current() - step;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    this.hover.set(null);
    this.commit(Math.min(this.max(), Math.max(0, next)));
  }

  protected onFocusOut(): void {
    this.onTouched();
  }

  private commit(value: number): void {
    if (value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  private isRtl(element: HTMLElement): boolean {
    return this.document.defaultView?.getComputedStyle(element).direction === 'rtl';
  }

  writeValue(value: number | null | undefined): void {
    this.value.set(typeof value === 'number' && !Number.isNaN(value) ? value : 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
