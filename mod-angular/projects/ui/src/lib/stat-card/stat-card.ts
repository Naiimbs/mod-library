import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { ModIcon } from '../icon/icon';
import { ModSkeleton } from '../skeleton/skeleton';

export type ModStatCardTone = 'default' | 'positive' | 'warning' | 'critical';
export type ModStatCardTrend = 'up' | 'down' | 'flat';
/** Whether the change is good, bad or neither (an increase is not always good). */
export type ModStatCardTrendTone = 'neutral' | 'positive' | 'negative';

const TREND_ICONS: Record<ModStatCardTrend, string> = {
  up: 'arrow-up-02',
  down: 'arrow-down-02',
  flat: 'minus-sign',
};

/**
 * KPI tile: a label, one large value, and optionally an icon, a unit, a trend
 * against the previous period and a caption.
 *
 *   <mod-stat-card
 *     label="Acceptance rate"
 *     value="78.4"
 *     unit="%"
 *     icon="checkmark-circle-02"
 *     trend="up"
 *     trendTone="positive"
 *     trendText="2.1 points higher than the previous period"
 *   />
 *
 *   <mod-stat-card label="Pending actions" [value]="7" tone="warning" caption="Open the pending actions" />
 *   <mod-stat-card label="Total referrals" loading />
 *
 * The trend is announced in words: its direction is given by an arrow icon
 * and by hidden text (`upLabel` / `downLabel` / `flatLabel`), never by colour
 * alone. `tone` adds an accent bar for values that need attention. Default
 * content is rendered under the caption (e.g. a link).
 */
@Component({
  selector: 'mod-stat-card',
  imports: [ModIcon, ModSkeleton],
  template: `
    <div class="stat-card__head">
      <span class="stat-card__label">{{ label() }}</span>
      @if (icon()) {
        <span class="stat-card__icon" aria-hidden="true"><mod-icon [name]="icon()" /></span>
      }
    </div>
    @if (loading()) {
      <div class="stat-card__loading">
        <span class="stat-card__sr">{{ loadingLabel() }}</span>
        <mod-skeleton shape="line" size="lg" width="55%" />
        <mod-skeleton shape="line" size="sm" width="80%" />
      </div>
    } @else {
      <p class="stat-card__value">
        <span class="stat-card__number">{{ value() }}</span>
        @if (unit()) {
          <span class="stat-card__unit">{{ unit() }}</span>
        }
      </p>
      @if (trend(); as direction) {
        <p class="stat-card__trend" [class]="'stat-card__trend--' + trendTone()">
          <mod-icon class="stat-card__trend-icon" [name]="trendIcon()" />
          <span class="stat-card__sr">{{ trendLabel() }}{{ trendText() ? ': ' : '' }}</span>
          <span>{{ trendText() }}</span>
        </p>
      }
      @if (caption()) {
        <p class="stat-card__caption">{{ caption() }}</p>
      }
      <ng-content />
    }
  `,
  styleUrl: './stat-card.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class ModStatCard {
  /** What the number measures. */
  readonly label = input.required<string>();
  /** The value, already formatted. */
  readonly value = input<string | number>('');
  /** Unit shown after the value in smaller type (%, hours, days…). */
  readonly unit = input('');
  /** Icon name without the `dga-icon-` prefix. */
  readonly icon = input('');
  /** Direction of the change against the previous period. Empty hides the trend line. */
  readonly trend = input<ModStatCardTrend | ''>('');
  /** Text of the trend line, e.g. "12% higher than the previous period". */
  readonly trendText = input('');
  /** Colours the trend as good or bad. */
  readonly trendTone = input<ModStatCardTrendTone>('neutral');
  /** Small helper line under the value. */
  readonly caption = input('');
  /** Accent for values that need attention. */
  readonly tone = input<ModStatCardTone>('default');
  /** Shows a skeleton instead of the value. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Hidden text announced before the trend text. */
  readonly upLabel = input('Increase');
  readonly downLabel = input('Decrease');
  readonly flatLabel = input('No change');
  /**
   * Hidden text of the loading placeholder. The card is not a live region (a
   * dashboard has many cards): announce the loading of the whole view once,
   * in the page.
   */
  readonly loadingLabel = input('Loading');

  protected readonly classes = computed(() => `stat-card stat-card--${this.tone()}`);

  protected readonly trendIcon = computed(() => {
    const direction = this.trend();
    return direction ? TREND_ICONS[direction] : '';
  });

  protected readonly trendLabel = computed(() => {
    switch (this.trend()) {
      case 'up':
        return this.upLabel();
      case 'down':
        return this.downLabel();
      case 'flat':
        return this.flatLabel();
      default:
        return '';
    }
  });
}
