import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

export type ModBarListTone = 'default' | 'neutral' | 'warning' | 'critical';

/** One row of a `<mod-bar-list>`. */
export interface ModBarListItem {
  /** Optional stable id (used for `track`). */
  id?: string;
  label: string;
  value: number;
  /** Text shown for the value instead of the formatted number (e.g. "62%"). */
  text?: string;
  /** Renders the label as a link. */
  href?: string;
  /** Bar colour. The meaning must also be clear from the label or the text. */
  tone?: ModBarListTone;
}

/**
 * Ranked list of labelled horizontal bars, for "top N" breakdowns.
 *
 *   <mod-bar-list
 *     aria-label="Referrals by specialty"
 *     [items]="[
 *       { label: 'Cardiology', value: 212 },
 *       { label: 'Orthopedic Surgery', value: 164 },
 *     ]"
 *     unit="referrals"
 *     ranked
 *   />
 *
 * Bars are scaled to the largest value (or to `max`). The markup is a list
 * (`ol` when `ranked`, otherwise `ul`); every row gives its value as text, so
 * the bar itself is decorative. `format` turns a value into text; `unit` is
 * appended to it. A label with `href` is a link and emits `itemSelect` on
 * click.
 */
@Component({
  selector: 'mod-bar-list',
  template: `
    @if (rows().length) {
      @if (ranked()) {
        <ol class="bar-list__list" role="list" [attr.aria-label]="ariaLabel() || null">
          @for (row of rows(); track row.item.id ?? $index) {
            <li class="bar-list__row">
              <span class="bar-list__rank" aria-hidden="true">{{ $index + 1 }}</span>
              <ng-container [ngTemplateOutlet]="body" [ngTemplateOutletContext]="{ $implicit: row }" />
            </li>
          }
        </ol>
      } @else {
        <ul class="bar-list__list" role="list" [attr.aria-label]="ariaLabel() || null">
          @for (row of rows(); track row.item.id ?? $index) {
            <li class="bar-list__row">
              <ng-container [ngTemplateOutlet]="body" [ngTemplateOutletContext]="{ $implicit: row }" />
            </li>
          }
        </ul>
      }
    } @else {
      <p class="bar-list__empty">{{ emptyText() }}</p>
    }

    <ng-template #body let-row>
      <div class="bar-list__body">
        <div class="bar-list__line">
          @if (row.item.href) {
            <a class="bar-list__label bar-list__link" [href]="row.item.href" (click)="itemSelect.emit(row.item)">{{
              row.item.label
            }}</a>
          } @else {
            <span class="bar-list__label">{{ row.item.label }}</span>
          }
          <span class="bar-list__value">{{ row.text }}</span>
        </div>
        <div class="bar-list__track" aria-hidden="true">
          <span
            class="bar-list__fill"
            [class]="'bar-list__fill--' + (row.item.tone || 'default')"
            [style.width.%]="row.share"
          ></span>
        </div>
      </div>
    </ng-template>
  `,
  styleUrl: './bar-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    class: 'bar-list',
    '[class.bar-list--compact]': 'compact()',
  },
})
export class ModBarList {
  readonly items = input<readonly ModBarListItem[]>([]);
  /** Value of a full bar. Defaults to the largest value in `items`. */
  readonly max = input<number | null>(null);
  /** Turns a value into its text. Defaults to the number grouped by thousands. */
  readonly format = input<(value: number) => string>((value) => value.toLocaleString('en-US'));
  /** Appended to every formatted value, e.g. "referrals" or "hours". */
  readonly unit = input('');
  /** Numbers the rows (an ordered list). */
  readonly ranked = input(false, { transform: booleanAttribute });
  /** Tighter rows. */
  readonly compact = input(false, { transform: booleanAttribute });
  /** Accessible name of the list. */
  readonly ariaLabel = input('', { alias: 'aria-label' });
  /** Shown when `items` is empty. */
  readonly emptyText = input('No data');

  /** Emitted when a linked label is activated. */
  readonly itemSelect = output<ModBarListItem>();

  protected readonly rows = computed(() => {
    const items = this.items();
    const format = this.format();
    const unit = this.unit();
    const top = this.max() ?? Math.max(0, ...items.map((item) => item.value));
    return items.map((item) => ({
      item,
      share: top > 0 ? Math.min(100, Math.max(0, (item.value / top) * 100)) : 0,
      text: item.text ?? (unit ? `${format(item.value)} ${unit}` : format(item.value)),
    }));
  });
}
