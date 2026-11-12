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

export type ModTextareaAppearance = 'default' | 'filled-darker' | 'filled-lighter';

let nextId = 0;

/**
 * DGA textarea: multi-line text field with label, helper text and error state.
 *
 *   <mod-textarea label="Description" rows="4" [(value)]="text" />
 */
@Component({
  selector: 'mod-textarea',
  template: `
    <div class="textarea" [class.textarea--disabled]="isDisabled()">
      @if (label()) {
        <label class="textarea__label" [class.textarea__label--required]="required()" [attr.for]="fieldId()">{{
          label()
        }}</label>
      }
      <textarea
        #field
        [class]="fieldClasses()"
        [id]="fieldId()"
        [value]="value()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [required]="required()"
        [attr.rows]="rows()"
        [attr.cols]="cols() ?? null"
        [attr.name]="name() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.maxlength]="maxLength() ?? null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-invalid]="error() ? 'true' : null"
        [attr.aria-describedby]="helperText() ? helperId : null"
        (input)="onInput(field.value)"
        (blur)="onBlur()"
      ></textarea>
      @if (helperText()) {
        <span class="textarea__helper" [class.textarea__helper--error]="error()" [id]="helperId">
          @if (helperIcon()) {
          <svg class="textarea__helper-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            @if (error()) {
              <path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round" />
            } @else {
              <path d="M8 7.333V10.667M8 5.333h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round" />
            }
          </svg>
          }
          {{ helperText() }}
        </span>
      }
    </div>
  `,
  styleUrl: './textarea.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModTextarea), multi: true },
  ],
})
export class ModTextarea implements ControlValueAccessor {
  /** Current text. Two-way bindable; also driven by Angular forms. */
  readonly value = model<string>('');

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  readonly cols = input<number | undefined>(undefined);
  readonly appearance = input<ModTextareaAppearance>('default');
  /** Helper / validation message below the field. */
  readonly helperText = input<string>('');
  /** Shows the state icon before the helper text. */
  readonly helperIcon = input(true, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Allows vertical resizing by the user. */
  readonly resizable = input(true, { transform: booleanAttribute });
  readonly maxLength = input<number | undefined>(undefined);
  readonly name = input<string>('');
  /** Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string>('');
  /** Id for the native textarea. Generated when omitted. */
  readonly inputId = input<string>('');

  readonly blurred = output<void>();

  private readonly uid = `mod-textarea-${++nextId}`;
  protected readonly helperId = `${this.uid}-helper`;
  protected readonly fieldId = computed(() => this.inputId() || this.uid);

  private readonly fieldRef = viewChild<ElementRef<HTMLTextAreaElement>>('field');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly fieldClasses = computed(() => {
    const list = ['textarea__field'];
    const appearance = this.appearance();
    if (appearance !== 'default') list.push(`textarea__field--${appearance}`);
    if (this.error()) list.push('textarea__field--error');
    if (!this.resizable()) list.push('textarea__field--no-resize');
    return list.join(' ');
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected onInput(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  /** Moves focus to the native textarea. */
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
