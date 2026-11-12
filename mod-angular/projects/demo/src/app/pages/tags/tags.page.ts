import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModTag, ModTagSize, ModTagVariant } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const PLUS = 'M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z';
const CROSS =
  'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z';

interface IconTag {
  variant: ModTagVariant;
  icon: string;
  label: string;
  rounded?: boolean;
}

@Component({
  selector: 'demo-tags-page',
  imports: [ModTag, NgTemplateOutlet, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Inline SVG icon in the tag__icon slot: context is { d: path data, s: pixel size } -->
    <ng-template #svg let-d="d" let-s="s">
      <span class="tag__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          [attr.width]="s || 16"
          [attr.height]="s || 16"
        >
          <path fill-rule="evenodd" clip-rule="evenodd" [attr.d]="d" />
        </svg>
      </span>
    </ng-template>

    <div class="content-header">
      <h1 class="content-title">Tags</h1>
      <p class="content-description">
        Compact, non-interactive labels used to attach metadata, categorize content, or surface status. Tags come in
        five semantic variants plus an On-Color variant for dark surfaces, three sizes, and support filled and
        outlined styles, rounded (pill) shape, leading and trailing icon slots, and icon-only forms.
      </p>
    </div>

    <demo-live
      heading="Tag"
      description="Tags are short, non-interactive labels. Use them to mark items with a category, a status, or a piece of metadata that a reader can scan at a glance."
      [rtl]="rtl()"
      [dark]="variant() === 'on-color'"
    >
      <mod-tag
        [variant]="variant()"
        [size]="size()"
        [outline]="outline()"
        [rounded]="rounded()"
        [iconOnly]="iconOnly()"
        [attr.aria-label]="iconOnly() ? label() : null"
      >
        @if (iconOnly() || leadIcon()) {
          <ng-container *ngTemplateOutlet="svg; context: { d: plus, s: iconSize() }" />
        }
        @if (!iconOnly()) {
          {{ label() }}
        }
        @if (trailIcon() && !iconOnly()) {
          <ng-container *ngTemplateOutlet="svg; context: { d: cross, s: iconSize() }" />
        }
      </mod-tag>

      @if (!iconOnly() && !leadIcon() && !trailIcon()) {
        <mod-tag [variant]="variant()" [size]="size()" [outline]="outline()" [rounded]="rounded()">
          <ng-container *ngTemplateOutlet="svg; context: { d: plus, s: iconSize() }" />
          {{ newLabel() }}
        </mod-tag>
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="Variant" [options]="variants" [(value)]="variant" />
      <demo-switch label="Outline" [(checked)]="outline" />
      <demo-switch label="Rounded" [(checked)]="rounded" />
      <demo-switch label="Icon only" [checked]="iconOnly()" (checkedChange)="setIconOnly($event)" />
      <demo-switch label="Lead Icon" [checked]="leadIcon()" (checkedChange)="setLead($event)" />
      <demo-switch label="Trail Icon" [checked]="trailIcon()" (checkedChange)="setTrail($event)" />
    </demo-live>

    <demo-props description="All available inputs for configuring the mod-tag component." [props]="props" />

    <demo-showcase
      heading="Tag Variants"
      description="The five semantic variants. Neutral for default metadata, Success and Error for positive and negative states, Warning and Info for cautionary and informational signals. The On-Color variant is shown separately below."
    >
      <div class="showcase-row">
        @for (v of semantic; track v.value) {
          <mod-tag [variant]="v.value">{{ v.label }}</mod-tag>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Tag Sizes"
      description="Three size options matching the Figma typography scale. Medium (32px, 16/24 medium), Small (24px, 12/18 medium — the default), and X-Small (20px, 10/14 semibold)."
    >
      <div class="showcase-row">
        <mod-tag variant="success" size="md">Medium (32px)</mod-tag>
        <mod-tag variant="success" size="sm">Small (24px)</mod-tag>
        <mod-tag variant="success" size="xs">X-Small (20px)</mod-tag>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Outline Variants"
      description="Outlined style strips the fill, keeping only the border and label color. Use when a softer visual weight is needed, such as in dense lists or alongside other UI controls."
    >
      <div class="showcase-row">
        @for (v of semantic; track v.value) {
          <mod-tag outline [variant]="v.value">{{ v.label }}</mod-tag>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Rounded Variants"
      description="Pill-shaped tags use a fully rounded border-radius. Available across all variants and combinable with the outline modifier."
    >
      <div class="showcase-row">
        @for (v of semantic; track v.value) {
          <mod-tag rounded [variant]="v.value">{{ v.label }}</mod-tag>
        }
      </div>
      <span class="showcase-label">Rounded + Outline</span>
      <div class="showcase-row">
        @for (v of semantic; track v.value) {
          <mod-tag rounded outline [variant]="v.value">{{ v.label }}</mod-tag>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Tags with Icons (SVG)"
      description="Tags paired with inline SVG icons for stronger visual recognition. The same .tag__icon slot is used for leading and trailing icons — placement is determined by HTML order."
    >
      <span class="showcase-label">Leading icon</span>
      <div class="showcase-row">
        <mod-tag variant="success">
          <ng-container *ngTemplateOutlet="svg; context: { d: check }" />
          Completed
        </mod-tag>
        <mod-tag variant="error">
          <ng-container *ngTemplateOutlet="svg; context: { d: crossCircle }" />
          Failed
        </mod-tag>
        <mod-tag variant="warning">
          <ng-container *ngTemplateOutlet="svg; context: { d: warning }" />
          Review
        </mod-tag>
      </div>
      <span class="showcase-label">Trailing icon</span>
      <div class="showcase-row">
        <mod-tag variant="info">
          Beta
          <ng-container *ngTemplateOutlet="svg; context: { d: info }" />
        </mod-tag>
        <mod-tag variant="success">
          New
          <ng-container *ngTemplateOutlet="svg; context: { d: bolt }" />
        </mod-tag>
      </div>
      <span class="showcase-label">Both leading and trailing</span>
      <div class="showcase-row">
        <mod-tag variant="neutral">
          <span class="tag__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          Public
          <ng-container *ngTemplateOutlet="svg; context: { d: chevron }" />
        </mod-tag>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Tags with Icon Font"
      description="Using the DGA icon font system instead of inline SVGs. Apply an icon font class directly to a span inside the .tag__icon slot, or use the icon font class on the slot itself."
    >
      <div class="showcase-row">
        @for (t of fontTags; track t.label) {
          <mod-tag [variant]="t.variant" [icon]="t.icon">{{ t.label }}</mod-tag>
        }
      </div>
      <span class="showcase-label">Sizes</span>
      <div class="showcase-row">
        @for (s of sizes; track s.value) {
          <mod-tag variant="success" icon="star" [size]="s.value">{{ s.label }}</mod-tag>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Icon-Only Tags"
      description="Square tags containing only an icon (no label). Useful for compact status indicators in tables and lists. Available across all three sizes and combinable with any variant or shape."
    >
      <span class="showcase-label">Sizes</span>
      <div class="showcase-row">
        @for (s of sizes; track s.value) {
          <mod-tag variant="success" iconOnly icon="checkmark-circle-02" [size]="s.value" aria-label="Success" />
        }
      </div>
      <span class="showcase-label">Variants</span>
      <div class="showcase-row">
        <mod-tag variant="neutral" iconOnly icon="tag-01" aria-label="Tag" />
        <mod-tag variant="success" iconOnly icon="checkmark-circle-02" aria-label="Success" />
        <mod-tag variant="error" iconOnly icon="cancel-circle" aria-label="Error" />
        <mod-tag variant="warning" iconOnly icon="alert-02" aria-label="Warning" />
        <mod-tag variant="info" iconOnly icon="information-circle" aria-label="Info" />
      </div>
      <span class="showcase-label">Rounded + Outline</span>
      <div class="showcase-row">
        <mod-tag variant="success" iconOnly rounded icon="checkmark-circle-02" aria-label="Success" />
        <mod-tag variant="success" iconOnly rounded outline icon="checkmark-circle-02" aria-label="Success" />
        <mod-tag variant="error" iconOnly outline icon="cancel-circle" aria-label="Error" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="On-Color Variant"
      description="For use on dark or colored backgrounds. Uses white at 20% alpha for the fill, white at 60% alpha for the border, and pure white for the label and icon — matching the Figma tag-background-on-color and tag-border-on-color tokens."
      dark
    >
      <span class="showcase-label" style="color: rgba(255,255,255,0.75);">Filled, outline, rounded</span>
      <div class="showcase-row">
        <mod-tag variant="on-color">On-Color</mod-tag>
        <mod-tag variant="on-color" outline>Outline</mod-tag>
        <mod-tag variant="on-color" rounded>Rounded</mod-tag>
        <mod-tag variant="on-color" rounded outline>Rounded + Outline</mod-tag>
      </div>
      <span class="showcase-label" style="color: rgba(255,255,255,0.75);">Sizes</span>
      <div class="showcase-row">
        @for (s of sizes; track s.value) {
          <mod-tag variant="on-color" [size]="s.value">{{ s.label }}</mod-tag>
        }
      </div>
      <span class="showcase-label" style="color: rgba(255,255,255,0.75);">With icon and icon-only</span>
      <div class="showcase-row">
        <mod-tag variant="on-color" icon="star">Featured</mod-tag>
        <mod-tag variant="on-color" outline icon="checkmark-circle-02">Verified</mod-tag>
        <mod-tag variant="on-color" iconOnly icon="star" aria-label="Featured" />
        <mod-tag variant="on-color" iconOnly outline rounded icon="information-circle" aria-label="Info" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="Right-to-left layout support for Arabic and other RTL languages. Icon placement is automatically mirrored based on document direction."
      subtle
    >
      <div class="showcase-row" dir="rtl">
        @for (t of rtlTags; track t.label) {
          <mod-tag [variant]="t.variant" [icon]="t.icon" [rounded]="!!t.rounded">{{ t.label }}</mod-tag>
        }
      </div>
    </demo-showcase>
  `,
})
export class TagsPage {
  protected readonly plus = PLUS;
  protected readonly cross = CROSS;
  protected readonly check =
    'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z';
  protected readonly crossCircle =
    'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';
  protected readonly warning =
    'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z';
  protected readonly info =
    'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z';
  protected readonly bolt =
    'M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z';
  protected readonly chevron =
    'M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z';

  protected readonly sizes: DemoOption<ModTagSize>[] = [
    { value: 'md', label: 'Medium' },
    { value: 'sm', label: 'Small' },
    { value: 'xs', label: 'X-Small' },
  ];
  protected readonly semantic: DemoOption<ModTagVariant>[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
  ];
  protected readonly variants: DemoOption<ModTagVariant>[] = [
    ...this.semantic,
    { value: 'on-color', label: 'On-Color' },
  ];

  protected readonly fontTags: IconTag[] = [
    { variant: 'success', icon: 'checkmark-circle-02', label: 'Verified' },
    { variant: 'error', icon: 'cancel-circle', label: 'Rejected' },
    { variant: 'warning', icon: 'alert-02', label: 'Pending' },
    { variant: 'info', icon: 'information-circle', label: 'Note' },
    { variant: 'neutral', icon: 'star', label: 'Featured' },
  ];
  protected readonly rtlTags: IconTag[] = [
    { variant: 'success', icon: 'checkmark-circle-02', label: 'مكتمل' },
    { variant: 'error', icon: 'cancel-circle', label: 'مرفوض' },
    { variant: 'warning', icon: 'alert-02', label: 'قيد المراجعة' },
    { variant: 'info', icon: 'information-circle', label: 'ملاحظة' },
    { variant: 'neutral', icon: 'star', label: 'مميز', rounded: true },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModTagSize>('sm');
  protected readonly variant = signal<ModTagVariant>('neutral');
  protected readonly outline = signal(false);
  protected readonly rounded = signal(false);
  protected readonly iconOnly = signal(false);
  protected readonly leadIcon = signal(false);
  protected readonly trailIcon = signal(false);

  protected readonly label = computed(() => (this.rtl() ? 'وسم' : 'Tag'));
  protected readonly newLabel = computed(() => (this.rtl() ? 'جديد' : 'New'));
  protected readonly iconSize = computed(() => {
    const size = this.size();
    return size === 'md' ? 20 : size === 'xs' ? 14 : 16;
  });

  // Icon-only is mutually exclusive with lead/trail icon, as in the original demo.
  protected setIconOnly(on: boolean): void {
    this.iconOnly.set(on);
    this.leadIcon.set(false);
    this.trailIcon.set(false);
  }

  protected setLead(on: boolean): void {
    this.leadIcon.set(on);
    this.iconOnly.set(false);
  }

  protected setTrail(on: boolean): void {
    this.trailIcon.set(on);
    this.iconOnly.set(false);
  }

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'neutral' | 'success' | 'error' | 'warning' | 'info' | 'on-color'", default: "'neutral'", description: 'Semantic color. on-color is the white-on-alpha variant for dark or colored backgrounds.' },
    { name: 'size', type: "'md' | 'sm' | 'xs'", default: "'sm'", description: 'Medium 32px (16/24 text), small 24px (12/18 text), x-small 20px (10/14 semibold text).' },
    { name: 'outline', type: 'boolean', default: 'false', description: 'Transparent fill with colored border. Combines with any variant.' },
    { name: 'rounded', type: 'boolean', default: 'false', description: 'Pill shape with fully rounded corners.' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Square tag containing only an icon (no label). Provide an aria-label.' },
    { name: 'icon', type: 'string', default: "''", description: 'Leading font icon name, without the dga-icon- prefix.' },
    { name: 'trailingIcon', type: 'string', default: "''", description: 'Trailing font icon name, without the dga-icon- prefix.' },
    { name: 'content', type: 'projection', description: 'Label text. Inline SVG icons can be projected wrapped in <span class="tag__icon">, before or after the label.' },
  ];
}
