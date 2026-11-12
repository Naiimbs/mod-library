import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModRating, ModRatingSize } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-rating-page',
  imports: [ModRating, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Rating</h1>
      <p class="content-description">
        Ratings collect or display a score out of five stars. Three sizes, half-star precision, a hover preview,
        a brand-colored variant, and a read-only display mode. Ported from the DGA library's
        <code>mod-rating</code> component; stars come from the DGA icon font.
      </p>
    </div>

    <demo-live
      heading="Rating"
      description="Click a star to rate it. Clicking the first half of a star gives a half rating; hovering previews the score."
      [rtl]="rtl()"
    >
      <mod-rating [(value)]="value" [size]="size()" [brand]="brand()" [readonly]="readonly()" />

      <demo-switch label="RTL" [checked]="rtl()" (checkedChange)="rtl.set($event); reset()" />
      <demo-select label="Size" [options]="sizes" [value]="size()" (valueChange)="size.set($event); reset()" />
      <demo-switch label="Brand color" [checked]="brand()" (checkedChange)="brand.set($event); reset()" />
      <demo-switch label="Read-only" [checked]="readonly()" (checkedChange)="readonly.set($event); reset()" />
    </demo-live>

    <demo-props
      description="Inputs and models of the mod-rating component. Changing a control in the live demo resets the value to 3.5."
      [props]="props"
    />

    <demo-showcase heading="Sizes" description="Three star sizes; the value here is 3.5 to show a half fill.">
      <div class="showcase-row" style="align-items: center; gap: var(--spacing-5xl);">
        <mod-rating size="sm" [value]="3.5" />
        <mod-rating size="md" [value]="3.5" />
        <mod-rating size="lg" [value]="3.5" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Colors & Read-only"
      description="Gold is the default; the brand variant uses Saudi green. Read-only ratings display a fixed score."
    >
      <div class="showcase-row" style="align-items: center; gap: var(--spacing-5xl);">
        <mod-rating [value]="4" />
        <mod-rating brand [value]="4" />
        <mod-rating readonly [value]="2.5" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="Stars fill from the right and half-star clicks use the star's right half."
    >
      <div dir="rtl">
        <mod-rating [value]="3.5" />
      </div>
    </demo-showcase>
  `,
})
export class RatingPage {
  protected readonly sizes: DemoOption<ModRatingSize>[] = [
    { value: 'sm', label: 'Small (24px)' },
    { value: 'md', label: 'Medium (32px)' },
    { value: 'lg', label: 'Large (48px)' },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModRatingSize>('md');
  protected readonly brand = signal(false);
  protected readonly readonly = signal(false);
  protected readonly value = signal(3.5);

  /** Changing a control resets the value to 3.5, as in the original demo. */
  protected reset(): void {
    this.value.set(3.5);
  }

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'number (model)', default: '0', description: 'The committed score, in half-star steps. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'max', type: 'number', default: '5', description: 'Number of stars.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Star sizes 24 / 32 / 48px.' },
    { name: 'brand', type: 'boolean', default: 'false', description: 'Saudi green stars instead of the default gold.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Display-only: no hover preview, clicks ignored.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the star buttons.' },
    { name: 'allowHalf', type: 'boolean', default: 'true', description: 'Clicking the start half of a star gives a half rating.' },
    { name: 'label', type: '(value: number, max: number) => string', default: "'3.5 out of 5 stars'", description: 'Accessible label of the whole rating.' },
    { name: 'starLabel', type: '(star: number, max: number) => string', default: "'1 of 5'", description: 'Accessible label of each star button.' },
  ];
}
