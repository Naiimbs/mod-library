import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  MOD_DEFAULT_DATE_PRESETS,
  MOD_MONTH_NAMES,
  MOD_WEEKDAY_LABELS,
  ModCalendar,
  ModDateField,
  ModDatePicker,
  ModDatePreset,
  ModDateRange,
  modFormatDate,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type DemoState = 'default' | 'filled' | 'error' | 'disabled';

const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];
const WEEKDAYS_AR = ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب'];

/** The six quick options of the original live demo, in order, with their Arabic labels. */
const DEMO_PRESETS: { id: string; ar: string }[] = [
  { id: 'today', ar: 'اليوم' },
  { id: 'this-week', ar: 'هذا الأسبوع' },
  { id: 'last-week', ar: 'الأسبوع الماضي' },
  { id: 'this-month', ar: 'هذا الشهر' },
  { id: 'last-month', ar: 'الشهر الماضي' },
  { id: 'last-7-days', ar: 'آخر 7 أيام' },
];

function presetLabel(id: string): string {
  return MOD_DEFAULT_DATE_PRESETS.find((preset) => preset.id === id)?.label ?? id;
}

@Component({
  selector: 'demo-date-picker-page',
  imports: [ModCalendar, ModDateField, ModDatePicker, NgTemplateOutlet, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.page.html',
  styles: `
    /* Docs-only layout helpers of the original page (not part of the library CSS). */
    .date-cell-showcase {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-lg);
      align-items: center;
    }
    .date-cell-showcase__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }
    .date-cell-showcase__label {
      font-family: var(--font-family-primary);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-align: center;
    }
  `,
})
export class DatePickerPage {
  /** The original page is drawn around January 2024 with the 3rd as "today". */
  protected readonly today = new Date(2024, 0, 3);
  protected readonly monthsAr = MONTHS_AR;
  protected readonly weekdaysAr = WEEKDAYS_AR;
  protected readonly years = [2021, 2022, 2023, 2024, 2025, 2026, 2027];
  protected readonly allPresets = MOD_DEFAULT_DATE_PRESETS;

  protected readonly states: DemoOption<DemoState>[] = [
    { value: 'default', label: 'Default' },
    { value: 'filled', label: 'Filled' },
    { value: 'error', label: 'Error' },
    { value: 'disabled', label: 'Disabled' },
  ];

  // Live demo controls (defaults as in the original).
  protected readonly rtl = signal(false);
  protected readonly state = signal<DemoState>('default');
  protected readonly inputField = signal(true);
  protected readonly range = signal(false);
  protected readonly quickOptions = signal(false);
  protected readonly submitButton = signal(false);

  // Live demo selection.
  protected readonly date = signal<Date | null>(null);
  protected readonly dateRange = signal<ModDateRange>({ start: null, end: null });
  protected readonly activePreset = signal<string | null>(null);

  protected readonly t = computed(() =>
    this.rtl()
      ? {
          label: 'التاريخ',
          startLabel: 'تاريخ البداية',
          endLabel: 'تاريخ النهاية',
          placeholder: 'الشهر يوم، سنة',
          errorValue: 'تاريخ غير صالح',
          errorMsg: 'يرجى إدخال تاريخ صالح.',
          quickOption: 'خيار سريع',
          presets: DEMO_PRESETS.map((preset) => ({ id: preset.id, label: preset.ar })),
          months: MONTHS_AR as readonly string[],
          weekdays: WEEKDAYS_AR as readonly string[],
          previous: 'الشهر السابق',
          next: 'الشهر التالي',
          year: 'السنة',
          clear: 'مسح',
          apply: 'تطبيق',
        }
      : {
          label: 'Date',
          startLabel: 'Start Date',
          endLabel: 'End Date',
          placeholder: 'Month DD, YYYY',
          errorValue: 'Invalid date',
          errorMsg: 'Please enter a valid date.',
          quickOption: 'Quick Option',
          presets: DEMO_PRESETS.map((preset) => ({ id: preset.id, label: presetLabel(preset.id) })),
          months: MOD_MONTH_NAMES,
          weekdays: MOD_WEEKDAY_LABELS,
          previous: 'Previous month',
          next: 'Next month',
          year: 'Year',
          clear: 'Clear',
          apply: 'Apply',
        },
  );

  protected readonly singleText = computed(() => this.demoText(this.date()));
  protected readonly startText = computed(() => this.demoText(this.dateRange().start));
  protected readonly endText = computed(() => this.demoText(this.dateRange().end));

  // Showcase values.
  protected readonly yearOpen = signal(true);
  protected readonly yearDemoDate = signal<Date | null>(new Date(2024, 0, 19));
  protected readonly standardDate = signal<Date | null>(new Date(2024, 0, 19));
  protected readonly presetsRange = signal<ModDateRange>({ start: new Date(2024, 0, 19), end: null });
  protected readonly presetsActive = signal<string | null>(null);
  protected readonly attachedDate = signal<Date | null>(new Date(2024, 0, 19));
  protected readonly selectedRange = signal<ModDateRange>({
    start: new Date(2024, 0, 19),
    end: new Date(2024, 0, 28),
  });
  protected readonly emptyRange = signal<ModDateRange>({ start: null, end: null });
  protected readonly appointment = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);
  protected readonly rtlDate = signal<Date | null>(new Date(2024, 0, 19));

  /** "Filled" loads the original sample dates; "Default" empties the fields. */
  protected setState(state: DemoState): void {
    this.state.set(state);
    this.activePreset.set(null);
    if (state === 'filled') {
      this.date.set(new Date(2024, 0, 19));
      this.dateRange.set({ start: new Date(2024, 0, 19), end: new Date(2024, 0, 28) });
    } else if (state === 'default') {
      this.date.set(null);
      this.dateRange.set({ start: null, end: null });
    }
  }

  protected onDate(value: Date | null): void {
    this.date.set(value);
    this.activePreset.set(null);
  }

  protected onRange(value: ModDateRange): void {
    this.dateRange.set(value);
    this.activePreset.set(null);
  }

  protected applyPreset(id: string): void {
    const preset = MOD_DEFAULT_DATE_PRESETS.find((entry) => entry.id === id);
    if (!preset) return;
    const range = preset.range(this.today);
    this.dateRange.set(range);
    this.date.set(range.start);
    this.activePreset.set(id);
  }

  protected pickPreset(preset: ModDatePreset): void {
    this.presetsRange.set(preset.range(this.today));
    this.presetsActive.set(preset.id);
  }

  protected format(date: Date | null): string {
    return date ? modFormatDate(date, MOD_MONTH_NAMES) : '';
  }

  /** Field text of the live demo: the error sample, or the date in the demo language. */
  private demoText(date: Date | null): string {
    if (this.state() === 'error') return this.t().errorValue;
    if (!date) return '';
    return this.rtl()
      ? `${date.getDate()} ${MONTHS_AR[date.getMonth()]} ${date.getFullYear()}`
      : modFormatDate(date, MOD_MONTH_NAMES);
  }

  protected readonly pickerProps: DemoProp[] = [
    { name: '[(value)]', type: 'Date | null', default: 'null', description: 'Selected day (Gregorian, local midnight). Also available through ngModel / formControl.' },
    { name: '[(open)]', type: 'boolean', default: 'false', description: 'Whether the calendar popup is open.' },
    { name: 'label', type: 'string', default: "''", description: 'Visible label of the field.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when there is no visible label.' },
    { name: 'placeholder', type: 'string', default: "'Month DD, YYYY'", description: 'Placeholder of the empty field.' },
    { name: 'size', type: "'large' | 'medium'", default: "'large'", description: 'Field height: large 40px, medium 32px.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Adds the red asterisk to the label and aria-required.' },
    { name: 'optional', type: 'boolean', default: 'false', description: 'Appends the "(Optional)" marker to the label.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state. Grays out the field and prevents interaction.' },
    { name: 'invalid', type: 'boolean', default: 'false', description: 'Error styling (red border) without a message.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message under the field; also switches the field to the error state.' },
    { name: 'helper', type: 'string', default: "''", description: 'Helper text under the field.' },
    { name: 'inputId', type: 'string', default: 'generated', description: 'Id of the native input.' },
    { name: 'min / max', type: 'Date | null', default: 'null', description: 'Earliest / latest selectable day.' },
    { name: 'dateDisabled', type: '(date: Date) => boolean', default: 'null', description: 'Extra predicate that disables individual days.' },
    { name: 'showFooter', type: 'boolean', default: 'true', description: 'Shows the Clear / Today footer in the popup.' },
    { name: 'yearSpan', type: 'number', default: '10', description: 'Years offered before and after the current year in the year dropdown.' },
    { name: 'format', type: '(date: Date) => string', default: 'null', description: 'Custom text for the field. Defaults to "Month DD, YYYY" using monthNames.' },
    { name: 'monthNames', type: 'string[]', default: 'English', description: 'Twelve month names, for localisation.' },
    { name: 'weekdayLabels', type: 'string[]', default: "['Su', … 'Sa']", description: 'Seven weekday labels, Sunday first.' },
    { name: 'previousMonthLabel / nextMonthLabel / yearLabel', type: 'string', default: 'English', description: 'Accessible names of the navigation arrows and the year dropdown.' },
    { name: 'clearLabel / todayLabel', type: 'string', default: "'Clear' / 'Today'", description: 'Labels of the footer buttons.' },
    { name: 'calendarLabel', type: 'string', default: "'Choose date'", description: 'Accessible name of the popup when the field has no label.' },
  ];

  protected readonly rangeProps: DemoProp[] = [
    { name: '[(value)]', type: '{ start: Date | null; end: Date | null }', default: '{ start: null, end: null }', description: 'Selected range. end is null while only the start is picked.' },
    { name: 'startLabel', type: 'string', default: "'Start Date'", description: 'Label of the first field.' },
    { name: 'endLabel', type: 'string', default: "'End Date'", description: 'Label of the second field.' },
    { name: 'presets', type: 'ModDatePreset[]', default: '[]', description: 'Quick options shown next to the calendar (MOD_DEFAULT_DATE_PRESETS has the nine source presets). Empty = no presets column.' },
    { name: 'presetsTitle', type: 'string', default: "'Quick Option'", description: 'Title of the presets column.' },
    { name: 'error / helper', type: 'string', default: "''", description: 'Message shown under the two fields.' },
    { name: 'calendarLabel', type: 'string', default: "'Choose date range'", description: 'Accessible name of the popup.' },
  ];

  protected readonly calendarProps: DemoProp[] = [
    { name: 'mode', type: "'single' | 'range'", default: "'single'", description: 'Selects one day, or a start / end pair with the range band.' },
    { name: '[(value)]', type: 'Date | null', default: 'null', description: 'Selected day in single mode.' },
    { name: '[(range)]', type: '{ start, end }', default: '{ start: null, end: null }', description: 'Selected range in range mode.' },
    { name: 'inline', type: 'boolean', default: 'true', description: 'Always visible, in normal flow. The pickers set it to false for their popup.' },
    { name: 'showFooter', type: 'boolean', default: 'false', description: 'Shows the footer with the Clear button and the second action.' },
    { name: 'footerAction', type: "'today' | 'apply'", default: "'today'", description: 'Second footer button: Today selects the current day; Apply emits (applied) to confirm the selection.' },
    { name: 'today', type: 'Date | null', default: 'current day', description: 'Day highlighted as today.' },
    { name: 'startAt', type: 'Date | null', default: 'month of today', description: 'Month shown initially when nothing is selected.' },
    { name: '[(yearOpen)]', type: 'boolean', default: 'false', description: 'Whether the year dropdown is open.' },
    { name: 'min / max / dateDisabled / yearSpan', type: '—', description: 'Same as mod-date-picker.' },
    { name: 'monthNames / weekdayLabels / …Label', type: '—', description: 'Same localisation inputs as mod-date-picker, plus applyLabel.' },
    { name: '(selectionComplete)', type: 'void', description: 'A day (single) or a complete range was chosen by the user.' },
    { name: '(cleared)', type: 'void', description: "The footer's Clear button was pressed." },
    { name: '(applied)', type: 'void', description: "The footer's Apply button was pressed." },
  ];

  protected readonly fieldProps: DemoProp[] = [
    { name: 'value', type: 'string', default: "''", description: 'Formatted text shown in the field.' },
    { name: 'label / ariaLabel / placeholder / size', type: '—', description: 'Same as mod-date-picker.' },
    { name: 'required / optional / disabled / invalid / error / helper', type: '—', description: 'Same as mod-date-picker.' },
    { name: 'active', type: 'boolean', default: 'false', description: 'Active styling, used while a calendar popup is open.' },
    { name: 'popup', type: 'string', default: "''", description: 'Id of the popup this field controls (enables aria-haspopup / aria-expanded).' },
    { name: '(fieldClick) / (fieldKeydown) / (fieldBlur)', type: 'void / KeyboardEvent / void', description: 'Interaction events of the native input.' },
  ];
}
