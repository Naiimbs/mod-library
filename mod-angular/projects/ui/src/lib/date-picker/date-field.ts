import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

export type ModDateFieldSize = 'large' | 'medium';

let nextId = 0;

/**
 * DGA date field — the read-only input with a calendar icon that triggers a
 * calendar. Presentational: the date pickers compose it with `ModCalendar`,
 * and it can be used on its own next to an inline calendar.
 */
@Component({
  selector: 'mod-date-field',
  template: `
    @if (label()) {
      <label
        class="date-field__label"
        [class.date-field__label--required]="required()"
        [class.date-field__label--optional]="optional()"
        [attr.for]="fieldId()"
        >{{ label() }}</label
      >
    }
    <div class="date-field__wrapper">
      <input
        #field
        type="text"
        class="date-field__input"
        readonly
        [id]="fieldId()"
        [class.date-field__input--md]="size() === 'medium'"
        [class.date-field__input--error]="hasError()"
        [class.date-field__input--active]="active()"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        [attr.aria-required]="required() ? 'true' : null"
        [attr.aria-invalid]="hasError() ? 'true' : null"
        [attr.aria-describedby]="hasHelper() ? helperId : null"
        [attr.aria-haspopup]="popup() ? 'dialog' : null"
        [attr.aria-expanded]="popup() ? active() : null"
        [attr.aria-controls]="popup() || null"
        (click)="fieldClick.emit()"
        (keydown)="fieldKeydown.emit($event)"
        (blur)="fieldBlur.emit()"
      />
      <span class="date-field__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6.667 1.667v3.333M13.333 1.667v3.333M2.917 7.575h14.166M17.5 7.083v7.084c0 3.333-1.667 5-5 5H7.5c-3.333 0-5-1.667-5-5V7.083c0-3.333 1.667-5 5-5h5c3.333 0 5 1.667 5 5Z"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>
    @if (error()) {
      <span class="date-field__helper date-field__helper--error" [id]="helperId">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z"
            stroke="currentColor"
            stroke-width="1.333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ error() }}
      </span>
    } @else if (helper()) {
      <span class="date-field__helper" [id]="helperId">{{ helper() }}</span>
    }
  `,
  styleUrl: './date-picker.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'date-field',
    '[class.date-field--disabled]': 'disabled()',
  },
})
export class ModDateField {
  readonly label = input('');
  /** Accessible name when there is no visible label. */
  readonly ariaLabel = input('');
  /** Formatted text shown in the field. */
  readonly value = input('');
  readonly placeholder = input('Month DD, YYYY');
  readonly size = input<ModDateFieldSize>('large');
  readonly required = input(false, { transform: booleanAttribute });
  /** Appends the "(Optional)" marker to the label. */
  readonly optional = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Error styling without a message. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Error message; also switches the field to the error state. */
  readonly error = input('');
  readonly helper = input('');
  /** Active styling, used while the calendar popup is open. */
  readonly active = input(false, { transform: booleanAttribute });
  /** Id of the popup this field controls (enables aria-haspopup / aria-expanded). */
  readonly popup = input('');
  /** Id of the native input. Generated when empty. */
  readonly inputId = input('');

  readonly fieldClick = output<void>();
  readonly fieldKeydown = output<KeyboardEvent>();
  readonly fieldBlur = output<void>();

  private readonly uid = `mod-date-field-${nextId++}`;
  protected readonly helperId = `${this.uid}-helper`;
  protected readonly fieldId = computed(() => this.inputId() || this.uid);
  protected readonly hasError = computed(() => this.invalid() || !!this.error());
  protected readonly hasHelper = computed(() => !!this.error() || !!this.helper());

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** Focuses the native input. */
  focus(): void {
    this.field().nativeElement.focus();
  }
}
