import { FERIEN, Ferien, feiertagAm, Pruefung, PRUEFUNGEN } from '@/data/schoolData';
import type { CalendarEvent } from '@/store/events';
import type { SchulartFilter } from '@/store/settings';

import { ISODate, isBetween } from './dates';

export type DayInfo = {
  date: ISODate;
  ferien?: Ferien;
  feiertag?: string;
  pruefungen: Pruefung[];
  events: CalendarEvent[];
};

export function ferienAm(iso: ISODate): Ferien | undefined {
  return FERIEN.find((f) => isBetween(iso, f.start, f.end));
}

export function pruefungenAm(iso: ISODate, filter: SchulartFilter): Pruefung[] {
  return PRUEFUNGEN.filter((p) => p.date === iso && (filter === 'alle' || p.schulart === filter)).sort(
    (a, b) => a.schulart.localeCompare(b.schulart),
  );
}

export function filterPruefungen(filter: SchulartFilter): Pruefung[] {
  return PRUEFUNGEN.filter((p) => filter === 'alle' || p.schulart === filter);
}

export function getDayInfo(
  iso: ISODate,
  filter: SchulartFilter,
  eventsByDate: Map<ISODate, CalendarEvent[]>,
): DayInfo {
  return {
    date: iso,
    ferien: ferienAm(iso),
    feiertag: feiertagAm(iso),
    pruefungen: pruefungenAm(iso, filter),
    events: eventsByDate.get(iso) ?? [],
  };
}
