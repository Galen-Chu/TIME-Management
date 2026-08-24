/**
 * Intl 格式化(I18N.md:禁止手動串接日期/時長/百分比)。
 */
import type { Language } from './index';

const INTL_LOCALE: Record<Language, string> = {
  'zh-TW': 'zh-TW',
  'en-US': 'en-US',
};

/** 頁首日期:zh「7月13日 · 星期一」/ en「Monday, Jul 13」 */
export function formatHeaderDate(d: Date, lang: Language): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    month: lang === 'zh-TW' ? 'numeric' : 'short',
    day: 'numeric',
    weekday: 'long',
  })
    .format(d)
    .replace(/^(\d+)\/(\d+)/, '$1月$2日');
}

/** 24h 時間,如 14:45;value 為 0–24 小數(步階 0.25) */
export function formatClock(value: number): string {
  const h = Math.floor(value) % 24;
  const m = Math.round((value - Math.floor(value)) * 60);
  const hh = m === 60 ? (h + 1) % 24 : h;
  const mm = m === 60 ? 0 : m;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** 時長:zh「4.7 小時」/ en「4.7 h」 */
export function formatHours(hours: number, lang: Language): string {
  const n = new Intl.NumberFormat(INTL_LOCALE[lang], {
    maximumFractionDigits: 1,
  }).format(hours);
  return lang === 'zh-TW' ? `${n} 小時` : `${n} h`;
}

/** 事件時間範圍,如「14:45 – 17:00」 */
export function formatRange(start: number, end: number): string {
  return `${formatClock(start)} – ${formatClock(end)}`;
}

/** 百分比:86% */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
