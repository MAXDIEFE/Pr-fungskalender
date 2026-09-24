import { router } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { FilterBar } from '@/components/FilterBar';
import { Pruefung, Schulart, SCHULART_LANG, Termin } from '@/data/schoolData';
import { formatDate, WEEKDAYS_LONG, weekdayIndex } from '@/lib/dates';
import { filterPruefungen } from '@/lib/dayInfo';
import { COLORS } from '@/lib/theme';
import { useSettings } from '@/store/settings';

type Section = { title: string; subtitle: string; schulart: Schulart; data: Pruefung[] };

const ORDER: { schulart: Schulart; termin: Termin }[] = [
  { schulart: 'hs', termin: 'Haupttermin' },
  { schulart: 'hs', termin: 'Nachtermin' },
  { schulart: 'rs', termin: 'Haupttermin' },
  { schulart: 'rs', termin: 'Nachtermin' },
];

export default function ExamsScreen() {
  const { filter } = useSettings();
  const list = filterPruefungen(filter);

  const sections: Section[] = ORDER.map(({ schulart, termin }) => ({
    title: SCHULART_LANG[schulart],
    subtitle: `Schriftliche Prüfung 2027 · ${termin}`,
    schulart,
    data: list
      .filter((p) => p.schulart === schulart && p.termin === termin)
      .sort((a, b) => a.date.localeCompare(b.date)),
  })).filter((s) => s.data.length > 0);

  return (
    <SectionList
      style={styles.flex}
      sections={sections}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={<FilterBar />}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.content}
      renderSectionHeader={({ section }) => (
        <View style={[styles.header, { borderLeftColor: COLORS[section.schulart] }]}>
          <Text style={[styles.headerTitle, { color: COLORS[section.schulart] }]}>{section.title}</Text>
          <Text style={styles.headerSub}>{section.subtitle}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          accessibilityRole="button"
          accessibilityHint="Im Kalender anzeigen"
          onPress={() => router.navigate({ pathname: '/', params: { date: item.date, t: String(Date.now()) } })}>
          <View style={styles.dateBox}>
            <Text style={styles.weekday}>{WEEKDAYS_LONG[weekdayIndex(item.date)]}</Text>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
          <Text style={styles.fach}>{item.fach}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },
  header: { marginTop: 14, marginHorizontal: 12, paddingLeft: 10, borderLeftWidth: 4, marginBottom: 6 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 13, color: COLORS.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: 8,
    gap: 12,
    elevation: 1,
  },
  dateBox: { width: 110 },
  weekday: { fontSize: 12, color: COLORS.textMuted },
  date: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  fach: { flex: 1, fontSize: 15, color: COLORS.text },
});
