import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  createComponent,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

export type ModTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type ModTooltipVariant = 'dark' | 'light';

let nextId = 0;

/**
 * Static DGA tooltip element. Place it inside a `.tooltip-wrapper` next to
 * its trigger; the source CSS shows it on wrapper hover, or set `visible`.
 *
 *   <span class="tooltip-wrapper">
 *     <button mod-button aria-describedby="tip">Save</button>
 *     <mod-tooltip id="tip" position="bottom">Saves the draft</mod-tooltip>
 *   </span>
 *
 * For most cases prefer the `[modTooltip]` directive, which also handles
 * keyboard focus, Escape and `aria-describedby`.
 */
@Component({
  selector: 'mod-tooltip',
  template: '<ng-content />',
  styleUrl: './tooltip.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tooltip',
    '[class]': 'classes()',
  },
})
export class ModTooltip {
  readonly position = input<ModTooltipPosition>('top');
  readonly variant = input<ModTooltipVariant>('dark');
  /** Wraps long text (max-width 200px, centred). */
  readonly multiline = input(false, { transform: booleanAttribute });
  /** Forces the tooltip visible regardless of hover. */
  readonly visible = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const list = ['tooltip', `tooltip--${this.position()}`];
    if (this.variant() === 'light') list.push('tooltip--light');
    if (this.multiline()) list.push('tooltip--multiline');
    if (this.visible()) list.push('tooltip--visible');
    return list.join(' ');
  });
}

/**
 * Adds a DGA tooltip to any element. Shown on hover and keyboard focus,
 * hidden on leave, blur and Escape, and linked with `aria-describedby`.
 *
 *   <button mod-button modTooltip="Saves the draft" tooltipPosition="bottom">Save</button>
 *
 * The tooltip markup (`.tooltip-wrapper` > `.tooltip`) is rendered in
 * `<body>` inside a fixed wrapper that mirrors the trigger's rectangle, so
 * the source positioning CSS applies and the tooltip is never clipped by an
 * `overflow: hidden` ancestor.
 */
@Directive({
  selector: '[modTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
  },
})
export class ModTooltipDirective {
  /** Tooltip text. An empty string disables the tooltip. */
  readonly text = input<string>('', { alias: 'modTooltip' });
  readonly position = input<ModTooltipPosition>('top', { alias: 'tooltipPosition' });
  readonly variant = input<ModTooltipVariant>('dark', { alias: 'tooltipVariant' });
  readonly multiline = input(false, { alias: 'tooltipMultiline', transform: booleanAttribute });
  readonly disabled = input(false, { alias: 'tooltipDisabled', transform: booleanAttribute });
  /** Delay before showing, in milliseconds. */
  readonly showDelay = input(0, { alias: 'tooltipShowDelay', transform: numberAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private readonly tooltipId = `mod-tooltip-${nextId++}`;
  private wrapper: HTMLElement | null = null;
  private textNode: Text | null = null;
  private tooltipRef: ComponentRef<ModTooltip> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly reposition = (): void => this.updatePosition();
  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.hide();
  };

  constructor() {
    // Keep an open tooltip in sync with input changes.
    effect(() => {
      const text = this.text();
      const position = this.position();
      const variant = this.variant();
      const multiline = this.multiline();
      const off = this.disabled() || !text;
      if (!this.tooltipRef) return;
      if (off) {
        this.hide();
        return;
      }
      if (this.textNode) this.textNode.data = text;
      this.tooltipRef.setInput('position', position);
      this.tooltipRef.setInput('variant', variant);
      this.tooltipRef.setInput('multiline', multiline);
    });

    inject(DestroyRef).onDestroy(() => this.hide());
  }

  /** Shows the tooltip (after `tooltipShowDelay`). */
  show(): void {
    if (this.tooltipRef || this.showTimer !== undefined) return;
    if (this.disabled() || !this.text()) return;
    const delay = this.showDelay();
    if (delay > 0) {
      this.showTimer = setTimeout(() => {
        this.showTimer = undefined;
        this.open();
      }, delay);
    } else {
      this.open();
    }
  }

  /** Hides the tooltip immediately. */
  hide(): void {
    if (this.showTimer !== undefined) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
    const ref = this.tooltipRef;
    if (!ref) return;
    this.tooltipRef = null;

    const view = this.document.defaultView;
    view?.removeEventListener('scroll', this.reposition, true);
    view?.removeEventListener('resize', this.reposition);
    this.document.removeEventListener('keydown', this.onDocumentKeydown, true);

    this.setDescribedBy(false);
    this.appRef.detachView(ref.hostView);
    ref.destroy();
    this.wrapper?.remove();
    this.wrapper = null;
    this.textNode = null;
  }

  private open(): void {
    const doc = this.document;
    const view = doc.defaultView;
    if (!view || !doc.body || !this.host.isConnected) return;

    const wrapper = doc.createElement('span');
    wrapper.className = 'tooltip-wrapper tooltip-wrapper--overlay';
    wrapper.dir = view.getComputedStyle(this.host).direction;

    const textNode = doc.createTextNode(this.text());
    const ref = createComponent(ModTooltip, {
      environmentInjector: this.environmentInjector,
      projectableNodes: [[textNode]],
    });
    ref.setInput('position', this.position());
    ref.setInput('variant', this.variant());
    ref.setInput('multiline', this.multiline());
    ref.setInput('visible', true);
    const tooltipEl = ref.location.nativeElement as HTMLElement;
    tooltipEl.id = this.tooltipId;

    wrapper.appendChild(tooltipEl);
    doc.body.appendChild(wrapper);
    this.appRef.attachView(ref.hostView);
    ref.changeDetectorRef.detectChanges();

    this.wrapper = wrapper;
    this.textNode = textNode;
    this.tooltipRef = ref;

    this.updatePosition();
    this.setDescribedBy(true);
    view.addEventListener('scroll', this.reposition, true);
    view.addEventListener('resize', this.reposition);
    doc.addEventListener('keydown', this.onDocumentKeydown, true);
  }

  /** Makes the fixed wrapper cover the trigger's current rectangle. */
  private updatePosition(): void {
    const wrapper = this.wrapper;
    if (!wrapper) return;
    const rect = this.host.getBoundingClientRect();
    wrapper.style.top = `${rect.top}px`;
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;
  }

  private setDescribedBy(add: boolean): void {
    const ids = (this.host.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && id !== this.tooltipId);
    if (add) ids.push(this.tooltipId);
    if (ids.length) {
      this.host.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this.host.removeAttribute('aria-describedby');
    }
  }
}
