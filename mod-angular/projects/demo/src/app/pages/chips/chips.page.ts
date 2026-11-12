import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModChip, ModChipSize, ModChipVariant } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-chips-page',
  imports: [ModChip, NgTemplateOutlet, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #plus let-s>
      <span class="chip__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          [attr.width]="s"
          [attr.height]="s"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </ng-template>
    <ng-template #cross let-s>
      <span class="chip__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          [attr.width]="s"
          [attr.height]="s"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </ng-template>

    <div class="content-header">
      <h1 class="content-title">Chips</h1>
      <p class="content-description">
        Chips are small, interactive elements used to display information, trigger actions, or allow selections.
        Available in 2 styles, 3 sizes, with rounded, on-color, and selected variants.
      </p>
    </div>

    <demo-live
      heading="Chip"
      description="Chips are compact elements that represent an input, attribute, or action. They allow users to make selections, filter content, or trigger actions."
      [rtl]="rtl()"
      [dark]="onColor()"
    >
      <button
        mod-chip
        [variant]="variant()"
        [size]="size()"
        [rounded]="rounded()"
        [onColor]="onColor()"
        [selected]="selected()"
        [disabled]="state() === 'disabled'"
      >
        @if (leadingIcon()) {
          <ng-container *ngTemplateOutlet="plus; context: { $implicit: iconSize() }" />
        }
        {{ label() }}
        @if (trailingIcon()) {
          <ng-container *ngTemplateOutlet="cross; context: { $implicit: iconSize() }" />
        }
      </button>

      @if (!leadingIcon() && !trailingIcon()) {
        <button
          mod-chip
          [variant]="variant()"
          [size]="size()"
          [rounded]="rounded()"
          [onColor]="onColor()"
          [selected]="selected()"
          [disabled]="state() === 'disabled'"
        >
          <ng-container *ngTemplateOutlet="plus; context: { $implicit: iconSize() }" />
          {{ addLabel() }}
        </button>
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="State" [options]="states" [(value)]="state" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-switch label="Rounded" [(checked)]="rounded" />
      <demo-switch label="On-color" [(checked)]="onColor" />
      <demo-switch label="Selected" [(checked)]="selected" />
      <demo-switch label="Lead Icon" [(checked)]="leadingIcon" />
      <demo-switch label="Trail Icon" [(checked)]="trailingIcon" />
    </demo-live>

    <demo-props
      description="Inputs, models and outputs of the mod-chip component. Apply it to a native button: <button mod-chip>."
      [props]="props"
    />

    <demo-showcase
      heading="Chip Styles"
      description="The two core chip styles. Primary for brand-colored selections and Neutral for general-purpose use."
    >
      <div class="showcase-row">
        <button mod-chip>Primary</button>
        <button mod-chip variant="neutral">Neutral</button>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Chip Sizes"
      description="Three size options to fit different contexts. Large (32px) is the default, Medium (24px) for denser layouts, and Small (20px) for compact usage."
    >
      @for (v of variants; track v.value) {
        <span class="showcase-label">{{ v.label }}</span>
        <div class="showcase-row">
          <button mod-chip [variant]="v.value">Large (32px)</button>
          <button mod-chip [variant]="v.value" size="medium">Medium (24px)</button>
          <button mod-chip [variant]="v.value" size="small">Small (20px)</button>
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="Rounded Chips"
      description="Apply the rounded modifier for a pill-shaped appearance. Works with all styles and sizes."
    >
      @for (v of variants; track v.value) {
        <span class="showcase-label">{{ v.label }}</span>
        <div class="showcase-row">
          @for (s of sizes; track s.value) {
            <button mod-chip rounded [variant]="v.value" [size]="s.value">{{ s.label }}</button>
          }
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="Chip States"
      description="Interactive states that provide visual feedback. Hover and press states are handled by CSS pseudo-classes. Selected and Disabled states are set via classes and attributes."
    >
      @for (v of variants; track v.value) {
        <span class="showcase-label">{{ v.label }}</span>
        <div class="showcase-row">
          <button mod-chip [variant]="v.value">Default</button>
          <button mod-chip [variant]="v.value" [selected]="true">Selected</button>
          <button mod-chip [variant]="v.value" disabled>Disabled</button>
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="Selected State"
      description="Chips in selected state show a filled background to indicate active selection. Useful for filter groups and multi-select scenarios."
    >
      @for (v of variants; track v.value) {
        <span class="showcase-label">{{ v.label }} — All Sizes</span>
        <div class="showcase-row">
          @for (s of sizes; track s.value) {
            <button mod-chip [variant]="v.value" [size]="s.value" [selected]="true">{{ s.label }}</button>
          }
        </div>
      }
      <span class="showcase-label">Rounded Selected</span>
      <div class="showcase-row">
        <button mod-chip rounded [selected]="true">Primary</button>
        <button mod-chip rounded variant="neutral" [selected]="true">Neutral</button>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Chips with Icons"
      description="Chips can include leading and/or trailing icons for enhanced visual communication. Icons scale with chip size."
    >
      <span class="showcase-label">Leading Icon</span>
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-chip [variant]="v.value"><ng-container *ngTemplateOutlet="plus" />Add Item</button>
        }
      </div>
      <span class="showcase-label">Trailing Icon</span>
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-chip [variant]="v.value">Remove<ng-container *ngTemplateOutlet="cross" /></button>
        }
      </div>
      <span class="showcase-label">Both Icons</span>
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-chip [variant]="v.value">
            <ng-container *ngTemplateOutlet="plus" />Item<ng-container *ngTemplateOutlet="cross" />
          </button>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="On-Color"
      description="Chips placed on dark or colored backgrounds use the on-color modifier to ensure sufficient contrast. Colors are inverted to white/light tones."
      dark
    >
      @for (v of variants; track v.value) {
        <span class="showcase-label">{{ v.label }}</span>
        <div class="showcase-row">
          <button mod-chip onColor [variant]="v.value">Default</button>
          <button mod-chip onColor [variant]="v.value" [selected]="true">Selected</button>
          <button mod-chip onColor [variant]="v.value" disabled>Disabled</button>
        </div>
      }
      <span class="showcase-label">Rounded</span>
      <div class="showcase-row">
        <button mod-chip onColor rounded>Primary</button>
        <button mod-chip onColor rounded [selected]="true">Selected</button>
        <button mod-chip onColor rounded variant="neutral">Neutral</button>
        <button mod-chip onColor rounded variant="neutral" [selected]="true">Selected</button>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Size × Style Matrix"
      description="Complete matrix showing all combinations of sizes, styles, and rounded modifier for both default and selected states."
    >
      @for (row of matrix; track row.label) {
        <span class="showcase-label">{{ row.label }}</span>
        <div class="showcase-row">
          @for (sel of [false, true]; track sel) {
            @for (s of sizes; track s.value) {
              <button mod-chip [variant]="row.variant" [rounded]="row.rounded" [size]="s.value" [selected]="sel">
                {{ s.label }}
              </button>
            }
          }
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="Chips in right-to-left layout for Arabic and other RTL languages. Icon positions are mirrored automatically."
      subtle
    >
      <div dir="rtl" style="display: contents">
        <span class="showcase-label">أساسي (Primary)</span>
        <div class="showcase-row">
          <button mod-chip>اختيار</button>
          <button mod-chip [selected]="true">اختيار</button>
          <button mod-chip rounded>اختيار</button>
          <button mod-chip><ng-container *ngTemplateOutlet="plus" />إضافة</button>
        </div>
        <span class="showcase-label">محايد (Neutral)</span>
        <div class="showcase-row">
          <button mod-chip variant="neutral">اختيار</button>
          <button mod-chip variant="neutral" [selected]="true">اختيار</button>
          <button mod-chip variant="neutral" rounded>اختيار</button>
          <button mod-chip variant="neutral">إزالة<ng-container *ngTemplateOutlet="cross" /></button>
        </div>
      </div>
    </demo-showcase>
  `,
})
export class ChipsPage {
  protected readonly variants: DemoOption<ModChipVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'neutral', label: 'Neutral' },
  ];
  protected readonly sizes: DemoOption<ModChipSize>[] = [
    { value: 'large', label: 'Large' },
    { value: 'medium', label: 'Medium' },
    { value: 'small', label: 'Small' },
  ];
  protected readonly states: DemoOption<'default' | 'disabled'>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
  ];
  protected readonly matrix: { label: string; variant: ModChipVariant; rounded: boolean }[] = [
    { label: 'Primary — Square', variant: 'primary', rounded: false },
    { label: 'Primary — Rounded', variant: 'primary', rounded: true },
    { label: 'Neutral — Square', variant: 'neutral', rounded: false },
    { label: 'Neutral — Rounded', variant: 'neutral', rounded: true },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModChipSize>('large');
  protected readonly state = signal<'default' | 'disabled'>('default');
  protected readonly variant = signal<ModChipVariant>('primary');
  protected readonly rounded = signal(false);
  protected readonly onColor = signal(false);
  protected readonly selected = signal(false);
  protected readonly leadingIcon = signal(false);
  protected readonly trailingIcon = signal(false);

  protected readonly label = computed(() => (this.rtl() ? 'اختيار' : 'Item'));
  protected readonly addLabel = computed(() => (this.rtl() ? 'إضافة عنصر' : 'Add Item'));
  protected readonly iconSize = computed(() => {
    const size = this.size();
    return size === 'small' ? 14 : size === 'medium' ? 16 : 18;
  });

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'primary' | 'neutral'", default: "'primary'", description: 'Primary brand-colored style with green tones, or neutral gray for general-purpose use.' },
    { name: 'size', type: "'large' | 'medium' | 'small'", default: "'large'", description: 'Large 32px, medium 24px, small 20px.' },
    { name: 'rounded', type: 'boolean', default: 'false', description: 'Applies full pill/rounded shape to the chip.' },
    { name: 'onColor', type: 'boolean', default: 'false', description: 'Modifier for dark/colored backgrounds. Inverts chip colors for contrast.' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Square chip containing only an icon (no label text). Provide an aria-label.' },
    { name: 'selectable', type: 'boolean', default: 'false', description: 'Clicking the chip toggles selected.' },
    { name: '[(selected)]', type: 'boolean', default: 'false', description: 'Visual selected state with filled background; sets aria-pressed. Two-way bindable.' },
    { name: 'removable', type: 'boolean', default: 'false', description: 'Adds the trailing remove icon; clicking the chip emits removed.' },
    { name: '(removed)', type: 'void', description: 'Emitted when a removable chip is clicked.' },
    { name: 'disabled', type: 'native attribute', default: 'false', description: 'Disables the chip. Grays out appearance and prevents interaction.' },
  ];
}
