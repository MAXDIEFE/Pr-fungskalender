import {
  addDays,
  addMonths,
  easterSunday,
  isoWeek,
  isValidISO,
  isValidTime,
  monthGrid,
  startOfWeek,
  toISO,
  weekdayIndex,
} from '@/lib/dates';

describe('dates', () => {
  test('toISO normalisiert Überläufe', () => {
    expect(toISO(2027, 1, 32)).toBe('2027-02-01');
    expect(toISO(2026, 12, 31 + 1)).toBe('2027-01-01');
    expect(toISO(2028, 2, 29)).toBe('2028-02-29');
  });

  test('addDays über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28');
    // Umstellung auf Sommerzeit darf nichts verschieben
    expect(addDays('2027-03-27', 1)).toBe('2027-03-28');
    expect(addDays('2027-03-28', 1)).toBe('2027-03-29');
  });

  test('addMonths', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
    expect(addMonths(2026, 9, 11)).toEqual({ year: 2027, month: 8 });
  });

  test('Wochentage (0 = Montag)', () => {
    expect(weekdayIndex('2026-09-14')).toBe(0); // Montag
    expect(weekdayIndex('2027-04-27')).toBe(1); // Dienstag
    expect(weekdayIndex('2027-05-02')).toBe(6); // Sonntag
  });

  test('ISO-Kalenderwochen', () => {
    expect(isoWeek('2027-01-01')).toEqual({ week: 53, year: 2026 });
    expect(isoWeek('2026-12-28')).toEqual({ week: 53, year: 2026 });
    expect(isoWeek('2027-01-04')).toEqual({ week: 1, year: 2027 });
    expect(isoWeek('2027-04-27')).toEqual({ week: 17, year: 2027 });
    expect(isoWeek('2026-01-01')).toEqual({ week: 1, year: 2026 });
  });

  test('Ostersonntag', () => {
    expect(easterSunday(2025)).toBe('2025-04-20');
    expect(easterSunday(2026)).toBe('2026-04-05');
    expect(easterSunday(2027)).toBe('2027-03-28');
    expect(easterSunday(2028)).toBe('2028-04-16');
  });

  test('Monatsraster beginnt am Montag und hat 42 Tage', () => {
    const grid = monthGrid(2027, 4);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2027-03-29');
    expect(weekdayIndex(grid[0])).toBe(0);
    expect(grid).toContain('2027-04-30');
    expect(startOfWeek('2027-04-01')).toBe('2027-03-29');
  });

  test('Validierung', () => {
    expect(isValidISO('2027-02-29')).toBe(false);
    expect(isValidISO('2028-02-29')).toBe(true);
    expect(isValidISO('27.04.2027')).toBe(false);
    expect(isValidTime('08:05')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('8:05')).toBe(false);
  });
});
