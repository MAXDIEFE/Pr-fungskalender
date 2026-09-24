import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
};

/** Kopfzeile mit Vor/Zurück-Pfeilen und "Heute"-Knopf. */
export function NavHeader({ title, subtitle, onPrev, onNext, onToday }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} hitSlop={12} accessibilityRole="button" accessibilityLabel="Zurück" style={styles.arrow}>
        <Ionicons name="chevron-back" size={26} color={COLORS.primary} />
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable onPress={onNext} hitSlop={12} accessibilityRole="button" accessibilityLabel="Weiter" style={styles.arrow}>
        <Ionicons name="chevron-forward" size={26} color={COLORS.primary} />
      </Pressable>
      {onToday && (
        <Pressable onPress={onToday} accessibilityRole="button" style={styles.today}>
          <Text style={styles.todayText}>Heute</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  arrow: { padding: 6 },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textMuted },
  today: {
    marginLeft: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
});
