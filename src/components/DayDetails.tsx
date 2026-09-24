import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SCHULART_LABEL } from '@/data/schoolData';
import { formatLong, formatRange, ISODate } from '@/lib/dates';
import { getDayInfo } from '@/lib/dayInfo';
import { COLORS } from '@/lib/theme';
import { useEvents } from '@/store/events';
import { useSettings } from '@/store/settings';

/** Alle Einträge eines Tages: Feiertag, Ferien, Prüfungen und eigene Termine. */
export function DayDetails({ date, showTitle = true }: { date: ISODate; showTitle?: boolean }) {
  const { filter } = useSettings();
  const { eventsByDate } = useEvents();
  const info = getDayInfo(date, filter, eventsByDate);
  const empty = !info.feiertag && !info.ferien && info.pruefungen.length === 0 && info.events.length === 0;

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.title}>{formatLong(date)}</Text>}
      {info.feiertag && (
        <View style={[styles.badge, { backgroundColor: COLORS.feiertag }]}>
          <Text style={[styles.badgeText, { color: COLORS.feiertagText }]}>Feiertag: {info.feiertag}</Text>
        </View>
      )}
      {info.ferien && (
        <View style={[styles.badge, { backgroundColor: COLORS.ferien }]}>
          <Text style={[styles.badgeText, { color: COLORS.ferienText }]}>
            {info.ferien.name} ({formatRange(info.ferien.start, info.ferien.end)})
          </Text>
        </View>
      )}
      {info.pruefungen.map((p) => (
        <View key={p.id} style={[styles.exam, { borderLeftColor: COLORS[p.schulart] }]}>
          <Text style={[styles.examType, { color: COLORS[p.schulart] }]}>
            {SCHULART_LABEL[p.schulart]} · {p.termin}
          </Text>
          <Text style={styles.examTitle}>Schriftliche Prüfung {p.fach}</Text>
        </View>
      ))}
      {info.events.map((e) => (
        <Pressable
          key={e.id}
          style={styles.event}
          accessibilityRole="button"
          accessibilityHint="Termin bearbeiten"
          onPress={() => router.push({ pathname: '/event', params: { id: e.id } })}>
          <View style={[styles.eventColor, { backgroundColor: e.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle}>{e.title}</Text>
            <Text style={styles.eventMeta}>
              {e.startTime ? `${e.startTime}${e.endTime ? ` – ${e.endTime}` : ''} Uhr` : 'Ganztägig'}
              {e.note ? ` · ${e.note}` : ''}
            </Text>
          </View>
        </Pressable>
      ))}
      {empty && <Text style={styles.empty}>Keine Einträge</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  badge: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  badgeText: { fontSize: 13, fontWeight: '600' },
  exam: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 10,
    elevation: 1,
  },
  examType: { fontSize: 12, fontWeight: '700' },
  examTitle: { fontSize: 15, color: COLORS.text, marginTop: 2 },
  event: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    elevation: 1,
  },
  eventColor: { width: 6, alignSelf: 'stretch', borderRadius: 3 },
  eventTitle: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  eventMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  empty: { color: COLORS.textMuted, fontStyle: 'italic' },
});
