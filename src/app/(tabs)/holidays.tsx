import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FERIEN, FERIEN_HINWEIS, feiertageBW, SCHULJAHR } from '@/data/schoolData';
import { formatDate, formatRange, ISODate, WEEKDAYS_LONG, weekdayIndex } from '@/lib/dates';
import { COLORS } from '@/lib/theme';

// Zeitraum: Beginn des Schuljahres bis Ende der Sommerferien 2027
const FROM: ISODate = '2026-09-01';
const TO: ISODate = '2027-09-30';

function openDate(date: ISODate) {
  router.navigate({ pathname: '/', params: { date, t: String(Date.now()) } });
}

export default function HolidaysScreen() {
  // Sommerferien 2026 gehören noch zum Vorjahr und werden hier nicht aufgeführt.
  const ferien = FERIEN.filter((f) => f.end >= SCHULJAHR.ersterSchultag && f.start <= TO);
  const feiertage = [...feiertageBW(2026), ...feiertageBW(2027)].filter((f) => f.date >= FROM && f.date <= TO);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Schulferien Baden-Württemberg {SCHULJAHR.label}</Text>
      <Text style={styles.info}>
        Erster Schultag: {formatDate(SCHULJAHR.ersterSchultag)} · Letzter Schultag: {formatDate(SCHULJAHR.letzterSchultag)}
      </Text>
      {ferien.map((f) => (
        <Pressable key={f.id} style={[styles.row, styles.ferien]} onPress={() => openDate(f.start)} accessibilityRole="button">
          <Text style={styles.name}>{f.name}</Text>
          <Text style={styles.range}>{formatRange(f.start, f.end)}</Text>
        </Pressable>
      ))}
      <Text style={styles.note}>{FERIEN_HINWEIS}</Text>

      <Text style={[styles.h1, { marginTop: 18 }]}>Gesetzliche Feiertage</Text>
      {feiertage.map((f) => (
        <Pressable key={f.date} style={[styles.row, styles.feiertag]} onPress={() => openDate(f.date)} accessibilityRole="button">
          <Text style={styles.name}>{f.name}</Text>
          <Text style={styles.range}>
            {WEEKDAYS_LONG[weekdayIndex(f.date)]}, {formatDate(f.date)}
          </Text>
        </Pressable>
      ))}
      <View style={{ height: 12 }} />
      <Text style={styles.source}>
        Quelle Ferien: Kultusministerium Baden-Württemberg. Alle Angaben ohne Gewähr.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 12, paddingBottom: 24 },
  h1: { fontSize: 17, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 4 },
  info: { fontSize: 13, color: COLORS.textMuted, marginBottom: 10 },
  row: { borderRadius: 8, padding: 12, marginBottom: 6 },
  ferien: { backgroundColor: COLORS.ferien },
  feiertag: { backgroundColor: COLORS.surface, borderLeftWidth: 4, borderLeftColor: COLORS.feiertagText },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  range: { fontSize: 14, color: COLORS.text, marginTop: 2 },
  note: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, fontStyle: 'italic' },
  source: { fontSize: 11, color: COLORS.textMuted },
});
