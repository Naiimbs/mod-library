import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { ModIcon } from '../icon/icon';

export type ModTimelineTone = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * Vertical activity timeline: what happened, when and by whom, newest or
 * oldest first as the items are given.
 *
 *   <mod-timeline aria-label="Referral history">
 *     <mod-timeline-item heading="Referral accepted" time="Today, 09:40" actor="Head of Cardiology" tone="success" icon="checkmark-circle-02">
 *       Accepted for the outpatient clinic.
 *     </mod-timeline-item>
 *     <mod-timeline-item heading="Eligibility checked" time="Yesterday, 14:05" actor="Medical coordinator" />
 *   </mod-timeline>
 *
 * The timeline is exposed as a list. Each item shows a marker (a dot, or the
 * item's `icon`) joined to the next one by a line.
 */
@Component({
  selector: 'mod-timeline',
  template: '<ng-content />',
  styleUrl: './timeline.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    class: 'timeline',
    '[class.timeline--compact]': 'compact()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class ModTimeline {
  /** Tighter spacing and smaller markers. */
  readonly compact = input(false, { transform: booleanAttribute });
  /** Accessible name of the list. */
  readonly ariaLabel = input('', { alias: 'aria-label' });
}

/**
 * One event of a `<mod-timeline>`. Projected content is the body under the
 * title line (a note, a tag, a link).
 */
@Component({
  selector: 'mod-timeline-item',
  imports: [ModIcon],
  template: `
    <span class="timeline__marker" aria-hidden="true">
      @if (icon()) {
        <mod-icon [name]="icon()" />
      } @else {
        <span class="timeline__dot"></span>
      }
    </span>
    <div class="timeline__content">
      <div class="timeline__head">
        <span class="timeline__title">
          @if (toneLabel()) {
            <span class="timeline__sr">{{ toneLabel() }}: </span>
          }
          {{ heading() }}
        </span>
        @if (time()) {
          <span class="timeline__time">{{ time() }}</span>
        }
      </div>
      @if (actor()) {
        <span class="timeline__actor">{{ actor() }}</span>
      }
      <div class="timeline__body"><ng-content /></div>
    </div>
  `,
  styleUrl: './timeline.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    '[class]': 'classes()',
  },
})
export class ModTimelineItem {
  /** What happened. */
  readonly heading = input.required<string>();
  /** When, already formatted ("Today, 09:40", "2 hours ago"). */
  readonly time = input('');
  /** Who did it (a name or a role). */
  readonly actor = input('');
  /** Colour of the marker. */
  readonly tone = input<ModTimelineTone>('default');
  /** Icon name without the `dga-icon-` prefix, shown in the marker. Empty shows a dot. */
  readonly icon = input('');
  /** Hidden text announced before the heading when the tone carries meaning, e.g. "Rejected". */
  readonly toneLabel = input('');

  protected readonly classes = computed(() => `timeline__item timeline__item--${this.tone()}`);
}
