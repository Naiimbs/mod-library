import { NgTemplateOutlet } from '@angular/common';
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
  ModDatePreset,
  ModDateRange,
  modFormatDate,
  modIsValidDate,
  modStartOfDay,
} from './date-utils';

let nextId = 0;

const EMPTY_RANGE: ModDateRange = { start: null, end: null };

/**
 * DGA date range picker — start and end date fields that share one calendar
 * popup, with optional quick-option presets.
 * Form control with `ModDateRange` (`{ start, end }`) as its value.
 *
 *   <mod-date-range-picker startLabel="Start date" endLabel="End date" [(value)]="range" />
 *   <mod-date-range-picker [presets]="presets" [formControl]="period" />
 */
@Component({
  selector: 'mod-date-range-picker',
  imports: [ModCalendar, ModDateField, NgTemplateOutlet],
  template: `
    <div class="date-picker__dual-fields">
      <mod-date-field
        #startField
        [label]="startLabel()"
        [ariaLabel]="startLabel()"
        [value]="startText()"
        [placeholder]="placeholder()"
        [size]="size()"
        [required]="required()"
        [disabled]="isDisabled()"
        [invalid]="invalid() || !!error()"
        [active]="open()"
        [popup]="panelId"
        (fieldClick)="toggle()"
        (fieldKeydown)="onFieldKeydown($event)"
        (fieldBlur)="onTouched()"
      />
      <mod-date-field
        [label]="endLabel()"
        [ariaLabel]="endLabel()"
        [value]="endText()"
        [placeholder]="placeholder()"
        [size]="size()"
        [required]="required()"
        [disabled]="isDisabled()"
        [invalid]="invalid() || !!error()"
        [active]="open()"
        [popup]="panelId"
        (fieldClick)="toggle()"
        (fieldKeydown)="onFieldKeydown($event)"
        (fieldBlur)="onTouched()"
      />
    </div>
    @if (error()) {
      <span class="date-field__helper date-field__helper--error" role="alert">{{ error() }}</span>
    } @else if (helper()) {
      <span class="date-field__helper">{{ helper() }}</span>
    }

    <ng-template #calendarTemplate let-inline>
      <mod-calendar
        #calendar
        mode="range"
        [attr.id]="inline ? null : panelId"
        [attr.role]="inline ? null : 'dialog'"
        [attr.aria-label]="inline ? null : calendarLabel()"
        [inline]="inline"
        [range]="value()"
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
        (rangeChange)="onCalendarChange($event)"
        (selectionComplete)="close(true)"
      />
    </ng-template>

    @if (presets().length) {
      <div
        class="date-picker__panel date-picker__panel--presets"
        role="dialog"
        [id]="panelId"
        [attr.aria-label]="calendarLabel()"
      >
        <div class="date-picker--with-presets">
          <div class="date-picker__presets" role="group" [attr.aria-label]="presetsTitle()">
            <span class="date-picker__presets-title">{{ presetsTitle() }}</span>
            @for (preset of presets(); track preset.id) {
              <button
                class="date-picker__preset-option"
                type="button"
                [class.date-picker__preset-option--active]="preset.id === activePreset()"
                [attr.aria-pressed]="preset.id === activePreset()"
                (click)="applyPreset(preset)"
              >
                {{ preset.label }}
              </button>
            }
          </div>
          <div>
            <ng-container
              [ngTemplateOutlet]="calendarTemplate"
              [ngTemplateOutletContext]="{ $implicit: true }"
            />
          </div>
        </div>
      </div>
    } @else {
      <ng-container
        [ngTemplateOutlet]="calendarTemplate"
        [ngTemplateOutletContext]="{ $implicit: false }"
      />
    }
  `,
  styleUrl: './date-picker.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModDateRangePicker), multi: true },
  ],
  host: {
    class: 'date-picker',
    '[class.is-open]': 'open()',
        '(keydown.escape)': 'onEscape($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ModDateRangePicker implements ControlValueAccessor {
  /** Selected range (two-way bindable). `end` is `null` while only the start is picked. */
  readonly value = model<ModDateRange>(EMPTY_RANGE);
  /** Popup open state (two-way bindable). */
  readonly open = model(false);

  readonly startLabel = input('Start Date');
  readonly endLabel = input('End Date');
  readonly placeholder = input('Month DD, YYYY');
  readonly size = input<ModDateFieldSize>('large');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Error message shown under the fields; also switches them to the error state. */
  readonly error = input('');
  readonly helper = input('');

  /** Quick options shown next to the calendar. Empty = no presets column. */
  readonly presets = input<readonly ModDatePreset[]>([]);
  readonly presetsTitle = input('Quick Option');

  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly dateDisabled = input<((date: Date) => boolean) | null>(null);
  /** Shows the Clear / Today footer in the popup. */
  readonly showFooter = input(true, { transform: booleanAttribute });
  readonly yearSpan = input(10);
  /** Custom text for the fields. Defaults to "Month DD, YYYY" using `monthNames`. */
  readonly format = input<ModDateFormatter | null>(null);

  readonly monthNames = input<readonly string[]>(MOD_MONTH_NAMES);
  readonly weekdayLabels = input<readonly string[]>(MOD_WEEKDAY_LABELS);
  readonly previousMonthLabel = input('Previous month');
  readonly nextMonthLabel = input('Next month');
  readonly yearLabel = input('Year');
  readonly clearLabel = input('Clear');
  readonly todayLabel = input('Today');
  /** Accessible name of the popup. */
  readonly calendarLabel = input('Choose date range');

  protected readonly panelId = `mod-date-range-picker-${nextId++}-panel`;
  protected readonly activePreset = signal<string | null>(null);
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly startText = computed(() => this.text(this.value()?.start));
  protected readonly endText = computed(() => this.text(this.value()?.end));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly startField = viewChild.required<ModDateField>('startField');
  private readonly calendar = viewChild<ModCalendar>('calendar');

  private onChange: (value: ModDateRange) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    listenOnDocumentWhile(() => this.open(), 'click', (event) => this.onDocumentClick(event));
  }

  writeValue(value: ModDateRange | null): void {
    this.activePreset.set(null);
    this.value.set({
      start: modIsValidDate(value?.start) ? value.start : null,
      end: modIsValidDate(value?.end) ? value.end : null,
    });
  }

  registerOnChange(fn: (value: ModDateRange) => void): void {
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

  /** Closes the popup, optionally returning focus to the start field. */
  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
    if (restoreFocus) this.startField().focus();
  }

  protected onCalendarChange(range: ModDateRange): void {
    this.activePreset.set(null);
    this.commit(range);
  }

  protected applyPreset(preset: ModDatePreset): void {
    const today = modStartOfDay(new Date());
    if (!today) return;
    this.commit(preset.range(today));
    this.activePreset.set(preset.id);
    this.close(true);
  }

  private commit(range: ModDateRange): void {
    this.value.set(range);
    this.onChange(range);
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    this.open.set(true);
    // Keyboard users land on the active day.
    afterNextRender(() => this.calendar()?.focusActiveCell(), { injector: this.injector });
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

  private text(date: Date | null | undefined): string {
    if (!modIsValidDate(date)) return '';
    return this.format()?.(date) ?? modFormatDate(date, this.monthNames());
  }
}
