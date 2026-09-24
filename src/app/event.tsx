import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatLong, isValidISO, ISODate, isValidTime, parseISO, todayISO, toISO } from '@/lib/dates';
import { COLORS, EVENT_COLORS } from '@/lib/theme';
import { useEvents } from '@/store/events';

type PickerMode = { kind: 'date' } | { kind: 'start' } | { kind: 'end' } | null;

function isoToDate(iso: ISODate): Date {
  const { year, month, day } = parseISO(iso);
  // 12 Uhr mittags, damit Sommer-/Winterzeit den Tag nie verschiebt.
  return new Date(year, month - 1, day, 12, 0, 0);
}

function timeToDate(time: string | undefined): Date {
  const d = new Date();
  const [h, m] = (time ?? '08:00').split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function EventScreen() {
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const { getEvent, addEvent, updateEvent, deleteEvent } = useEvents();
  const existing = params.id ? getEvent(params.id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState<ISODate>(
    existing?.date ?? (params.date && isValidISO(params.date) ? params.date : todayISO()),
  );
  const [allDay, setAllDay] = useState(!existing?.startTime);
  const [startTime, setStartTime] = useState(existing?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(existing?.endTime ?? '09:00');
  const [note, setNote] = useState(existing?.note ?? '');
  const [color, setColor] = useState(existing?.color ?? EVENT_COLORS[0]);
  const [picker, setPicker] = useState<PickerMode>(null);
  const [webDate, setWebDate] = useState(date);

  const onPicked = (mode: NonNullable<PickerMode>, event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS !== 'ios') setPicker(null);
    if (event.type !== 'set' || !value) return;
    if (mode.kind === 'date') {
      setDate(toISO(value.getFullYear(), value.getMonth() + 1, value.getDate()));
    } else {
      const t = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
      if (mode.kind === 'start') setStartTime(t);
      else setEndTime(t);
    }
  };

  const openPicker = (mode: NonNullable<PickerMode>) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: mode.kind === 'date' ? isoToDate(date) : timeToDate(mode.kind === 'start' ? startTime : endTime),
        mode: mode.kind === 'date' ? 'date' : 'time',
        is24Hour: true,
        onChange: (e, v) => onPicked(mode, e, v),
      });
    } else {
      setPicker(picker?.kind === mode.kind ? null : mode);
    }
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Titel fehlt', 'Bitte gib einen Titel für den Termin ein.');
      return;
    }
    if (!allDay) {
      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        Alert.alert('Uhrzeit ungültig', 'Bitte wähle eine gültige Uhrzeit.');
        return;
      }
      if (endTime < startTime) {
        Alert.alert('Uhrzeit ungültig', 'Das Ende darf nicht vor dem Beginn liegen.');
        return;
      }
    }
    const data = {
      title: trimmed,
      date,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      note: note.trim() || undefined,
      color,
    };
    if (existing) updateEvent(existing.id, data);
    else addEvent(data);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Termin löschen?', `„${existing.title}“ wird endgültig gelöscht.`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          deleteEvent(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: existing ? 'Termin bearbeiten' : 'Neuer Termin' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="z. B. Elternabend"
          maxLength={120}
          autoFocus={!existing}
          returnKeyType="done"
        />

        <Text style={styles.label}>Datum</Text>
        {Platform.OS === 'web' ? (
          <TextInput
            style={styles.input}
            value={webDate}
            placeholder="JJJJ-MM-TT"
            onChangeText={(t) => {
              setWebDate(t);
              if (isValidISO(t)) setDate(t);
            }}
          />
        ) : (
          <Pressable style={styles.input} onPress={() => openPicker({ kind: 'date' })} accessibilityRole="button">
            <Text style={styles.value}>{formatLong(date)}</Text>
          </Pressable>
        )}
        {Platform.OS === 'ios' && picker?.kind === 'date' && (
          <DateTimePicker
            value={isoToDate(date)}
            mode="date"
            display="inline"
            locale="de-DE"
            onChange={(e, v) => onPicked({ kind: 'date' }, e, v)}
          />
        )}

        <View style={styles.switchRow}>
          <Text style={styles.value}>Ganztägig</Text>
          <Switch value={allDay} onValueChange={setAllDay} />
        </View>

        {!allDay && (
          <View style={styles.timeRow}>
            <View style={styles.flex}>
              <Text style={styles.label}>Beginn</Text>
              <TimeField
                value={startTime}
                onChange={setStartTime}
                onPress={() => openPicker({ kind: 'start' })}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Ende</Text>
              <TimeField value={endTime} onChange={setEndTime} onPress={() => openPicker({ kind: 'end' })} />
            </View>
          </View>
        )}
        {Platform.OS === 'ios' && !allDay && (picker?.kind === 'start' || picker?.kind === 'end') && (
          <DateTimePicker
            value={timeToDate(picker.kind === 'start' ? startTime : endTime)}
            mode="time"
            display="spinner"
            locale="de-DE"
            is24Hour
            onChange={(e, v) => onPicked(picker, e, v)}
          />
        )}

        <Text style={styles.label}>Notiz</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={note}
          onChangeText={setNote}
          placeholder="optional"
          multiline
          maxLength={500}
        />

        <Text style={styles.label}>Farbe</Text>
        <View style={styles.colors}>
          {EVENT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="radio"
              accessibilityState={{ selected: c === color }}
              accessibilityLabel={`Farbe ${c}`}
              style={[styles.color, { backgroundColor: c }, c === color && styles.colorActive]}
            />
          ))}
        </View>

        <Pressable style={styles.save} onPress={save} accessibilityRole="button">
          <Text style={styles.saveText}>Speichern</Text>
        </Pressable>
        {existing && (
          <Pressable style={styles.delete} onPress={remove} accessibilityRole="button">
            <Text style={styles.deleteText}>Termin löschen</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TimeField({ value, onChange, onPress }: { value: string; onChange: (t: string) => void; onPress: () => void }) {
  if (Platform.OS === 'web') {
    return <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="HH:MM" maxLength={5} />;
  }
  return (
    <Pressable style={styles.input} onPress={onPress} accessibilityRole="button">
      <Text style={styles.value}>{value} Uhr</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  value: { fontSize: 16, color: COLORS.text },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeRow: { flexDirection: 'row', gap: 12 },
  colors: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  color: { width: 36, height: 36, borderRadius: 18 },
  colorActive: { borderWidth: 3, borderColor: COLORS.text },
  save: { marginTop: 28, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  delete: { marginTop: 12, paddingVertical: 14, alignItems: 'center' },
  deleteText: { color: COLORS.danger, fontSize: 16, fontWeight: '600' },
});
