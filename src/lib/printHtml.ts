import { FERIEN_HINWEIS, Pruefung, SCHULART_LABEL } from '@/data/schoolData';
import type { CalendarEvent } from '@/store/events';
import type { SchulartFilter } from '@/store/settings';

import {
  addMonths,
  daysInMonth,
  formatDate,
  formatShort,
  ISODate,
  isoWeek,
  isWeekend,
  MONTHS,
  toISO,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  weekDays,
  weekdayIndex,
} from './dates';
import { getDayInfo } from './dayInfo';
import { COLORS } from './theme';

/** Leere Schreibzeilen pro Tag in der Wochenübersicht (überzählige werden abgeschnitten). */
const LEERZEILEN = 8;

/** DIN A4 in Punkt (72 PPI), wie von expo-print erwartet. */
export const A4_PORTRAIT = { width: 595, height: 842 };
export const A4_LANDSCAPE = { width: 842, height: 595 };

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function filterLabel(filter: SchulartFilter): string {
  return filter === 'alle' ? 'Haupt- und Realschule' : SCHULART_LABEL[filter];
}

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: Helvetica, Arial, sans-serif; color: ${COLORS.text};
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .ferien { background: ${COLORS.ferien}; }
  .feiertag { background: ${COLORS.feiertag}; }
  .we { background: ${COLORS.weekend}; }
  .hs { color: ${COLORS.hs}; font-weight: bold; }
  .rs { color: ${COLORS.rs}; font-weight: bold; }
  .legend { display: flex; flex-wrap: wrap; gap: 4mm; font-size: 7pt; align-items: center; }
  .legend span.box { display: inline-block; width: 3.5mm; height: 3.5mm; border: 0.2mm solid #999;
    vertical-align: middle; margin-right: 1mm; }
  .footer { font-size: 6pt; color: ${COLORS.textMuted}; }
`;

function legendHtml(filter: SchulartFilter, kurzformen = false): string {
  const items = [
    `<span><span class="box ferien"></span>Ferien / unterrichtsfrei</span>`,
    `<span><span class="box feiertag"></span>Feiertag</span>`,
    `<span><span class="box we"></span>Wochenende</span>`,
  ];
  if (filter !== 'rs') items.push(`<span class="hs">HS</span> = Hauptschule`);
  if (filter !== 'hs') items.push(`<span class="rs">RS</span> = Realschule`);
  if (kurzformen) {
    items.push('<span>H = Haupttermin, N = Nachtermin</span>');
    if (filter !== 'hs') items.push('<span>WPF = Wahlpflichtfach</span>');
  }
  return `<div class="legend">${items.join('')}</div>`;
}

/**
 * Jahresübersicht: 12 Monate nebeneinander, DIN A4 quer, eine Seite.
 */
export function yearOverviewHtml(opts: {
  title: string;
  startYear: number;
  startMonth: number;
  filter: SchulartFilter;
  eventsByDate: Map<ISODate, CalendarEvent[]>;
}): string {
  const { title, startYear, startMonth, filter, eventsByDate } = opts;
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startYear, startMonth, i));

  const head = months
    .map((m) => `<th>${MONTHS[m.month - 1]} ${String(m.year).slice(2)}</th>`)
    .join('');

  let rows = '';
  for (let day = 1; day <= 31; day++) {
    let cells = '';
    for (const m of months) {
      if (day > daysInMonth(m.year, m.month)) {
        cells += '<td class="empty"></td>';
        continue;
      }
      const iso = toISO(m.year, m.month, day);
      const info = getDayInfo(iso, filter, eventsByDate);
      const cls = info.feiertag ? 'feiertag' : info.ferien ? 'ferien' : isWeekend(iso) ? 'we' : '';
      const labels: string[] = [];
      if (info.feiertag) labels.push(escapeHtml(KURZ_FEIERTAG[info.feiertag] ?? info.feiertag));
      labels.push(...examLabels(info.pruefungen));
      for (const e of info.events) labels.push(escapeHtml(e.title));
      const kw =
        weekdayIndex(iso) === 0
          ? `<span class="kw">${isoWeek(iso).week}</span>`
          : '';
      cells += `<td class="${cls}"><div class="c"><span class="d">${String(day).padStart(2, '0')}</span><span class="wd">${
        WEEKDAYS_SHORT[weekdayIndex(iso)]
      }</span><span class="lbl">${labels.join(' · ')}</span>${kw}</div></td>`;
    }
    rows += `<tr>${cells}</tr>`;
  }

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: A4 landscape; margin: 7mm; }
  ${BASE_CSS}
  .page { width: 283mm; height: 195mm; display: flex; flex-direction: column; overflow: hidden; }
  h1 { font-size: 12pt; margin-bottom: 1.5mm; display: flex; justify-content: space-between; align-items: baseline; }
  h1 small { font-size: 8pt; font-weight: normal; color: ${COLORS.textMuted}; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { font-size: 7pt; background: ${COLORS.primary}; color: #fff; height: 5mm; border: 0.2mm solid #888; }
  td { height: 5.25mm; border: 0.2mm solid #999; font-size: 5.4pt; line-height: 5mm;
    white-space: nowrap; overflow: hidden; padding: 0 0.6mm; }
  td .c { display: flex; align-items: baseline; overflow: hidden; }
  td.empty { background: #fafafa; border-color: #ddd; }
  td .d { font-weight: bold; flex: 0 0 2.9mm; }
  td .wd { flex: 0 0 2.7mm; color: ${COLORS.textMuted}; }
  td .lbl { flex: 1; min-width: 0; margin-left: 0.4mm; overflow: hidden; text-overflow: ellipsis; }
  td .kw { flex: 0 0 auto; margin-left: 0.3mm; font-size: 4.5pt; color: ${COLORS.textMuted}; }
  .bottom { margin-top: 1.5mm; display: flex; justify-content: space-between; align-items: center; gap: 4mm; }
</style></head>
<body><div class="page">
  <h1><span>${escapeHtml(title)}</span><small>Prüfungskalender BW · ${escapeHtml(filterLabel(filter))}</small></h1>
  <table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
  <div class="bottom">${legendHtml(filter, true)}<div class="footer">Kleine Zahl = Kalenderwoche. ${escapeHtml(
    FERIEN_HINWEIS,
  )}</div></div>
</div></body></html>`;
}

