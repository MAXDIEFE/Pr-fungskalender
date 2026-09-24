import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayDetails } from '@/components/DayDetails';
import { Fab } from '@/components/Fab';
import { FilterBar } from '@/components/FilterBar';
import { NavHeader } from '@/components/NavHeader';
import { PrintButtons } from '@/components/PrintButtons';
import { addDays, formatDate, formatShort, isoWeek, startOfWeek, todayISO, WEEKDAYS_LONG, weekDays } from '@/lib/dates';
import { ferienAm } from '@/lib/dayInfo';
import { feiertagAm } from '@/data/schoolData';
import { A4_PORTRAIT, weekOverviewHtml } from '@/lib/printHtml';
import { COLORS } from '@/lib/theme';
import { useEvents } from '@/store/events';
import { useSettings } from '@/store/settings';

export default function WeekScreen() {
  const [monday, setMonday] = useState(() => startOfWeek(todayISO()));
  const { filter } = useSettings();
  const { eventsByDate } = useEvents();
  const days = weekDays(monday);
  const { week, year } = isoWeek(monday);
  const today = todayISO();

  const buildHtml = () => weekOverviewHtml({ anyDay: monday, filter, eventsByDate });

  return (
    <View style={styles.flex}>
      <NavHeader
        title={`KW ${week} / ${year}`}
        subtitle={`${formatDate(days[0])} – ${formatDate(days[6])}`}
        onPrev={() => setMonday(addDays(monday, -7))}
        onNext={() => setMonday(addDays(monday, 7))}
        onToday={() => setMonday(startOfWeek(todayISO()))}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <FilterBar />
        <PrintButtons label="Wochenübersicht" size={A4_PORTRAIT} buildHtml={buildHtml} />
        {days.map((iso, i) => {
          const colored = feiertagAm(iso) ? COLORS.feiertag : ferienAm(iso) ? COLORS.ferien : undefined;
          return (
            <View key={iso} style={styles.day}>
              <Pressable
                style={[styles.dayHeader, colored && { backgroundColor: colored }]}
                accessibilityRole="button"
                accessibilityHint="Im Monatskalender öffnen"
                onPress={() => router.navigate({ pathname: '/', params: { date: iso, t: String(Date.now()) } })}>
                <Text style={[styles.dayName, iso === today && styles.todayText]}>{WEEKDAYS_LONG[i]}</Text>
                <Text style={[styles.dayDate, iso === today && styles.todayText]}>{formatShort(iso)}</Text>
              </Pressable>
              <DayDetails date={iso} showTitle={false} />
            </View>
          );
        })}
      </ScrollView>
      <Fab label="Neuer Termin" onPress={() => router.push({ pathname: '/event', params: { date: monday } })} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 96 },
  day: { marginHorizontal: 8, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 8, overflow: 'hidden' },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  dayName: { fontWeight: '700', fontSize: 15, color: COLORS.text },
  dayDate: { fontSize: 15, color: COLORS.textMuted },
  todayText: { color: COLORS.primary },
});
