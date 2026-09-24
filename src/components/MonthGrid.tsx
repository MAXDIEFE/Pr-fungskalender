import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  daysInMonth,
  diffDays,
  ISODate,
  monthGrid,
  parseISO,
  todayISO,
  toISO,
  WEEKDAYS_SHORT,
} from '@/lib/dates';
import { getDayInfo } from '@/lib/dayInfo';
import { COLORS } from '@/lib/theme';
import { useEvents } from '@/store/events';
import { useSettings } from '@/store/settings';

type Props = {
  year: number;
  month: number;
  selected?: ISODate;
  onSelect?: (iso: ISODate) => void;
  compact?: boolean;
};

export const MonthGrid = memo(function MonthGrid({ year, month, selected, onSelect, compact }: Props) {
  const { filter } = useSettings();
  const { eventsByDate } = useEvents();
  const today = todayISO();
  const days = monthGrid(year, month);
  // Nur so viele Wochenzeilen anzeigen, wie der Monat braucht (4 bis 6).
  const offset = diffDays(days[0], toISO(year, month, 1));
  const rows = Math.ceil((offset + daysInMonth(year, month)) / 7);
  const visible = days.slice(0, rows * 7);
  const cellHeight = compact ? 18 : 54;

  return (
    <View>
      <View style={styles.row}>
        {WEEKDAYS_SHORT.map((w, i) => (
          <Text key={w} style={[styles.weekday, compact && styles.weekdayCompact, i >= 5 && styles.weekendText]}>
            {compact ? w[0] : w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {visible.map((iso, i) => {
          const { month: m, day } = parseISO(iso);
          const inMonth = m === month;
          const info = getDayInfo(iso, filter, eventsByDate);
          const bg = !inMonth
            ? undefined
            : info.feiertag
              ? COLORS.feiertag
              : info.ferien
                ? COLORS.ferien
                : i % 7 >= 5
                  ? COLORS.weekend
                  : undefined;
          const isToday = iso === today;
          const isSelected = iso === selected;
          const hasHs = info.pruefungen.some((p) => p.schulart === 'hs');
          const hasRs = info.pruefungen.some((p) => p.schulart === 'rs');
          const label = [
            `${day}.`,
            info.feiertag,
            info.ferien?.name,
            ...info.pruefungen.map((p) => `Prüfung ${p.fach}`),
            info.events.length ? `${info.events.length} Termin(e)` : undefined,
          ]
            .filter(Boolean)
            .join(', ');

          return (
            <Pressable
              key={iso}
              disabled={!onSelect}
              onPress={() => onSelect?.(iso)}
              accessibilityLabel={label}
              style={[
                styles.cell,
                { height: cellHeight, backgroundColor: bg },
                isSelected && !compact && styles.selected,
              ]}>
              <View style={[styles.dayCircle, compact && styles.dayCircleCompact, isToday && styles.today]}>
                <Text
                  style={[
                    styles.dayText,
                    compact && styles.dayTextCompact,
                    !inMonth && styles.outside,
                    info.feiertag && inMonth && styles.feiertagText,
                    isToday && styles.todayText,
                  ]}>
                  {day}
                </Text>
              </View>
              {inMonth && !compact && (
                <View style={styles.dots}>
                  {hasHs && <View style={[styles.dot, { backgroundColor: COLORS.hs }]} />}
                  {hasRs && <View style={[styles.dot, { backgroundColor: COLORS.rs }]} />}
                  {info.events.slice(0, 3).map((e) => (
                    <View key={e.id} style={[styles.dot, { backgroundColor: e.color }]} />
                  ))}
                </View>
              )}
              {inMonth && compact && (hasHs || hasRs) && (
                <View style={[styles.compactMark, { backgroundColor: hasRs && !hasHs ? COLORS.rs : COLORS.hs }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    paddingVertical: 4,
  },
  weekdayCompact: { fontSize: 9, paddingVertical: 1 },
  weekendText: { color: COLORS.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  selected: { borderWidth: 2, borderColor: COLORS.primary },
  dayCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayCircleCompact: { width: 14, height: 14, borderRadius: 7 },
  today: { backgroundColor: COLORS.today },
  dayText: { fontSize: 15, color: COLORS.text },
  dayTextCompact: { fontSize: 9 },
  todayText: { color: '#fff', fontWeight: '700' },
  outside: { color: '#B5BDC7' },
  feiertagText: { color: COLORS.feiertagText, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 3, marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  compactMark: { position: 'absolute', bottom: 1, width: 10, height: 2, borderRadius: 1 },
});
