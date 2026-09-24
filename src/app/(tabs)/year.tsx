import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterBar } from '@/components/FilterBar';
import { Legend } from '@/components/Legend';
import { MonthGrid } from '@/components/MonthGrid';
import { PrintButtons } from '@/components/PrintButtons';
import { SCHULJAHR } from '@/data/schoolData';
import { addMonths, MONTHS, toISO } from '@/lib/dates';
import { A4_LANDSCAPE, yearOverviewHtml } from '@/lib/printHtml';
import { COLORS } from '@/lib/theme';
import { useEvents } from '@/store/events';
import { useSettings } from '@/store/settings';

type Range = { key: string; label: string; title: string; startYear: number; startMonth: number };

const RANGES: Range[] = [
  {
    key: 'schuljahr',
    label: `Schuljahr ${SCHULJAHR.label}`,
    title: `Jahresübersicht Schuljahr ${SCHULJAHR.label} (September 2026 – August 2027)`,
    startYear: 2026,
    startMonth: 9,
  },
  {
    key: '2027',
    label: 'Kalenderjahr 2027',
    title: 'Jahresübersicht 2027',
    startYear: 2027,
    startMonth: 1,
  },
];

export default function YearScreen() {
  const [range, setRange] = useState<Range>(RANGES[0]);
  const { filter } = useSettings();
  const { eventsByDate } = useEvents();
  const months = Array.from({ length: 12 }, (_, i) => addMonths(range.startYear, range.startMonth, i));

  const buildHtml = () =>
    yearOverviewHtml({
      title: range.title,
      startYear: range.startYear,
      startMonth: range.startMonth,
      filter,
      eventsByDate,
    });

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <Pressable
            key={r.key}
            onPress={() => setRange(r)}
            accessibilityRole="radio"
            accessibilityState={{ selected: r.key === range.key }}
            style={[styles.rangeItem, r.key === range.key && styles.rangeActive]}>
            <Text style={[styles.rangeText, r.key === range.key && styles.rangeTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>
      <FilterBar />
      <PrintButtons label="Jahresübersicht" size={A4_LANDSCAPE} buildHtml={buildHtml} />
      <Legend />
      <View style={styles.grid}>
        {months.map(({ year, month }) => (
          <Pressable
            key={`${year}-${month}`}
            style={styles.month}
            accessibilityRole="button"
            accessibilityLabel={`${MONTHS[month - 1]} ${year} öffnen`}
            onPress={() =>
              router.navigate({ pathname: '/', params: { date: toISO(year, month, 1), t: String(Date.now()) } })
            }>
            <Text style={styles.monthTitle}>
              {MONTHS[month - 1]} {year}
            </Text>
            <MonthGrid year={year} month={month} compact />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 24 },
  rangeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 10 },
  rangeItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  rangeActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  rangeText: { fontWeight: '600', color: COLORS.text, fontSize: 13 },
  rangeTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 },
  month: { width: '33.33%', padding: 4 },
  monthTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2, textAlign: 'center' },
});
