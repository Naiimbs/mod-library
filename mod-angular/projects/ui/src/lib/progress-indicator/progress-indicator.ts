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

export interface ModProgressStep {
  /** Step name shown next to / under the circle. */
  name: string;
  /** Optional secondary line. */
  description?: string;
}

export type ModProgressStepStatus = 'completed' | 'current' | 'upcoming';
export type ModProgressIndicatorOrientation = 'horizontal' | 'vertical';
export type ModProgressIndicatorVariant = 'number' | 'dot';

interface StepView {
  index: number;
  number: number;
  step: ModProgressStep;
  status: ModProgressStepStatus;
  last: boolean;
  label: string;
}

/**
 * DGA progress indicator (stepper).
 *
 *   <mod-progress-indicator [steps]="steps" [(current)]="step" interactive />
 *
 * `current` is the 1-based number of the current step; steps before it are
 * completed, steps after it are upcoming. A value above the number of steps
 * marks every step completed.
 */
@Component({
  selector: 'mod-progress-indicator',
  template: `
    @for (item of views(); track item.index) {
      <div
        [class]="'progress-step progress-step--' + item.status"
        [class.progress-step--focused]="focused()"
        role="listitem"
      >
        <div class="progress-step__track">
          <div
            class="progress-step__circle"
            [attr.role]="interactive() ? 'button' : 'img'"
            [attr.tabindex]="interactive() ? 0 : null"
            [attr.aria-label]="item.label"
            [attr.aria-current]="item.status === 'current' ? 'step' : null"
            (click)="select(item)"
            (keydown.enter)="select(item, $event)"
            (keydown.space)="select(item, $event)"
          >
            @if (item.status === 'completed') {
              <svg
                class="progress-step__check"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            } @else {
              <span class="progress-step__number" aria-hidden="true">{{ item.number }}</span>
            }
          </div>
          @if (!item.last) {
            <div class="progress-step__connector"></div>
          }
        </div>
        @if (showName() || (showDescription() && item.step.description)) {
          <div class="progress-step__text">
            @if (showName()) {
              <span class="progress-step__name">{{ item.step.name }}</span>
            }
            @if (showDescription() && item.step.description) {
              <span class="progress-step__desc">{{ item.step.description }}</span>
            }
          </div>
        }
      </div>
    }
  `,
  styleUrl: './progress-indicator.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class ModProgressIndicator {
  readonly steps = input.required<readonly ModProgressStep[]>();
  /** 1-based number of the current step. */
  readonly current = model(1);
  readonly orientation = input<ModProgressIndicatorOrientation>('horizontal');
  /** `number` shows the step number / check mark, `dot` shows small dots. */
  readonly variant = input<ModProgressIndicatorVariant>('number');
  readonly showName = input(true, { transform: booleanAttribute });
  readonly showDescription = input(true, { transform: booleanAttribute });
  /** Makes the circles focusable buttons that set `current` when activated. */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Forces the focus ring on every step circle (static previews of the focused state). */
  readonly focused = input(false, { transform: booleanAttribute });
  /** Accessible name of the list. */
  readonly ariaLabel = input<string>('Progress');
  /** Text used in each circle's accessible name. */
  readonly stepLabel = input<string>('Step');
  readonly completedLabel = input<string>('completed');
  readonly currentLabel = input<string>('current');
  readonly upcomingLabel = input<string>('upcoming');

  /** Emits the 1-based step number when a step is activated (interactive only). */
  readonly stepSelected = output<number>();

  protected readonly classes = computed(() => {
    const list = ['progress-indicator', `progress-indicator--${this.orientation()}`];
    if (this.variant() === 'dot') list.push('progress-indicator--dot');
    return list.join(' ');
  });

  protected readonly views = computed<StepView[]>(() => {
    const steps = this.steps();
    const current = this.current();
    const statusText: Record<ModProgressStepStatus, string> = {
      completed: this.completedLabel(),
      current: this.currentLabel(),
      upcoming: this.upcomingLabel(),
    };
    const stepLabel = this.stepLabel();
    return steps.map((step, index) => {
      const number = index + 1;
      const status: ModProgressStepStatus =
        number < current ? 'completed' : number === current ? 'current' : 'upcoming';
      return {
        index,
        number,
        step,
        status,
        last: index === steps.length - 1,
        label: `${stepLabel} ${number}: ${step.name}, ${statusText[status]}`,
      };
    });
  });

  protected select(item: StepView, event?: Event): void {
    if (!this.interactive()) return;
    event?.preventDefault();
    this.current.set(item.number);
    this.stepSelected.emit(item.number);
  }
}
