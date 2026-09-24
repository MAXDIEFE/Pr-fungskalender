# Prüfungskalender BW

Android-App (Expo / React Native) mit Schulferien und Feiertagen in Baden-Württemberg sowie den
schriftlichen Abschlussprüfungen 2027 für Haupt- und Realschule.

## Funktionen

- **Monat / Woche / Jahr** – Kalenderansichten mit farbig markierten Ferien, Feiertagen und Prüfungen
- **Prüfungen** – schriftliche Prüfungen 2027, aufgeschlüsselt nach Hauptschule (HSAPO) und Realschule (RSAPO), Haupt- und Nachtermin
- **Ferien** – Schulferien 2026/27 und gesetzliche Feiertage BW
- **Filter** Alle / Hauptschule / Realschule (gilt für alle Ansichten und den Druck)
- **Eigene Termine** anlegen, bearbeiten, löschen (lokal auf dem Gerät gespeichert)
- **Drucken in DIN A4**: Jahresübersicht (quer) und Wochenübersicht (hoch), alternativ als PDF teilen

## Daten pflegen

Alle festen Termine stehen in [`src/data/schoolData.ts`](src/data/schoolData.ts):

- `FERIEN` – Schulferien (Quelle: Kultusministerium BW)
- `PRUEFUNGEN` – Prüfungstermine
- `feiertageBW()` – gesetzliche Feiertage, werden für jedes Jahr berechnet (Osterformel)

Für ein neues Schuljahr dort die Termine ergänzen, `SCHULJAHR` sowie die Zeiträume in
`src/app/(tabs)/year.tsx` anpassen und die Tests in `src/__tests__/` erweitern.

## Entwicklung

```bash
npm install
npx expo start          # Entwicklungsserver (Expo Go oder Development Build)
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm test                # Jest-Tests (u. a. Prüfen aller Termine und Wochentage)
```

Hinweis: Die App nutzt `@react-native-community/datetimepicker` und `expo-print`; beides ist in Expo Go enthalten.

## Veröffentlichung im Google Play Store

Voraussetzungen: kostenloses [Expo-Konto](https://expo.dev/signup) und ein
[Google-Play-Entwicklerkonto](https://play.google.com/console/signup) (einmalig 25 US-$).

1. **EAS einrichten** (einmalig):
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init        # verknüpft das Projekt mit deinem Expo-Konto
   ```
2. **Testversion (APK) zum Ausprobieren** auf dem eigenen Handy:
   ```bash
   npx eas-cli@latest build --platform android --profile preview
   ```
3. **Release-Build (AAB) für den Play Store:**
   ```bash
   npx eas-cli@latest build --platform android --profile production
   ```
   EAS erzeugt und verwaltet den Signaturschlüssel automatisch; die Versionsnummer (`versionCode`) wird bei jedem Build automatisch erhöht.
4. **In der Play Console** eine neue App „Prüfungskalender BW“ anlegen und die Angaben aus
   [`store/LISTING.md`](store/LISTING.md) sowie die Grafiken aus `store/` eintragen.
   Die **erste** AAB-Datei muss manuell in der Play Console hochgeladen werden (Test → Interner Test).
5. **Datenschutzerklärung**: In [`PRIVACY.md`](PRIVACY.md) den Verantwortlichen eintragen und die Seite öffentlich
   erreichbar machen (z. B. GitHub Pages); die URL in der Play Console angeben.
6. **Weitere Updates** können danach direkt eingereicht werden:
   ```bash
   npx eas-cli@latest submit --platform android --profile production
   ```
   (Dafür einmalig einen Google-Service-Account-Schlüssel in EAS hinterlegen – siehe
   [Expo-Anleitung](https://docs.expo.dev/submit/android/).)

Hinweis für neue private Entwicklerkonten: Google verlangt vor der Produktionsfreigabe einen geschlossenen Test mit
mindestens 12 Testern über 14 Tage.

## Projektstruktur

```
src/app/            Bildschirme (Expo Router)
  (tabs)/           Monat, Woche, Jahr, Prüfungen, Ferien
  event.tsx         Termin anlegen/bearbeiten
src/components/     UI-Bausteine (Monatsraster, Filter, Druckknöpfe …)
src/data/           Ferien, Feiertage, Prüfungstermine
src/lib/            Datumslogik, Druckvorlagen (HTML → PDF), Theme
src/store/          Eigene Termine und Einstellungen (AsyncStorage)
store/              Play-Store-Texte und -Grafiken
```
