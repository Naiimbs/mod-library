import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

export type ModAccordionSize = 'lg' | 'md' | 'sm';
export type ModAccordionIconPosition = 'leading' | 'trailing';

let nextAccordionId = 0;

/**
 * DGA accordion container.
 *
 *   <mod-accordion size="md" [multiple]="false">
 *     <mod-accordion-item heading="Question?">Answer.</mod-accordion-item>
 *   </mod-accordion>
 *
 * `size`, `iconPosition` and `flush` apply to every item unless the item
 * overrides them.
 */
@Component({
  selector: 'mod-accordion',
  template: '<ng-content />',
  styleUrl: './accordion.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'accordion' },
})
export class ModAccordion {
  readonly size = input<ModAccordionSize>('lg');
  readonly iconPosition = input<ModAccordionIconPosition>('trailing');
  /** Inset ("cut") separators. */
  readonly flush = input(false, { transform: booleanAttribute });
  /** Allow several items to be open at once (source behaviour). Set to false for single-expand. */
  readonly multiple = input(true, { transform: booleanAttribute });

  // forwardRef: ModAccordionItem is declared further down this file. A direct reference fails with
  // "Cannot access 'ModAccordionItem' before initialization" where the package is loaded unlinked (unit tests).
  private readonly items = contentChildren(forwardRef(() => ModAccordionItem));

  /** @internal Called by an item when the user opens it. */
  itemOpened(opened: ModAccordionItem): void {
    if (this.multiple()) return;
    for (const item of this.items()) {
      if (item !== opened && item.expanded()) item.expanded.set(false);
    }
  }
}

/**
 * One collapsible section. The projected content is the body; the header text
 * comes from `heading`, or project rich content with the `modAccordionHeading`
 * attribute.
 */
@Component({
  selector: 'mod-accordion-item',
  templateUrl: './accordion-item.html',
  styleUrl: './accordion.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class ModAccordionItem {
  readonly heading = input('');
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Overrides the accordion's `size`. */
  readonly size = input<ModAccordionSize | undefined>(undefined);
  /** Overrides the accordion's `iconPosition`. */
  readonly iconPosition = input<ModAccordionIconPosition | undefined>(undefined);
  /** Overrides the accordion's `flush`. */
  readonly flush = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  private readonly accordion = inject(ModAccordion, { optional: true });
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  private readonly uid = nextAccordionId++;
  protected readonly headerId = `mod-accordion-header-${this.uid}`;
  protected readonly bodyId = `mod-accordion-body-${this.uid}`;

  protected readonly leading = computed(
    () => (this.iconPosition() ?? this.accordion?.iconPosition() ?? 'trailing') === 'leading',
  );

  protected readonly classes = computed(() => {
    const list = ['accordion-item', `accordion-item--${this.size() ?? this.accordion?.size() ?? 'lg'}`];
    if (this.leading()) list.push('accordion-item--icon-leading');
    if (this.flush() ?? this.accordion?.flush() ?? false) list.push('accordion-item--flush');
    if (this.disabled()) list.push('disabled');
    if (this.expanded()) list.push('active');
    return list.join(' ');
  });

  constructor() {
    // As in the source: the body animates max-height to scrollHeight + 24
    // (the expanded bottom padding).
    afterRenderEffect(() => {
      const body = this.body().nativeElement;
      body.style.maxHeight = this.expanded() ? `${body.scrollHeight + 24}px` : '';
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.expanded();
    this.expanded.set(next);
    if (next) this.accordion?.itemOpened(this);
  }
}
