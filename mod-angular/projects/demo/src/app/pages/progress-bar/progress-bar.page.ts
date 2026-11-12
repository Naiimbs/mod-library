import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModCircularProgress,
  ModCircularProgressSize,
  ModProgressBar,
  ModProgressBarSize,
  ModProgressVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type Kind = 'linear' | 'circular';

@Component({
  selector: 'demo-progress-bar-page',
  imports: [ModProgressBar, ModCircularProgress, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-3xl);
      width: 100%;
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Progress Bar</h1>
      <p class="content-description">
        Progress bars communicate how much of a process has completed. The linear bar comes in three heights and four
        styles with an optional label and helper note; the circular bar comes in five diameters with a percentage or
        state icon at its center. Ported from the DGA library's <code>mod-linear-progress-bar</code> and
        <code>mod-circular-progress-bar</code> components.
      </p>
    </div>

    <demo-live
      heading="Progress Bar"
      description="Use the linear bar inside forms and cards, and the circular bar for dashboards and confirmations."
      [rtl]="rtl()"
    >
      @if (kind() === 'linear') {
        <mod-progress-bar
          style="max-width: 420px"
          showValue
          [value]="pct()"
          [size]="linSize()"
          [variant]="variant()"
          [label]="showLabel() ? linear().label : ''"
          [helperText]="showHelper() ? linear().helper : ''"
          [ariaLabel]="linear().label"
        />
      } @else {
        <mod-circular-progress
          [value]="pct()"
          [size]="circSize()"
          [variant]="variant()"
          [text]="centerText() && circSize() >= 120 ? (rtl() ? 'مكتمل' : 'Completed') : ''"
        />
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Kind" [options]="kinds" [(value)]="kind" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-select label="Percentage" [options]="percentages" [(value)]="pct" />
      @if (kind() === 'linear') {
        <demo-select label="Size" [options]="linSizes" [(value)]="linSize" />
      }
      @if (kind() === 'circular') {
        <demo-select label="Diameter" [options]="circSizes" [(value)]="circSize" />
      }
      @if (kind() === 'linear') {
        <demo-switch label="Label" [(checked)]="showLabel" />
      }
      @if (kind() === 'linear') {
        <demo-switch label="Helper text" [(checked)]="showHelper" />
      }
      @if (kind() === 'circular') {
        <demo-switch label="Center text" [(checked)]="centerText" />
      }
    </demo-live>

    <demo-props
      description="Inputs of mod-progress-bar (linear) and mod-circular-progress. The large linear bar shows its percentage inside the fill once it passes 8%."
      [props]="props"
    />

    <demo-showcase
      heading="Linear Sizes"
      description="Three track heights. The large bar carries its percentage inside the fill once it passes 8%."
    >
      <div class="stack">
        <mod-progress-bar [value]="65" size="sm" label="Small (4px)" />
        <mod-progress-bar [value]="65" size="md" label="Medium (8px)" />
        <mod-progress-bar [value]="65" size="lg" label="Large (16px)" showValue />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Linear Styles & States"
      description="Primary and neutral fills for running processes; error and success recolor the fill and the helper note together."
    >
      <div class="stack">
        <mod-progress-bar [value]="65" label="Uploading file" helperText="Your file is being uploaded" />
        <mod-progress-bar [value]="40" variant="neutral" label="Processing" />
        <mod-progress-bar [value]="35" variant="error" label="Uploading file" helperText="Upload failed. Try again." />
        <mod-progress-bar [value]="100" variant="success" label="Uploading file" helperText="Upload complete" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Circular Sizes"
      description="Five diameters with a stroke of one tenth of the size. The center percentage scales with the ring; the optional text label hides at 80px and below."
    >
      <div class="showcase-row" style="align-items: flex-end;">
        <mod-circular-progress [value]="65" [size]="200" text="Completed" />
        <mod-circular-progress [value]="65" [size]="160" text="Completed" />
        <mod-circular-progress [value]="65" [size]="120" text="Completed" />
        <mod-circular-progress [value]="65" [size]="80" />
        <mod-circular-progress [value]="65" [size]="64" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Circular Variants"
      description="Primary and neutral rings show the running percentage; success and error complete the ring and swap the center for a state icon."
    >
      <div class="showcase-row" style="align-items: flex-end;">
        <mod-circular-progress [value]="65" [size]="120" variant="primary" />
        <mod-circular-progress [value]="65" [size]="120" variant="neutral" />
        <mod-circular-progress [value]="100" [size]="120" variant="success" text="Done" />
        <mod-circular-progress [value]="100" [size]="120" variant="error" text="Failed" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="In right-to-left layouts the linear fill anchors to the right edge and the note mirrors."
    >
      <div class="stack" dir="rtl" lang="ar">
        <mod-progress-bar [value]="65" label="جاري رفع الملف" helperText="يتم رفع الملف الآن" />
      </div>
    </demo-showcase>
  `,
})
export class ProgressBarPage {
  protected readonly kinds: DemoOption<Kind>[] = [
    { value: 'linear', label: 'Linear' },
    { value: 'circular', label: 'Circular' },
  ];
  protected readonly variants: DemoOption<ModProgressVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'error', label: 'Error' },
    { value: 'success', label: 'Success' },
  ];
  protected readonly percentages: DemoOption<number>[] = [0, 25, 50, 65, 80, 100].map((value) => ({
    value,
    label: `${value}%`,
  }));
  protected readonly linSizes: DemoOption<ModProgressBarSize>[] = [
    { value: 'sm', label: 'Small (4px)' },
    { value: 'md', label: 'Medium (8px)' },
    { value: 'lg', label: 'Large (16px)' },
  ];
  protected readonly circSizes: DemoOption<ModCircularProgressSize>[] = [
    { value: 200, label: '200px' },
    { value: 160, label: '160px' },
    { value: 120, label: '120px' },
    { value: 80, label: '80px' },
    { value: 64, label: '64px' },
  ];

  protected readonly rtl = signal(false);
  protected readonly kind = signal<Kind>('linear');
  protected readonly variant = signal<ModProgressVariant>('primary');
  protected readonly pct = signal(65);
  protected readonly linSize = signal<ModProgressBarSize>('md');
  protected readonly circSize = signal<ModCircularProgressSize>(120);
  protected readonly showLabel = signal(true);
  protected readonly showHelper = signal(true);
  protected readonly centerText = signal(false);

  protected readonly linear = computed(() => {
    const variant = this.variant();
    const tone = variant === 'error' || variant === 'success' ? variant : 'neutral';
    return this.rtl()
      ? {
          label: 'جاري رفع الملف',
          helper: { neutral: 'يتم رفع الملف الآن', error: 'فشل رفع الملف', success: 'اكتمل رفع الملف' }[tone],
        }
      : {
          label: 'Uploading file',
          helper: { neutral: 'Your file is being uploaded', error: 'Upload failed', success: 'Upload complete' }[tone],
        };
  });

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'number', default: '0', description: 'Both components. Progress from 0 to 100.' },
    { name: 'variant', type: "'primary' | 'neutral' | 'error' | 'success'", default: "'primary'", description: 'Both components. Fill color; error and success also recolor the helper note / swap the center for a state icon.' },
    { name: 'ariaLabel', type: 'string', default: "'Progress'", description: 'Both components. Accessible name (linear: used when there is no visible label).' },
    { name: 'valueText', type: 'string', default: "''", description: 'Both components. Optional human readable value, e.g. "Step 2 of 5".' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'mod-progress-bar. Track height: 4px, 8px or 16px.' },
    { name: 'label', type: 'string', default: "''", description: 'mod-progress-bar. Visible label above the track.' },
    { name: 'helperText', type: 'string', default: "''", description: 'mod-progress-bar. Helper note below the track with a state icon.' },
    { name: 'showValue', type: 'boolean', default: 'false', description: 'mod-progress-bar. Shows the percentage inside the fill (large size, above 8%).' },
    { name: 'size', type: '200 | 160 | 120 | 80 | 64', default: '120', description: 'mod-circular-progress. Diameter in pixels; the stroke is one tenth of it.' },
    { name: 'text', type: 'string', default: "''", description: 'mod-circular-progress. Caption under the percentage (hidden at 80px and below).' },
  ];
}
