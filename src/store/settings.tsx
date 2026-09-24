import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import type { Schulart } from '@/data/schoolData';

export type SchulartFilter = 'alle' | Schulart;

type SettingsContextValue = {
  filter: SchulartFilter;
  setFilter: (f: SchulartFilter) => void;
};

const STORAGE_KEY = 'settings.schulartFilter.v1';

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [filter, setFilterState] = useState<SchulartFilter>('alle');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'alle' || value === 'hs' || value === 'rs') setFilterState(value);
      })
      .catch(() => {});
  }, []);

  const setFilter = useCallback((f: SchulartFilter) => {
    setFilterState(f);
    AsyncStorage.setItem(STORAGE_KEY, f).catch(() => {});
  }, []);

  return <SettingsContext.Provider value={{ filter, setFilter }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings muss innerhalb von SettingsProvider verwendet werden');
  return ctx;
}
