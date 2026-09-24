import { addDays, easterSunday, ISODate, toISO } from '@/lib/dates';

/**
 * Schulferien Baden-Württemberg
 * Quelle: Kultusministerium Baden-Württemberg (km.baden-wuerttemberg.de/de/service/ferien)
 * Letzter Arbeitstag der Ferien ist jeweils Freitag; das offizielle Enddatum ist
 * wie beim Kultusministerium der Samstag.
 */
export type Ferien = {
  id: string;
  name: string;
  start: ISODate;
  end: ISODate;
  hinweis?: string;
};

export const FERIEN: Ferien[] = [
  { id: 'sommer-2026', name: 'Sommerferien', start: '2026-07-30', end: '2026-09-12' },
  { id: 'herbst-2026', name: 'Herbstferien', start: '2026-10-26', end: '2026-10-31' },
  { id: 'weihnachten-2026', name: 'Weihnachtsferien', start: '2026-12-23', end: '2027-01-09' },
  {
    id: 'gruendonnerstag-2027',
    name: 'Gründonnerstag (unterrichtsfrei)',
    start: '2027-03-25',
    end: '2027-03-25',
  },
  { id: 'ostern-2027', name: 'Osterferien', start: '2027-03-30', end: '2027-04-03' },
  { id: 'pfingsten-2027', name: 'Pfingstferien', start: '2027-05-18', end: '2027-05-29' },
  { id: 'sommer-2027', name: 'Sommerferien', start: '2027-07-29', end: '2027-09-11' },
];

export const FERIEN_HINWEIS =
  'Zusätzlich legt jede Schule bis zu vier bewegliche Ferientage selbst fest. ' +
  'Diese sind schulspezifisch und deshalb nicht enthalten – du kannst sie als eigene Termine eintragen.';

/** Schuljahr 2026/27 */
export const SCHULJAHR = {
  label: '2026/27',
  /** Erster Schultag nach den Sommerferien 2026 */
  ersterSchultag: '2026-09-14',
  /** Letzter Schultag vor den Sommerferien 2027 */
  letzterSchultag: '2027-07-28',
};

/** Gesetzliche Feiertage in Baden-Württemberg für ein Kalenderjahr. */
export type Feiertag = { date: ISODate; name: string };

export function feiertageBW(year: number): Feiertag[] {
  const easter = easterSunday(year);
  return [
    { date: toISO(year, 1, 1), name: 'Neujahr' },
    { date: toISO(year, 1, 6), name: 'Heilige Drei Könige' },
    { date: addDays(easter, -2), name: 'Karfreitag' },
    { date: addDays(easter, 1), name: 'Ostermontag' },
    { date: toISO(year, 5, 1), name: 'Tag der Arbeit' },
    { date: addDays(easter, 39), name: 'Christi Himmelfahrt' },
    { date: addDays(easter, 50), name: 'Pfingstmontag' },
    { date: addDays(easter, 60), name: 'Fronleichnam' },
    { date: toISO(year, 10, 3), name: 'Tag der Deutschen Einheit' },
    { date: toISO(year, 11, 1), name: 'Allerheiligen' },
    { date: toISO(year, 12, 25), name: '1. Weihnachtstag' },
    { date: toISO(year, 12, 26), name: '2. Weihnachtstag' },
  ].sort((a, b) => a.date.localeCompare(b.date));
}

const feiertagCache = new Map<number, Map<ISODate, string>>();

export function feiertagAm(iso: ISODate): string | undefined {
  const year = Number(iso.slice(0, 4));
  let map = feiertagCache.get(year);
  if (!map) {
    map = new Map(feiertageBW(year).map((f) => [f.date, f.name]));
    feiertagCache.set(year, map);
  }
  return map.get(iso);
}

/**
 * Prüfungstermine 2027 – schriftliche Prüfungen
 * Realschulabschlussprüfung (auch Schulfremde, RSAPO)
 * Hauptschulabschlussprüfung (auch Schulfremde, HSAPO)
 */
export type Schulart = 'hs' | 'rs';
export type Termin = 'Haupttermin' | 'Nachtermin';

export type Pruefung = {
  id: string;
  schulart: Schulart;
  termin: Termin;
  fach: string;
  date: ISODate;
};

export const SCHULART_LABEL: Record<Schulart, string> = {
  hs: 'Hauptschule',
  rs: 'Realschule',
};

export const SCHULART_LANG: Record<Schulart, string> = {
  hs: 'Hauptschulabschlussprüfung (HSAPO)',
  rs: 'Realschulabschlussprüfung (RSAPO)',
};

export const PRUEFUNGEN: Pruefung[] = [
  // Realschule – Haupttermin
  { id: 'rs-h-de', schulart: 'rs', termin: 'Haupttermin', fach: 'Deutsch', date: '2027-04-27' },
  { id: 'rs-h-ma', schulart: 'rs', termin: 'Haupttermin', fach: 'Mathematik', date: '2027-04-29' },
  {
    id: 'rs-h-en',
    schulart: 'rs',
    termin: 'Haupttermin',
    fach: 'Englisch (Pflichtfremdsprache)',
    date: '2027-05-03',
  },
  {
    id: 'rs-h-wp',
    schulart: 'rs',
    termin: 'Haupttermin',
    fach: 'Wahlpflichtfach',
    date: '2027-05-05',
  },
  // Realschule – Nachtermin
  { id: 'rs-n-de', schulart: 'rs', termin: 'Nachtermin', fach: 'Deutsch', date: '2027-06-03' },
  { id: 'rs-n-ma', schulart: 'rs', termin: 'Nachtermin', fach: 'Mathematik', date: '2027-06-04' },
  {
    id: 'rs-n-en',
    schulart: 'rs',
    termin: 'Nachtermin',
    fach: 'Englisch (Pflichtfremdsprache)',
    date: '2027-06-07',
  },
  {
    id: 'rs-n-wp',
    schulart: 'rs',
    termin: 'Nachtermin',
    fach: 'Wahlpflichtfach',
    date: '2027-06-08',
  },
  // Hauptschule – Haupttermin
  { id: 'hs-h-de', schulart: 'hs', termin: 'Haupttermin', fach: 'Deutsch', date: '2027-04-27' },
  { id: 'hs-h-ma', schulart: 'hs', termin: 'Haupttermin', fach: 'Mathematik', date: '2027-04-29' },
  { id: 'hs-h-en', schulart: 'hs', termin: 'Haupttermin', fach: 'Englisch', date: '2027-05-03' },
  // Hauptschule – Nachtermin
  { id: 'hs-n-de', schulart: 'hs', termin: 'Nachtermin', fach: 'Deutsch', date: '2027-06-03' },
  { id: 'hs-n-ma', schulart: 'hs', termin: 'Nachtermin', fach: 'Mathematik', date: '2027-06-04' },
  { id: 'hs-n-en', schulart: 'hs', termin: 'Nachtermin', fach: 'Englisch', date: '2027-06-07' },
];
