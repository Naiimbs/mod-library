import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { ModRadioGroup, ModRadioVariant } from './radio-group';

let nextId = 0;

/**
 * DGA radio button. Normally placed inside a `mod-radio-group`, which owns the
 * selected value and is the form control. Used alone it exposes `checked`.
 *
 *   <mod-radio value="pro" label="Pro" helperText="For teams" />
 */
@Component({
  selector: 'mod-radio',
  template: `
    <label [class]="classes()">
      <div class="radio__row">
        <div class="radio__control">
          <span class="radio__ripple"></span>
          <input
            #input
            type="radio"
            class="radio__input"
            [id]="inputId"
            [checked]="isChecked()"
            [disabled]="isDisabled()"
            [required]="!!group?.required()"
            [attr.name]="resolvedName()"
            [attr.aria-label]="ariaLabel() || null"
            [attr.aria-readonly]="isReadonly() ? 'true' : null"
            [attr.aria-invalid]="alertText() ? 'true' : null"
            [attr.aria-describedby]="describedBy()"
            (click)="onClick($event)"
            (change)="onNativeChange(input.checked)"
          />
          <span class="radio__circle"></span>
        </div>
        <span class="radio__label">{{ label() }}<ng-content /></span>
      </div>
      @if (helperText()) {
        <span class="radio__helper" [id]="helperId">{{ helperText() }}</span>
      }
      @if (alertText()) {
        <div class="radio__alert" [id]="alertId">
          <svg class="radio__alert-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="radio__alert-text">{{ alertText() }}</span>
        </div>
      }
    </label>
  `,
  styleUrl: './radio.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModRadio<T = unknown> {
  /** Value this radio contributes to its group. */
  readonly value = input<T | undefined>(undefined);
  /** Checked state when used without a group. Two-way bindable. */
  readonly checked = model(false);

  /** Label text. Rich labels can be projected as content instead. */
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  /** Error / alert message shown below the radio. */
  readonly alertText = input<string>('');
  /** Colour style. Falls back to the group's variant. */
  readonly variant = input<ModRadioVariant | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Native `name` when used without a group. */
  readonly name = input<string>('');
  /** Accessible name when there is no visible label. */
  readonly ariaLabel = input<string>('');

  protected readonly group = inject<ModRadioGroup<T>>(ModRadioGroup, { optional: true });
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  private readonly uid = `mod-radio-${++nextId}`;
  protected readonly inputId = this.uid;
  protected readonly helperId = `${this.uid}-helper`;
  protected readonly alertId = `${this.uid}-alert`;

  protected readonly isDisabled = computed(() => this.disabled() || !!this.group?.isDisabled());
  protected readonly isReadonly = computed(() => this.readonly() || !!this.group?.readonly());

  protected readonly isChecked = computed(() => {
    const value = this.value();
    if (this.group) return value !== undefined && Object.is(this.group.value(), value);
    return this.checked();
  });

  protected readonly resolvedName = computed(
    () => this.group?.groupName() ?? (this.name() || null),
  );

  protected readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.helperText()) ids.push(this.helperId);
    if (this.alertText()) ids.push(this.alertId);
    return ids.length ? ids.join(' ') : null;
  });

  protected readonly classes = computed(() => {
    const list = ['radio'];
    if ((this.variant() ?? this.group?.variant()) === 'neutral') list.push('radio--neutral');
    if (this.isDisabled()) list.push('radio--disabled');
    if (this.isReadonly()) list.push('radio--readonly');
    return list.join(' ');
  });

  protected onClick(event: Event): void {
    // Read-only: cancel the native selection (covers mouse, label and arrow keys).
    if (this.isReadonly()) event.preventDefault();
  }

  protected onNativeChange(checked: boolean): void {
    if (!checked) return;
    const value = this.value();
    if (this.group) {
      if (value !== undefined) this.group.select(value);
    } else {
      this.checked.set(true);
    }
  }

  /** Moves focus to the native radio. */
  focus(): void {
    this.inputRef()?.nativeElement.focus();
  }
}
