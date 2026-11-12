import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModAccordion, ModAccordionIconPosition, ModAccordionItem, ModAccordionSize } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const ITEMS = {
  en: [
    ['What is the digital services portal?', 'A unified portal for accessing government digital services in the Kingdom.'],
    ['How do I create an account?', 'You can register with the national single sign-on in a few minutes.'],
    ['Is the service free?', 'Yes. All core services are available at no charge.'],
  ],
  ar: [
    ['ما هي بوابة الخدمات الرقمية؟', 'بوابة موحدة للوصول إلى الخدمات الحكومية الرقمية في المملكة.'],
    ['كيف يمكنني إنشاء حساب؟', 'يمكنك التسجيل باستخدام النفاذ الوطني الموحد خلال دقائق.'],
    ['هل الخدمة مجانية؟', 'نعم، جميع الخدمات الأساسية متاحة دون رسوم.'],
  ],
};

@Component({
  selector: 'demo-accordion-page',
  imports: [ModAccordion, ModAccordionItem, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Accordion</h1>
      <p class="content-description">
        Accordions collapse long content into scannable sections that expand on demand. Three sizes, a leading or
        trailing chevron, a flush variant with inset separators, and disabled items. Ported from the DGA library's
        <code>nds-accordion</code> component.
      </p>
    </div>

    <demo-live
      heading="Accordion"
      description="Click a header to expand its content. The body animates to its measured height, exactly like the library behavior."
      [rtl]="rtl()"
    >
      <mod-accordion
        style="max-width: 520px; min-width: 320px;"
        [size]="size()"
        [iconPosition]="icon()"
        [flush]="flush()"
      >
        @for (item of liveItems(); track $index; let i = $index) {
          <mod-accordion-item
            [heading]="item[0]"
            [disabled]="disabled()"
            [expanded]="open()[i]"
            (expandedChange)="setOpen(i, $event)"
          >
            <p>{{ item[1] }}</p>
          </mod-accordion-item>
        }
      </mod-accordion>

      <demo-switch label="RTL" [checked]="rtl()" (checkedChange)="rtl.set($event); collapse()" />
      <demo-select label="Size" [options]="sizes" [value]="size()" (valueChange)="size.set($event); collapse()" />
      <demo-select
        label="Icon alignment"
        [options]="icons"
        [value]="icon()"
        (valueChange)="icon.set($event); collapse()"
      />
      <demo-switch label="Flush" [checked]="flush()" (checkedChange)="flush.set($event); collapse()" />
      <demo-switch label="Disabled" [checked]="disabled()" (checkedChange)="disabled.set($event); collapse()" />
    </demo-live>

    <demo-props
      description="Inputs and models of mod-accordion and mod-accordion-item, mapped from the library's nds-accordion API. Size, iconPosition and flush set on the accordion apply to every item unless the item overrides them."
      [props]="props"
    />

    <demo-showcase
      heading="Default"
      description="Trailing chevron, large density. Click any header to expand it; items operate independently."
      align="stretch"
    >
      <mod-accordion>
        <mod-accordion-item heading="What is the digital services portal?">
          <p>
            A unified portal for accessing government digital services in the Kingdom, built on the DGA design system.
          </p>
        </mod-accordion-item>
        <mod-accordion-item heading="How do I create an account?">
          <p>You can register with the national single sign-on in a few minutes.</p>
        </mod-accordion-item>
        <mod-accordion-item heading="Is the service free?">
          <p>Yes. All core services are available at no charge.</p>
        </mod-accordion-item>
      </mod-accordion>
    </demo-showcase>

    <demo-showcase heading="Sizes" description="Three header densities for different page rhythms." align="stretch">
      <div style="display: flex; flex-direction: column; align-items: stretch; gap: var(--spacing-4xl); width: 100%;">
        <mod-accordion size="lg">
          <mod-accordion-item heading="Large (16px padding)"><p>Body content.</p></mod-accordion-item>
        </mod-accordion>
        <mod-accordion size="md">
          <mod-accordion-item heading="Medium (12 × 16px padding)"><p>Body content.</p></mod-accordion-item>
        </mod-accordion>
        <mod-accordion size="sm">
          <mod-accordion-item heading="Small (8 × 16px padding)"><p>Body content.</p></mod-accordion-item>
        </mod-accordion>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Leading Icon"
      description="The chevron moves before the title and the expanded body indents under it."
      align="stretch"
    >
      <mod-accordion iconPosition="leading">
        <mod-accordion-item heading="Leading chevron">
          <p>The body aligns with the title, indented past the chevron column.</p>
        </mod-accordion-item>
        <mod-accordion-item heading="Second section"><p>More content.</p></mod-accordion-item>
      </mod-accordion>
    </demo-showcase>

    <demo-showcase
      heading="Flush"
      description="Separators stop 16px short of each edge for use inside cards and panels."
      align="stretch"
    >
      <mod-accordion flush>
        <mod-accordion-item heading="First flush section"><p>Body content.</p></mod-accordion-item>
        <mod-accordion-item heading="Second flush section"><p>Body content.</p></mod-accordion-item>
      </mod-accordion>
    </demo-showcase>

    <demo-showcase
      heading="Disabled"
      description="Disabled items gray out and ignore hover, focus, and clicks."
      align="stretch"
    >
      <mod-accordion>
        <mod-accordion-item heading="Disabled section" disabled><p>Not reachable.</p></mod-accordion-item>
        <mod-accordion-item heading="Enabled section"><p>Works as usual.</p></mod-accordion-item>
      </mod-accordion>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="Header order and body indentation mirror in right-to-left layouts."
      align="stretch"
    >
      <div dir="rtl">
        <mod-accordion>
          <mod-accordion-item heading="ما هي بوابة الخدمات الرقمية؟">
            <p>بوابة موحدة للوصول إلى الخدمات الحكومية الرقمية في المملكة.</p>
          </mod-accordion-item>
          <mod-accordion-item heading="كيف يمكنني إنشاء حساب؟">
            <p>يمكنك التسجيل باستخدام النفاذ الوطني الموحد خلال دقائق.</p>
          </mod-accordion-item>
        </mod-accordion>
      </div>
    </demo-showcase>
  `,
})
export class AccordionPage {
  protected readonly sizes: DemoOption<ModAccordionSize>[] = [
    { value: 'lg', label: 'Large' },
    { value: 'md', label: 'Medium' },
    { value: 'sm', label: 'Small' },
  ];
  protected readonly icons: DemoOption<ModAccordionIconPosition>[] = [
    { value: 'trailing', label: 'Trailing' },
    { value: 'leading', label: 'Leading' },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModAccordionSize>('lg');
  protected readonly icon = signal<ModAccordionIconPosition>('trailing');
  protected readonly flush = signal(false);
  protected readonly disabled = signal(false);
  protected readonly open = signal<boolean[]>([false, false, false]);

  protected readonly liveItems = computed(() => (this.rtl() ? ITEMS.ar : ITEMS.en));

  protected setOpen(index: number, expanded: boolean): void {
    this.open.update((list) => list.map((value, i) => (i === index ? expanded : value)));
  }

  /** Changing a control re-renders the original demo collapsed. */
  protected collapse(): void {
    this.open.set([false, false, false]);
  }

  protected readonly props: DemoProp[] = [
    { name: 'mod-accordion · size', type: "'lg' | 'md' | 'sm'", default: "'lg'", description: 'Header padding density: 16px / 12×16px / 8×16px.' },
    { name: 'mod-accordion · iconPosition', type: "'leading' | 'trailing'", default: "'trailing'", description: 'Leading moves the chevron before the title and indents the body under it.' },
    { name: 'mod-accordion · flush', type: 'boolean', default: 'false', description: 'Replaces full-width borders with an inset separator that stops 16px from each edge.' },
    { name: 'mod-accordion · multiple', type: 'boolean', default: 'true', description: 'Allow several items to be open at once. Set to false for single-expand.' },
    { name: 'mod-accordion-item · heading', type: 'string', default: "''", description: 'Header title (16px semibold). Rich content can be projected with the modAccordionHeading attribute.' },
    { name: 'mod-accordion-item · expanded', type: 'model<boolean>', default: 'false', description: 'Expanded: the chevron rotates 180° and the body animates to its measured height.' },
    { name: 'mod-accordion-item · disabled', type: 'boolean', default: 'false', description: 'Grays the item out and ignores interaction.' },
    { name: 'mod-accordion-item · size', type: "'lg' | 'md' | 'sm'", default: 'inherited', description: "Overrides the accordion's size for this item." },
    { name: 'mod-accordion-item · iconPosition', type: "'leading' | 'trailing'", default: 'inherited', description: "Overrides the accordion's iconPosition for this item." },
    { name: 'mod-accordion-item · flush', type: 'boolean', default: 'inherited', description: "Overrides the accordion's flush for this item." },
  ];
}
