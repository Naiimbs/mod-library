import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModIcon, ModLink, ModLinkSize, ModLinkUnderline, ModLinkVariant } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-links-page',
  imports: [ModLink, ModIcon, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Links</h1>
      <p class="content-description">Link components for navigation.</p>
    </div>

    <demo-live
      heading="Link"
      description="Links navigate to another page or resource. Switch the style, underline and size to explore the variants."
      [rtl]="rtl()"
    >
      <a
        mod-link
        href="#"
        [variant]="variant()"
        [underline]="underline()"
        [size]="size()"
        [external]="external()"
        [withIcon]="leadIcon() || trailIcon()"
        [disabled]="state() === 'disabled'"
        (click)="$event.preventDefault()"
      >
        @if (leadIcon()) {
          <mod-icon [name]="rtl() ? 'arrow-right-01' : 'arrow-left-01'" [size]="16" />
        }
        {{ label() }}
        @if (trailIcon()) {
          <mod-icon [name]="rtl() ? 'arrow-left-01' : 'arrow-right-01'" [size]="16" />
        }
      </a>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="State" [options]="states" [(value)]="state" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-select label="Underline" [options]="underlines" [(value)]="underline" />
      <demo-switch label="External" [(checked)]="external" />
      <demo-switch label="Lead Icon" [(checked)]="leadIcon" />
      <demo-switch label="Trail Icon" [(checked)]="trailIcon" />
    </demo-live>

    <demo-props
      description="Inputs of the mod-link component. Apply it to a native anchor: <a mod-link href=&quot;…&quot;>."
      [props]="props"
    />

    <demo-showcase heading="Link Styles">
      <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); width: 100%;">
        <a mod-link href="#" (click)="$event.preventDefault()">Primary Link</a>
        <a mod-link underline="always" href="#" (click)="$event.preventDefault()">Underlined Link</a>
        <a mod-link variant="muted" href="#" (click)="$event.preventDefault()">Secondary Link</a>
      </div>
    </demo-showcase>

    <demo-showcase heading="Variants" description="Four color variants: primary, secondary, muted and danger.">
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <a mod-link [variant]="v.value" href="#" (click)="$event.preventDefault()">{{ v.label }} link</a>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Underline" description="No underline, always underlined, or underlined on hover.">
      <div class="showcase-row">
        @for (u of underlines; track u.value) {
          <a mod-link [underline]="u.value" href="#" (click)="$event.preventDefault()">{{ u.label }}</a>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Sizes" description="Small, medium (inherits the surrounding font size) and large.">
      <div class="showcase-row">
        @for (s of sizes; track s.value) {
          <a mod-link [size]="s.value" href="#" (click)="$event.preventDefault()">{{ s.label }} link</a>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Icon, external and disabled">
      <div class="showcase-row">
        <a mod-link withIcon href="#" (click)="$event.preventDefault()">
          <mod-icon name="arrow-left-01" [size]="16" /> Back
        </a>
        <a mod-link withIcon href="#" (click)="$event.preventDefault()">
          Continue <mod-icon name="arrow-right-01" [size]="16" />
        </a>
        <a mod-link external underline="hover" href="https://dga.gov.sa" target="_blank" rel="noopener noreferrer">
          External link
        </a>
        <a mod-link disabled underline="always" href="#">Disabled link</a>
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL Support" description="The external glyph mirrors in right-to-left layouts." subtle>
      <div class="showcase-row" dir="rtl">
        <a mod-link href="#" (click)="$event.preventDefault()">رابط أساسي</a>
        <a mod-link underline="always" href="#" (click)="$event.preventDefault()">رابط مسطر</a>
        <a mod-link external href="#" (click)="$event.preventDefault()">رابط خارجي</a>
      </div>
    </demo-showcase>
  `,
})
export class LinksPage {
  protected readonly variants: DemoOption<ModLinkVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'muted', label: 'Muted' },
    { value: 'danger', label: 'Danger' },
  ];
  protected readonly underlines: DemoOption<ModLinkUnderline>[] = [
    { value: 'none', label: 'None' },
    { value: 'always', label: 'Always' },
    { value: 'hover', label: 'On hover' },
  ];
  protected readonly sizes: DemoOption<ModLinkSize>[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ];
  protected readonly states: DemoOption<'default' | 'disabled'>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<ModLinkVariant>('primary');
  protected readonly underline = signal<ModLinkUnderline>('none');
  protected readonly size = signal<ModLinkSize>('md');
  protected readonly state = signal<'default' | 'disabled'>('default');
  protected readonly external = signal(false);
  protected readonly leadIcon = signal(false);
  protected readonly trailIcon = signal(false);

  protected readonly label = computed(() => (this.rtl() ? 'رابط' : 'Link'));

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'primary' | 'secondary' | 'muted' | 'danger'", default: "'primary'", description: 'Color of the link.' },
    { name: 'underline', type: "'none' | 'always' | 'hover'", default: "'none'", description: 'Underline mode: never, always, or only on hover.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Font size. Medium inherits the surrounding font size.' },
    { name: 'external', type: 'boolean', default: 'false', description: 'Appends the external-link glyph (mirrored in RTL).' },
    { name: 'withIcon', type: 'boolean', default: 'false', description: 'Inline-flex layout with a gap, for links that contain a leading or trailing icon.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Grays the link out, removes it from the tab order and blocks activation.' },
    { name: 'href', type: 'native attribute', description: 'Native href of the anchor element; target and rel work as usual.' },
  ];
}
