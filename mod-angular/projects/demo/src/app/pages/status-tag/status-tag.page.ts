import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModStatusTag,
  ModStatusTagAppearance,
  ModStatusTagSize,
  ModStatusTagVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-status-tag-page',
  imports: [ModStatusTag, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Status Tag</h1>
      <p class="content-description">
        Pill-shaped indicators that surface the state of an item with a colored dot and a short label. Five semantic
        variants (Neutral, Info, Success, Warning, Error), three sizes (Medium, Small, X-Small), and three styles
        (Subtle, Inverted, Ghost). Modeled on the Figma source frame 5698:52957.
      </p>
    </div>

    <demo-live
      heading="Status Tag"
      description="A status tag pairs a colored dot with a short label to communicate the current state of an item — for example, a record's review status or a workflow stage."
      [rtl]="rtl()"
    >
      <mod-status-tag [variant]="variant()" [size]="size()" [appearance]="appearance()">{{ label() }}</mod-status-tag>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="Style" [options]="appearances" [(value)]="appearance" />
      <demo-select label="Variant" [options]="variants" [(value)]="variant" />
    </demo-live>

    <demo-props description="All available inputs for configuring the mod-status-tag component." [props]="props" />

    <demo-showcase
      heading="Variants"
      description="The five semantic variants shown in the default Subtle style. Variant choice communicates meaning — Neutral for unset, Info for information, Success for positive states, Warning for caution, Error for failure."
    >
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <mod-status-tag [variant]="v.value">{{ v.label }}</mod-status-tag>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Sizes"
      description="Three sizes matching the Figma typography scale. Medium (32px, 16/24 medium), Small (24px, 14/20 medium), and X-Small (20px, 10/14 medium — dot shrinks from 8px to 6px)."
    >
      <div class="showcase-row">
        <mod-status-tag variant="success" size="md">Medium (32px)</mod-status-tag>
        <mod-status-tag variant="success" size="sm">Small (24px)</mod-status-tag>
        <mod-status-tag variant="success" size="xs">X-Small (20px)</mod-status-tag>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Subtle Style"
      description="Light tinted background paired with darker colored text. The default presentation — quiet enough to use anywhere in dense UIs while still carrying semantic color."
    >
      @for (s of sizes; track s.value) {
        <span class="showcase-label">{{ s.label }}</span>
        <div class="showcase-row">
          @for (v of variants; track v.value) {
            <mod-status-tag appearance="subtle" [size]="s.value" [variant]="v.value">Status</mod-status-tag>
          }
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="Inverted Style"
      description="Solid colored background with white text and a translucent white dot (rgba(255,255,255,0.6) per the Figma tag-dot token). Use for high-emphasis states such as a primary success in a header card."
    >
      @for (s of sizes; track s.value) {
        <span class="showcase-label">{{ s.label }}</span>
        <div class="showcase-row">
          @for (v of variants; track v.value) {
            <mod-status-tag appearance="inverted" [size]="s.value" [variant]="v.value">Status</mod-status-tag>
          }
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="Ghost Style"
      description="No background, no padding — just the colored dot and label. Use inline with body text or in dense tables where any background tint would be visual noise."
    >
      @for (s of sizes; track s.value) {
        <span class="showcase-label">{{ s.label }}</span>
        <div class="showcase-row">
          @for (v of variants; track v.value) {
            <mod-status-tag appearance="ghost" [size]="s.value" [variant]="v.value">Status</mod-status-tag>
          }
        </div>
      }
    </demo-showcase>

    <demo-showcase
      heading="Style Comparison"
      description="The same Success status rendered in all three styles side by side, so the visual weight differences are easy to compare at a glance."
    >
      <div class="showcase-row">
        @for (a of appearances; track a.value) {
          <mod-status-tag variant="success" [appearance]="a.value">{{ a.label }}</mod-status-tag>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="Right-to-left layout support for Arabic and other RTL languages. The dot placement automatically flips to the trailing edge."
      subtle
    >
      <div dir="rtl" style="display: contents">
        @for (a of appearances; track a.value) {
          <span class="showcase-label">{{ a.label }}</span>
          <div class="showcase-row">
            @for (v of variants; track v.value) {
              <mod-status-tag [appearance]="a.value" [variant]="v.value">حالة</mod-status-tag>
            }
          </div>
        }
      </div>
    </demo-showcase>
  `,
})
export class StatusTagPage {
  protected readonly sizes: DemoOption<ModStatusTagSize>[] = [
    { value: 'md', label: 'Medium' },
    { value: 'sm', label: 'Small' },
    { value: 'xs', label: 'X-Small' },
  ];
  protected readonly appearances: DemoOption<ModStatusTagAppearance>[] = [
    { value: 'subtle', label: 'Subtle' },
    { value: 'inverted', label: 'Inverted' },
    { value: 'ghost', label: 'Ghost' },
  ];
  protected readonly variants: DemoOption<ModStatusTagVariant>[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModStatusTagSize>('md');
  protected readonly appearance = signal<ModStatusTagAppearance>('subtle');
  protected readonly variant = signal<ModStatusTagVariant>('success');

  protected readonly label = computed(() => (this.rtl() ? 'حالة' : 'Status'));

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'neutral' | 'info' | 'success' | 'warning' | 'error'", default: "'neutral'", description: 'Semantic color of the dot, label and background.' },
    { name: 'size', type: "'md' | 'sm' | 'xs'", default: "'md'", description: 'Medium 32px, small 24px, x-small 20px (dot shrinks from 8px to 6px).' },
    { name: 'appearance', type: "'subtle' | 'inverted' | 'ghost'", default: "'subtle'", description: 'Style: light tinted background, solid colored background, or no background.' },
    { name: 'statusLabel', type: 'string', default: "''", description: 'Optional screen-reader-only prefix rendered before the label (e.g. "Status:").' },
    { name: 'content', type: 'projection', description: 'The visible label text.' },
  ];
}
