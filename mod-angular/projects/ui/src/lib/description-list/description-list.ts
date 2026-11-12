import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type ModDescriptionListColumns = 1 | 2 | 3;
/** `stacked`: label above the value. `inline`: label beside the value. */
export type ModDescriptionListLayout = 'stacked' | 'inline';

/**
 * Read-only details as label / value pairs.
 *
 *   <mod-description-list columns="3" dividers aria-label="Patient details">
 *     <mod-description-item label="Patient" value="Fahad Al-Otaibi" />
 *     <mod-description-item label="File number" value="48213" />
 *     <mod-description-item label="Status">
 *       <mod-status-tag variant="warning">Medical review</mod-status-tag>
 *     </mod-description-item>
 *     <mod-description-item label="Diagnosis" span="full">Long text…</mod-description-item>
 *   </mod-description-list>
 *
 * `columns` is the layout on wide containers; the list measures ITS OWN width
 * and drops to two columns under 720px and one under 400px. It is exposed as
 * a list of items, each read as "label, value".
 */
@Component({
  selector: 'mod-description-list',
  template: `
    <div class="description-list__grid" role="list" [attr.aria-label]="ariaLabel() || null">
      <ng-content />
    </div>
  `,
  styleUrl: './description-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class ModDescriptionList {
  /** Number of columns on wide containers. */
  readonly columns = input(1 as ModDescriptionListColumns, {
    transform: (value: unknown): ModDescriptionListColumns => {
      const count = Number(value);
      return count === 2 || count === 3 ? count : 1;
    },
  });
  readonly layout = input<ModDescriptionListLayout>('stacked');
  /** Line between the rows. */
  readonly dividers = input(false, { transform: booleanAttribute });
  /** Accessible name of the list. */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  protected readonly classes = computed(() => {
    const list = [
      'description-list',
      `description-list--cols-${this.columns()}`,
      `description-list--${this.layout()}`,
    ];
    if (this.dividers()) list.push('description-list--dividers');
    return list.join(' ');
  });
}

/**
 * One label / value pair of a `<mod-description-list>`. The value is the
 * `value` input, projected content, or both (content after the text).
 */
@Component({
  selector: 'mod-description-item',
  template: `
    <span class="description-list__label">{{ label() }}</span>
    <span class="description-list__value">{{ value() }}<ng-content /></span>
  `,
  styleUrl: './description-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    '[class]': 'classes()',
  },
})
export class ModDescriptionItem {
  readonly label = input.required<string>();
  /** Plain text value. Use projected content for tags, links or formatted text. */
  readonly value = input<string | number>('');
  /** Columns the item covers; `full` takes the whole row. */
  readonly span = input<1 | 2 | 3 | 'full'>(1);

  protected readonly classes = computed(() => {
    const span = this.span();
    return span === 1 ? 'description-list__item' : `description-list__item description-list__item--span-${span}`;
  });
}
