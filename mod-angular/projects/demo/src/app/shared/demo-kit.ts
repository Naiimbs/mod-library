import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';

/**
 * Building blocks that reproduce the original docs-site page structure
 * (design-system/components/<name>/<name>.html): the "Live demo" card with a
 * preview canvas and a controls sidebar, showcase sections and the props table.
 * They render the original markup and class names; the styles are in
 * projects/demo/src/docs.css (copied from the original css/base.css).
 */

let nextId = 0;

export interface DemoOption<T = string> {
  value: T;
  label: string;
}

/** Live demo card: default content is the canvas, controls go in the sidebar. */
@Component({
  selector: 'demo-live',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // text-align: an `align="center"` attribute on the host would otherwise centre the headings.
  host: { style: 'display: block; text-align: start' },
  template: `
    <h2 class="live-demo__heading">Live demo</h2>
    <div class="live-demo">
      <div class="live-demo__body">
        <div
          class="live-demo__canvas"
          [class.live-demo__canvas--dark]="dark()"
          [attr.dir]="rtl() ? 'rtl' : null"
          [attr.lang]="rtl() ? 'ar' : null"
          [style.align-items]="align()"
          [style.justify-content]="justify()"
        >
          <ng-content />
        </div>
        <div class="live-demo__sidebar">
          <div class="live-demo__sidebar-header">
            <h3 class="live-demo__sidebar-title">{{ heading() }}</h3>
            @if (description()) {
              <p class="live-demo__sidebar-desc">{{ description() }}</p>
            }
          </div>
          <ng-content select="demo-select, demo-switch, demo-text, [demoControl]" />
        </div>
      </div>
      <div class="live-demo__footer">
        This live demo contains only a preview of functionality and styles available for this component.
      </div>
    </div>
  `,
})
export class DemoLive {
  /** Sidebar title (component name). */
  readonly heading = input.required<string>();
  readonly description = input('');
  /** Dark canvas, for on-color variants. */
  readonly dark = input(false, { transform: booleanAttribute });
  /** Sets dir="rtl" on the canvas only, like the original RTL switch. */
  readonly rtl = input(false, { transform: booleanAttribute });
  /** Optional canvas alignment overrides (CSS values). */
  readonly align = input<string | null>(null);
  readonly justify = input<string | null>(null);
}

/** Sidebar row with a select. */
@Component({
  selector: 'demo-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'live-demo__sidebar-row' },
  template: `
    <label class="live-demo__sidebar-label" [attr.for]="id">{{ label() }}</label>
    <select
      class="live-demo__sidebar-select"
      [id]="id"
      [disabled]="disabled()"
      (change)="onChange($any($event.target).selectedIndex)"
    >
      @for (o of normalized(); track $index) {
        <option [selected]="o.value === value()">{{ o.label }}</option>
      }
    </select>
  `,
})
export class DemoSelect<T = string> {
  protected readonly id = `demo-select-${nextId++}`;
  readonly label = input.required<string>();
  /** Options as `{ value, label }` or plain strings (label is derived). */
  readonly options = input.required<readonly (DemoOption<T> | T)[]>();
  readonly value = model.required<T>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly normalized = computed<DemoOption<T>[]>(() =>
    this.options().map((o) =>
      typeof o === 'object' && o !== null && 'value' in o && 'label' in o
        ? (o as DemoOption<T>)
        : { value: o as T, label: toLabel(String(o)) },
    ),
  );

  protected onChange(index: number): void {
    const option = this.normalized()[index];
    if (option) this.value.set(option.value);
  }
}

/** Sidebar row with an on/off switch. */
@Component({
  selector: 'demo-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'live-demo__sidebar-row' },
  template: `
    <label class="live-demo__sidebar-label" [id]="id">{{ label() }}</label>
    <button
      class="live-demo__switch"
      type="button"
      role="switch"
      [class.active]="checked()"
      [attr.aria-checked]="checked()"
      [attr.aria-labelledby]="id"
      [disabled]="disabled()"
      (click)="checked.set(!checked())"
    >
      <span class="live-demo__switch-thumb"></span>
    </button>
  `,
})
export class DemoSwitch {
  protected readonly id = `demo-switch-${nextId++}`;
  readonly label = input.required<string>();
  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
}

/** Sidebar row with a free-text (or number) field. */
@Component({
  selector: 'demo-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'live-demo__sidebar-row' },
  template: `
    <label class="live-demo__sidebar-label" [attr.for]="id">{{ label() }}</label>
    <input
      class="live-demo__sidebar-select"
      style="background-image: none; padding-inline-end: var(--spacing-md)"
      [id]="id"
      [type]="type()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
    />
  `,
})
export class DemoText {
  protected readonly id = `demo-text-${nextId++}`;
  readonly label = input.required<string>();
  readonly type = input<'text' | 'number'>('text');
  readonly value = model('');
}

/** Showcase section card: title, description, divider and a preview area. */
@Component({
  selector: 'demo-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'showcase-section', style: 'display: block' },
  template: `
    <div class="showcase-header">
      <h2 class="showcase-title">{{ heading() }}</h2>
      @if (description()) {
        <p class="showcase-description">{{ description() }}</p>
      }
    </div>
    <div class="showcase-divider"></div>
    @if (bare()) {
      <div style="padding: var(--spacing-3xl) var(--spacing-4xl); overflow-x: auto;">
        <ng-content select="[bare]" />
      </div>
    } @else {
      <div
        class="showcase-preview"
        [class.showcase-preview--dark]="dark()"
        [class.showcase-preview--subtle]="subtle()"
        [style.align-items]="align()"
      >
        <ng-content />
      </div>
    }
  `,
})
export class DemoShowcase {
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly dark = input(false, { transform: booleanAttribute });
  readonly subtle = input(false, { transform: booleanAttribute });
  /** Skip the centered preview wrapper; project content marked with `bare`. */
  readonly bare = input(false, { transform: booleanAttribute });
  /** CSS align-items for the preview (default: center). */
  readonly align = input<string | null>(null);
}

export interface DemoProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** "Props / Configuration" card listing the Angular inputs, outputs and models. */
@Component({
  selector: 'demo-props',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'showcase-section', style: 'display: block' },
  template: `
    <div class="showcase-header">
      <h2 class="showcase-title">{{ heading() }}</h2>
      @if (description()) {
        <p class="showcase-description">{{ description() }}</p>
      }
    </div>
    <div class="showcase-divider"></div>
    <div style="padding: var(--spacing-3xl) var(--spacing-4xl); overflow-x: auto;">
      <table class="props-table">
        <thead>
          <tr>
            <th>Input / Output</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          @for (p of props(); track p.name) {
            <tr>
              <td><code>{{ p.name }}</code></td>
              <td><code>{{ p.type }}</code></td>
              <td>
                @if (p.default) {
                  <code>{{ p.default }}</code>
                } @else {
                  —
                }
              </td>
              <td>{{ p.description }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DemoProps {
  readonly heading = input('Props / Configuration');
  readonly description = input('');
  readonly props = input.required<readonly DemoProp[]>();
}

/** Everything a page usually needs, for the component `imports` array. */
export const DEMO_KIT = [DemoLive, DemoSelect, DemoSwitch, DemoText, DemoShowcase, DemoProps] as const;

function toLabel(value: string): string {
  return value.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
