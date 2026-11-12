import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type ModErrorPageAlign = 'center' | 'start';

/** Marks the illustration / media of a `<mod-error-page>` (shown beside the text when `split`). */
@Directive({ selector: '[modErrorMedia]' })
export class ModErrorMedia {}

/** Marks a block of helpful links shown under the actions of a `<mod-error-page>`. */
@Directive({ selector: '[modErrorLinks]', host: { class: 'error-page__links' } })
export class ModErrorLinks {}

/**
 * Error / empty-state section for 404, 403, 500 and similar pages.
 *
 *   <mod-error-page code="404" heading="Page not found"
 *                   description="The page you are looking for does not exist or was moved.">
 *     <a mod-button href="/">Back to home</a>
 *     <button mod-button variant="secondary-outline" (click)="back()">Go back</button>
 *   </mod-error-page>
 *
 * Default content is the actions row. Add an element marked `modErrorMedia`
 * for an illustration and `modErrorLinks` for a list of helpful links.
 * The section fills the viewport height when `fullHeight` is set; otherwise
 * it takes the height of its content.
 */
@Component({
  selector: 'mod-error-page',
  template: `
    <div [class]="classes()">
    <div class="error-page__body">
      @if (code()) {
        <p class="error-page__code">{{ code() }}</p>
      }
      <h1 class="error-page__title">{{ heading() }}</h1>
      @if (description()) {
        <p class="error-page__text">{{ description() }}</p>
      }
      <div class="error-page__actions"><ng-content /></div>
      <ng-content select="[modErrorLinks]" />
    </div>
    <div class="error-page__media"><ng-content select="[modErrorMedia]" /></div>
    </div>
  `,
  styleUrl: './error-page.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModErrorPage {
  /** Short status shown above the title, e.g. "404" or "404 error". */
  readonly code = input('');
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly align = input<ModErrorPageAlign>('center');
  /** Text on the start side and the media on the end side (stacks on narrow containers). */
  readonly split = input(false, { transform: booleanAttribute });
  /** Renders the code as a large watermark number instead of a small label. */
  readonly largeCode = input(false, { transform: booleanAttribute });
  /** Fills the viewport height and centres the content vertically. */
  readonly fullHeight = input(false, { transform: booleanAttribute });
  /** Dark green background with light text. */
  readonly dark = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const list = ['error-page'];
    if (this.split()) list.push('error-page--split');
    else if (this.align() === 'start') list.push('error-page--start');
    if (this.largeCode()) list.push('error-page--large-code');
    if (this.fullHeight()) list.push('error-page--full');
    if (this.dark()) list.push('error-page--dark');
    return list.join(' ');
  });
}
