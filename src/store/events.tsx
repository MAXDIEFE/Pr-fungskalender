import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { ISODate } from '@/lib/dates';

export type CalendarEvent = {
  id: string;
  title: string;
  date: ISODate;
  /** HH:MM, leer = ganztägig */
  startTime?: string;
  endTime?: string;
  note?: string;
  color: string;
};

export type NewCalendarEvent = Omit<CalendarEvent, 'id'>;

type EventsContextValue = {
  loaded: boolean;
  events: CalendarEvent[];
  eventsByDate: Map<ISODate, CalendarEvent[]>;
  getEvent: (id: string) => CalendarEvent | undefined;
  addEvent: (e: NewCalendarEvent) => void;
  updateEvent: (id: string, e: NewCalendarEvent) => void;
  deleteEvent: (id: string) => void;
};

const STORAGE_KEY = 'events.v1';

const EventsContext = createContext<EventsContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function sortEvents(a: CalendarEvent, b: CalendarEvent) {
  // Ganztägige Termine zuerst, dann nach Uhrzeit, dann nach Titel.
  const ta = a.startTime ?? '';
  const tb = b.startTime ?? '';
  if (ta !== tb) return ta.localeCompare(tb);
  return a.title.localeCompare(b.title, 'de');
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEvents(parsed);
      })
      .catch(() => {})
      .finally(() => {
        loadedRef.current = true;
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    // Erst speichern, wenn geladen wurde – sonst würde der leere Anfangszustand gespeicherte Daten überschreiben.
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events)).catch(() => {});
  }, [events]);

  const addEvent = useCallback((e: NewCalendarEvent) => {
    setEvents((prev) => [...prev, { ...e, id: newId() }]);
  }, []);

  const updateEvent = useCallback((id: string, e: NewCalendarEvent) => {
    setEvents((prev) => prev.map((x) => (x.id === id ? { ...e, id } : x)));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<ISODate, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
    for (const list of map.values()) list.sort(sortEvents);
    return map;
  }, [events]);

  const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events]);

  const value = useMemo(
    () => ({ loaded, events, eventsByDate, getEvent, addEvent, updateEvent, deleteEvent }),
    [loaded, events, eventsByDate, getEvent, addEvent, updateEvent, deleteEvent],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents muss innerhalb von EventsProvider verwendet werden');
  return ctx;
}
