import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModButton, ModButtonSize, ModButtonVariant, ModIcon } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-button-page',
  imports: [ModButton, ModIcon, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Buttons</h1>
      <p class="content-description">
        Interactive button components following DGA design guidelines. Includes 6 variants, 3 sizes,
        multiple states, and modifiers for destructive actions, dark backgrounds, loading indicators, and
        floating action buttons.
      </p>
    </div>

    <demo-live
      heading="Button"
      description="Buttons are interactive components that trigger specific actions. The label on a button tells users what happens when they click it."
      [rtl]="rtl()"
      [dark]="onColor()"
    >
      <button
        mod-button
        [variant]="variant()"
        [size]="size()"
        [disabled]="state() === 'disabled'"
        [destructive]="destructive()"
        [onColor]="onColor()"
        [selected]="selected()"
        [loading]="loading()"
        [iconOnly]="iconOnly()"
        [attr.aria-label]="iconOnly() ? label() : null"
      >
        @if (iconOnly() || leadingIcon()) {
          <mod-icon name="add-01" />
        }
        @if (!iconOnly()) {
          {{ label() }}
        }
        @if (trailingIcon() && !iconOnly()) {
          <mod-icon name="add-01" />
        }
      </button>

      @if (!iconOnly() && !leadingIcon() && !trailingIcon()) {
        <button
          mod-button
          [variant]="variant()"
          [size]="size()"
          [disabled]="state() === 'disabled'"
          [destructive]="destructive()"
          [onColor]="onColor()"
          [selected]="selected()"
          [loading]="loading()"
        >
          <mod-icon name="add-01" /> {{ addLabel() }}
        </button>
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="State" [options]="states" [(value)]="state" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-switch label="Destructive" [(checked)]="destructive" />
      <demo-switch label="Icon only" [checked]="iconOnly()" (checkedChange)="setIconOnly($event)" />
      <demo-switch label="On-color" [(checked)]="onColor" />
      <demo-switch label="Selected" [(checked)]="selected" />
      <demo-switch label="Loading" [(checked)]="loading" />
      <demo-switch label="Lead Icon" [checked]="leadingIcon()" (checkedChange)="setLeading($event)" />
      <demo-switch label="Trail Icon" [checked]="trailingIcon()" (checkedChange)="setTrailing($event)" />
    </demo-live>

    <demo-props
      description="Inputs of the mod-button directive-style component. Apply it to a native button or anchor: <button mod-button>."
      [props]="props"
    />

    <demo-showcase heading="Variants" description="Six visual styles, from the primary call-to-action to text-only.">
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-button [variant]="v.value">{{ v.label }}</button>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Sizes" description="Large (40px, default), medium (32px) and small (24px).">
      <div class="showcase-row">
        @for (s of sizes; track s.value) {
          <button mod-button [size]="s.value"><mod-icon name="add-01" /> {{ s.label }}</button>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Destructive" description="Red tones for delete and other irreversible actions.">
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-button destructive [variant]="v.value">{{ v.label }}</button>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="On color" description="Adjusted colors for dark or brand-colored backgrounds." dark>
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-button onColor [variant]="v.value">{{ v.label }}</button>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Icon only, loading and disabled">
      <div class="showcase-row">
        <button mod-button iconOnly aria-label="Add"><mod-icon name="add-01" /></button>
        <button mod-button variant="secondary-outline" size="medium" iconOnly aria-label="Add">
          <mod-icon name="add-01" />
        </button>
        <button mod-button variant="subtle" size="small" iconOnly aria-label="Add"><mod-icon name="add-01" /></button>
        <button mod-button loading>Loading</button>
        <button mod-button variant="secondary-outline" loading>Loading</button>
        <button mod-button disabled>Disabled</button>
        <button mod-button variant="secondary-outline" disabled>Disabled</button>
      </div>
    </demo-showcase>

    <demo-showcase heading="Floating action button" description="Pill shape with elevated shadow, in two sizes.">
      <div class="showcase-row">
        <button mod-button fab><mod-icon name="add-01" /> Create</button>
        <button mod-button fab size="small"><mod-icon name="add-01" /> Create</button>
        <button mod-button fab iconOnly aria-label="Create"><mod-icon name="add-01" /></button>
        <button mod-button fab size="small" iconOnly aria-label="Create"><mod-icon name="add-01" /></button>
      </div>
    </demo-showcase>
  `,
})
export class ButtonPage {
  protected readonly variants: DemoOption<ModButtonVariant>[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary-solid', label: 'Secondary Solid' },
    { value: 'secondary-outline', label: 'Secondary Outline' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'transparent', label: 'Transparent' },
  ];
  protected readonly sizes: DemoOption<ModButtonSize>[] = [
    { value: 'large', label: 'Large' },
    { value: 'medium', label: 'Medium' },
    { value: 'small', label: 'Small' },
  ];
  protected readonly states: DemoOption<'default' | 'disabled'>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<ModButtonVariant>('neutral');
  protected readonly size = signal<ModButtonSize>('large');
  protected readonly state = signal<'default' | 'disabled'>('default');
  protected readonly destructive = signal(false);
  protected readonly onColor = signal(false);
  protected readonly selected = signal(false);
  protected readonly loading = signal(false);
  protected readonly iconOnly = signal(false);
  protected readonly leadingIcon = signal(false);
  protected readonly trailingIcon = signal(false);

  protected readonly label = computed(() => (this.rtl() ? 'زر' : 'Button'));
  protected readonly addLabel = computed(() => (this.rtl() ? 'إضافة عنصر' : 'Add Item'));

  // Icon-only is mutually exclusive with leading/trailing icon, as in the original demo.
  protected setIconOnly(on: boolean): void {
    this.iconOnly.set(on);
    if (on) {
      this.leadingIcon.set(false);
      this.trailingIcon.set(false);
    }
  }

  protected setLeading(on: boolean): void {
    this.leadingIcon.set(on);
    if (on) this.iconOnly.set(false);
  }

  protected setTrailing(on: boolean): void {
    this.trailingIcon.set(on);
    if (on) this.iconOnly.set(false);
  }

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'neutral' | 'primary' | 'secondary-solid' | 'secondary-outline' | 'subtle' | 'transparent'", default: "'primary'", description: 'Visual style of the button.' },
    { name: 'size', type: "'large' | 'medium' | 'small'", default: "'large'", description: 'Large 40px, medium 32px, small 24px. With fab: large 56px, small 40px.' },
    { name: 'destructive', type: 'boolean', default: 'false', description: 'Red tones for destructive / danger actions.' },
    { name: 'onColor', type: 'boolean', default: 'false', description: 'Adjusts colors for dark or colored backgrounds.' },
    { name: 'selected', type: 'boolean', default: 'false', description: 'Selected state for toggle buttons; sets aria-pressed.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Replaces the label with an animated spinner.' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Square button containing only an icon. Provide an aria-label.' },
    { name: 'fab', type: 'boolean', default: 'false', description: 'Floating action button with pill shape and elevated shadow.' },
    { name: 'disabled', type: 'native attribute', description: 'Native disabled attribute of the button element.' },
  ];
}
