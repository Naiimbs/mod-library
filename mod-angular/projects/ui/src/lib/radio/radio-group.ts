import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ModRadioGroupOrientation = 'vertical' | 'horizontal';
export type ModRadioVariant = 'primary' | 'neutral';

let nextId = 0;

/**
 * Owns the selected value of a set of `mod-radio` items.
 *
 *   <mod-radio-group [(value)]="plan" ariaLabel="Plan">
 *     <mod-radio value="basic" label="Basic" />
 *     <mod-radio value="pro" label="Pro" />
 *   </mod-radio-group>
 */
@Component({
  selector: 'mod-radio-group',
  template: '<ng-content />',
  styleUrl: './radio.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModRadioGroup), multi: true },
  ],
  host: {
    role: 'radiogroup',
    class: 'radio-group',
    '[class.radio-group--horizontal]': 'orientation() === "horizontal"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '[attr.aria-required]': 'required() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '(focusout)': 'onFocusOut()',
  },
})
export class ModRadioGroup<T = unknown> implements ControlValueAccessor {
  /** Value of the selected radio. Two-way bindable. */
  readonly value = model<T | null>(null);

  readonly orientation = input<ModRadioGroupOrientation>('vertical');
  /** Default colour style for the radios in the group. */
  readonly variant = input<ModRadioVariant>('primary');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Native `name` shared by the radios. Generated when omitted. */
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledby = input<string>('');

  private readonly uid = `mod-radio-group-${++nextId}`;
  private readonly formDisabled = signal(false);

  /** @internal */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** @internal */
  readonly groupName = computed(() => this.name() || this.uid);

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  /** @internal Called by child radios. */
  select(value: T): void {
    if (Object.is(this.value(), value)) return;
    this.value.set(value);
    this.onChange(value);
  }

  protected onFocusOut(): void {
    this.onTouched();
  }

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
