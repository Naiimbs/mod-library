import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModDropdown,
  ModDropdownFeedback,
  ModDropdownOption,
  ModDropdownSize,
  ModDropdownVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type State = 'default' | 'error' | 'readonly' | 'disabled';

function toOptions(labels: string[]): ModDropdownOption<string>[] {
  return labels.map((label, index) => ({ value: `option-${index}`, label }));
}

@Component({
  selector: 'demo-dropdown-page',
  imports: [ModDropdown, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Dropdown</h1>
      <p class="content-description">
        Dropdowns let people pick one or several options from a list. Two sizes, three field variants, error and
        feedback states, single and multi select with checkboxes, and the library's signature press line that
        grows across the field's bottom edge when open. Ported from the DGA library's
        <code>mod-dropdown</code> component.
      </p>
    </div>

    <demo-live
      heading="Dropdown"
      description="Click the field to open the list. Single select closes on choice; multi select keeps the list open and joins the selections."
      align="flex-start"
      [rtl]="rtl()"
    >
      <div style="width: 100%; max-width: 320px; min-height: 300px; padding-top: var(--spacing-3xl)">
        <mod-dropdown
          [label]="showLabel() ? t().label : ''"
          [ariaLabel]="showLabel() ? '' : t().label"
          [placeholder]="t().placeholder"
          [options]="t().options"
          [(value)]="value"
          [size]="size()"
          [variant]="variant()"
          [feedback]="feedback()"
          [readonly]="state() === 'readonly'"
          [disabled]="state() === 'disabled'"
          [multiple]="multi()"
        />
      </div>

      <demo-switch label="RTL" [checked]="rtl()" (checkedChange)="rtl.set($event); reset()" />
      <demo-select label="Size" [options]="sizes" [value]="size()" (valueChange)="size.set($event); reset()" />
      <demo-select label="Variant" [options]="variants" [value]="variant()" (valueChange)="variant.set($event); reset()" />
      <demo-select label="State" [options]="states" [value]="state()" (valueChange)="state.set($event); reset()" />
      <demo-switch label="Multi select" [checked]="multi()" (checkedChange)="multi.set($event); reset()" />
      <demo-switch label="Field label" [checked]="showLabel()" (checkedChange)="showLabel.set($event); reset()" />
    </demo-live>

    <demo-props
      description="Inputs, outputs and models of the mod-dropdown component. Changing a control in the live demo clears the selection."
      [props]="props"
    />

    <demo-showcase
      heading="Default"
      description="Click the field to open it. Choosing an option fills the trigger label and shows a tick next to the selection."
      align="flex-start"
    >
      <div style="width: 100%; min-height: 236px">
        <mod-dropdown style="max-width: 320px" label="Region" placeholder="Select a region" [options]="regions" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Variants"
      description="Lighter drops the border until interaction; darker sits on a gray fill. Both regain the default border when hovered or open."
      align="flex-start"
    >
      <div
        class="showcase-row"
        style="justify-content: flex-start; align-items: flex-start; width: 100%; min-height: 176px;"
      >
        <mod-dropdown style="max-width: 220px" placeholder="Default" [options]="optionsAB" />
        <mod-dropdown style="max-width: 220px" variant="lighter" placeholder="Lighter" [options]="optionsAB" />
        <mod-dropdown style="max-width: 220px" variant="darker" placeholder="Darker" [options]="optionsAB" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Validation & States"
      description="Error outlines the field and recolors the press line; a feedback icon with a tinted halo can sit before the chevron. Read-only and disabled mute the field."
      align="flex-start"
    >
      <div class="showcase-row" style="justify-content: flex-start; align-items: flex-start; width: 100%;">
        <mod-dropdown style="max-width: 220px" placeholder="Error" feedback="error" [options]="optionsA" />
        <mod-dropdown
          style="max-width: 220px"
          placeholder="Success"
          feedback="success"
          value="riyadh"
          [options]="riyadh"
        />
        <mod-dropdown style="max-width: 220px" placeholder="" value="readonly" readonly [options]="readonlyOptions" />
        <mod-dropdown style="max-width: 220px" placeholder="Disabled" disabled />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Multi Select"
      description="Options carry 24px checkboxes and stay open while choosing; the trigger joins the selections with commas."
      align="flex-start"
    >
      <div style="width: 100%; min-height: 256px">
        <mod-dropdown style="max-width: 320px" multiple placeholder="Select services" [options]="services" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="The field, chevron, and options mirror in right-to-left layouts."
      align="flex-start"
    >
      <div dir="rtl" style="width: 100%; min-height: 216px">
        <mod-dropdown style="max-width: 320px" label="المنطقة" placeholder="اختر منطقة" [options]="regionsAr" />
      </div>
    </demo-showcase>
  `,
})
export class DropdownPage {
  protected readonly sizes: DemoOption<ModDropdownSize>[] = [
    { value: 'lg', label: 'Large (40px)' },
    { value: 'md', label: 'Medium (32px)' },
  ];
  protected readonly variants: DemoOption<ModDropdownVariant>[] = [
    { value: 'default', label: 'Default' },
    { value: 'lighter', label: 'Lighter' },
    { value: 'darker', label: 'Darker' },
  ];
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'error', label: 'Error' },
    { value: 'readonly', label: 'Read-only' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModDropdownSize>('lg');
  protected readonly variant = signal<ModDropdownVariant>('default');
  protected readonly state = signal<State>('default');
  protected readonly multi = signal(false);
  protected readonly showLabel = signal(true);
  protected readonly value = signal<string | string[] | null>(null);

  protected readonly regions = toOptions(['Riyadh', 'Makkah', 'Madinah', 'Eastern Province']);
  private readonly demoRegionsAr = toOptions(['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'المنطقة الشرقية']);
  protected readonly regionsAr = toOptions(['الرياض', 'مكة المكرمة']);
  protected readonly optionsAB = toOptions(['Option A', 'Option B']);
  protected readonly optionsA = toOptions(['Option A']);
  protected readonly riyadh: ModDropdownOption<string>[] = [{ value: 'riyadh', label: 'Riyadh' }];
  protected readonly readonlyOptions: ModDropdownOption<string>[] = [{ value: 'readonly', label: 'Read-only value' }];
  protected readonly services = toOptions(['Digital certificates', 'E-payments', 'Document verification']);

  protected readonly t = computed(() =>
    this.rtl()
      ? { label: 'المنطقة', placeholder: 'اختر منطقة', options: this.demoRegionsAr }
      : { label: 'Region', placeholder: 'Select a region', options: this.regions },
  );

  protected readonly feedback = computed<ModDropdownFeedback | null>(() =>
    this.state() === 'error' ? 'error' : null,
  );

  /** Changing a control clears the selection, as in the original demo. */
  protected reset(): void {
    this.value.set(null);
  }

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'T | T[] | null (model)', default: 'null', description: 'Selected option value, or an array of values when multiple. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'options', type: 'ModDropdownOption<T>[]', default: '[]', description: 'Options as { value, label, disabled?, group? }. Consecutive options sharing a group are rendered under one group label.' },
    { name: 'label', type: 'string', default: "''", description: 'Field label displayed above the trigger.' },
    { name: 'placeholder', type: 'string', default: "'Select'", description: 'Text shown in the trigger while nothing is selected.' },
    { name: 'size', type: "'lg' | 'md'", default: "'lg'", description: 'Field heights 40px / 32px; the list opens below the field accordingly.' },
    { name: 'variant', type: "'default' | 'lighter' | 'darker'", default: "'default'", description: 'Borderless variants: lighter is transparent, darker sits on a gray-100 fill. Both regain their border on hover and open.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Options render 24px checkboxes; the trigger joins selections with commas.' },
    { name: 'separator', type: 'string', default: "', '", description: 'Separator between labels in multi select.' },
    { name: 'error', type: 'boolean', default: 'false', description: 'Error recolors the border and press line.' },
    { name: 'feedback', type: "'error' | 'success' | 'warning' | null", default: 'null', description: 'Status icon inside the field with a soft tinted halo. Error also applies the error outline.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Mutes the field and ignores interaction.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Mutes the field and ignores interaction.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when no visible label is rendered.' },
    { name: 'compareWith', type: '(a: T, b: T) => boolean', default: 'Object.is', description: 'Equality used to match value against option values.' },
    { name: '(openChange)', type: 'boolean', description: 'Emits whenever the list opens or closes.' },
  ];
}
