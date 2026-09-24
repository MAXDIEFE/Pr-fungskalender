import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/lib/theme';
import { useSettings } from '@/store/settings';

export function Legend() {
  const { filter } = useSettings();
  return (
    <View style={styles.row}>
      <Item color={COLORS.ferien} label="Ferien" />
      <Item color={COLORS.feiertag} label="Feiertag" />
      {filter !== 'rs' && <Dot color={COLORS.hs} label="Prüfung HS" />}
      {filter !== 'hs' && <Dot color={COLORS.rs} label="Prüfung RS" />}
      <Dot color={COLORS.textMuted} label="Termin" />
    </View>
  );
}

function Item({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.item}>
      <View style={[styles.box, { backgroundColor: color }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.item}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12, paddingVertical: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  box: { width: 12, height: 12, borderRadius: 3, borderWidth: StyleSheet.hairlineWidth, borderColor: '#999' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 12, color: COLORS.textMuted },
});
