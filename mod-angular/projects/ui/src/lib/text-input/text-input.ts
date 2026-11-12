import { NgTemplateOutlet } from '@angular/common';
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

export type ModTextInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type ModTextInputSize = 'large' | 'medium';
export type ModTextInputAppearance = 'default' | 'filled-darker' | 'filled-lighter';
export type ModTextInputAddonStyle = 'solid' | 'subtle';

let nextId = 0;

/**
 * DGA text input: single-line field with label, helper text, validation
 * states, leading/trailing icons, prefix/suffix addons and character count.
 *
 *   <mod-text-input label="Email" type="email" [(value)]="email" />
 *   <mod-text-input label="Website" prefix="https://" formControlName="site" />
 */
@Component({
  selector: 'mod-text-input',
  imports: [NgTemplateOutlet],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModTextInput), multi: true },
  ],
})
export class ModTextInput implements ControlValueAccessor {
  /**
   * Current text. Two-way bindable; also driven by Angular forms. With
   * `type="number"` a bound form control receives a `number` (or `null` when
   * the field is empty or not a number), like Angular's native number input.
   */
  readonly value = model<string>('');

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<ModTextInputType>('text');
  readonly size = input<ModTextInputSize>('large');
  readonly appearance = input<ModTextInputAppearance>('default');
  /** Helper / validation message below the field. */
  readonly helperText = input<string>('');
  /** Shows the state icon before the helper text. */
  readonly helperIcon = input(true, { transform: booleanAttribute });
  /** Error state (red border, error helper styling, aria-invalid). */
  readonly error = input(false, { transform: booleanAttribute });
  /** Success state (green border, success helper styling). */
  readonly success = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Appends the "(Optional)" marker to the label (text comes from the CSS). */
  readonly optional = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Font icon name (without `dga-icon-`) shown inside the field start. */
  readonly leadingIcon = input<string>('');
  /** Font icon name (without `dga-icon-`) shown inside the field end. */
  readonly trailingIcon = input<string>('');

  /** Prefix addon text. */
  readonly prefix = input<string>('');
  /** Suffix addon text. */
  readonly suffix = input<string>('');
  readonly addonStyle = input<ModTextInputAddonStyle>('solid');
  /** Renders the prefix as a button with a chevron; emits `prefixClick`. */
  readonly prefixDropdown = input(false, { transform: booleanAttribute });
  /** Renders the suffix as a button with a chevron; emits `suffixClick`. */
  readonly suffixDropdown = input(false, { transform: booleanAttribute });
  readonly prefixSelected = input(false, { transform: booleanAttribute });
  readonly suffixSelected = input(false, { transform: booleanAttribute });
  /** Font icon name shown inside a dropdown-type prefix. */
  readonly prefixIcon = input<string>('');

  /**
   * With `type="password"`: shows an eye button at the end of the field that
   * reveals or hides the typed password. The button uses the trailing-icon
   * slot, so `trailingIcon` is not shown while the toggle is active.
   */
  readonly passwordToggle = input(false, { transform: booleanAttribute });
  /** Accessible labels of the reveal button. */
  readonly showPasswordLabel = input<string>('Show password');
  readonly hidePasswordLabel = input<string>('Hide password');

  /** Maximum number of characters (sets the native `maxlength`). */
  readonly maxLength = input<number | undefined>(undefined);
  /** Shows the character counter under the field. */
  readonly showCount = input(false, { transform: booleanAttribute });

  readonly name = input<string>('');
  readonly autocomplete = input<string>('');
  readonly inputMode = input<string>('');
  /** Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string>('');
  /** Id for the native input. Generated when omitted. */
  readonly inputId = input<string>('');

  readonly prefixClick = output<void>();
  readonly suffixClick = output<void>();
  readonly blurred = output<void>();

  private readonly uid = `mod-text-input-${++nextId}`;
  protected readonly helperId = `${this.uid}-helper`;
  protected readonly fieldId = computed(() => this.inputId() || this.uid);

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Whether the password is currently shown as plain text. */
  protected readonly revealed = signal(false);
  protected readonly hasToggle = computed(() => this.passwordToggle() && this.type() === 'password');
  /** Native input type: a revealed password is rendered as text. */
  protected readonly nativeType = computed(() =>
    this.hasToggle() && this.revealed() ? 'text' : this.type(),
  );

  protected readonly hasWrapper = computed(
    () =>
      !!(this.prefix() || this.suffix() || this.leadingIcon() || this.trailingIcon() || this.hasToggle()),
  );

  protected readonly wrapperClasses = computed(() => {
    const list = ['text-input__field-wrapper'];
    if (this.leadingIcon()) list.push('text-input__field-wrapper--leading');
    if (this.trailingIcon() || this.hasToggle()) list.push('text-input__field-wrapper--trailing');
    if (this.prefix()) list.push('text-input__field-wrapper--prefix');
    if (this.suffix()) list.push('text-input__field-wrapper--suffix');
    return list.join(' ');
  });

  protected readonly fieldClasses = computed(() => {
    const list = ['text-input__field'];
    const appearance = this.appearance();
    if (appearance !== 'default') list.push(`text-input__field--${appearance}`);
    if (this.error()) list.push('text-input__field--error');
    else if (this.success()) list.push('text-input__field--success');
    if (this.size() === 'medium') list.push('text-input__field--md');
    return list.join(' ');
  });

  protected readonly countText = computed(() => {
    const max = this.maxLength();
    const length = this.value().length;
    return max === undefined ? `${length}` : `${length}/${max}`;
  });

  protected readonly overLimit = computed(() => {
    const max = this.maxLength();
    return max !== undefined && this.value().length > max;
  });

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected addonClasses(side: 'prefix' | 'suffix'): string {
    const base = `text-input__${side}`;
    const list = [base];
    const dropdown = side === 'prefix' ? this.prefixDropdown() : this.suffixDropdown();
    const selected = side === 'prefix' ? this.prefixSelected() : this.suffixSelected();
    if (dropdown) list.push(`${base}--dropdown`);
    if (dropdown && selected) list.push(`${base}--selected`);
    if (this.addonStyle() === 'subtle') list.push(`${base}--subtle`);
    if (this.size() === 'medium') list.push(`${base}--md`);
    if (this.isDisabled()) list.push(`${base}--disabled`);
    return list.join(' ');
  }

  protected onInput(value: string): void {
    this.value.set(value);
    if (this.type() === 'number') {
      const parsed = value.trim() === '' ? NaN : Number(value);
      this.onChange(Number.isNaN(parsed) ? null : parsed);
    } else {
      this.onChange(value);
    }
  }

  protected onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  /** Moves focus to the native input. */
  focus(): void {
    this.inputRef()?.nativeElement.focus();
  }

  writeValue(value: string | number | null | undefined): void {
    this.value.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
