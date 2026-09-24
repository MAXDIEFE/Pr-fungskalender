// Alle Kalenderdaten werden als ISO-String "YYYY-MM-DD" gehandhabt.
// So gibt es keine Zeitzonen- oder Sommerzeitverschiebungen.

export type ISODate = string;

export const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const WEEKDAYS_LONG = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];
export const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Monat ist 1-basiert (1 = Januar). */
export function toISO(year: number, month: number, day: number): ISODate {
  // Über UTC normalisieren, damit Überläufe (z. B. 32. Januar) korrekt aufgelöst werden.
  const d = new Date(Date.UTC(year, month - 1, day));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function parseISO(iso: ISODate): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function isValidISO(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { year, month, day } = parseISO(iso);
  return toISO(year, month, day) === iso;
}

export function todayISO(): ISODate {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso: ISODate, days: number): ISODate {
  const { year, month, day } = parseISO(iso);
  return toISO(year, month, day + days);
}

export function addMonths(year: number, month: number, delta: number) {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = Montag … 6 = Sonntag */
export function weekdayIndex(iso: ISODate): number {
  const { year, month, day } = parseISO(iso);
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sonntag
  return (js + 6) % 7;
}

export function isWeekend(iso: ISODate): boolean {
  return weekdayIndex(iso) >= 5;
}

export function startOfWeek(iso: ISODate): ISODate {
  return addDays(iso, -weekdayIndex(iso));
}

/** Kalenderwoche nach ISO 8601 (in Deutschland üblich). */
export function isoWeek(iso: ISODate): { week: number; year: number } {
  // Donnerstag der Woche bestimmt das Jahr.
  const thursday = addDays(iso, 3 - weekdayIndex(iso));
  const { year } = parseISO(thursday);
  const jan4 = toISO(year, 1, 4);
  const week1Monday = startOfWeek(jan4);
  const diff = diffDays(week1Monday, thursday);
  return { week: Math.floor(diff / 7) + 1, year };
}

export function diffDays(from: ISODate, to: ISODate): number {
  const a = parseISO(from);
  const b = parseISO(to);
  const ms = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.round(ms / 86400000);
}

export function isBetween(iso: ISODate, start: ISODate, end: ISODate): boolean {
  return iso >= start && iso <= end;
}

/** Liefert 42 Tage (6 Wochen) für ein Monatsraster, beginnend am Montag. */
export function monthGrid(year: number, month: number): ISODate[] {
  const first = toISO(year, month, 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekDays(anyDayInWeek: ISODate): ISODate[] {
  const start = startOfWeek(anyDayInWeek);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatShort(iso: ISODate): string {
  const { month, day } = parseISO(iso);
  return `${pad(day)}.${pad(month)}.`;
}

export function formatDate(iso: ISODate): string {
  const { year, month, day } = parseISO(iso);
  return `${pad(day)}.${pad(month)}.${year}`;
}

export function formatLong(iso: ISODate): string {
  const { year, month, day } = parseISO(iso);
  return `${WEEKDAYS_LONG[weekdayIndex(iso)]}, ${day}. ${MONTHS[month - 1]} ${year}`;
}

export function formatRange(start: ISODate, end: ISODate): string {
  if (start === end) return formatDate(start);
  return `${formatShort(start)} – ${formatDate(end)}`;
}

/** Ostersonntag nach der gaußschen Osterformel (gregorianisch, anonymer Algorithmus). */
export function easterSunday(year: number): ISODate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toISO(year, month, day);
}

/** Validiert eine Uhrzeit im Format HH:MM (24 h). */
export function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}
