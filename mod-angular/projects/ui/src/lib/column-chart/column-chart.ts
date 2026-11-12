import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

/** One data series of a `<mod-column-chart>`: one value per category. */
export interface ModColumnChartSeries {
  /** Series name, shown in the legend, the tooltips and the data table. */
  name: string;
  /** Values in the order of `categories`. A missing value counts as 0. */
  values: readonly number[];
}

/** Rounds a maximum up to a "nice" axis end (1, 2, 2.5 or 5 times a power of ten). */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const fraction = value / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * Simple column chart for one or two series, drawn with CSS (no chart
 * library).
 *
 *   <mod-column-chart
 *     aria-label="Referrals per month"
 *     [categories]="['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']"
 *     [series]="[
 *       { name: 'Received', values: [182, 204, 197, 231, 248, 226] },
 *       { name: 'Accepted', values: [141, 160, 158, 176, 197, 171] },
 *     ]"
 *     unit="referrals"
 *   />
 *
 * Accessibility: the chart is a labelled group; every column can be focused
 * with the keyboard and announces "category, series: value"; the value also
 * appears in a tooltip on hover and focus; and the same data is available to
 * assistive technology as a visually hidden table. With two series a legend
 * is shown and the second series is hatched, so the series do not differ by
 * colour alone. In RTL the categories run from right to left.
 */
@Component({
  selector: 'mod-column-chart',
  template: `
    <div
      class="column-chart__figure"
      role="group"
      [attr.aria-label]="ariaLabel() || null"
      [style.--column-chart-height]="height() + 'px'"
    >
      @if (shown().length > 1) {
        <ul class="column-chart__legend" role="list" [attr.aria-label]="legendLabel()">
          @for (item of shown(); track $index) {
            <li class="column-chart__legend-item">
              <span class="column-chart__swatch" [class]="'column-chart__bar--s' + ($index + 1)" aria-hidden="true"></span>
              {{ item.name }}
            </li>
          }
        </ul>
      }

      <div class="column-chart__plot">
        <div class="column-chart__axis" aria-hidden="true">
          <span class="column-chart__axis-sizer">{{ widestTick() }}</span>
          @for (tick of ticks(); track tick.share) {
            <span class="column-chart__tick" [style.inset-block-end.%]="tick.share">{{ tick.text }}</span>
          }
        </div>

        <div class="column-chart__area">
          @for (tick of ticks(); track tick.share) {
            <span class="column-chart__grid" aria-hidden="true" [style.inset-block-end.%]="tick.share"></span>
          }
          <div class="column-chart__groups">
            @for (group of groups(); track $index) {
              <div class="column-chart__group">
                @for (bar of group.bars; track $index) {
                  <span
                    class="column-chart__bar"
                    [class]="'column-chart__bar--s' + ($index + 1)"
                    role="img"
                    tabindex="0"
                    [attr.aria-label]="bar.label"
                    [style.height.%]="bar.share"
                  >
                    @if (showValues()) {
                      <span class="column-chart__value" aria-hidden="true">{{ bar.short }}</span>
                    }
                    <span class="column-chart__tip" aria-hidden="true">
                      <span class="column-chart__tip-title">{{ group.category }}</span>
                      {{ bar.tip }}
                    </span>
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <div class="column-chart__labels" aria-hidden="true">
          @for (group of groups(); track $index) {
            <span class="column-chart__label">{{ group.category }}</span>
          }
        </div>
      </div>

      <table class="column-chart__table">
        <caption>{{ tableCaption() || ariaLabel() }}</caption>
        <thead>
          <tr>
            <th scope="col">{{ categoryHeader() }}</th>
            @for (item of shown(); track $index) {
              <th scope="col">{{ item.name || valueHeader() }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (group of groups(); track $index) {
            <tr>
              <th scope="row">{{ group.category }}</th>
              @for (bar of group.bars; track $index) {
                <td>{{ bar.text }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './column-chart.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'column-chart' },
})
export class ModColumnChart {
  /** Category names along the horizontal axis. */
  readonly categories = input<readonly string[]>([]);
  /** One or two series (further series are ignored). */
  readonly series = input<readonly ModColumnChartSeries[]>([]);
  /** Accessible name of the chart (required for a meaningful chart). */
  readonly ariaLabel = input('', { alias: 'aria-label' });
  /** End of the value axis. Defaults to a rounded value above the largest data value. */
  readonly max = input<number | null>(null);
  /** Number of intervals on the value axis. */
  readonly tickCount = input(4, { transform: numberAttribute });
  /** Turns a value into its text. Defaults to the number grouped by thousands. */
  readonly format = input<(value: number) => string>((value) => value.toLocaleString('en-US'));
  /** Appended to values in tooltips, accessible names and the data table, e.g. "referrals". */
  readonly unit = input('');
  /** Height of the plot area in pixels. */
  readonly height = input(240, { transform: numberAttribute });
  /** Prints every value above its column. */
  readonly showValues = input(false, { transform: booleanAttribute });

  /** Accessible name of the legend. */
  readonly legendLabel = input('Legend');
  /** Caption of the hidden data table. Defaults to the chart's accessible name. */
  readonly tableCaption = input('');
  /** Header of the first column of the hidden data table. */
  readonly categoryHeader = input('Category');
  /** Header of the value column when a series has no name. */
  readonly valueHeader = input('Value');

  /** The series that are drawn: the first two. */
  protected readonly shown = computed(() => this.series().slice(0, 2));

  private readonly top = computed(() => {
    const fixed = this.max();
    if (fixed !== null && fixed > 0) return fixed;
    const values = this.shown().flatMap((item) => item.values);
    return niceMax(Math.max(0, ...values));
  });

  protected readonly ticks = computed(() => {
    const requested = Math.round(this.tickCount());
    // An unusable value (not a number, below 1) falls back to the default.
    const count = Number.isFinite(requested) && requested >= 1 ? requested : 4;
    const top = this.top();
    const format = this.format();
    return Array.from({ length: count + 1 }, (_, index) => ({
      share: (index / count) * 100,
      text: format((top * index) / count),
    }));
  });

  /** The longest tick text reserves the width of the axis. */
  protected readonly widestTick = computed(() =>
    this.ticks().reduce((widest, tick) => (tick.text.length > widest.length ? tick.text : widest), ''),
  );

  protected readonly groups = computed(() => {
    const series = this.shown();
    const top = this.top();
    const format = this.format();
    const unit = this.unit();
    return this.categories().map((category, index) => ({
      category,
      bars: series.map((item) => {
        const value = item.values[index] ?? 0;
        const short = format(value);
        const text = unit ? `${short} ${unit}` : short;
        const named = item.name ? `${item.name}: ${text}` : text;
        return {
          share: Math.min(100, Math.max(0, (value / top) * 100)),
          short,
          text,
          tip: named,
          label: `${category}, ${named}`,
        };
      }),
    }));
  });
}
