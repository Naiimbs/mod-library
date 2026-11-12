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

export type ModCheckboxGroupOrientation = 'vertical' | 'horizontal';

let nextId = 0;

/**
 * Groups `mod-checkbox` items and owns the list of checked values. Every
 * child checkbox needs a `value`.
 *
 *   <mod-checkbox-group [(value)]="channels" ariaLabel="Notifications">
 *     <mod-checkbox value="email" label="Email" />
 *     <mod-checkbox value="sms" label="SMS" />
 *   </mod-checkbox-group>
 */
@Component({
  selector: 'mod-checkbox-group',
  template: '<ng-content />',
  styleUrl: './checkbox.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModCheckboxGroup), multi: true },
  ],
  host: {
    role: 'group',
    class: 'checkbox-group',
    '[class.checkbox-group--horizontal]': 'orientation() === "horizontal"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '(focusout)': 'onFocusOut()',
  },
})
export class ModCheckboxGroup<T = unknown> implements ControlValueAccessor {
  /** Values of the checked checkboxes. Two-way bindable. */
  readonly value = model<T[]>([]);

  readonly orientation = input<ModCheckboxGroupOrientation>('vertical');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** `name` applied to every native checkbox in the group. Generated when omitted. */
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledby = input<string>('');

  private readonly uid = `mod-checkbox-group-${++nextId}`;
  private readonly formDisabled = signal(false);

  /** @internal */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** @internal */
  readonly groupName = computed(() => this.name() || this.uid);

  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};

  /** @internal */
  includes(value: T): boolean {
    return this.value().includes(value);
  }

  /** @internal Called by child checkboxes. */
  setChecked(value: T, checked: boolean): void {
    const current = this.value();
    const has = current.includes(value);
    if (checked === has) return;
    const next = checked ? [...current, value] : current.filter((item) => item !== value);
    this.value.set(next);
    this.onChange(next);
  }

  protected onFocusOut(): void {
    this.onTouched();
  }

  writeValue(value: T[] | null | undefined): void {
    this.value.set(Array.isArray(value) ? value : []);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
