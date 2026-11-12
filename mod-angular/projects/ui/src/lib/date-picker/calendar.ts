import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { listenOnDocumentWhile } from '../internal/listen-while';
import {
  MOD_MONTH_NAMES,
  MOD_WEEKDAY_LABELS,
  ModDateRange,
  modAddDays,
  modSameDay,
  modStartOfDay,
} from './date-utils';

export type ModCalendarMode = 'single' | 'range';
/** Second footer button: jump to today, or confirm the current selection. */
export type ModCalendarFooterAction = 'today' | 'apply';

interface CalendarCell {
  key: string;
  date: Date;
  day: number;
  label: string;
  outside: boolean;
  disabled: boolean;
  today: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  rangeMid: boolean;
  focusable: boolean;
}

interface CalendarView {
  year: number;
  month: number;
}

let nextId = 0;

/**
 * DGA calendar panel (Gregorian): month grid, month arrows and year dropdown.
 * Used by the date pickers as their popup and usable on its own as an
 * always-visible calendar.
 *
 *   <mod-calendar [(value)]="date" />
 *   <mod-calendar mode="range" [(range)]="range" showFooter />
 */
@Component({
  selector: 'mod-calendar',
  templateUrl: './calendar.html',
  styleUrl: './date-picker.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'date-picker__panel',
    '[class.date-picker__panel--static]': 'inline()',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class ModCalendar {
  readonly mode = input<ModCalendarMode>('single');
  /** Selected day in `single` mode (two-way bindable). */
  readonly value = model<Date | null>(null);
  /** Selected range in `range` mode (two-way bindable). */
  readonly range = model<ModDateRange>({ start: null, end: null });
  /** Earliest / latest selectable day. */
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /** Extra predicate that disables individual days. */
  readonly dateDisabled = input<((date: Date) => boolean) | null>(null);
  /** Always visible, in normal flow. The pickers set this to `false` for their popup. */
  readonly inline = input(true, { transform: booleanAttribute });
  /** Shows the Clear / Today footer. */
  readonly showFooter = input(false, { transform: booleanAttribute });
  /** Years offered before and after the current year in the year dropdown. */
  readonly yearSpan = input(10);
  /** Second footer button: `today` selects today, `apply` emits `applied`. */
  readonly footerAction = input<ModCalendarFooterAction>('today');
  /** Day highlighted as today. Defaults to the current day. */
  readonly today = input<Date | null>(null);
  /** Month shown initially when nothing is selected. Defaults to the month of today. */
  readonly startAt = input<Date | null>(null);
  /** Year dropdown open state (two-way bindable). */
  readonly yearOpen = model(false);

  readonly monthNames = input<readonly string[]>(MOD_MONTH_NAMES);
  /** Seven labels, Sunday first. */
  readonly weekdayLabels = input<readonly string[]>(MOD_WEEKDAY_LABELS);
  readonly previousMonthLabel = input('Previous month');
  readonly nextMonthLabel = input('Next month');
  readonly yearLabel = input('Year');
  readonly clearLabel = input('Clear');
  readonly todayLabel = input('Today');
  readonly applyLabel = input('Apply');

  /** A day (single) or a complete range was chosen by the user. */
  readonly selectionComplete = output<void>();
  /** The footer's Clear button was pressed. */
  readonly cleared = output<void>();
  /** The footer's Apply button was pressed (`footerAction="apply"`). */
  readonly applied = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly yearDropdown = viewChild.required<ElementRef<HTMLElement>>('yearDropdown');
  private readonly yearTrigger = viewChild.required<ElementRef<HTMLElement>>('yearTrigger');
  private readonly yearMenu = viewChild.required<ElementRef<HTMLElement>>('yearMenu');

  private readonly now = modStartOfDay(new Date()) ?? new Date();
  private readonly todayDay = computed(() => modStartOfDay(this.today()) ?? this.now);
  protected readonly monthLabelId = `mod-calendar-${nextId++}-month`;
  protected readonly view = signal<CalendarView>({
    year: this.now.getFullYear(),
    month: this.now.getMonth(),
  });
  /** Day that owns the roving tabindex. */
  private readonly active = signal<Date | null>(null);
  private previousAnchor: Date | null = null;

  private readonly selectedDay = computed(() => modStartOfDay(this.value()));
  private readonly selectedRange = computed<ModDateRange>(() => {
    const range = this.range();
    return { start: modStartOfDay(range?.start), end: modStartOfDay(range?.end) };
  });

  protected readonly monthLabel = computed(() => this.monthNames()[this.view().month] ?? '');

  protected readonly years = computed(() => {
    const span = Math.max(0, this.yearSpan());
    const current = this.todayDay().getFullYear();
    // Always offer the year being viewed (e.g. a date of birth far from today).
    const viewed = this.view().year;
    const first = Math.min(current - span, viewed, this.min()?.getFullYear() ?? Infinity);
    const last = Math.max(current + span, viewed, this.max()?.getFullYear() ?? -Infinity);
    const years: number[] = [];
    for (let year = first; year <= last; year++) years.push(year);
    return years;
  });

  private readonly activeDay = computed(() => {
    const { year, month } = this.view();
    const inView = (date: Date | null): date is Date =>
      !!date && date.getFullYear() === year && date.getMonth() === month;
    const active = this.active();
    if (inView(active)) return active.getDate();
    const selected = this.mode() === 'range' ? this.selectedRange().start : this.selectedDay();
    if (inView(selected)) return selected.getDate();
    const today = this.todayDay();
    if (inView(today)) return today.getDate();
    return 1;
  });

  protected readonly cells = computed<CalendarCell[]>(() => {
    const { year, month } = this.view();
    const names = this.monthNames();
    const isRange = this.mode() === 'range';
    const selected = this.selectedDay();
    const { start, end } = this.selectedRange();
    const startTime = start?.getTime();
    const endTime = end?.getTime();
    const activeDay = this.activeDay();
    const today = this.todayDay();

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const total = firstWeekday + daysInMonth <= 35 ? 35 : 42;

    const cells: CalendarCell[] = [];
    for (let index = 0; index < total; index++) {
      const date = new Date(year, month, index - firstWeekday + 1);
      const day = date.getDate();
      const outside = date.getMonth() !== month;
      const time = date.getTime();
      const cell: CalendarCell = {
        key: `${date.getFullYear()}-${date.getMonth()}-${day}`,
        date,
        day,
        label: `${names[date.getMonth()] ?? ''} ${day}, ${date.getFullYear()}`,
        outside,
        // Days of the neighbouring months are fillers, as in the source.
        disabled: outside || this.isDisabled(date),
        today: !outside && modSameDay(date, today),
        selected: false,
        rangeStart: false,
        rangeEnd: false,
        rangeMid: false,
        focusable: !outside && day === activeDay,
      };
      if (!outside) {
        if (!isRange) {
          cell.selected = modSameDay(date, selected);
        } else if (startTime !== undefined && endTime !== undefined) {
          if (startTime === endTime) cell.selected = time === startTime;
          else if (time === startTime) cell.rangeStart = true;
          else if (time === endTime) cell.rangeEnd = true;
          else cell.rangeMid = time > startTime && time < endTime;
        } else if (startTime !== undefined) {
          cell.selected = time === startTime;
        }
      }
      cells.push(cell);
    }
    return cells;
  });

  constructor() {
    listenOnDocumentWhile(() => this.yearOpen(), 'click', (event) => this.onDocumentClick(event));

    // Initial month: `startAt`, else the month of a custom `today`. Registered
    // before the selection effect so that a selected day wins.
    effect(() => {
      const start = modStartOfDay(this.startAt()) ?? modStartOfDay(this.today());
      if (start) {
        untracked(() => this.view.set({ year: start.getFullYear(), month: start.getMonth() }));
      }
    });
    // Follow the selection when it is set from outside (or by a preset):
    // show its month. Picking the end of a range must not move the view.
    effect(() => {
      const anchor = this.mode() === 'range' ? this.selectedRange().start : this.selectedDay();
      if (anchor && !modSameDay(anchor, this.previousAnchor)) {
        untracked(() => this.showMonthOf(anchor));
      }
      this.previousAnchor = anchor;
    });
  }

  /** Moves keyboard focus to the active day. */
  focusActiveCell(): void {
    this.host.nativeElement.querySelector<HTMLElement>('.date-cell[tabindex="0"]')?.focus();
  }

  protected navigate(delta: number): void {
    this.view.update(({ year, month }) => {
      const target = new Date(year, month + delta, 1);
      return { year: target.getFullYear(), month: target.getMonth() };
    });
  }

  protected pick(cell: CalendarCell): void {
    if (!cell.disabled) this.select(cell.date);
  }

  protected clear(): void {
    if (this.mode() === 'range') this.range.set({ start: null, end: null });
    else this.value.set(null);
    this.cleared.emit();
  }

  protected selectToday(): void {
    const today = this.todayDay();
    if (this.isDisabled(today)) return;
    this.showMonthOf(today);
    if (this.mode() === 'range') this.range.set({ start: today, end: today });
    else this.value.set(today);
    this.selectionComplete.emit();
  }

  protected apply(): void {
    this.applied.emit();
  }

  protected toggleYear(): void {
    this.yearOpen.update((open) => !open);
    if (!this.yearOpen()) return;
    // Bring the selected year into view without scrolling the page.
    afterNextRender(
      () => {
        const menu = this.yearMenu().nativeElement;
        const selected = menu.querySelector<HTMLElement>('.year-dropdown__option--selected');
        if (selected) {
          menu.scrollTop = selected.offsetTop - (menu.clientHeight - selected.offsetHeight) / 2;
        }
      },
      { injector: this.injector },
    );
  }

  protected pickYear(year: number, event: Event): void {
    event.preventDefault();
    this.view.update((view) => ({ ...view, year }));
    this.yearOpen.set(false);
    this.yearTrigger().nativeElement.focus();
  }

  private onDocumentClick(event: Event): void {
    if (!this.yearOpen()) return;
    if (!event.composedPath().includes(this.yearDropdown().nativeElement)) {
      this.yearOpen.set(false);
    }
  }

  protected onEscape(event: Event): void {
    if (!this.yearOpen()) return;
    // Close only the year dropdown; a second Escape closes the picker.
    event.stopPropagation();
    this.yearOpen.set(false);
    this.yearTrigger().nativeElement.focus();
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const { year, month } = this.view();
    const current = new Date(year, month, this.activeDay());
    // Left/right follow the visual order of the grid, which mirrors in RTL.
    const view = this.host.nativeElement.ownerDocument.defaultView;
    const rtl = view?.getComputedStyle(this.host.nativeElement).direction === 'rtl';
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft':
        next = modAddDays(current, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        next = modAddDays(current, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        next = modAddDays(current, -7);
        break;
      case 'ArrowDown':
        next = modAddDays(current, 7);
        break;
      case 'Home':
        next = new Date(year, month, 1);
        break;
      case 'End':
        next = new Date(year, month + 1, 0);
        break;
      case 'PageUp':
        next = this.sameDayOfMonth(year, month - 1, current.getDate());
        break;
      case 'PageDown':
        next = this.sameDayOfMonth(year, month + 1, current.getDate());
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDisabled(current)) this.select(current);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.showMonthOf(next);
    afterNextRender(() => this.focusActiveCell(), { injector: this.injector });
  }

  private select(date: Date): void {
    this.active.set(date);
    if (this.mode() !== 'range') {
      this.value.set(date);
      this.selectionComplete.emit();
      return;
    }
    const { start, end } = this.selectedRange();
    if (!start || end) {
      this.range.set({ start: date, end: null });
    } else {
      this.range.set(date < start ? { start: date, end: start } : { start, end: date });
      this.selectionComplete.emit();
    }
  }

  private showMonthOf(date: Date): void {
    this.active.set(date);
    this.view.set({ year: date.getFullYear(), month: date.getMonth() });
  }

  private sameDayOfMonth(year: number, month: number, day: number): Date {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDay));
  }

  private isDisabled(date: Date): boolean {
    const min = modStartOfDay(this.min());
    const max = modStartOfDay(this.max());
    if (min && date < min) return true;
    if (max && date > max) return true;
    return this.dateDisabled()?.(date) ?? false;
  }
}
