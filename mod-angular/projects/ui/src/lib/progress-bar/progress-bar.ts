import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export type ModProgressVariant = 'primary' | 'neutral' | 'error' | 'success';
export type ModProgressBarSize = 'sm' | 'md' | 'lg';
export type ModCircularProgressSize = 200 | 160 | 120 | 80 | 64;

let nextId = 0;

function clampPercent(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

/**
 * DGA linear progress bar (determinate).
 *
 *   <mod-progress-bar [value]="42" label="Uploading file" helperText="Your file is being uploaded" />
 *   <mod-progress-bar [value]="100" variant="success" size="lg" showValue />
 */
@Component({
  selector: 'mod-progress-bar',
  template: `
    @if (label()) {
      <h3 class="progress-bar__label" [id]="labelId">{{ label() }}</h3>
    }
    <div
      [class]="'progress-bar-container ' + size()"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="percent()"
      [attr.aria-valuetext]="valueText() || null"
      [attr.aria-labelledby]="label() ? labelId : null"
      [attr.aria-label]="label() ? null : ariaLabel() || null"
      [attr.aria-describedby]="helperText() ? noteId : null"
      [attr.title]="percent() + '%'"
    >
      <div [class]="'progress-bar ' + variant()" [style.width.%]="percent()">
        @if (showValue() && size() === 'lg' && percent() > 8) {
          <span class="progress-bar-text">{{ percent() }}%</span>
        }
      </div>
    </div>
    @if (helperText()) {
      <div class="progress-bar__note" [id]="noteId">
        <span [class]="noteIconClass()" aria-hidden="true"></span>
        <p [class]="tone()">{{ helperText() }}</p>
      </div>
    }
  `,
  styleUrl: './progress-bar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'progress-wrapper' },
})
export class ModProgressBar {
  /** Progress from 0 to 100. */
  readonly value = input(0, { transform: numberAttribute });
  readonly size = input<ModProgressBarSize>('md');
  readonly variant = input<ModProgressVariant>('primary');
  /** Visible label above the track. */
  readonly label = input<string>('');
  /** Helper note below the track; coloured for error / success variants. */
  readonly helperText = input<string>('');
  /** Shows the percentage inside the fill (large size only, as in the source). */
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Accessible name when there is no visible label. */
  readonly ariaLabel = input<string>('Progress');
  /** Optional human readable value, e.g. "Step 2 of 5". */
  readonly valueText = input<string>('');

  private readonly uid = nextId++;
  protected readonly labelId = `mod-progress-bar-label-${this.uid}`;
  protected readonly noteId = `mod-progress-bar-note-${this.uid}`;

  protected readonly percent = computed(() => Math.round(clampPercent(this.value())));

  protected readonly tone = computed(() => {
    const variant = this.variant();
    return variant === 'error' || variant === 'success' ? variant : '';
  });

  protected readonly noteIconClass = computed(() => {
    const tone = this.tone();
    const icon =
      tone === 'error'
        ? 'dga-icon-cancel-circle'
        : tone === 'success'
          ? 'dga-icon-checkmark-circle-02'
          : 'dga-icon-help-circle';
    return `progress-bar__note-icon ${tone} icon ${icon}`.replace('  ', ' ');
  });
}

/**
 * DGA circular progress bar (determinate). Success and error variants show
 * a status icon instead of the percentage, as in the source.
 *
 *   <mod-circular-progress [value]="64" size="120" text="Completed" />
 */
@Component({
  selector: 'mod-circular-progress',
  template: `
    <div class="circular-progress-bar__label">
      @switch (variant()) {
        @case ('success') {
          <span
            class="circular-progress-bar__label--icon success icon dga-icon-checkmark-circle-02"
            aria-hidden="true"
          ></span>
        }
        @case ('error') {
          <span
            class="circular-progress-bar__label--icon error icon dga-icon-cancel-circle"
            aria-hidden="true"
          ></span>
        }
        @default {
          <h4 class="circular-progress-bar__label--percentage">{{ percent() }}%</h4>
        }
      }
      @if (text()) {
        <h5 [class]="'circular-progress-bar__label--text ' + variant()">{{ text() }}</h5>
      }
    </div>
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        class="track"
        fill="none"
        [attr.r]="radius()"
        [attr.cx]="center()"
        [attr.cy]="center()"
        [attr.stroke-width]="strokeWidth()"
      ></circle>
      <circle
        [attr.class]="'tail tail--' + variant()"
        fill="none"
        stroke-linecap="round"
        [attr.r]="radius()"
        [attr.cx]="center()"
        [attr.cy]="center()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="dashArray()"
        [attr.stroke-dashoffset]="dashOffset()"
        [attr.transform]="'rotate(-180 ' + center() + ' ' + center() + ')'"
      ></circle>
    </svg>
  `,
  styleUrl: './progress-bar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'circular-progress-bar',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.data-size]': 'size()',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-valuetext]': 'valueText() || null',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class ModCircularProgress {
  /** Progress from 0 to 100. */
  readonly value = input(0, { transform: numberAttribute });
  /** Diameter in pixels: 200, 160, 120, 80 or 64. */
  readonly size = input(120 as ModCircularProgressSize, {
    transform: (value: unknown): ModCircularProgressSize => {
      const n = numberAttribute(value, 120);
      const sizes: readonly ModCircularProgressSize[] = [200, 160, 120, 80, 64];
      return sizes.find((s) => s === n) ?? 120;
    },
  });
  readonly variant = input<ModProgressVariant>('primary');
  /** Caption under the percentage (hidden by the source CSS below 120px). */
  readonly text = input<string>('');
  /** Accessible name. */
  readonly ariaLabel = input<string>('Progress');
  /** Optional human readable value. */
  readonly valueText = input<string>('');

  protected readonly percent = computed(() => Math.round(clampPercent(this.value())));
  protected readonly strokeWidth = computed(() => this.size() / 10);
  protected readonly radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  protected readonly center = computed(() => this.size() / 2);
  private readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly dashArray = computed(() => this.circumference().toFixed(3));
  protected readonly dashOffset = computed(() =>
    (this.circumference() * (1 - clampPercent(this.value()) / 100)).toFixed(3),
  );
}
