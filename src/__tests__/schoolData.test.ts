import { FERIEN, feiertageBW, PRUEFUNGEN } from '@/data/schoolData';
import { weekdayIndex } from '@/lib/dates';
import { ferienAm, getDayInfo, pruefungenAm } from '@/lib/dayInfo';

const WD = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

describe('Prüfungstermine 2027', () => {
  // Exakt wie vorgegeben: [Schulart, Termin, Fach, Wochentag, Datum]
  const expected: [string, string, string, string, string][] = [
    ['rs', 'Haupttermin', 'Deutsch', 'Dienstag', '2027-04-27'],
    ['rs', 'Haupttermin', 'Mathematik', 'Donnerstag', '2027-04-29'],
    ['rs', 'Haupttermin', 'Englisch (Pflichtfremdsprache)', 'Montag', '2027-05-03'],
    ['rs', 'Haupttermin', 'Wahlpflichtfach', 'Mittwoch', '2027-05-05'],
    ['rs', 'Nachtermin', 'Deutsch', 'Donnerstag', '2027-06-03'],
    ['rs', 'Nachtermin', 'Mathematik', 'Freitag', '2027-06-04'],
    ['rs', 'Nachtermin', 'Englisch (Pflichtfremdsprache)', 'Montag', '2027-06-07'],
    ['rs', 'Nachtermin', 'Wahlpflichtfach', 'Dienstag', '2027-06-08'],
    ['hs', 'Haupttermin', 'Deutsch', 'Dienstag', '2027-04-27'],
    ['hs', 'Haupttermin', 'Mathematik', 'Donnerstag', '2027-04-29'],
    ['hs', 'Haupttermin', 'Englisch', 'Montag', '2027-05-03'],
    ['hs', 'Nachtermin', 'Deutsch', 'Donnerstag', '2027-06-03'],
    ['hs', 'Nachtermin', 'Mathematik', 'Freitag', '2027-06-04'],
    ['hs', 'Nachtermin', 'Englisch', 'Montag', '2027-06-07'],
  ];

  test('alle Termine vorhanden und vollständig', () => {
    expect(PRUEFUNGEN).toHaveLength(expected.length);
    for (const [schulart, termin, fach, , date] of expected) {
      expect(PRUEFUNGEN).toContainEqual(expect.objectContaining({ schulart, termin, fach, date }));
    }
  });

  test.each(expected)('%s %s %s fällt auf %s (%s)', (_s, _t, _f, weekday, date) => {
    expect(WD[weekdayIndex(date)]).toBe(weekday);
  });

  test('keine Prüfung liegt in den Ferien oder an einem Feiertag', () => {
    for (const p of PRUEFUNGEN) {
      expect(ferienAm(p.date)).toBeUndefined();
      expect(getDayInfo(p.date, 'alle', new Map()).feiertag).toBeUndefined();
    }
  });

  test('Filter nach Schulart', () => {
    expect(pruefungenAm('2027-05-05', 'hs')).toHaveLength(0);
    expect(pruefungenAm('2027-05-05', 'rs')).toHaveLength(1);
    expect(pruefungenAm('2027-04-27', 'alle')).toHaveLength(2);
  });

  test('IDs sind eindeutig', () => {
    expect(new Set(PRUEFUNGEN.map((p) => p.id)).size).toBe(PRUEFUNGEN.length);
  });
});

describe('Ferien BW 2026/27', () => {
  test('Zeiträume gültig, sortiert und überschneidungsfrei', () => {
    for (let i = 0; i < FERIEN.length; i++) {
      expect(FERIEN[i].start <= FERIEN[i].end).toBe(true);
      if (i > 0) expect(FERIEN[i - 1].end < FERIEN[i].start).toBe(true);
    }
  });

  test('Stichtage', () => {
    expect(ferienAm('2026-10-26')?.name).toBe('Herbstferien');
    expect(ferienAm('2026-10-30')?.name).toBe('Herbstferien');
    expect(ferienAm('2026-11-02')).toBeUndefined();
    expect(ferienAm('2026-12-22')).toBeUndefined();
    expect(ferienAm('2026-12-23')?.name).toBe('Weihnachtsferien');
    expect(ferienAm('2027-01-08')?.name).toBe('Weihnachtsferien');
    expect(ferienAm('2027-01-11')).toBeUndefined();
    expect(ferienAm('2027-03-25')?.name).toMatch(/Gründonnerstag/);
    expect(ferienAm('2027-03-30')?.name).toBe('Osterferien');
    expect(ferienAm('2027-04-02')?.name).toBe('Osterferien');
    expect(ferienAm('2027-04-05')).toBeUndefined();
    expect(ferienAm('2027-05-18')?.name).toBe('Pfingstferien');
    expect(ferienAm('2027-05-28')?.name).toBe('Pfingstferien');
    expect(ferienAm('2027-05-31')).toBeUndefined();
    expect(ferienAm('2027-07-28')).toBeUndefined();
    expect(ferienAm('2027-07-29')?.name).toBe('Sommerferien');
    expect(ferienAm('2027-09-10')?.name).toBe('Sommerferien');
    expect(ferienAm('2026-09-12')?.name).toBe('Sommerferien');
    expect(ferienAm('2026-09-14')).toBeUndefined();
  });
});

describe('Feiertage BW', () => {
  test('2027', () => {
    const map = Object.fromEntries(feiertageBW(2027).map((f) => [f.name, f.date]));
    expect(map).toEqual({
      Neujahr: '2027-01-01',
      'Heilige Drei Könige': '2027-01-06',
      Karfreitag: '2027-03-26',
      Ostermontag: '2027-03-29',
      'Tag der Arbeit': '2027-05-01',
      'Christi Himmelfahrt': '2027-05-06',
      Pfingstmontag: '2027-05-17',
      Fronleichnam: '2027-05-27',
      'Tag der Deutschen Einheit': '2027-10-03',
      Allerheiligen: '2027-11-01',
      '1. Weihnachtstag': '2027-12-25',
      '2. Weihnachtstag': '2027-12-26',
    });
  });

  test('2026', () => {
    const map = Object.fromEntries(feiertageBW(2026).map((f) => [f.name, f.date]));
    expect(map.Karfreitag).toBe('2026-04-03');
    expect(map.Ostermontag).toBe('2026-04-06');
    expect(map['Christi Himmelfahrt']).toBe('2026-05-14');
    expect(map.Pfingstmontag).toBe('2026-05-25');
    expect(map.Fronleichnam).toBe('2026-06-04');
    expect(Object.keys(map)).toHaveLength(12);
  });
});
