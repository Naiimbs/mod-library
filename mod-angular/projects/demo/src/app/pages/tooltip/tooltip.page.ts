import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModButton,
  ModIcon,
  ModTooltip,
  ModTooltipDirective,
  ModTooltipPosition,
  ModTooltipVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-tooltip-page',
  imports: [ModTooltip, ModTooltipDirective, ModButton, ModIcon, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacing-3xl);
      padding: var(--spacing-5xl) var(--spacing-3xl);
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Tooltip</h1>
      <p class="content-description">Tooltip component for additional information.</p>
    </div>

    <demo-live
      heading="Tooltip"
      description="A small label anchored to its trigger. Shown on hover and keyboard focus; turn on Always visible to pin it."
      [rtl]="rtl()"
    >
      <div style="padding: var(--spacing-6xl) 0;">
        <span class="tooltip-wrapper">
          <button mod-button variant="secondary-outline" aria-describedby="demo-tooltip-live">{{ trigger() }}</button>
          <mod-tooltip
            id="demo-tooltip-live"
            [position]="position()"
            [variant]="variant()"
            [multiline]="multiline()"
            [visible]="visible()"
            >{{ text() }}</mod-tooltip
          >
        </span>
      </div>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Position" [options]="positions" [(value)]="position" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-switch label="Multiline" [(checked)]="multiline" />
      <demo-switch label="Always visible" [(checked)]="visible" />
      <demo-text label="Text" [(value)]="customText" />
    </demo-live>

    <demo-props
      description="Inputs of the static mod-tooltip element and of the [modTooltip] directive, which adds a tooltip to any element and handles hover, keyboard focus, Escape and aria-describedby."
      [props]="props"
    />

    <demo-showcase heading="Tooltip Positions" description="Top (default), bottom, left and right of the trigger.">
      <div class="row">
        <span class="tooltip-wrapper">
          <button mod-button variant="secondary-outline" aria-describedby="demo-tooltip-static">Hover me</button>
          <mod-tooltip id="demo-tooltip-static" visible>Tooltip text</mod-tooltip>
        </span>
        @for (p of positions; track p.value) {
          <button mod-button variant="secondary-outline" modTooltip="Tooltip text" [tooltipPosition]="p.value">
            {{ p.label }}
          </button>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Variants" description="Dark (default) and light styles, multiline text, icon triggers and a show delay.">
      <div class="row">
        <button mod-button variant="secondary-outline" modTooltip="Dark tooltip">Dark</button>
        <button mod-button variant="secondary-outline" modTooltip="Light tooltip" tooltipVariant="light">Light</button>
        <button
          mod-button
          variant="secondary-outline"
          modTooltip="A longer explanation that wraps onto several lines when it does not fit."
          tooltipMultiline
        >
          Multiline
        </button>
        <button mod-button variant="subtle" iconOnly aria-label="Help" modTooltip="Help" tooltipPosition="right">
          <mod-icon name="help-circle" />
        </button>
        <button mod-button variant="secondary-outline" modTooltip="Shown after 500 ms" [tooltipShowDelay]="500">
          Delayed
        </button>
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL Layout" description="Tooltip text follows the reading direction of its trigger.">
      <div class="row" dir="rtl" lang="ar">
        <button mod-button variant="secondary-outline" modTooltip="نص التلميح">مرر المؤشر هنا</button>
        <button mod-button variant="secondary-outline" modTooltip="نص التلميح" tooltipPosition="bottom" tooltipVariant="light">
          مرر المؤشر هنا
        </button>
      </div>
    </demo-showcase>
  `,
})
export class TooltipPage {
  protected readonly positions: DemoOption<ModTooltipPosition>[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ];
  protected readonly variants: DemoOption<ModTooltipVariant>[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
  ];

  protected readonly rtl = signal(false);
  protected readonly position = signal<ModTooltipPosition>('top');
  protected readonly variant = signal<ModTooltipVariant>('dark');
  protected readonly multiline = signal(false);
  protected readonly visible = signal(true);
  protected readonly customText = signal('');

  protected readonly trigger = computed(() => (this.rtl() ? 'مرر المؤشر هنا' : 'Hover me'));
  protected readonly text = computed(() => {
    const custom = this.customText().trim();
    if (custom) return custom;
    if (this.multiline()) {
      return this.rtl()
        ? 'شرح أطول يلتف على عدة أسطر عندما لا تكفيه المساحة.'
        : 'A longer explanation that wraps onto several lines when it does not fit.';
    }
    return this.rtl() ? 'نص التلميح' : 'Tooltip text';
  });

  protected readonly props: DemoProp[] = [
    { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'mod-tooltip. Side of the trigger the tooltip is placed on.' },
    { name: 'variant', type: "'dark' | 'light'", default: "'dark'", description: 'mod-tooltip. Dark gray or white with border and shadow.' },
    { name: 'multiline', type: 'boolean', default: 'false', description: 'mod-tooltip. Wraps long text (max-width 200px, centered).' },
    { name: 'visible', type: 'boolean', default: 'false', description: 'mod-tooltip. Forces the tooltip visible regardless of hover.' },
    { name: 'modTooltip', type: 'string', default: "''", description: 'Directive. Tooltip text; an empty string disables the tooltip.' },
    { name: 'tooltipPosition', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Directive. Side of the trigger.' },
    { name: 'tooltipVariant', type: "'dark' | 'light'", default: "'dark'", description: 'Directive. Visual style.' },
    { name: 'tooltipMultiline', type: 'boolean', default: 'false', description: 'Directive. Wraps long text.' },
    { name: 'tooltipDisabled', type: 'boolean', default: 'false', description: 'Directive. Turns the tooltip off.' },
    { name: 'tooltipShowDelay', type: 'number', default: '0', description: 'Directive. Delay before showing, in milliseconds.' },
  ];
}