/** Fasst gleiche Prüfungen von HS und RS am selben Tag zusammen, z. B. "HS/RS Deutsch H". */
function examLabels(pruefungen: Pruefung[]): string[] {
  const groups = new Map<string, Pruefung[]>();
  for (const p of pruefungen) {
    const key = `${kurzFach(p.fach)}|${p.termin}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()].map((group) => {
    const arten = group
      .map((p) => `<span class="${p.schulart}">${p.schulart.toUpperCase()}</span>`)
      .join('/');
    const { fach, termin } = group[0];
    return `${arten} ${escapeHtml(kurzFach(fach))} ${termin === 'Haupttermin' ? 'H' : 'N'}`;
  });
}

/** Kurzformen für die schmalen Zellen der Jahresübersicht. */
const KURZ_FACH: Record<string, string> = {
  'Englisch (Pflichtfremdsprache)': 'Engl.',
  Englisch: 'Engl.',
  Mathematik: 'Mathe',
  Wahlpflichtfach: 'WPF',
};

const KURZ_FEIERTAG: Record<string, string> = {
  'Tag der Deutschen Einheit': 'Dt. Einheit',
  'Heilige Drei Könige': 'Hl. 3 Könige',
  'Christi Himmelfahrt': 'Himmelfahrt',
  '1. Weihnachtstag': '1. Weihnachtst.',
  '2. Weihnachtstag': '2. Weihnachtst.',
};

function kurzFach(fach: string): string {
  return KURZ_FACH[fach] ?? fach;
}

/**
 * Wochenübersicht: Montag bis Sonntag, DIN A4 hoch, eine Seite.
 */
export function weekOverviewHtml(opts: {
  anyDay: ISODate;
  filter: SchulartFilter;
  eventsByDate: Map<ISODate, CalendarEvent[]>;
}): string {
  const { anyDay, filter, eventsByDate } = opts;
  const days = weekDays(anyDay);
  const { week, year } = isoWeek(days[0]);

  const blocks = days
    .map((iso, i) => {
      const info = getDayInfo(iso, filter, eventsByDate);
      const cls = info.feiertag ? 'feiertag' : info.ferien ? 'ferien' : i >= 5 ? 'we' : '';
      const tags: string[] = [];
      if (info.feiertag) tags.push(`<div class="tag f">Feiertag: ${escapeHtml(info.feiertag)}</div>`);
      if (info.ferien) tags.push(`<div class="tag">${escapeHtml(info.ferien.name)}</div>`);
      for (const p of info.pruefungen) {
        tags.push(
          `<div class="exam ${p.schulart}-b"><span class="bar"></span><span class="${p.schulart}">${
            SCHULART_LABEL[p.schulart]
          }</span> · Prüfung ${escapeHtml(p.fach)} (${p.termin})</div>`,
        );
      }
      const evs = info.events
        .map((e) => {
          const time = e.startTime ? `${e.startTime}${e.endTime ? `–${e.endTime}` : ''} ` : '';
          const note = e.note ? ` <span class="note">– ${escapeHtml(e.note)}</span>` : '';
          return `<div class="ev"><span class="dot" style="background:${escapeHtml(
            e.color,
          )}"></span><b>${escapeHtml(time)}</b>${escapeHtml(e.title)}${note}</div>`;
        })
        .join('');
      return `<div class="day ${i >= 5 ? 'short' : ''}">
        <div class="date ${cls}"><div class="wd">${WEEKDAYS_LONG[i]}</div><div class="num">${formatShort(
          iso,
        )}</div></div>
        <div class="content">${tags.join('')}${evs}${'<div></div>'.repeat(LEERZEILEN)}</div>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: A4 portrait; margin: 10mm; }
  ${BASE_CSS}
  .page { width: 190mm; height: 276mm; display: flex; flex-direction: column; overflow: hidden; }
  header { display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: 0.6mm solid ${COLORS.primary}; padding-bottom: 2mm; margin-bottom: 2mm; }
  header h1 { font-size: 16pt; color: ${COLORS.primaryDark}; }
  header .sub { font-size: 9pt; color: ${COLORS.textMuted}; text-align: right; }
  .days { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  .day { flex: 38; display: flex; border: 0.25mm solid #999; border-top: none; min-height: 0; }
  .day:first-child { border-top: 0.25mm solid #999; }
  .day.short { flex: 27; }
  .date { width: 26mm; padding: 2mm; border-right: 0.25mm solid #999; }
  .date .wd { font-size: 9pt; font-weight: bold; }
  .date .num { font-size: 14pt; margin-top: 1mm; }
  /* Jede Eintragszeile ist genau so hoch wie der Linienabstand, damit Text auf den Linien steht. */
  .content { flex: 1; padding: 0 2mm; font-size: 8.5pt; line-height: 6.6mm; overflow: hidden; }
  .content > div { height: 6.8mm; border-bottom: 0.2mm solid #d0d0d0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .content > div:last-child { border-bottom: none; }
  .tag { color: ${COLORS.ferienText}; font-weight: bold; }
  .tag.f { color: ${COLORS.feiertagText}; }
  .exam .bar { display: inline-block; width: 1mm; height: 4mm; vertical-align: -0.8mm; margin-right: 1.5mm; }
  .hs-b .bar { background: ${COLORS.hs}; }
  .rs-b .bar { background: ${COLORS.rs}; }
  .ev .dot { display: inline-block; width: 2.2mm; height: 2.2mm; border-radius: 50%; margin-right: 1.2mm; }
  .ev .note { color: ${COLORS.textMuted}; }
  .bottom { margin-top: 2mm; display: flex; justify-content: space-between; align-items: center; }
</style></head>
<body><div class="page">
  <header>
    <h1>KW ${week} / ${year}</h1>
    <div class="sub">${formatDate(days[0])} – ${formatDate(days[6])}<br/>Prüfungskalender BW · ${escapeHtml(
      filterLabel(filter),
    )}</div>
  </header>
  <div class="days">${blocks}</div>
  <div class="bottom">${legendHtml(filter)}</div>
</div></body></html>`;
}
