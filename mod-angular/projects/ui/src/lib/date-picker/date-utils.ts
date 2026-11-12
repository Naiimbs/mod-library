/** A start/end pair of calendar days. Either end may still be unset. */
export interface ModDateRange {
  start: Date | null;
  end: Date | null;
}

/** A "quick option" shown next to the range calendar. */
export interface ModDatePreset {
  id: string;
  label: string;
  /** Builds the range relative to the given day (local midnight). */
  range: (today: Date) => ModDateRange;
}

export type ModDateFormatter = (date: Date) => string;

export const MOD_MONTH_NAMES: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Sunday-first, matching the calendar grid. */
export const MOD_WEEKDAY_LABELS: readonly string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function modIsValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Local midnight of the given date, or `null` for a missing / invalid date. */
export function modStartOfDay(date: Date | null | undefined): Date | null {
  return modIsValidDate(date)
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate())
    : null;
}

export function modSameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function modAddDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** The source format: "January 05, 2026". */
export function modFormatDate(date: Date, monthNames: readonly string[]): string {
  const day = String(date.getDate()).padStart(2, '0');
  return `${monthNames[date.getMonth()] ?? ''} ${day}, ${date.getFullYear()}`;
}

function weekOf(today: Date, offsetWeeks: number): ModDateRange {
  const start = modAddDays(today, -today.getDay() + offsetWeeks * 7);
  return { start, end: modAddDays(start, 6) };
}

/** The quick options of the source design system, with English labels. */
export const MOD_DEFAULT_DATE_PRESETS: readonly ModDatePreset[] = [
  { id: 'today', label: 'Today', range: (today) => ({ start: today, end: today }) },
  { id: 'this-week', label: 'This week', range: (today) => weekOf(today, 0) },
  { id: 'last-week', label: 'Last week', range: (today) => weekOf(today, -1) },
  {
    id: 'this-month',
    label: 'This month',
    range: (today) => ({
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    }),
  },
  {
    id: 'last-month',
    label: 'Last month',
    range: (today) => ({
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    }),
  },
  {
    id: 'last-3-months',
    label: 'Last 3 months',
    range: (today) => ({
      start: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
      end: today,
    }),
  },
  {
    id: 'last-7-days',
    label: 'Last 7 days',
    range: (today) => ({ start: modAddDays(today, -6), end: today }),
  },
  {
    id: 'last-30-days',
    label: 'Last 30 days',
    range: (today) => ({ start: modAddDays(today, -29), end: today }),
  },
  {
    id: 'last-90-days',
    label: 'Last 90 days',
    range: (today) => ({ start: modAddDays(today, -89), end: today }),
  },
];
