import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModProgressIndicator,
  ModProgressIndicatorOrientation,
  ModProgressIndicatorVariant,
  ModProgressStep,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const NAMES = {
  en: ['Account Setup', 'Personal Info', 'Verification', 'Confirmation', 'Complete'],
  ar: ['إنشاء الحساب', 'المعلومات الشخصية', 'التحقق', 'التأكيد', 'الإكمال'],
};
const DESCS = {
  en: ['Create your account', 'Fill in your details', 'Verify your identity', 'Review and confirm', 'Finish the process'],
  ar: ['أنشئ حسابك', 'أدخل بياناتك', 'تحقق من هويتك', 'راجع وأكد', 'أنهِ العملية'],
};

@Component({
  selector: 'demo-progress-indicator-page',
  imports: [ModProgressIndicator, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .col {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      width: 100%;
    }
    .col--wide {
      gap: var(--spacing-3xl);
    }
    .states {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-6xl);
    }
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }
    .state mod-progress-indicator,
    .state .progress-step,
    .state .progress-step__track {
      width: auto;
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Progress Indicator</h1>
      <p class="content-description">
        Progress Indicator enables incremental navigation through a series of steps or stages in a process. It provides
        clear visual cues indicating the current step to help users understand their progress.
      </p>
    </div>

    <demo-live
      heading="Progress Indicator"
      description="Facilitates step-by-step navigation through a process or sequence, commonly used in forms or multi-step processes."
      align="stretch"
      [rtl]="rtl()"
    >
      <mod-progress-indicator
        interactive
        [steps]="steps()"
        [current]="current()"
        (currentChange)="current.set($event)"
        [orientation]="orientation()"
        [variant]="variant()"
        [focused]="focused()"
        [showName]="showName()"
        [showDescription]="showDescription()"
      />

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Alignment" [options]="orientations" [(value)]="orientation" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-select label="Steps" [options]="stepCounts" [value]="stepCount()" (valueChange)="setStepCount($event)" />
      <demo-select label="Current Step" [options]="currentOptions()" [(value)]="current" />
      <demo-switch label="Focused" [(checked)]="focused" />
      <demo-switch label="Step Name" [(checked)]="showName" />
      <demo-switch label="Description" [(checked)]="showDescription" />
    </demo-live>

    <demo-props
      heading="Props"
      description="Inputs, model and output of mod-progress-indicator. Each step shows Completed, Current, or Upcoming state automatically from the current step."
      [props]="props"
    />
    <demo-props heading="Step Child Props" description="Shape of each item in the steps array (ModProgressStep)." [props]="stepProps" />

    <demo-showcase heading="Horizontal Layout">
      <div class="col">
        <span class="showcase-label">4 Steps — Step 2 Active</span>
        <mod-progress-indicator [steps]="four" [current]="2" />
      </div>
    </demo-showcase>

    <demo-showcase heading="Vertical Layout">
      <div class="col">
        <span class="showcase-label">4 Steps — Step 2 Active</span>
        <mod-progress-indicator style="max-width: 300px" orientation="vertical" [steps]="four" [current]="2" />
      </div>
    </demo-showcase>

    <demo-showcase heading="Step States">
      <div class="states">
        <div class="state">
          <mod-progress-indicator [steps]="single" [current]="2" [showName]="false" />
          <span class="showcase-label">Completed</span>
        </div>
        <div class="state">
          <mod-progress-indicator [steps]="single" [current]="1" [showName]="false" />
          <span class="showcase-label">Current</span>
        </div>
        <div class="state">
          <mod-progress-indicator [steps]="single" [current]="0" [showName]="false" />
          <span class="showcase-label">Upcoming</span>
        </div>
        <div class="state">
          <mod-progress-indicator focused [steps]="single" [current]="2" [showName]="false" />
          <span class="showcase-label">Completed + Focused</span>
        </div>
        <div class="state">
          <mod-progress-indicator focused [steps]="single" [current]="1" [showName]="false" />
          <span class="showcase-label">Current + Focused</span>
        </div>
      </div>
    </demo-showcase>

    <demo-showcase heading="Dot Style">
      <div class="col col--wide">
        <span class="showcase-label">Horizontal — Dot Style</span>
        <mod-progress-indicator variant="dot" [steps]="four" [current]="2" />

        <span class="showcase-label" style="margin-top: var(--spacing-xl);">Dot States</span>
        <div class="states">
          <div class="state">
            <mod-progress-indicator variant="dot" [steps]="single" [current]="2" [showName]="false" />
            <span class="showcase-label">Completed</span>
          </div>
          <div class="state">
            <mod-progress-indicator variant="dot" [steps]="single" [current]="1" [showName]="false" />
            <span class="showcase-label">Current</span>
          </div>
          <div class="state">
            <mod-progress-indicator variant="dot" [steps]="single" [current]="0" [showName]="false" />
            <span class="showcase-label">Upcoming</span>
          </div>
        </div>
      </div>
    </demo-showcase>

    <demo-showcase heading="Without Description">
      <div class="col">
        <span class="showcase-label">Name Only — No Description</span>
        <mod-progress-indicator [steps]="nameOnly" [current]="2" />
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL Layout">
      <div class="col col--wide">
        <span class="showcase-label">Horizontal — Arabic RTL</span>
        <div dir="rtl" lang="ar">
          <mod-progress-indicator
            [steps]="arabic"
            [current]="2"
            ariaLabel="التقدم"
            stepLabel="الخطوة"
            completedLabel="مكتملة"
            currentLabel="الحالية"
            upcomingLabel="قادمة"
          />
        </div>
      </div>
    </demo-showcase>
  `,
})
export class ProgressIndicatorPage {
  protected readonly orientations: DemoOption<ModProgressIndicatorOrientation>[] = [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
  ];
  protected readonly variants: DemoOption<ModProgressIndicatorVariant>[] = [
    { value: 'number', label: 'Circles' },
    { value: 'dot', label: 'Dot' },
  ];
  protected readonly stepCounts: DemoOption<number>[] = [3, 4, 5].map((value) => ({ value, label: String(value) }));

  protected readonly rtl = signal(false);
  protected readonly orientation = signal<ModProgressIndicatorOrientation>('horizontal');
  protected readonly variant = signal<ModProgressIndicatorVariant>('number');
  protected readonly stepCount = signal(4);
  protected readonly current = signal(2);
  protected readonly focused = signal(false);
  protected readonly showName = signal(true);
  protected readonly showDescription = signal(true);

  /** The "Current Step" options follow the number of steps, as in the original demo. */
  protected readonly currentOptions = computed<DemoOption<number>[]>(() =>
    Array.from({ length: this.stepCount() }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
  );

  protected readonly steps = computed<ModProgressStep[]>(() => {
    const lang = this.rtl() ? 'ar' : 'en';
    return NAMES[lang]
      .slice(0, this.stepCount())
      .map((name, i) => ({ name, description: DESCS[lang][i] }));
  });

  protected setStepCount(count: number): void {
    this.stepCount.set(count);
    if (this.current() > count) this.current.set(count);
  }

  protected readonly four: ModProgressStep[] = NAMES.en.slice(0, 4).map((name, i) => ({ name, description: DESCS.en[i] }));
  protected readonly single: ModProgressStep[] = [{ name: 'Step' }];
  protected readonly nameOnly: ModProgressStep[] = [{ name: 'Step One' }, { name: 'Step Two' }, { name: 'Step Three' }];
  protected readonly arabic: ModProgressStep[] = [
    { name: 'الخطوة الأولى', description: 'وصف الخطوة' },
    { name: 'الخطوة الثانية', description: 'وصف الخطوة' },
    { name: 'الخطوة الثالثة', description: 'وصف الخطوة' },
  ];

  protected readonly props: DemoProp[] = [
    { name: 'steps', type: 'ModProgressStep[]', description: 'Required. The steps, in order.' },
    { name: 'current', type: 'model<number>', default: '1', description: '1-based number of the current step. Earlier steps are completed, later ones upcoming.' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Alignment of the steps.' },
    { name: 'variant', type: "'number' | 'dot'", default: "'number'", description: 'Circles with the step number / check mark, or small dots.' },
    { name: 'showName', type: 'boolean', default: 'true', description: 'Shows the step name.' },
    { name: 'showDescription', type: 'boolean', default: 'true', description: 'Shows the step description.' },
    { name: 'interactive', type: 'boolean', default: 'false', description: 'Makes the circles focusable buttons that set current when activated.' },
    { name: 'focused', type: 'boolean', default: 'false', description: 'Forces the focus ring on every step circle (static preview of the focused state).' },
    { name: 'ariaLabel', type: 'string', default: "'Progress'", description: 'Accessible name of the list.' },
    { name: 'stepLabel', type: 'string', default: "'Step'", description: "Word used in each circle's accessible name." },
    { name: 'completedLabel / currentLabel / upcomingLabel', type: 'string', default: "'completed' / 'current' / 'upcoming'", description: "State words used in each circle's accessible name." },
    { name: '(stepSelected)', type: 'number', description: 'Emits the 1-based step number when a step is activated (interactive only).' },
  ];

  protected readonly stepProps: DemoProp[] = [
    { name: 'name', type: 'string', description: 'Step name shown next to / under the circle.' },
    { name: 'description', type: 'string', default: 'undefined', description: 'Optional secondary line.' },
  ];
}
