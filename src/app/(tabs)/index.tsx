import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DayDetails } from '@/components/DayDetails';
import { Fab } from '@/components/Fab';
import { FilterBar } from '@/components/FilterBar';
import { Legend } from '@/components/Legend';
import { MonthGrid } from '@/components/MonthGrid';
import { NavHeader } from '@/components/NavHeader';
import { addMonths, isValidISO, ISODate, MONTHS, parseISO, todayISO, toISO } from '@/lib/dates';
import { COLORS } from '@/lib/theme';

export default function MonthScreen() {
  const params = useLocalSearchParams<{ date?: string; t?: string }>();
  const [selected, setSelected] = useState<ISODate>(todayISO());
  const [{ year, month }, setMonth] = useState(() => {
    const { year, month } = parseISO(todayISO());
    return { year, month };
  });

  // Sprung zu einem Datum, z. B. aus der Prüfungsliste oder Jahresansicht.
  // Der Zustand wird während des Renderns angepasst, sobald neue Parameter ankommen.
  const jumpKey = `${params.date ?? ''}|${params.t ?? ''}`;
  const [handledJump, setHandledJump] = useState('|');
  if (jumpKey !== handledJump) {
    setHandledJump(jumpKey);
    if (params.date && isValidISO(params.date)) {
      const target = parseISO(params.date);
      setMonth({ year: target.year, month: target.month });
      setSelected(params.date);
    }
  }

  const go = (delta: number) => {
    const next = addMonths(year, month, delta);
    setMonth(next);
    setSelected(toISO(next.year, next.month, 1));
  };

  const goToday = () => {
    const t = todayISO();
    const { year, month } = parseISO(t);
    setMonth({ year, month });
    setSelected(t);
  };

  return (
    <View style={styles.flex}>
      <NavHeader title={`${MONTHS[month - 1]} ${year}`} onPrev={() => go(-1)} onNext={() => go(1)} onToday={goToday} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <FilterBar />
        <View style={styles.card}>
          <MonthGrid year={year} month={month} selected={selected} onSelect={setSelected} />
        </View>
        <Legend />
        <DayDetails date={selected} />
      </ScrollView>
      <Fab label="Neuer Termin" onPress={() => router.push({ pathname: '/event', params: { date: selected } })} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 96 },
  card: { backgroundColor: COLORS.surface, marginHorizontal: 8, borderRadius: 8, overflow: 'hidden' },
});
