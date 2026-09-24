import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PageSize, printHtml, sharePdf } from '@/lib/print';
import { COLORS } from '@/lib/theme';

type Props = {
  label: string;
  buildHtml: () => string;
  size: PageSize;
};

export function PrintButtons({ label, buildHtml, size }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.button, styles.primary]}
        disabled={busy}
        accessibilityRole="button"
        onPress={() => run(() => printHtml(buildHtml(), size))}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="print-outline" size={18} color="#fff" />
        )}
        <Text style={styles.primaryText}>{label} drucken</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.secondary]}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={`${label} als PDF teilen`}
        onPress={() => run(() => sharePdf(buildHtml(), size, `${label} als PDF`))}>
        <Ionicons name="share-outline" size={18} color={COLORS.primary} />
        <Text style={styles.secondaryText}>PDF</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, padding: 12 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  primary: { flex: 1, backgroundColor: COLORS.primary },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondary: { borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  secondaryText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});
