import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import { ModIcon } from '../icon/icon';

/** Marks the actions (buttons, links) of a `<mod-empty-state>`. */
@Directive({ selector: '[modEmptyStateActions]' })
export class ModEmptyStateActions {}

/**
 * Placeholder for a list, table or panel that has nothing to show.
 *
 *   <mod-empty-state
 *     icon="inbox"
 *     heading="No pending actions"
 *     text="No case is waiting for an action of your role now."
 *   >
 *     <button modEmptyStateActions mod-button size="medium">New referral request</button>
 *   </mod-empty-state>
 *
 *   <mod-empty-state compact heading="No data" text="Try a longer period." />
 *
 * `compact` is for small panels and table bodies: smaller icon and spacing.
 * `bordered` draws a dashed frame for an empty drop area or page section.
 * Default content is rendered between the text and the actions.
 */
@Component({
  selector: 'mod-empty-state',
  imports: [ModIcon],
  template: `
    @if (icon()) {
      <span class="empty-state__icon" aria-hidden="true"><mod-icon [name]="icon()" /></span>
    }
    @switch (level()) {
      @case (2) {
        <h2 class="empty-state__title">{{ heading() }}</h2>
      }
      @case (4) {
        <h4 class="empty-state__title">{{ heading() }}</h4>
      }
      @case (0) {
        <p class="empty-state__title">{{ heading() }}</p>
      }
      @default {
        <h3 class="empty-state__title">{{ heading() }}</h3>
      }
    }
    @if (text()) {
      <p class="empty-state__text">{{ text() }}</p>
    }
    <ng-content />
    <div class="empty-state__actions"><ng-content select="[modEmptyStateActions]" /></div>
  `,
  styleUrl: './empty-state.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'empty-state',
    '[class.empty-state--compact]': 'compact()',
    '[class.empty-state--bordered]': 'bordered()',
  },
})
export class ModEmptyState {
  /** Short statement of what is empty. */
  readonly heading = input.required<string>();
  /** One or two sentences: why, and what to do next. */
  readonly text = input('');
  /** Icon name without the `dga-icon-` prefix. */
  readonly icon = input('');
  /** Heading level of the title (2, 3 or 4). 0 renders a paragraph, for use inside a table cell. */
  readonly level = input<0 | 2 | 3 | 4>(3);
  readonly compact = input(false, { transform: booleanAttribute });
  /** Dashed frame around the block. */
  readonly bordered = input(false, { transform: booleanAttribute });
}
