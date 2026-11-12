import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModCheckboxGroup } from './checkbox-group';

export type ModCheckboxSize = 'medium' | 'small' | 'xsmall';
export type ModCheckboxVariant = 'primary' | 'neutral';

let nextId = 0;

/**
 * DGA checkbox with optional helper text and alert message.
 *
 *   <mod-checkbox label="Accept terms" [(checked)]="accepted" />
 *   <mod-checkbox [formControl]="ctrl">Projected <b>label</b></mod-checkbox>
 *
 * Inside a `mod-checkbox-group` the group owns the state: give each checkbox
 * a `value` and bind the group's `value` array instead.
 */
@Component({
  selector: 'mod-checkbox',
  template: `
    <label [class]="classes()">
      <div class="checkbox__row">
        <div [class]="controlClasses()">
          <span class="checkbox__ripple"></span>
          <input
            #input
            type="checkbox"
            class="checkbox__input"
            [id]="inputId"
            [checked]="isChecked()"
            [indeterminate]="indeterminate()"
            [disabled]="isDisabled()"
            [required]="required()"
            [attr.name]="resolvedName()"
            [attr.aria-label]="ariaLabel() || null"
            [attr.aria-readonly]="isReadonly() ? 'true' : null"
            [attr.aria-invalid]="alertText() ? 'true' : null"
            [attr.aria-describedby]="describedBy()"
            (click)="onClick($event)"
            (change)="onNativeChange(input.checked)"
            (blur)="onBlur()"
          />
          <span class="checkbox__box">
            <svg class="checkbox__icon checkbox__icon--check" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg class="checkbox__icon checkbox__icon--minus" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M2.5 6h7" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
        <span class="checkbox__label">{{ label() }}<ng-content /></span>
      </div>
      @if (helperText()) {
        <span class="checkbox__helper" [id]="helperId">{{ helperText() }}</span>
      }
      @if (alertText()) {
        <div class="checkbox__alert" [id]="alertId">
          <svg class="checkbox__alert-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="checkbox__alert-text">{{ alertText() }}</span>
        </div>
      }
    </label>
  `,
  styleUrl: './checkbox.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModCheckbox), multi: true },
  ],
})
export class ModCheckbox<T = unknown> implements ControlValueAccessor {
  /** Checked state. Two-way bindable; ignored inside a group (the group owns it). */
  readonly checked = model(false);
  /** Mixed state. Cleared when the user toggles the checkbox. Two-way bindable. */
  readonly indeterminate = model(false);

  /** Label text. Rich labels can be projected as content instead. */
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  /** Error / alert message shown below the checkbox. */
  readonly alertText = input<string>('');
  readonly size = input<ModCheckboxSize>('medium');
  readonly variant = input<ModCheckboxVariant>('primary');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Value contributed to the parent `mod-checkbox-group`. */
  readonly value = input<T | undefined>(undefined);
  readonly name = input<string>('');
  /** Accessible name when there is no visible label. */
  readonly ariaLabel = input<string>('');

  private readonly group = inject<ModCheckboxGroup<T>>(ModCheckboxGroup, { optional: true });
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  private readonly uid = `mod-checkbox-${++nextId}`;
  protected readonly inputId = this.uid;
  protected readonly helperId = `${this.uid}-helper`;
  protected readonly alertId = `${this.uid}-alert`;

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled() || !!this.group?.isDisabled(),
  );
  protected readonly isReadonly = computed(() => this.readonly() || !!this.group?.readonly());

  protected readonly isChecked = computed(() => {
    const value = this.value();
    return this.group && value !== undefined ? this.group.includes(value) : this.checked();
  });

  protected readonly resolvedName = computed(
    () => this.name() || this.group?.groupName() || null,
  );

  protected readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.helperText()) ids.push(this.helperId);
    if (this.alertText()) ids.push(this.alertId);
    return ids.length ? ids.join(' ') : null;
  });

  protected readonly classes = computed(() => {
    const list = ['checkbox'];
    if (this.variant() === 'neutral') list.push('checkbox--neutral');
    if (this.isDisabled()) list.push('checkbox--disabled');
    if (this.isReadonly()) list.push('checkbox--readonly');
    if (this.indeterminate()) list.push('checkbox--indeterminate');
    return list.join(' ');
  });

  protected readonly controlClasses = computed(() => {
    const size = this.size();
    if (size === 'small') return 'checkbox__control checkbox__control--sm';
    if (size === 'xsmall') return 'checkbox__control checkbox__control--xs';
    return 'checkbox__control';
  });

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  protected onClick(event: Event): void {
    // Read-only: cancel the native toggle (covers mouse, label and keyboard).
    if (this.isReadonly()) event.preventDefault();
  }

  protected onNativeChange(checked: boolean): void {
    this.indeterminate.set(false);
    this.checked.set(checked);
    const value = this.value();
    if (this.group && value !== undefined) this.group.setChecked(value, checked);
    this.onChange(checked);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  /** Moves focus to the native checkbox. */
  focus(): void {
    this.inputRef()?.nativeElement.focus();
  }

  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
