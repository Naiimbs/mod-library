import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModSkeleton, ModSkeletonGradient, ModSkeletonShape, ModSkeletonSize } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type SizeOption = ModSkeletonSize | 'none';

@Component({
  selector: 'demo-skeleton-page',
  imports: [ModSkeleton, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Skeleton</h1>
      <p class="content-description">
        Skeletons hold the layout while content loads. Four primitives (line, rectangle, circle, square) with two
        gradient directions and a 2-second opacity pulse, composable into loading patterns for cards, lists, and
        profiles. Ported from the DGA library's <code>mod-skeleton</code> family.
      </p>
    </div>

    <demo-live
      heading="Skeleton"
      description="Placeholders hold the layout while content loads. Pick a primitive and adjust its size, gradient and dimensions."
    >
      <div style="width: 320px; display: flex; justify-content: center;">
        <mod-skeleton
          [shape]="shape()"
          [size]="sizeValue()"
          [gradient]="gradient()"
          [short]="short()"
          [rounded]="rounded()"
          [animated]="animated()"
          [width]="width() || undefined"
          [height]="height() || undefined"
        />
      </div>

      <demo-select label="Shape" [options]="shapes" [(value)]="shape" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="Gradient" [options]="gradients" [(value)]="gradient" />
      <demo-switch label="Short" [(checked)]="short" />
      <demo-switch label="Rounded" [(checked)]="rounded" />
      <demo-switch label="Animated" [(checked)]="animated" />
      <demo-text label="Width (px)" type="number" [(value)]="width" />
      <demo-text label="Height (px)" type="number" [(value)]="height" />
    </demo-live>

    <demo-props
      description="Inputs of mod-skeleton, mapped from the library's mod-line-skeleton, mod-rectangle-skeleton, mod-circle-skeleton, and mod-square-skeleton APIs. The .skeleton-pattern* layout helpers are plain CSS classes."
      [props]="props"
    />

    <demo-showcase
      heading="Shapes"
      description="The four primitives. Lines hold text, rectangles hold fields and buttons, circles hold avatars, squares hold imagery."
    >
      <div class="showcase-row" style="align-items: center; gap: var(--spacing-4xl);">
        <div style="display:flex;flex-direction:column;gap: var(--spacing-lg);">
          <mod-skeleton shape="line" size="lg" />
          <mod-skeleton shape="line" size="sm" />
          <mod-skeleton shape="rectangle" size="md" />
        </div>
      </div>
      <div class="showcase-row" style="align-items: center; gap: var(--spacing-4xl);">
        <mod-skeleton shape="circle" />
        <mod-skeleton shape="circle" width="64" height="64" />
        <mod-skeleton shape="square" />
        <mod-skeleton shape="square" rounded width="120" height="80" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Rectangle Sizes"
      description="Three heights at full width, and the short variant sized for buttons."
      align="flex-start"
    >
      <mod-skeleton shape="rectangle" size="lg" />
      <mod-skeleton shape="rectangle" size="md" />
      <mod-skeleton shape="rectangle" size="sm" />
      <div class="showcase-row" style="justify-content: flex-start;">
        <mod-skeleton shape="rectangle" size="lg" short />
        <mod-skeleton shape="rectangle" size="md" short />
        <mod-skeleton shape="rectangle" size="sm" short />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Gradient Directions"
      description="Type 1 runs light-to-dark; type 2 reverses it. Alternate directions between adjacent placeholders for a subtler texture."
      align="flex-start"
    >
      <mod-skeleton shape="line" size="lg" width="320" />
      <mod-skeleton shape="line" size="lg" gradient="type2" width="320" />
    </demo-showcase>

    <demo-showcase
      heading="Patterns"
      description="Primitives composed into common loading layouts: a profile row, a media card, and an icon list."
    >
      <div class="showcase-row" style="align-items: flex-start; gap: var(--spacing-6xl);">
        <div class="skeleton-pattern">
          <div class="skeleton-pattern__row">
            <mod-skeleton shape="circle" />
            <div class="skeleton-pattern__col">
              <mod-skeleton shape="line" size="sm" width="160" />
              <mod-skeleton shape="line" size="sm" gradient="type2" width="110" />
            </div>
          </div>
        </div>

        <div class="skeleton-pattern">
          <div class="skeleton-pattern__wrapper">
            <mod-skeleton shape="square" width="220" height="120" />
            <div class="skeleton-pattern__lines">
              <mod-skeleton shape="line" size="lg" width="220" />
              <mod-skeleton shape="line" size="sm" gradient="type2" width="220" />
              <mod-skeleton shape="line" size="sm" width="150" />
            </div>
            <mod-skeleton class="skeleton-pattern__last" shape="rectangle" size="md" short />
          </div>
        </div>

        <div class="skeleton-pattern">
          <div style="display:flex;flex-direction:column;gap: var(--spacing-xl);">
            <div class="skeleton-pattern__row">
              <mod-skeleton shape="circle" width="24" height="24" />
              <mod-skeleton shape="line" size="sm" width="140" />
            </div>
            <div class="skeleton-pattern__row">
              <mod-skeleton shape="circle" width="24" height="24" />
              <mod-skeleton shape="line" size="sm" gradient="type2" width="120" />
            </div>
            <div class="skeleton-pattern__row">
              <mod-skeleton shape="circle" width="24" height="24" />
              <mod-skeleton shape="line" size="sm" width="130" />
            </div>
          </div>
        </div>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Reduced Motion"
      description="When the user prefers reduced motion, the pulse stops and skeletons render as static placeholders. No extra classes needed."
      align="flex-start"
    >
      <mod-skeleton shape="line" size="lg" width="320" [animated]="false" />
    </demo-showcase>
  `,
})
export class SkeletonPage {
  protected readonly shapes: DemoOption<ModSkeletonShape>[] = [
    { value: 'line', label: 'Line' },
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
  ];
  protected readonly sizes: DemoOption<SizeOption>[] = [
    { value: 'none', label: 'Default' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ];
  protected readonly gradients: DemoOption<ModSkeletonGradient>[] = [
    { value: 'type1', label: 'Type 1' },
    { value: 'type2', label: 'Type 2' },
  ];

  protected readonly shape = signal<ModSkeletonShape>('line');
  protected readonly size = signal<SizeOption>('lg');
  protected readonly gradient = signal<ModSkeletonGradient>('type1');
  protected readonly short = signal(false);
  protected readonly rounded = signal(false);
  protected readonly animated = signal(true);
  protected readonly width = signal('');
  protected readonly height = signal('');

  protected readonly sizeValue = computed<ModSkeletonSize | undefined>(() => {
    const size = this.size();
    return size === 'none' ? undefined : size;
  });

  protected readonly props: DemoProp[] = [
    { name: 'shape', type: "'line' | 'rectangle' | 'circle' | 'square'", default: "'line'", description: 'The primitive: lines hold text, rectangles fields and buttons, circles avatars, squares imagery.' },
    { name: 'size', type: "'sm' | 'md' | 'lg' | undefined", default: 'undefined', description: 'Height step. Lines support sm (14px) and lg (22px); rectangles sm (24px), md (32px) and lg (40px).' },
    { name: 'gradient', type: "'type1' | 'type2'", default: "'type1'", description: 'Gradient direction: type1 runs light-to-dark, type2 reverses it.' },
    { name: 'short', type: 'boolean', default: 'false', description: 'Short, button-sized rectangle. Requires a size.' },
    { name: 'rounded', type: 'boolean', default: 'false', description: 'Larger corner radius for squares.' },
    { name: 'animated', type: 'boolean', default: 'true', description: 'The 2-second opacity pulse. Also stops automatically with prefers-reduced-motion.' },
    { name: 'width', type: 'string | number', default: 'undefined', description: 'Width override. A number (or numeric string) is treated as pixels.' },
    { name: 'height', type: 'string | number', default: 'undefined', description: 'Height override. A number (or numeric string) is treated as pixels.' },
  ];
}
