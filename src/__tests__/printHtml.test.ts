import { escapeHtml, weekOverviewHtml, yearOverviewHtml } from '@/lib/printHtml';
import type { CalendarEvent } from '@/store/events';

const ev: CalendarEvent = {
  id: '1',
  title: '<script>alert(1)</script> Elternabend',
  date: '2027-04-28',
  startTime: '19:00',
  endTime: '20:30',
  color: '#1B5E9E',
};
const events = new Map([[ev.date, [ev]]]);

describe('Druckvorlagen', () => {
  test('escapeHtml', () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
  });

  test('Jahresübersicht enthält 12 Monate, Prüfungen und ist A4 quer', () => {
    const html = yearOverviewHtml({ title: 'Test', startYear: 2026, startMonth: 9, filter: 'alle', eventsByDate: events });
    expect(html).toContain('size: A4 landscape');
    expect((html.match(/<th>/g) ?? []).length).toBe(12);
    expect(html).toContain('September 26');
    expect(html).toContain('August 27');
    expect(html).toContain('Wahlpflichtfach');
    expect(html).toContain('<span class="hs">HS</span>/<span class="rs">RS</span> Deutsch H');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    // 31 Zeilen à 12 Zellen
    expect((html.match(/<tr>/g) ?? []).length).toBe(32);
  });

  test('Filter Hauptschule blendet RS-Prüfungen aus', () => {
    const html = yearOverviewHtml({ title: 'T', startYear: 2027, startMonth: 1, filter: 'hs', eventsByDate: new Map() });
    expect(html).not.toContain('Wahlpflichtfach');
    expect(html).not.toContain('class="rs"');
    expect(html).toContain('<span class="hs">HS</span> Engl. H');
  });

  test('Wochenübersicht ist A4 hoch und enthält alle Tage', () => {
    const html = weekOverviewHtml({ anyDay: '2027-04-28', filter: 'alle', eventsByDate: events });
    expect(html).toContain('size: A4 portrait');
    expect(html).toContain('KW 17 / 2027');
    for (const d of ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']) {
      expect(html).toContain(`>${d}<`);
    }
    expect(html).toContain('Prüfung Deutsch (Haupttermin)');
    expect(html).toContain('19:00–20:30');
    expect(html).not.toContain('<script>');
  });
});
