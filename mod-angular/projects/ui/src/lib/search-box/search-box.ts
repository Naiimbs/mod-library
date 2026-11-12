import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ModSearchBoxFeedback = 'error' | 'success' | 'warning';

/**
 * DGA search box: leading search icon, clear action that appears while the
 * field has text, optional search button and feedback icons.
 *
 *   <mod-search-box placeholder="Search services..." [(value)]="query" (search)="run($event)" />
 */
@Component({
  selector: 'mod-search-box',
  template: `
    <div
      class="search-box"
      [class.focus]="focused()"
      [class.search-box--error]="feedback() === 'error'"
      [class.search-box--readonly]="readonly()"
      [class.search-box--disabled]="isDisabled()"
    >
      <span class="search-box__icon"><span class="icon dga-icon-search-01" aria-hidden="true"></span></span>
      <input
        #field
        type="text"
        class="search-box__field"
        [value]="value()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [attr.name]="name() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="feedback() === 'error' ? 'true' : null"
        (input)="onInput(field.value)"
        (focus)="focused.set(true)"
        (blur)="onBlur()"
        (keydown.enter)="submit()"
        (keydown.escape)="onEscape($event)"
      />
      @switch (feedback()) {
        @case ('error') {
          <span class="search-box__feedback-icon search-box__feedback-icon--error"
            ><span class="icon dga-icon-cancel-circle" aria-hidden="true"></span
          ></span>
        }
        @case ('success') {
          <span class="search-box__feedback-icon search-box__feedback-icon--success"
            ><span class="icon dga-icon-checkmark-circle-02" aria-hidden="true"></span
          ></span>
        }
        @case ('warning') {
          <span class="search-box__feedback-icon search-box__feedback-icon--warning"
            ><span class="icon dga-icon-alert-02" aria-hidden="true"></span
          ></span>
        }
      }
      @if (showActions()) {
        <div class="search-box__actions">
          @if (clearable()) {
            <button type="button" class="search-box__action-btn" [attr.aria-label]="clearLabel()" (click)="clear()">
              <span class="icon dga-icon-multiplication-sign" aria-hidden="true"></span>
            </button>
          }
          @if (clearable() && searchButton()) {
            <span class="search-box__divider"></span>
          }
          @if (searchButton()) {
            <button type="button" class="search-box__search-btn" [attr.aria-label]="searchLabel()" (click)="submit()">
              <span class="icon dga-icon-search-01" aria-hidden="true"></span>
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './search-box.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModSearchBox), multi: true },
  ],
})
export class ModSearchBox implements ControlValueAccessor {
  /** Current query. Two-way bindable; also driven by Angular forms. */
  readonly value = model<string>('');

  readonly placeholder = input<string>('Search');
  /** Accessible name of the field. */
  readonly ariaLabel = input<string>('Search');
  /** Accessible name of the clear button. */
  readonly clearLabel = input<string>('Clear search');
  /** Accessible name of the trailing search button. */
  readonly searchLabel = input<string>('Search');
  /** Shows the clear button while the field has text. */
  readonly clearable = input(true, { transform: booleanAttribute });
  /** Shows a trailing search button (after a divider) while the field has text. */
  readonly searchButton = input(false, { transform: booleanAttribute });
  /** Feedback icon. `error` also applies the error border. */
  readonly feedback = input<ModSearchBoxFeedback | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly name = input<string>('');

  /** Emits the query on Enter or when the search button is pressed. */
  readonly search = output<string>();
  /** Emits after the field was cleared through the clear button or Escape. */
  readonly cleared = output<void>();

  private readonly fieldRef = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly formDisabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly showActions = computed(
    () =>
      this.value().length > 0 &&
      !this.isDisabled() &&
      !this.readonly() &&
      (this.clearable() || this.searchButton()),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected onInput(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  protected onEscape(event: Event): void {
    if (!this.clearable() || !this.value() || this.readonly()) return;
    event.preventDefault();
    this.clear();
  }

  protected submit(): void {
    if (this.isDisabled()) return;
    this.search.emit(this.value());
  }

  /** Empties the field and returns focus to it. */
  clear(): void {
    this.value.set('');
    this.onChange('');
    this.cleared.emit();
    this.focus();
  }

  /** Moves focus to the native input. */
  focus(): void {
    this.fieldRef()?.nativeElement.focus();
  }

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
