import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export type PageSize = { width: number; height: number };

/**
 * Erzeugt aus dem HTML ein PDF im gewünschten DIN-A4-Format und öffnet
 * danach den System-Druckdialog. Über den Umweg PDF ist das Seitenformat
 * garantiert, unabhängig vom Standardpapier des Druckers.
 */
export async function printHtml(html: string, size: PageSize) {
  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return;
    }
    const { uri } = await Print.printToFileAsync({ html, ...size });
    await Print.printAsync({ uri });
  } catch (e) {
    showError(e);
  }
}

/** Erzeugt ein PDF und öffnet den Teilen-Dialog (z. B. speichern, per Mail senden). */
export async function sharePdf(html: string, size: PageSize, dialogTitle: string) {
  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return;
    }
    const { uri } = await Print.printToFileAsync({ html, ...size });
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Teilen nicht möglich', 'Auf diesem Gerät ist Teilen nicht verfügbar.');
      return;
    }
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle });
  } catch (e) {
    showError(e);
  }
}

function showError(e: unknown) {
  // iOS meldet einen Abbruch des Druckdialogs als Fehler – das ist kein echter Fehler.
  const msg = e instanceof Error ? e.message : String(e);
  if (/cancel|abgebrochen/i.test(msg)) return;
  Alert.alert('Drucken fehlgeschlagen', msg);
}
