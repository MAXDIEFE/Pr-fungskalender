import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/lib/theme';
import { SchulartFilter, useSettings } from '@/store/settings';

const OPTIONS: { value: SchulartFilter; label: string; color: string }[] = [
  { value: 'alle', label: 'Alle', color: COLORS.primary },
  { value: 'hs', label: 'Hauptschule', color: COLORS.hs },
  { value: 'rs', label: 'Realschule', color: COLORS.rs },
];

/** Auswahl, welche Prüfungen angezeigt werden. Gilt app-weit und für den Druck. */
export function FilterBar() {
  const { filter, setFilter } = useSettings();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {OPTIONS.map((o) => {
        const active = filter === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => setFilter(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: o.color, borderColor: o.color }]}>
            <Text style={[styles.text, active && styles.textActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  item: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  text: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  textActive: { color: '#fff' },
});
