import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
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
import { listenOnDocumentWhile } from '../internal/listen-while';
import { ModCalendar } from './calendar';
import { ModDateField, ModDateFieldSize } from './date-field';
import {
  MOD_MONTH_NAMES,
  MOD_WEEKDAY_LABELS,
  ModDateFormatter,
  modFormatDate,
  modIsValidDate,
} from './date-utils';

let nextId = 0;

/**
 * DGA date picker — a date field that opens a calendar popup.
 * Form control with `Date | null` as its value (Gregorian, local midnight).
 *
 *   <mod-date-picker label="Appointment date" required [(value)]="date" />
 *   <mod-date-picker label="Birth date" [formControl]="birthDate" [max]="today" />
 */
@Component({
  selector: 'mod-date-picker',
  imports: [ModCalendar, ModDateField],
  template: `
    <mod-date-field
      #field
      [label]="label()"
      [ariaLabel]="ariaLabel()"
      [value]="display()"
      [placeholder]="placeholder()"
      [size]="size()"
      [required]="required()"
      [optional]="optional()"
      [disabled]="isDisabled()"
      [invalid]="invalid()"
      [error]="error()"
      [helper]="helper()"
      [active]="open()"
      [popup]="panelId"
      [inputId]="inputId()"
      (fieldClick)="toggle()"
      (fieldKeydown)="onFieldKeydown($event)"
      (fieldBlur)="onTouched()"
    />
    <mod-calendar
      #calendar
      role="dialog"
      [id]="panelId"
      [attr.aria-label]="label() || ariaLabel() || calendarLabel()"
      [inline]="false"
      [value]="value()"
      [min]="min()"
      [max]="max()"
      [dateDisabled]="dateDisabled()"
      [showFooter]="showFooter()"
      [yearSpan]="yearSpan()"
      [monthNames]="monthNames()"
      [weekdayLabels]="weekdayLabels()"
      [previousMonthLabel]="previousMonthLabel()"
      [nextMonthLabel]="nextMonthLabel()"
      [yearLabel]="yearLabel()"
      [clearLabel]="clearLabel()"
      [todayLabel]="todayLabel()"
      (valueChange)="commit($event)"
      (selectionComplete)="close(true)"
    />
  `,
  styleUrl: './date-picker.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModDatePicker), multi: true },
  ],
  host: {
    class: 'date-picker',
    '[class.is-open]': 'open()',
        '(keydown.escape)': 'onEscape($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ModDatePicker implements ControlValueAccessor {
  /** Selected day (two-way bindable). */
  readonly value = model<Date | null>(null);
  /** Popup open state (two-way bindable). */
  readonly open = model(false);

  readonly label = input('');
  /** Accessible name when there is no visible label. */
  readonly ariaLabel = input('');
  readonly placeholder = input('Month DD, YYYY');
  readonly size = input<ModDateFieldSize>('large');
  readonly required = input(false, { transform: booleanAttribute });
  readonly optional = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Error message; also switches the field to the error state. */
  readonly error = input('');
  readonly helper = input('');
  /** Id of the native input. Generated when empty. */
  readonly inputId = input('');

  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly dateDisabled = input<((date: Date) => boolean) | null>(null);
  /** Shows the Clear / Today footer in the popup. */
  readonly showFooter = input(true, { transform: booleanAttribute });
  readonly yearSpan = input(10);
  /** Custom text for the field. Defaults to "Month DD, YYYY" using `monthNames`. */
  readonly format = input<ModDateFormatter | null>(null);

  readonly monthNames = input<readonly string[]>(MOD_MONTH_NAMES);
  readonly weekdayLabels = input<readonly string[]>(MOD_WEEKDAY_LABELS);
  readonly previousMonthLabel = input('Previous month');
  readonly nextMonthLabel = input('Next month');
  readonly yearLabel = input('Year');
  readonly clearLabel = input('Clear');
  readonly todayLabel = input('Today');
  /** Accessible name of the popup when the field has no label. */
  readonly calendarLabel = input('Choose date');

  protected readonly panelId = `mod-date-picker-${nextId++}-panel`;
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly display = computed(() => {
    const value = this.value();
    if (!modIsValidDate(value)) return '';
    return this.format()?.(value) ?? modFormatDate(value, this.monthNames());
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly field = viewChild.required<ModDateField>('field');
  private readonly calendar = viewChild.required<ModCalendar>('calendar');

  private onChange: (value: Date | null) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    listenOnDocumentWhile(() => this.open(), 'click', (event) => this.onDocumentClick(event));
  }

  writeValue(value: Date | null): void {
    this.value.set(modIsValidDate(value) ? value : null);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) this.open.set(false);
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    this.open.update((open) => !open);
  }

  /** Closes the popup, optionally returning focus to the field. */
  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
    if (restoreFocus) this.field().focus();
  }

  protected commit(value: Date | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    this.open.set(true);
    // Keyboard users land on the active day.
    afterNextRender(() => this.calendar().focusActiveCell(), { injector: this.injector });
  }

  protected onEscape(event: Event): void {
    if (!this.open()) return;
    // Handled here: an enclosing modal or slideout must not close as well.
    event.stopPropagation();
    this.close(true);
  }

  private onDocumentClick(event: Event): void {
    if (this.open() && !event.composedPath().includes(this.host.nativeElement)) this.close();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && !this.host.nativeElement.contains(next)) this.close();
  }
}
